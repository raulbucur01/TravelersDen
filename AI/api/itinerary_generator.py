from models import GeneratedItinerary
from constants import ITINERARY_JSON_STRUCTURE
import ollama
import json


def build_prompt(destination: str, days: int, preferences: list[str]) -> str:
    if preferences:
        pref_string = ", ".join(preferences)
        return (
            f"Generate a {days}-day travel itinerary for {destination} "
            f"User preferences: {pref_string}. "
            f"Return the result strictly as a JSON object following this structure:\n{ITINERARY_JSON_STRUCTURE}"
        )
    else:
        return (
            f"Generate a {days}-day travel itinerary for {destination}. "
            f"Return the result strictly as a JSON object following this structure:\n{ITINERARY_JSON_STRUCTURE}"
        )


def generate_itinerary(destination: str, days: int, preferences: list[str]) -> dict:
    prompt = build_prompt(destination, days, preferences)

    try:
        response = ollama.chat(
            model="mistral", messages=[{"role": "user", "content": prompt}]
        )

        raw_output = response["message"]["content"]
    except Exception as e:
        print(f"AI generation failed: {str(e)}")
        raise RuntimeError(f"AI generation failed: {str(e)}")

    try:
        itinerary_data = json.loads(raw_output)
    except json.JSONDecodeError:
        print("AI response was not valid JSON.")
        raise ValueError("AI response was not valid JSON.")

    try:
        validated_itinerary = GeneratedItinerary(**itinerary_data)
    except Exception as e:
        print(f"AI response JSON did not match expected schema: {str(e)}")
        raise ValueError(f"AI response JSON did not match expected schema: {str(e)}")

    return validated_itinerary.model_dump()
