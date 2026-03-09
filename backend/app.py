from flask import Flask

app = Flask(__name__)

# @app.route("/")
# def home():
#     return {"status": "backend running"}


# http://localhost:5001/health
@app.route("/health")
def health():
    return {"status": "ok"}