import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from . import models

THERAPISTS = [
    ("Dra. Camila Rojas", "Fisioterapia Deportiva", "camila.rojas@fisiocenter.com"),
    ("Dr. Martin Herrera", "Rehabilitacion Muscular", "martin.herrera@fisiocenter.com"),
    ("Dra. Valentina Soto", "Kinesiologia", "valentina.soto@fisiocenter.com"),
    ("Dr. Ignacio Vidal", "Terapia Manual", "ignacio.vidal@fisiocenter.com"),
]

CLIENTS = [
    "Sofia Munoz", "Diego Fernandez", "Isidora Torres", "Benjamin Castro",
    "Antonia Flores", "Matias Rojas", "Florencia Silva", "Tomas Araya",
    "Javiera Morales", "Vicente Contreras",
]

REASONS = [
    "Dolor lumbar", "Recuperacion post-quirurgica", "Esguince de tobillo",
    "Tendinitis", "Contractura cervical", "Rehabilitacion de rodilla",
]


def seed_if_empty(db: Session) -> None:
    if db.query(models.Therapist).count() > 0:
        return

    db.add_all(
        models.Therapist(name=name, specialty=spec, email=email, phone="+56 9 1234 5678")
        for name, spec, email in THERAPISTS
    )
    db.add_all(
        models.Client(
            name=name,
            email=f"{name.lower().replace(' ', '.')}@mail.com",
            phone="+56 9 8765 4321",
        )
        for name in CLIENTS
    )
    db.commit()

    therapists = db.query(models.Therapist).all()
    clients = db.query(models.Client).all()

    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    appointments = []
    for day_offset in range(-20, 10):
        day = now + timedelta(days=day_offset)
        for _ in range(random.randint(1, 4)):
            hour = random.choice([9, 10, 11, 14, 15, 16, 17])
            start = day.replace(hour=hour)
            end = start + timedelta(minutes=45)
            therapist = random.choice(therapists)
            client = random.choice(clients)

            if day_offset < 0:
                status = random.choices(
                    [
                        models.AppointmentStatus.completed,
                        models.AppointmentStatus.cancelled,
                        models.AppointmentStatus.no_show,
                    ],
                    weights=[75, 18, 7],
                )[0]
            else:
                status = models.AppointmentStatus.scheduled

            appt = models.Appointment(
                client_id=client.id,
                therapist_id=therapist.id,
                start_time=start,
                end_time=end,
                reason=random.choice(REASONS),
                status=status,
            )
            if status == models.AppointmentStatus.cancelled:
                appt.cancelled_at = start - timedelta(hours=random.randint(1, 48))
                appt.cancellation_reason = "Cliente reprogramo"
            appointments.append(appt)

    db.add_all(appointments)
    db.commit()
