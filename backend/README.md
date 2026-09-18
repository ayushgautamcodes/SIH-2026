# RoG-उपाttam backend (starter)

Minimal FastAPI backend matching the state shape already used in your
`script.js` prototype. Tested end-to-end: session creation, consent,
answers, red-flag detection, and summary generation all work.

## Run it

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Then open http://127.0.0.1:8000/docs — FastAPI auto-generates an
interactive API tester there. Use it to try every endpoint without
writing any frontend code first.

## What's here

| File | Purpose |
|---|---|
| `database.py` | DB connection. Uses SQLite by default (zero setup). Set `DATABASE_URL` env var to a Postgres URL to switch — no other code changes needed. |
| `models.py` | SQLAlchemy tables: `sessions`, `documents`, `summaries` |
| `schemas.py` | Request/response validation |
| `red_flags.py` | Server-side port of your `checkForUrgentSymptoms()` — only 4 rules ported as examples, add the rest from your original `script.js` the same way |
| `main.py` | All API endpoints |

## Endpoints

- `POST /api/sessions` — start a session
- `POST /api/sessions/{id}/consent` — record consent
- `PUT /api/sessions/{id}/patient` — save patient details
- `PUT /api/sessions/{id}/concern` — set selected health concern
- `PUT /api/sessions/{id}/answers` — save Q&A answers (also re-runs red-flag check)
- `PUT /api/sessions/{id}/ayush` — save AYUSH history answers
- `POST /api/sessions/{id}/documents` — upload a file (multipart)
- `POST /api/sessions/{id}/summary` — generate the structured summary
- `GET /api/sessions/{id}/summary` — fetch a generated summary
- `POST /api/sessions/{id}/physician-review` — mark doctor-reviewed

## Wiring this into your existing `script.js`

Your frontend currently just mutates a local `state` object. To connect
it to this backend, wrap state changes with `fetch()` calls, e.g. in
`generateSummary()`:

```js
async function generateSummary() {
  const res = await fetch(`http://127.0.0.1:8000/api/sessions/${state.sessionId}/summary`, {
    method: 'POST'
  });
  const summary = await res.json();
  state.patientSummary = summary;
  go('summary');
}
```

You'll need to call `POST /api/sessions` once at app start and store the
returned `id` as `state.sessionId`.

## Two things intentionally left as TODOs (marked in code)

1. **Real OCR** in the document upload endpoint — currently returns a
   placeholder. Swap in a Google Vision/PaddleOCR call where marked.
2. **LLM-based summary narrative** in `generate_summary()` — currently
   templated, same as your JS version. Swap in an LLM API call where marked.

Both are deliberately left as clearly marked stubs so you can wire in
whichever API keys you decide on without re-architecting anything.
