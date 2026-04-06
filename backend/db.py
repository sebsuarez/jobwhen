import os

from sqlalchemy import create_engine

DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or f"postgresql+psycopg2://{os.getenv('DB_USER', os.getenv('POSTGRES_USER', 'seb'))}:"
    f"{os.getenv('DB_PASSWORD', os.getenv('POSTGRES_PASSWORD', '123456'))}@"
    f"{os.getenv('DB_HOST', 'db')}:{os.getenv('DB_PORT', '5432')}/"
    f"{os.getenv('DB_NAME', os.getenv('POSTGRES_DB', 'jobwhen'))}"
)

engine = create_engine(DATABASE_URL, future=True)
