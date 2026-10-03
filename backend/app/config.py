from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    cors_origins: str = "http://localhost:4000"

    # Voice Generation: ElevenLabs
    elevenlabs_api_key: str = ""

    # Legacy fields for existing B4 tests/endpoints (not used in primary Gemini + ElevenLabs stack)
    openai_api_key: str = ""
    openai_realtime_model: str = "gpt-4o-realtime-preview"
    openai_realtime_voice: str = "alloy"


    # Alert notification provider (mock simulates SMS and feeds live dispatcher dashboard)
    # Exclusively mock is used for the hackathon demo
    alert_provider: str = "mock"

    model_config = {"env_file": [".env", "../.env"], "extra": "ignore"}


settings = Settings()
