import os
import re
import hmac
import hashlib
import secrets
import time
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional

import psycopg
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator

APP_VERSION = "0.1.0"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "").strip()
INSTALL_HASH_SALT = os.getenv("INSTALL_HASH_SALT", "").strip()
ALLOWED_ORIGINS = [
    x.strip()
    for x in os.getenv("ALLOWED_ORIGINS", "https://app.measymate.com").split(",")
    if x.strip()
]

ALLOWED_PROJECTS = {"money"}
ALLOWED_EVENTS = {
    "app_open",
    "nav_today", "nav_bills", "nav_future", "nav_overview", "nav_review",
    "onboarding_started", "onboarding_completed",
    "bill_saved", "expense_saved", "income_saved",
    "reserve_added", "reserve_used",
    "saving_added", "saving_withdrawn", "dream_updated", "week_closed",
    "backup_created", "backup_shared", "restore_used", "safety_restore_used",
    "app_reset", "runtime_error", "system_test",
}
ALLOWED_DEVICE = {"mobile", "tablet", "desktop", "other"}
ALLOWED_BROWSER = {"chrome", "samsung", "edge", "opera", "firefox", "safari", "other"}
ALLOWED_OS = {"android", "ios", "windows", "macos", "linux", "other"}

ID_RE = re.compile(r"^[A-Za-z0-9_.:-]{3,120}$")
VER_RE = re.compile(r"^[A-Za-z0-9_.+-]{1,40}$")

RATE_WINDOW_SECONDS = 60
RATE_MAX = 600
_recent = deque()

def utcnow():
    return datetime.now(timezone.utc)

def db_ready():
    return bool(DATABASE_URL and INSTALL_HASH_SALT)

