from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    cors_origins: str = "http://localhost:4000"

    # LLM Reasoning: Google Gemini Flash (Free Tier, NO CREDIT CARD required)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Voice Generation: ElevenLabs (Free Tier 10,000 credits, NO CREDIT CARD required)
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Rachel (warm female voice)

    # Legacy fields for existing B4 tests/endpoints (not used in primary Gemini + ElevenLabs stack)
    openai_api_key: str = ""
    openai_realtime_model: str = "gpt-4o-realtime-preview"
    openai_realtime_voice: str = "alloy"


    # Alert notification provider (mock simulates SMS and feeds live dispatcher dashboard)
    # Exclusively mock is used for the hackathon demo
    alert_provider: str = "mock"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
