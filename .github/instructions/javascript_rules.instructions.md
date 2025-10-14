---
applyTo: '*.js'
---
# ⚙️ AI ENGINEER COURSE — JAVASCRIPT PROJECT RULES (FETCH + NODE)

**Version:** 1.0  
**Language:** JavaScript (ES2023)  
**Environment:** Node.js + Browser (Vite / Vanilla JS)  
**HTTP Library:** fetch()  
**Linting:** ESLint + Prettier  
**Testing:** Jest / Vitest  
**Package Manager:** npm  

---

## 📘 1. PROJECT STRUCTURE

```
/project-name
│
├── /client
│   ├── /src
│   │   ├── index.html
│   │   ├── main.js
│   │   ├── /components/
│   │   ├── /utils/
│   │   └── /assets/
│   ├── package.json
│   └── vite.config.js
│
├── /server
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── /tests
    ├── client.test.js
    └── api.test.js
```

---

## ⚙️ 2. CODE STYLE

- Follow **Airbnb JS Style Guide**.
- Use **ES modules** and **async/await**.
- Prefer **arrow functions**.

Example:
```js
export const fetchData = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Error: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    return null
  }
}
```

---

## 🧩 3. API DESIGN (Node.js)

- Use **Express** and modular architecture.

Example route:
```js
import express from 'express'
import { getPrediction } from '../controllers/aiController.js'
const router = express.Router()

router.post('/predict', getPrediction)
export default router
```

Example controller:
```js
export const getPrediction = async (req, res) => {
  try {
    const { text } = req.body
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    const data = await response.json()
    res.json({ status: 'success', data })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
}
```

---

## 🧠 4. FRONTEND FETCH RULES

Example:
```js
export async function postData(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Request failed')
  return await res.json()
}
```

---

## 🧪 5. TESTING

- **Client:** Vitest  
- **Server:** Jest or Supertest

---

## 🔐 6. SECURITY PRACTICES

- Never hardcode secrets.
- Sanitize input.
- Use `.env`.


---

## 7. KISS

- Keep it simple, stupid
- These are small mini-projects to test small AI apps

---

## 🧾 8. DOCUMENTATION

- Include `README.md`, `API.md`, `ARCHITECTURE.md`, and `CHANGELOG.md`.

---

## 💡 9. VERSIONING

- Use semantic versioning and standard branches.

---

## 📈 10. LEARNING LOG

Each project must include `/docs/learning.md`.

> “Think async, code atomic, fetch smart.”
