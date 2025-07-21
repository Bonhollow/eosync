from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    PROJECT_NAME: str = "EOSync"
    WORK_START: str = "09:00"
    WORK_END: str = "18:00"
    TIMEZONE: str = "Europe/Rome"

    class Config:
        env_file = ".env"

settings = Settings()