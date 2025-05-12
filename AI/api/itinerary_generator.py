from models import GeneratedItinerary, ItineraryActivity
from constants import ITINERARY_JSON_STRUCTURE, ITINERARY_DAY_ACTIVITIES_JSON_STRUCTURE
import ollama
import json


def build_prompt_for_itinerary_generation(
    destination: str, days: int, preferences: list[str]
) -> str:
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
    prompt = build_prompt_for_itinerary_generation(destination, days, preferences)

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


def build_prompt_for_day_activities_regeneration(
    destination: str, excluded_activities: list[str]
) -> str:
    if excluded_activities:
        excluded_activities_string = ", ".join(excluded_activities)
        return (
            f"Generate 2 to 4 activities for a day in {destination}."
            f"Do not include any of the following activities: {excluded_activities_string}. "
            f"Return the result strictly as a JSON array following this structure:\n{ITINERARY_DAY_ACTIVITIES_JSON_STRUCTURE}"
        )
    else:
        return (
            f"Generate 2 to 4 activities for a day in {destination}. "
            f"Return the result strictly as a JSON array following this structure:\n{ITINERARY_DAY_ACTIVITIES_JSON_STRUCTURE}"
        )


def regenerate_day_activities(
    destination: str, excluded_activities: list[str]
) -> list[dict]:
    prompt = build_prompt_for_day_activities_regeneration(
        destination, excluded_activities
    )

    try:
        response = ollama.chat(
            model="mistral", messages=[{"role": "user", "content": prompt}]
        )

        raw_output = response["message"]["content"]
    except Exception as e:
        print(f"AI generation failed: {str(e)}")
        raise RuntimeError(f"AI generation failed: {str(e)}")

    try:
        activities_data = json.loads(raw_output)
    except json.JSONDecodeError:
        print("AI response was not valid JSON.")
        raise ValueError("AI response was not valid JSON.")

    if not isinstance(activities_data, list):
        print("Expected a JSON array of activities.")
        raise ValueError("Expected a JSON array of activities.")

    try:
        validated_activities = [
            ItineraryActivity(**activity) for activity in activities_data
        ]
    except Exception as e:
        print(f"AI response JSON did not match activity schema: {str(e)}")
        raise ValueError(f"AI response JSON did not match activity schema: {str(e)}")

    return [activity.model_dump() for activity in validated_activities]
