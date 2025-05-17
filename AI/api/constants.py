TOP_N_SIMILAR_POSTS = 5  # Number of most similar posts to store
TOP_N_SIMILAR_USERS = 10
WEIGHT_TFIDF = 0.5
WEIGHT_SBERT = 0.5

PATH_POSTS_CSV = "../api/data/posts.csv"

# TF-IDF paths
PATH_SIMILARITY_MATRIX_TFIDF = "../api/data/posts_similarity_matrix_TFIDF.csv"
PATH_TFIDF_MODEL = "../api/data/tfidf_vectorizer.pkl"
PATH_TFIDF_MATRIX = "../api/data/tfidf_matrix.npz"

# SBERT paths
PATH_SIMILARITY_MATRIX_SBERT = "../api/data/posts_similarity_matrix_SBERT.csv"
PATH_SBERT_MODEL = "../api/data/sbert_model"
PATH_SBERT_MATRIX = "../api/data/sbert_matrix.npz"

# ITINERARY GENERATOR JSONs
ITINERARY_JSON_STRUCTURE = """
{
  "destination": "string (destination name)",
  "days": [
    {
      "day": integer (day number),
      "activities": [
        {
          "title": "string (short name of activity including point of interest name)",
          "description": "string (1-2 sentences describing what the activity is and why it's interesting)",
          "location": "string (address of activity)",
        },
        ...
      ]
    },
    ...
  ]
}
"""

ITINERARY_DAY_ACTIVITIES_JSON_STRUCTURE = """
  [
    {
      "title": "string (short name of activity including point of interest name)",
      "description": "string (1-2 sentences describing what the activity is and why it's interesting)",
      "location": "string (address of activity)",
    },
    ...
  ]
"""
