import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/clients", tags=["clients"])


@router.post("", response_model=schemas.ClientRead, status_code=201)
def create_client(payload: schemas.ClientCreate, db: Session = Depends(get_db)):
    if db.query(models.Client).filter(models.Client.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Ya existe un cliente con ese email")
    client = models.Client(**payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("", response_model=List[schemas.ClientRead])
def list_clients(db: Session = Depends(get_db)):
    return db.query(models.Client).order_by(models.Client.name).all()


@router.get("/{client_id}", response_model=schemas.ClientRead)
def get_client(client_id: uuid.UUID, db: Session = Depends(get_db)):
    client = db.get(models.Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return client
