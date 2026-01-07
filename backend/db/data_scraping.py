import requests
import mysql.connector
import time
import json
import random

API_KEY = ""

CATEGORIES = {
    "counseling": [
        "foster care counseling",
        "youth mental health counseling",
        "youth trauma therapy",
        "bilingual youth counseling",
    ],
    "organization": [
        "nonprofit organization",
        "youth support organization",
        "youth volunteer organization",
        "foster care nonprofit organization",
    ],
    "housing": [
        "housing authority",
        "supportive housing",
        "housing assistance",
        "transitional housing",
    ],
}

STATES = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
]

conn = mysql.connector.connect(
    #credentials removed for public access purposes
)
cursor = conn.cursor()


def fetch_places(query, state):
    """Fetch all pages of Places Text Search results for a query in a state."""
    results = []
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query.replace(' ', '+')}+in+{state.replace(' ', '+')}&key={API_KEY}"

    while url:
        try:
            res = requests.get(url)
            data = res.json()
        except Exception as e:
            print(f"Request failed for '{query}' in {state}: {e}")
            break

        status = data.get("status")
        if status != "OK" and status != "ZERO_RESULTS":
            print(f"API returned {status} for '{query}' in {state}")
            break
        elif status == "OVER_QUERY_LIMIT":
            print("Hit query limit, sleeping...")
            time.sleep(60)
            continue
        elif status == "UNKNOWN_ERROR":
            print("Temporary error, retrying...")
            time.sleep(2)
            continue
        elif status not in ("OK", "ZERO_RESULTS"):
            print(f"API error {status}")
            break

        results.extend(data.get("results", []))

        # Pagination
        time.sleep(2)
        next_page_token = data.get("next_page_token")
        if next_page_token:
            time.sleep(2)  # token activation delay
            url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken={next_page_token}&key={API_KEY}"
        else:
            url = None

    return results


def fetch_place_details(place_id):
    """Fetch phone, website, and photo info for a place."""
    detail_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=formatted_phone_number,website,photos&key={API_KEY}"
    try:
        detail_res = requests.get(detail_url).json().get("result", {})
    except Exception as e:
        print(f"Failed to fetch details for place_id {place_id}: {e}")
        return None, None, None

    phone = detail_res.get("formatted_phone_number")
    website = detail_res.get("website")
    photo_url = None
    photos = detail_res.get("photos", [])
    if photos:
        photo_ref = photos[0]["photo_reference"]
        photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference={photo_ref}&key={API_KEY}"

    return phone, website, photo_url


MAX_PER_STATE = 5  # maximum number of places per state per category

# Keep track of how many places we’ve inserted per state/category
state_category_count = {
    state: {"counseling": 0, "organization": 0, "housing": 0} for state in STATES
}

# Main scraping loop with limit
try:
    for state in STATES:
        for category, keywords in CATEGORIES.items():
            if category == "counseling":
                table_name = "counseling"
            elif category == "organization":
                table_name = "organizations"
            else:
                table_name = "housing"

            # Skip this category if we already reached MAX_PER_STATE for the state
            if state_category_count[state][category] >= MAX_PER_STATE:
                continue

            # Shuffle keywords to randomize order
            shuffled_keywords = keywords.copy()
            random.shuffle(shuffled_keywords)

            for keyword in shuffled_keywords:
                remaining_slots = MAX_PER_STATE - state_category_count[state][category]
                if remaining_slots <= 0:
                    break  # we reached the limit for this state/category

                print(f"Searching '{keyword}' ({category}) in {state}...")
                places = fetch_places(keyword, state)

                # Limit to remaining slots for the state/category
                places = places[:remaining_slots]

                for place in places:
                    place_id = place["place_id"]
                    name = place.get("name")
                    address = place.get("formatted_address")
                    lat = place["geometry"]["location"]["lat"]
                    lng = place["geometry"]["location"]["lng"]
                    rating = place.get("rating", 0)
                    types = json.dumps(place.get("types", []))

                    phone, website, photo_url = fetch_place_details(place_id)

                    try:
                        cursor.execute(
                            f"""
                            INSERT IGNORE INTO {table_name}
                            (place_id, name, address, lat, lng, rating, types, category, keyword, phone, website, photo_url, state, source)
                            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                        """,
                            (
                                place_id,
                                name,
                                address,
                                lat,
                                lng,
                                rating,
                                types,
                                category,
                                keyword,
                                phone,
                                website,
                                photo_url,
                                state,
                                "Google Places",
                            ),
                        )
                        state_category_count[state][category] += 1  # update count
                    except Exception as e:
                        print(f"DB insert failed for place_id {place_id}: {e}")

                conn.commit()
                time.sleep(1)  # avoid rate limiting
finally:
    cursor.close()
    conn.close()

cursor.close()
conn.close()
print("Data insertion complete.")
