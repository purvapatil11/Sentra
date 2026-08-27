import json
import os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from jsonschema import Draft202012Validator
from openai import OpenAI, RateLimitError

try:
    from ml.scenario_generator.generate_scenario import (
        generate_scenario,
        validate_scenario,
    )
except ModuleNotFoundError:
    from generate_scenario import generate_scenario, validate_scenario


load_dotenv()


PROJECT_ROOT = Path(__file__).resolve().parents[2]

SCHEMA_PATH = (
    PROJECT_ROOT
    / "shared"
    / "schemas"
    / "scenario_schema.json"
)

PROMPT_PATH = (
    Path(__file__).parent
    / "prompts"
    / "scenario_prompt.txt"
)


def load_schema() -> dict:
    with open(SCHEMA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def get_validation_errors(schema: dict, scenario: dict) -> list[str]:
    validator = Draft202012Validator(schema)
    errors = sorted(
        validator.iter_errors(scenario),
        key=lambda error: list(error.path)
    )

    return [error.message for error in errors]


def local_fallback_enabled() -> bool:
    return os.getenv(
        "AEGISPAY_LOCAL_FALLBACK",
        "true"
    ).lower() in {"1", "true", "yes"}


def attach_generation_provenance(
    scenario: dict,
    *,
    source: str,
    provider: str,
    model: str,
    response_id: str | None = None,
    fallback_reason: str | None = None,
) -> dict:
    scenario["_generation"] = {
        "source": source,
        "provider": provider,
        "model": model,
        "response_id": response_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "fallback_reason": fallback_reason,
    }
    return scenario


def generate_local_fallback_scenario(
    attack_family: str,
    reason: str
) -> dict:
    scenario = generate_scenario(attack_family)

    if not validate_scenario(scenario):
        raise ValueError(
            "Local fallback scenario failed schema validation."
        )

    print(f"Using local fallback scenario: {reason}")
    return attach_generation_provenance(
        scenario,
        source="local_fallback",
        provider="AegisPay deterministic engine",
        model="local-rules-v1",
        fallback_reason=reason,
    )


def get_client() -> OpenAI:

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is missing from .env"
        )

    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key
    )


def generate_llm_scenario(
    attack_family: str
) -> dict:

    allowed_attacks = {
        "account_takeover",
        "ai_social_engineering",
        "synthetic_identity"
    }

    if attack_family not in allowed_attacks:
        raise ValueError(
            f"Unsupported attack family: {attack_family}"
        )

    try:
        client = get_client()
    except ValueError as error:
        if local_fallback_enabled():
            return generate_local_fallback_scenario(
                attack_family,
                str(error)
            )

        raise

    schema = load_schema()
    system_prompt = load_prompt()

    model = os.getenv(
        "OPENROUTER_MODEL",
        "nvidia/nemotron-3-super-120b-a12b:free"
    )

    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": (
                "Generate one baseline synthetic "
                f"AegisPay scenario for {attack_family}."
            )
        }
    ]

    last_content = ""
    last_errors = []

    for attempt in range(3):
        try:
            response = client.chat.completions.create(

                model=model,

                messages=messages,

                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "aegispay_scenario",
                        "strict": True,
                        "schema": schema
                    }
                },

                temperature=0.1,

                extra_body={
                    "provider": {
                        "require_parameters": True
                    }
                }
            )
        except RateLimitError as error:
            if local_fallback_enabled():
                return generate_local_fallback_scenario(
                    attack_family,
                    f"{model} is rate-limited upstream"
                )

            raise RuntimeError(
                "OpenRouter rate limit hit. Retry later, change "
                "OPENROUTER_MODEL, or set AEGISPAY_LOCAL_FALLBACK=true."
            ) from error

        except Exception as error:
            if local_fallback_enabled():
                return generate_local_fallback_scenario(
                    attack_family,
                    f"LLM request failed: {error}"
                )

            raise

        content = response.choices[0].message.content
        last_content = content or ""

        if not content:
            last_errors = ["Model returned empty content."]
        else:
            try:
                scenario = json.loads(content)
            except json.JSONDecodeError as error:
                last_errors = [f"Model returned invalid JSON: {error.msg}"]
            else:
                if not isinstance(scenario, dict):
                    last_errors = ["Model returned JSON that is not an object."]
                elif scenario.get("attack_family") != attack_family:
                    last_errors = [
                        "Model returned a different attack family."
                    ]
                else:
                    last_errors = get_validation_errors(schema, scenario)

                if not last_errors and validate_scenario(scenario):
                    return attach_generation_provenance(
                        scenario,
                        source="llm",
                        provider="OpenRouter",
                        model=getattr(response, "model", None) or model,
                        response_id=getattr(response, "id", None),
                    )

        messages.extend(
            [
                {
                    "role": "assistant",
                    "content": last_content
                },
                {
                    "role": "user",
                    "content": (
                        "Fix the JSON and return the complete object only. "
                        "It must include every required schema property. "
                        f"Validation errors: {json.dumps(last_errors)}"
                    )
                }
            ]
        )

        if attempt < 2:
            print(f"Retrying scenario generation, attempt {attempt + 2}/3")

    if local_fallback_enabled():
        return generate_local_fallback_scenario(
            attack_family,
            (
                "LLM scenario failed validation after retries. "
                f"Errors: {json.dumps(last_errors)}"
            )
        )

    raise ValueError(
        "Scenario failed schema validation. "
        f"Errors: {json.dumps(last_errors)}. "
        f"Last model output: {last_content}"
    )


if __name__ == "__main__":

    scenario = generate_llm_scenario(
        "account_takeover"
    )

    print("\nAegisPay Scenario Generated\n")

    print(
        json.dumps(
            scenario,
            indent=2
        )
    )
