from sqlmodel import Session, SQLModel, create_engine
from config import DATABASE_URL

# creating engine to connect to the database
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

# create tables in the database
def create_tables():
    SQLModel.metadata.create_all(engine)

# create session to get the data from database and add data to the database
def get_session():
    with Session(engine) as session:
        yield session
