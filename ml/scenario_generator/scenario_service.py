try:
    from ml.scenario_generator.llm_scenario_generator import (
        generate_llm_scenario,
        generate_local_fallback_scenario,
    )
except ModuleNotFoundError:
    from llm_scenario_generator import (
        generate_llm_scenario,
        generate_local_fallback_scenario,
    )


def get_scenario(attack_family: str) -> dict:
    try:
        print("Trying LLM scenario generator...")

        scenario = generate_llm_scenario(
            attack_family
        )

        print("Scenario generated")

        return scenario

    except Exception as error:

        print(f"LLM failed: {error}")
        print("Using deterministic fallback...")

        scenario = generate_local_fallback_scenario(
            attack_family,
            f"Scenario service failure: {error}",
        )

        print("Fallback scenario generated")

        return scenario


if __name__ == "__main__":

    scenario = get_scenario(
        "account_takeover"
    )

    print("\nFinal Scenario:\n")

    print(scenario)
