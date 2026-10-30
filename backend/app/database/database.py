import os
import socket
import subprocess
import time
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

Base = declarative_base()


def is_port_open(host: str = "127.0.0.1", port: int = 5432, timeout: float = 0.6) -> bool:
    """Quick socket check to verify if PostgreSQL service is actively listening."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


def try_autostart_postgresql() -> bool:
    """Attempts to auto-start PostgreSQL server if it was stopped on system startup."""
    if is_port_open():
        return True

    pg_ctl_candidates = [
        r"E:\PostgreSQL\18\bin\pg_ctl.exe",
        r"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe",
        r"C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe",
        r"C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe",
    ]
    data_dir_candidates = [
        r"E:\PostgreSQL\18\data",
        r"C:\Program Files\PostgreSQL\18\data",
        r"C:\Program Files\PostgreSQL\17\data",
        r"C:\Program Files\PostgreSQL\16\data",
    ]

    for pg_ctl in pg_ctl_candidates:
        if os.path.isfile(pg_ctl):
            for data_dir in data_dir_candidates:
                if os.path.isdir(data_dir):
                    try:
                        print(f"[DATABASE] PostgreSQL offline. Attempting auto-start via {pg_ctl} -D {data_dir}...")
                        subprocess.Popen(
                            [pg_ctl, "start", "-D", data_dir],
                            creationflags=getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0),
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL,
                        )
                        # Poll up to 4 seconds for PostgreSQL to accept incoming connections
                        for _ in range(8):
                            time.sleep(0.5)
                            if is_port_open():
                                print("[DATABASE] PostgreSQL server auto-started successfully!")
                                return True
                    except Exception as err:
                        print(f"[DATABASE] Could not auto-start PostgreSQL: {err}")
    return is_port_open()


def initialize_engine():
    """Initializes database engine with PostgreSQL auto-start and graceful SQLite fallback."""
    try_autostart_postgresql()

    # Try connecting to PostgreSQL with retry loop to allow startup recovery to finish
    last_err = None
    for attempt in range(5):
        try:
            pg_engine = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 3},
            )
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[DATABASE] Connected to PostgreSQL successfully.")
            return pg_engine
        except Exception as pg_err:
            last_err = pg_err
            time.sleep(1.0)

    print(f"[DATABASE WARNING] PostgreSQL connection failed ({last_err}).")
    print("[DATABASE INFO] Initializing zero-configuration local SQLite database fallback...")

    # Fallback to local SQLite database so the application NEVER crashes with HTTP 500
    workspace_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(workspace_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    sqlite_file = os.path.join(data_dir, "ai_research_scientist.db").replace("\\", "/")
    sqlite_url = f"sqlite:///{sqlite_file}"

    sqlite_engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
    )
    print(f"[DATABASE] Local SQLite database active at: {sqlite_url}")
    return sqlite_engine


engine = initialize_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields an active database session and ensures clean closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

