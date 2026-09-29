# FisioCenter · Sistema de Agendamiento

Demo de una plataforma web para agendar y gestionar citas de un centro de rehabilitacion muscular (clientes, terapeutas y citas), con un dashboard de estadisticas.

## Stack

- **Backend:** Python + FastAPI + SQLAlchemy
- **Base de datos:** PostgreSQL
- **Frontend:** React + TypeScript (Vite) + Recharts
- **Infraestructura:** Docker / Docker Compose

## Estructura

```
backend/    API FastAPI (clientes, terapeutas, citas, estadisticas)
frontend/   SPA en React (Dashboard, Citas, Clientes, Terapeutas)
docker-compose.yml
```

## Como levantar el proyecto

Requiere Docker y Docker Compose instalados.

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API (Swagger): http://localhost:8000/docs
- PostgreSQL: localhost:5432 (usuario `fisio`, password `fisio_pass`, base `fisio_db`)

Al levantar por primera vez, el backend crea las tablas automaticamente y siembra datos de ejemplo (terapeutas, clientes y citas de los ultimos 20 dias y proximos 10) para que el dashboard muestre estadisticas reales de inmediato.

## Funcionalidades

- Agendar citas (valida solapamiento de horario por terapeuta).
- Cancelar citas con motivo opcional.
- Gestion de clientes y terapeutas.
- Dashboard con: total de citas, agendadas/completadas/canceladas, tasa de cancelacion, citas por dia, distribucion por estado y carga por terapeuta.

## Desarrollo local (sin Docker)

**Backend**
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg2://fisio:fisio_pass@localhost:5432/fisio_db
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
