import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from .models import AppointmentStatus


class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    birth_date: Optional[datetime] = None
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientRead(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class TherapistBase(BaseModel):
    name: str
    specialty: str
    email: EmailStr
    phone: Optional[str] = None
    active: bool = True


class TherapistCreate(TherapistBase):
    pass


class TherapistRead(TherapistBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class AppointmentBase(BaseModel):
    client_id: uuid.UUID
    therapist_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = None
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentCancel(BaseModel):
    reason: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    start_time: datetime
    end_time: datetime
    status: AppointmentStatus
    reason: Optional[str] = None
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    client: ClientRead
    therapist: TherapistRead


class SummaryStats(BaseModel):
    total: int
    scheduled: int
    completed: int
    cancelled: int
    no_show: int
    cancellation_rate: float


class StatusCount(BaseModel):
    status: str
    count: int


class DayCount(BaseModel):
    date: str
    count: int


class TherapistCount(BaseModel):
    therapist_id: uuid.UUID
    therapist_name: str
    total: int
    completed: int
    cancelled: int
