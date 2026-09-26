from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine
from config import DATABASE_URL

# creating engine to connect to the database
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

# create tables in the database with safe migration
def create_tables():
    SQLModel.metadata.create_all(engine)
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(job);")).fetchall()
            columns = [row[1] for row in result]
            if columns and "user_id" not in columns:
                conn.execute(text("ALTER TABLE job ADD COLUMN user_id VARCHAR;"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_user_id ON job (user_id);"))
                conn.commit()
        except Exception:
            pass

# create session to get the data from database and add data to the database
def get_session():
    with Session(engine) as session:
        yield session
