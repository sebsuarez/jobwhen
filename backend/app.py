# Entry point for the Flask backend.
# Sets up the app, enables CORS, initializes the database, and exposes a single
# /graphql endpoint that serves both the GraphiQL browser UI (GET) and the API (POST).
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from database import init_db
from schema import schema

load_dotenv()

app = Flask(__name__)
CORS(app)

init_db(app)

# GraphQL endpoint
GRAPHIQL_HTML = """<!DOCTYPE html>
<html>
<head>
  <title>GraphiQL — Job When?</title>
  <link rel="stylesheet" href="https://unpkg.com/graphiql@3/graphiql.min.css" />
</head>
<body style="margin:0;">
  <div id="graphiql" style="height:100vh;"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/graphiql@3/graphiql.min.js"></script>
  <script>
    const root = ReactDOM.createRoot(document.getElementById('graphiql'));
    root.render(React.createElement(GraphiQL, {
      fetcher: GraphiQL.createFetcher({ url: '/graphql' }),
    }));
  </script>
</body>
</html>"""

# GET  /graphql -> serves the GraphiQL browser UI
# POST /graphql -> executes queries / mutations
@app.route("/graphql", methods=["GET", "POST"])
def graphql():
    if request.method == "GET":
        return GRAPHIQL_HTML, 200, {"Content-Type": "text/html"}

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"errors": [{"message": "Request body must be JSON"}]}), 400

    result = schema.execute(
        data.get("query"),
        variables=data.get("variables"),
        operation_name=data.get("operationName"),
    )

    response = {}
    if result.errors:
        response["errors"] = [{"message": str(e)} for e in result.errors]
    if result.data is not None:
        response["data"] = result.data

    status = 400 if result.errors and result.data is None else 200
    return jsonify(response), status


@app.route("/health")
def health():
    return {"status": "ok"}