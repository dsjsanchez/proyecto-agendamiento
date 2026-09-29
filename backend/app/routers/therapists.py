import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/therapists", tags=["therapists"])


@router.post("", response_model=schemas.TherapistRead, status_code=201)
def create_therapist(payload: schemas.TherapistCreate, db: Session = Depends(get_db)):
    if db.query(models.Therapist).filter(models.Therapist.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Ya existe un terapeuta con ese email")
    therapist = models.Therapist(**payload.model_dump())
    db.add(therapist)
    db.commit()
    db.refresh(therapist)
    return therapist


@router.get("", response_model=List[schemas.TherapistRead])
def list_therapists(db: Session = Depends(get_db)):
    return db.query(models.Therapist).order_by(models.Therapist.name).all()


@router.get("/{therapist_id}", response_model=schemas.TherapistRead)
def get_therapist(therapist_id: uuid.UUID, db: Session = Depends(get_db)):
    therapist = db.get(models.Therapist, therapist_id)
    if not therapist:
        raise HTTPException(status_code=404, detail="Terapeuta no encontrado")
    return therapist
