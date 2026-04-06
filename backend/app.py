import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

# this is what makes the __init__.py file in the directory important
# it allows us to import the schema directly from the gql package
from gql.schema import schema

load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")}},
    supports_credentials=True,
)


@app.route("/health")
def health():
    return {"status": "ok"}


@app.route("/graphql", methods=["GET", "POST", "OPTIONS"])
def graphql_server():
    if request.method == "OPTIONS":
        return ("", 204)

    if request.method == "GET":
        return jsonify(
            {
                "message": "GraphQL endpoint ready. Send a POST request with `query`.",
                "example": {
                    "query": "query { me { userId email fullName role { roleName } } }"
                },
            }
        )

    data = request.get_json(silent=True) or {}
    query = data.get("query")

    if not query:
        return jsonify({"errors": [{"message": "Missing GraphQL query."}]}), 400

    response = jsonify({})
    result = schema.execute(
        query,
        variable_values=data.get("variables"),
        context_value={"request": request, "response": response},
    )

    body = {}
    status_code = 200

    if result.errors:
        status_code = 400
        body["errors"] = [{"message": error.message} for error in result.errors]
    if result.data is not None:
        body["data"] = result.data

    response.set_data(app.json.dumps(body))
    response.mimetype = "application/json"
    response.status_code = status_code
    return response