def hash_id(value: str) -> str:
    return hmac.new(
        INSTALL_HASH_SALT.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

def connect():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured")
    return psycopg.connect(DATABASE_URL, autocommit=True)

def init_db():
    if not db_ready():
        return
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id BIGSERIAL PRIMARY KEY,
                    project_id VARCHAR(40) NOT NULL,
                    app_version VARCHAR(40) NOT NULL,
                    data_schema_version INTEGER,
                    event_name VARCHAR(64) NOT NULL,
                    occurred_at TIMESTAMPTZ NOT NULL,
                    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    install_hash CHAR(64) NOT NULL,
                    session_hash CHAR(64) NOT NULL,
                    device_class VARCHAR(16) NOT NULL,
                    browser_family VARCHAR(20) NOT NULL,
                    os_family VARCHAR(20) NOT NULL,
                    is_test BOOLEAN NOT NULL DEFAULT FALSE
                )
                """
            )
            cur.execute(
                "CREATE INDEX IF NOT EXISTS idx_analytics_project_received "
                "ON analytics_events(project_id, received_at DESC)"
            )
            cur.execute(
                "CREATE INDEX IF NOT EXISTS idx_analytics_project_install "
                "ON analytics_events(project_id, install_hash)"
            )
            cur.execute(
                "CREATE INDEX IF NOT EXISTS idx_analytics_project_event "
                "ON analytics_events(project_id, event_name, received_at DESC)"
            )

def cleanup_old():
    if not db_ready():
        return
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM analytics_events "
                "WHERE received_at < NOW() - INTERVAL '90 days'"
            )

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    cleanup_old()
    yield

app = FastAPI(
    title="MEasyMate Central Analytics API",
    version=APP_VERSION,
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-MEasyMate-Synthetic"],
    max_age=600,
)

class EventIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event: str = Field(min_length=1, max_length=64)
    project_id: str = Field(min_length=1, max_length=40)
    app_version: str = Field(min_length=1, max_length=40)
    data_schema_version: Optional[int] = Field(default=None, ge=0, le=1000)
    occurred_at: datetime
    session_id: str = Field(min_length=3, max_length=120)
    install_id: str = Field(min_length=3, max_length=120)
    device_class: str = Field(min_length=1, max_length=16)
    browser_family: str = Field(min_length=1, max_length=20)
    os_family: str = Field(min_length=1, max_length=20)
    meta: Optional[dict] = None

    @field_validator("project_id")
    @classmethod
    def valid_project(cls, v):
        if v not in ALLOWED_PROJECTS:
            raise ValueError("project not allowed")
        return v

    @field_validator("event")
    @classmethod
    def valid_event(cls, v):
        if v not in ALLOWED_EVENTS:
            raise ValueError("event not allowed")
        return v

    @field_validator("app_version")
    @classmethod
    def valid_version(cls, v):
        if not VER_RE.fullmatch(v):
            raise ValueError("invalid version")
        return v

    @field_validator("session_id", "install_id")
    @classmethod
    def valid_random_id(cls, v):
        if not ID_RE.fullmatch(v):
            raise ValueError("invalid anonymous id")
        return v

    @field_validator("device_class")
    @classmethod
    def valid_device(cls, v):
        if v not in ALLOWED_DEVICE:
            raise ValueError("invalid device class")
        return v

    @field_validator("browser_family")
    @classmethod
    def valid_browser(cls, v):
        if v not in ALLOWED_BROWSER:
            raise ValueError("invalid browser")
        return v

    @field_validator("os_family")
    @classmethod
    def valid_os(cls, v):
        if v not in ALLOWED_OS:
            raise ValueError("invalid os")
        return v

def enforce_rate_limit():
    now = time.monotonic()
    while _recent and now - _recent[0] > RATE_WINDOW_SECONDS:
        _recent.popleft()
    if len(_recent) >= RATE_MAX:
        raise HTTPException(status_code=429, detail="rate limit")
    _recent.append(now)

def require_admin(request: Request):
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="admin auth not configured")
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="unauthorized")
    if not secrets.compare_digest(auth[7:], ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="unauthorized")

@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "measymate-central-analytics",
        "version": APP_VERSION,
        "database_configured": bool(DATABASE_URL),
        "hash_salt_configured": bool(INSTALL_HASH_SALT),
        "admin_auth_configured": bool(ADMIN_TOKEN),
        "analytics_content_policy": "behavior_only",
        "financial_content": "forbidden",
    }

@app.post("/v1/events", status_code=202)
async def ingest(request: Request, event: EventIn):
    if not db_ready():
        raise HTTPException(status_code=503, detail="analytics storage not ready")

    length = request.headers.get("content-length")
    if length:
        try:
            if int(length) > 8192:
                raise HTTPException(status_code=413, detail="payload too large")
        except ValueError:
            raise HTTPException(status_code=400, detail="invalid content length")

    origin = request.headers.get("origin")
    if origin and origin not in ALLOWED_ORIGINS:
        raise HTTPException(status_code=403, detail="origin not allowed")

    enforce_rate_limit()
    now = utcnow()
    occurred = event.occurred_at
    if occurred.tzinfo is None:
        occurred = occurred.replace(tzinfo=timezone.utc)
    occurred = occurred.astimezone(timezone.utc)

    if occurred < now - timedelta(days=7) or occurred > now + timedelta(minutes=15):
        raise HTTPException(status_code=422, detail="event timestamp outside allowed window")

    synthetic = request.headers.get("x-measymate-synthetic") == "1"

    # Privacy: Central V1 deliberately discards meta; it is never stored.
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO analytics_events (
                    project_id, app_version, data_schema_version, event_name,
                    occurred_at, received_at, install_hash, session_hash,
                    device_class, browser_family, os_family, is_test
                )
                VALUES (%s, %s, %s, %s, %s, NOW(), %s, %s, %s, %s, %s, %s)
                """,
                (
                    event.project_id,
                    event.app_version,
                    event.data_schema_version,
                    event.event,
                    occurred,
                    hash_id(event.install_id),
                    hash_id(event.session_id),
                    event.device_class,
                    event.browser_family,
                    event.os_family,
                    synthetic,
                ),
            )
    return {"accepted": True}

def period_cutoff(period: str):
    mapping = {
        "1d": "NOW() - INTERVAL '1 day'",
        "7d": "NOW() - INTERVAL '7 days'",
        "30d": "NOW() - INTERVAL '30 days'",
        "90d": "NOW() - INTERVAL '90 days'",
        "all": None,
    }
    return mapping.get(period, "INVALID")

