from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    cors_origins: str = "http://localhost:4000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
