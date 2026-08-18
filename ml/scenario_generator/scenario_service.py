from generate_scenario import generate_scenario
from llm_scenario_generator import generate_llm_scenario


def get_scenario(attack_family: str) -> dict:
    try:
        print("Trying LLM scenario generator...")

        scenario = generate_llm_scenario(
            attack_family
        )

        print("✅ LLM scenario generated")

        return scenario

    except Exception as error:

        print(f"⚠️ LLM failed: {error}")
        print("Using deterministic fallback...")

        scenario = generate_scenario(
            attack_family
        )

        print("✅ Fallback scenario generated")

        return scenario


if __name__ == "__main__":

    scenario = get_scenario(
        "account_takeover"
    )

    print("\nFinal Scenario:\n")

    print(scenario)