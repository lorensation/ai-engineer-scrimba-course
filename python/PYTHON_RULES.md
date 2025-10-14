# 🧠 AI ENGINEER COURSE — PYTHON PROJECT RULES (FLASK)

**Version:** 1.0  
**Language:** Python 3.12  
**Framework:** Flask  
**Style Guide:** PEP 8 + Google Docstrings  
**Testing:** pytest  
**Linting:** black · flake8 · isort  
**Package Manager:** pip or poetry  

---

## 📘 1. PROJECT STRUCTURE

```
/project-name
│
├── /app
│   ├── __init__.py
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── templates/
│   └── static/
│
├── /tests
│   └── test_<module>.py
│
├── /data
│   ├── raw/
│   ├── processed/
│   └── README.md
│
├── /models
│   ├── model.pkl
│   ├── config.json
│   └── metrics.json
│
├── .env.example
├── requirements.txt
└── app.py
```

---

## ⚙️ 2. CORE RULES

### 2.1. Code Style
- Follow **PEP 8** strictly.
- Use **type hints** and **Google-style docstrings**:
  ```python
  def predict(text: str) -> dict:
      """
      Generates a prediction from the model.

      Args:
          text (str): Input text for analysis.

      Returns:
          dict: Prediction results and confidence score.
      """
  ```
- Use **logging** instead of `print()` for debugging.

### 2.2. Flask Setup
- Entry point must be `app.py` or `main.py`.
- Always use Blueprints.
- Use environment variables with `python-dotenv`.

---

## 🧩 3. DESIGN METHODOLOGY

- Follow **Clean Architecture** principles:
  - `routes` → defines HTTP interface
  - `services` → business logic
  - `models` → data or ML models
  - `utils` → helpers
- Keep functions **pure and testable**.
- Separate **training scripts** from **serving code**.

---

## 🧠 4. AI & DATA PIPELINES

### 4.1. Data Storage
- Datasets under `/data/raw` and `/data/processed`.
- Never commit files >50MB.

### 4.2. Model Management
- Store models in `/models/` with metadata.
- Log training results in `.json` or `.csv`.

### 4.3. Inference API Example
```python
@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    text = data.get("text", "")
    result = model.predict([text])
    return jsonify({"status": "success", "prediction": result.tolist()})
```

---

## 🧪 5. TESTING

- Use **pytest**, ≥80% coverage.
- Example:
  ```python
  def test_predict_route(client):
      res = client.post("/api/predict", json={"text": "Hello"})
      assert res.status_code == 200
  ```

---

## 🔐 6. SECURITY

- Never commit secrets.
- Use HTTPS and sanitize input.

---

## 🚀 7. DEPLOYMENT

- Use **Docker**, **Gunicorn**, and CI/CD pipelines.

---

## 🧾 8. DOCUMENTATION

- Include `README.md`, `API.md`, `CHANGELOG.md`, and `ARCHITECTURE.md`.

---

## 💡 9. VERSIONING

- Use semantic versioning (`vMAJOR.MINOR.PATCH`).

---

## 📈 10. LEARNING LOG

Each project must include `/docs/learning.md`.

> “Code like a researcher, deploy like an engineer.”
