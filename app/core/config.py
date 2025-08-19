from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    PROJECT_NAME: str = "EOSync"
    WORK_START: str = "09:00"
    WORK_END: str = "18:00"
    TIMEZONE: str = "Europe/Rome"
    MODEL_API_KEY: str
    MODEL_NAME: str = "gemini-2.0-flash"

    class Config:
        env_file = ".env"

settings = Settings()