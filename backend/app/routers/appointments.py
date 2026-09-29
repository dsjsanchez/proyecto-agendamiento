import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _has_conflict(db: Session, therapist_id, start_time, end_time, exclude_id=None) -> bool:
    query = db.query(models.Appointment).filter(
        models.Appointment.therapist_id == therapist_id,
        models.Appointment.status == models.AppointmentStatus.scheduled,
        models.Appointment.start_time < end_time,
        models.Appointment.end_time > start_time,
    )
    if exclude_id:
        query = query.filter(models.Appointment.id != exclude_id)
    return query.first() is not None


@router.post("", response_model=schemas.AppointmentRead, status_code=201)
def create_appointment(payload: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    if not db.get(models.Client, payload.client_id):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if not db.get(models.Therapist, payload.therapist_id):
        raise HTTPException(status_code=404, detail="Terapeuta no encontrado")
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="La hora de termino debe ser posterior al inicio")
    if _has_conflict(db, payload.therapist_id, payload.start_time, payload.end_time):
        raise HTTPException(status_code=409, detail="El terapeuta ya tiene una cita en ese horario")

    appt = models.Appointment(**payload.model_dump())
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.get("", response_model=List[schemas.AppointmentRead])
def list_appointments(
    status: Optional[models.AppointmentStatus] = None,
    therapist_id: Optional[uuid.UUID] = None,
    client_id: Optional[uuid.UUID] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Appointment)
    if status:
        query = query.filter(models.Appointment.status == status)
    if therapist_id:
        query = query.filter(models.Appointment.therapist_id == therapist_id)
    if client_id:
        query = query.filter(models.Appointment.client_id == client_id)
    if date_from:
        query = query.filter(models.Appointment.start_time >= date_from)
    if date_to:
        query = query.filter(models.Appointment.start_time <= date_to)
    return query.order_by(models.Appointment.start_time.desc()).all()


@router.get("/{appointment_id}", response_model=schemas.AppointmentRead)
def get_appointment(appointment_id: uuid.UUID, db: Session = Depends(get_db)):
    appt = db.get(models.Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return appt


@router.patch("/{appointment_id}/cancel", response_model=schemas.AppointmentRead)
def cancel_appointment(
    appointment_id: uuid.UUID, payload: schemas.AppointmentCancel, db: Session = Depends(get_db)
):
    appt = db.get(models.Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if appt.status != models.AppointmentStatus.scheduled:
        raise HTTPException(status_code=400, detail="Solo se pueden cancelar citas agendadas")
    appt.status = models.AppointmentStatus.cancelled
    appt.cancelled_at = datetime.utcnow()
    appt.cancellation_reason = payload.reason
    db.commit()
    db.refresh(appt)
    return appt


@router.patch("/{appointment_id}/status", response_model=schemas.AppointmentRead)
def update_status(
    appointment_id: uuid.UUID, payload: schemas.AppointmentStatusUpdate, db: Session = Depends(get_db)
):
    appt = db.get(models.Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    appt.status = payload.status
    db.commit()
    db.refresh(appt)
    return appt
