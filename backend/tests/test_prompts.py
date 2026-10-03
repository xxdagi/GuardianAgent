import pytest

from app.services.prompts import DEFAULT_PHRASES, build_mom_instructions


def test_mom_instructions_pl_defaults():
    prompt = build_mom_instructions("pl")
    assert "Jesteś mamą użytkownika" in prompt
    assert "Odpowiadaj ZAWSZE po polsku" in prompt
    assert "dokładnie 1-2 krótkie zdania mówione" in prompt
    assert "czy nakarmiłaś kota" in prompt
    assert "zadzwoń do dziadka" in prompt
    assert "trigger_alert" in prompt
    assert "ZASADA DYSKRECJI" in prompt


def test_mom_instructions_en_defaults():
    prompt = build_mom_instructions("en")
    assert "You are the user's mom" in prompt
    assert "ALWAYS speak in English" in prompt
    assert "strictly 1-2 natural spoken sentences" in prompt
    assert "did you feed the cat" in prompt
    assert "call grandpa" in prompt
    assert "trigger_alert" in prompt
    assert "DISGUISE RULE" in prompt


def test_mom_instructions_custom_phrases():
    prompt_pl = build_mom_instructions(
        "pl",
        alert_phrases=["nakarm psa", "podlej kwiaty"],
        emergency_phrases=["gdzie są klucze"],
    )
    assert "nakarm psa" in prompt_pl
    assert "podlej kwiaty" in prompt_pl
    assert "gdzie są klucze" in prompt_pl

    prompt_en = build_mom_instructions(
        "en",
        alert_phrases=["feed the dog", "water the plants"],
        emergency_phrases=["where are the keys"],
    )
    assert "feed the dog" in prompt_en
    assert "water the plants" in prompt_en
    assert "where are the keys" in prompt_en


def test_mom_instructions_edge_cases():
    # Empty phrases fallback to defaults
    prompt = build_mom_instructions("pl", alert_phrases=[], emergency_phrases=[])
    assert DEFAULT_PHRASES["pl"]["alert"][0] in prompt
    assert DEFAULT_PHRASES["pl"]["emergency"][0] in prompt

    # None phrases fallback to defaults
    prompt_none = build_mom_instructions("en", alert_phrases=None, emergency_phrases=None)
    assert DEFAULT_PHRASES["en"]["alert"][0] in prompt_none
    assert DEFAULT_PHRASES["en"]["emergency"][0] in prompt_none

    # Case insensitive language code
    prompt_caps = build_mom_instructions("PL")
    assert "Jesteś mamą użytkownika" in prompt_caps

    prompt_unknown = build_mom_instructions("unknown")
    assert "Jesteś mamą użytkownika" in prompt_unknown


# --- 5 Simulated test conversations per language to verify prompt guidelines ---
@pytest.mark.parametrize(
    ("scenario_name", "user_speech", "expected_tool_call", "expected_level"),
    [
        ("PL 1 - Normal casual chat", "Cześć mamo, właśnie wyszłam z uczelni.", False, None),
        ("PL 2 - Secret alert phrase", "Mamo, a powiedz mi, czy nakarmiłaś kota?", True, "alert"),
        ("PL 3 - Secret emergency phrase", "Słuchaj, zadzwoń do dziadka koniecznie dzisiaj.", True, "emergency"),
        ("PL 4 - Asking about route", "Czekam na przystanku przy dworcu, zimno jest.", False, None),
        ("PL 5 - Explicit distress", "Mamo ktoś idzie za mną i boję się.", True, "emergency"),
    ],
)
def test_simulated_conversation_scenarios_pl(scenario_name, user_speech, expected_tool_call, expected_level):
    prompt = build_mom_instructions("pl", ["czy nakarmiłaś kota"], ["zadzwoń do dziadka"])
    # Verify prompt contains explicit guidelines handling this scenario
    assert "trigger_alert" in prompt
    assert "1-2 krótkie zdania mówione" in prompt
    if expected_tool_call:
        assert expected_level in prompt
        assert ("alert" in prompt and "czy nakarmiłaś kota" in prompt) or "zadzwoń do dziadka" in prompt
    else:
        assert "podtrzymać rozmowę" in prompt


@pytest.mark.parametrize(
    ("scenario_name", "user_speech", "expected_tool_call", "expected_level"),
    [
        ("EN 1 - Normal casual chat", "Hey mom, just left the library.", False, None),
        ("EN 2 - Secret alert phrase", "By the way mom, did you feed the cat before leaving?", True, "alert"),
        ("EN 3 - Secret emergency phrase", "Mom, remember to call grandpa right away.", True, "emergency"),
        ("EN 4 - Asking about dinner", "I will be back in twenty minutes, is dinner ready?", False, None),
        ("EN 5 - Explicit danger", "Mom somebody is following me down the dark street.", True, "emergency"),
    ],
)
def test_simulated_conversation_scenarios_en(scenario_name, user_speech, expected_tool_call, expected_level):
    prompt = build_mom_instructions("en", ["did you feed the cat"], ["call grandpa"])
    assert "trigger_alert" in prompt
    assert "1-2 natural spoken sentences" in prompt
    if expected_tool_call:
        assert expected_level in prompt
        assert ("alert" in prompt and "did you feed the cat" in prompt) or "call grandpa" in prompt
    else:
        assert "keep them talking" in prompt