@app.get("/v1/summary")
def summary(
    request: Request,
    project_id: str = Query(default="money"),
    period: str = Query(default="30d"),
):
    require_admin(request)
    if project_id not in ALLOWED_PROJECTS:
        raise HTTPException(status_code=400, detail="project not allowed")

    cutoff = period_cutoff(period)
    if cutoff == "INVALID":
        raise HTTPException(status_code=400, detail="invalid period")
    if not db_ready():
        raise HTTPException(status_code=503, detail="analytics storage not ready")

    where = "project_id = %s AND is_test = FALSE"
    params = [project_id]
    if cutoff:
        where += f" AND received_at >= {cutoff}"

    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT
                    COUNT(*)::bigint,
                    COUNT(DISTINCT install_hash)::bigint,
                    COUNT(DISTINCT session_hash)::bigint,
                    COUNT(*) FILTER (WHERE event_name='app_open')::bigint,
                    MIN(received_at),
                    MAX(received_at)
                FROM analytics_events
                WHERE {where}
                """,
                params,
            )
            total, installs, sessions, opens, first_seen, last_seen = cur.fetchone()

            cur.execute(
                """
                SELECT
                    COUNT(DISTINCT install_hash)
                      FILTER (WHERE received_at >= NOW() - INTERVAL '1 day')::bigint,
                    COUNT(DISTINCT install_hash)
                      FILTER (WHERE received_at >= NOW() - INTERVAL '7 days')::bigint,
                    COUNT(DISTINCT install_hash)
                      FILTER (WHERE received_at >= NOW() - INTERVAL '30 days')::bigint
                FROM analytics_events
                WHERE project_id = %s AND is_test = FALSE
                """,
                (project_id,),
            )
            active_1d, active_7d, active_30d = cur.fetchone()

            cur.execute(
                f"""
                SELECT event_name, COUNT(*)::bigint
                FROM analytics_events
                WHERE {where}
                GROUP BY event_name
                ORDER BY COUNT(*) DESC, event_name
                """,
                params,
            )
            event_counts = {k: int(v) for k, v in cur.fetchall()}

            cur.execute(
                f"""
                SELECT app_version, COUNT(DISTINCT install_hash)::bigint
                FROM analytics_events
                WHERE {where}
                GROUP BY app_version
                ORDER BY COUNT(DISTINCT install_hash) DESC, app_version
                """,
                params,
            )
            version_counts = {k: int(v) for k, v in cur.fetchall()}

            cur.execute(
                f"""
                SELECT device_class, COUNT(DISTINCT install_hash)::bigint
                FROM analytics_events
                WHERE {where}
                GROUP BY device_class
                ORDER BY COUNT(DISTINCT install_hash) DESC, device_class
                """,
                params,
            )
            device_counts = {k: int(v) for k, v in cur.fetchall()}

            cur.execute(
                """
                SELECT DATE(received_at), COUNT(DISTINCT install_hash)::bigint
                FROM analytics_events
                WHERE project_id = %s
                  AND is_test = FALSE
                  AND received_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(received_at)
                ORDER BY DATE(received_at)
                """,
                (project_id,),
            )
            daily_active = [
                {"date": str(day), "active_installations": int(v)}
                for day, v in cur.fetchall()
            ]

    return {
        "project_id": project_id,
        "period": period,
        "generated_at": utcnow().isoformat(),
        "metrics": {
            "total_events": int(total or 0),
            "unique_installations": int(installs or 0),
            "unique_sessions": int(sessions or 0),
            "app_opens": int(opens or 0),
            "active_1d": int(active_1d or 0),
            "active_7d": int(active_7d or 0),
            "active_30d": int(active_30d or 0),
            "first_seen": first_seen.isoformat() if first_seen else None,
            "last_seen": last_seen.isoformat() if last_seen else None,
        },
        "event_counts": event_counts,
        "version_counts": version_counts,
        "device_counts": device_counts,
        "daily_active": daily_active,
        "privacy": {
            "financial_content_stored": False,
            "personal_identity_stored": False,
            "ip_stored": False,
            "raw_install_id_stored": False,
            "raw_session_id_stored": False,
            "meta_stored": False,
            "retention_days": 90,
        },
    }
