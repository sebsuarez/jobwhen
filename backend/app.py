import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")}},
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


# http://localhost:5001/health
@app.route("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/google")
def google_auth():
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "GOOGLE_CLIENT_ID is not configured on the server."}), 500

    data = request.get_json(silent=True) or {}
    credential = data.get("credential")

    if not credential:
        return jsonify({"error": "Missing Google credential."}), 400

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        return jsonify({"error": "Invalid Google token."}), 401

    if not payload.get("email_verified"):
        return jsonify({"error": "Google account email is not verified."}), 401

    return jsonify(
        {
            "message": "Google sign-in successful.",
            "user": {
                "google_id": payload.get("sub"),
                "email": payload.get("email"),
                "name": payload.get("name"),
                "picture": payload.get("picture"),
                "given_name": payload.get("given_name"),
                "family_name": payload.get("family_name"),
            },
        }
    )
