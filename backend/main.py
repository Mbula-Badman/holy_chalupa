import os
import secrets
from datetime import datetime, timezone
from typing import Generator

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import DateTime, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./holy_chalupa.db")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "replace_with_a_long_random_password")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class Inquiry(Base):
    __tablename__ = "inquiries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, index=True)
    service: Mapped[str] = mapped_column(String(120), nullable=False)
    budget: Mapped[str] = mapped_column(String(80), default="", nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="new", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Holy Chalupa API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"] + ([os.getenv("FRONTEND_URL", "").rstrip("/")] and [os.getenv("FRONTEND_URL", "").rstrip("/")] or []),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
security = HTTPBasic()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_admin(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    user_ok = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    pass_ok = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (user_ok and pass_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    if ADMIN_PASSWORD == "replace_with_a_long_random_password":
        raise HTTPException(status_code=503, detail="Set a strong ADMIN_PASSWORD before using admin routes.")
    return credentials.username


class InquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    service: str = Field(min_length=2, max_length=120)
    budget: str = Field(default="", max_length=80)
    message: str = Field(min_length=10, max_length=4000)


class InquiryStatus(BaseModel):
    status: str


def serialize_inquiry(row: Inquiry) -> dict:
    return {
        "id": row.id,
        "name": row.name,
        "email": row.email,
        "service": row.service,
        "budget": row.budget,
        "message": row.message,
        "status": row.status,
        "created_at": row.created_at.isoformat(),
    }


@app.get("/api/health")
def health():
    return {"ok": True, "service": "Holy Chalupa API"}


@app.get("/api/projects")
def projects():
    # Illustrative portfolio examples; replace with verified company projects.
    return {"projects": [
        {"id": "timiza", "title": "Timiza Digital Lending", "category": "Software development",
         "description": "A mobile-first lending experience with application workflows, decision support and administration."},
        {"id": "research", "title": "Research & Documentation", "category": "Research and writing",
         "description": "Structured research support, technical documentation and clear project reports."},
        {"id": "delivery", "title": "Project Delivery Toolkit", "category": "Project management",
         "description": "Planning, requirements and delivery workflows that keep complex work organized."},
    ]}


@app.post("/api/inquiries", status_code=201)
def create_inquiry(payload: InquiryCreate, db: Session = Depends(get_db)):
    row = Inquiry(
        name=payload.name.strip(),
        email=str(payload.email).lower(),
        service=payload.service.strip(),
        budget=payload.budget.strip(),
        message=payload.message.strip(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"ok": True, "id": row.id, "message": "Thanks â€” your inquiry has been received."}


@app.get("/api/admin/inquiries")
def list_inquiries(
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    rows = db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc()).limit(200)).all()
    return {"inquiries": [serialize_inquiry(row) for row in rows]}


@app.patch("/api/admin/inquiries/{inquiry_id}")
def update_inquiry(
    inquiry_id: int,
    payload: InquiryStatus,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    allowed = {"new", "in_review", "contacted", "closed"}
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(sorted(allowed))}")
    row = db.get(Inquiry, inquiry_id)
    if not row:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    row.status = payload.status
    db.commit()
    return {"ok": True, "inquiry": serialize_inquiry(row)}

