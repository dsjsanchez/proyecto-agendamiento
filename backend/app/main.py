from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .routers import appointments, clients, stats, therapists
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FisioCenter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients.router)
app.include_router(therapists.router)
app.include_router(appointments.router)
app.include_router(stats.router)


@app.on_event("startup")
def startup_seed() -> None:
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok"}
