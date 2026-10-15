from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/summary", response_model=schemas.SummaryStats)
def summary(db: Session = Depends(get_db)):
    total = db.query(models.Appointment).count()
    counts = {
        status: db.query(models.Appointment).filter(models.Appointment.status == status).count()
        for status in models.AppointmentStatus
    }
    #hollaaaa
    cancelled = counts[models.AppointmentStatus.cancelled]
    rate = round((cancelled / total) * 100, 1) if total else 0.0
    return schemas.SummaryStats(
        total=total,
        scheduled=counts[models.AppointmentStatus.scheduled],
        completed=counts[models.AppointmentStatus.completed],
        cancelled=cancelled,
        no_show=counts[models.AppointmentStatus.no_show],
        cancellation_rate=rate,
    )


@router.get("/by-status", response_model=List[schemas.StatusCount])
def by_status(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Appointment.status, func.count(models.Appointment.id))
        .group_by(models.Appointment.status)
        .all()
    )
    return [schemas.StatusCount(status=status.value, count=count) for status, count in rows]


@router.get("/by-day", response_model=List[schemas.DayCount])
def by_day(days: int = Query(default=14, ge=1, le=90), db: Session = Depends(get_db)):
    start = datetime.utcnow().date() - timedelta(days=days - 1)
    rows = (
        db.query(func.date(models.Appointment.start_time), func.count(models.Appointment.id))
        .filter(func.date(models.Appointment.start_time) >= start)
        .group_by(func.date(models.Appointment.start_time))
        .all()
    )
    counts = {str(day): count for day, count in rows}
    result = []
    for i in range(days):
        day = start + timedelta(days=i)
        key = str(day)
        result.append(schemas.DayCount(date=key, count=counts.get(key, 0)))
    return result


@router.get("/by-therapist", response_model=List[schemas.TherapistCount])
def by_therapist(db: Session = Depends(get_db)):
    therapists = db.query(models.Therapist).all()
    result = []
    for t in therapists:
        total = db.query(models.Appointment).filter(models.Appointment.therapist_id == t.id).count()
        completed = db.query(models.Appointment).filter(
            models.Appointment.therapist_id == t.id,
            models.Appointment.status == models.AppointmentStatus.completed,
        ).count()
        cancelled = db.query(models.Appointment).filter(
            models.Appointment.therapist_id == t.id,
            models.Appointment.status == models.AppointmentStatus.cancelled,
        ).count()
        result.append(
            schemas.TherapistCount(
                therapist_id=t.id,
                therapist_name=t.name,
                total=total,
                completed=completed,
                cancelled=cancelled,
            )
        )
    return result
