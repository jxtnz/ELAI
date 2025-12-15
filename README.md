# Portfolio (jxtnz)

React + Vite frontend in `frontend/src` and Express backend in `backend` that pulls the latest GitHub repositories for `jxtnz` and relays chat messages to a Flowise chatbot.

## Setup
```bash
npm install
```

Create a `.env` in the project root:
```
PORT=4000
FLOWISE_API_URL=http://localhost:3000/api/v1/prediction/<your-flowise-chatbot-id>
```

## Scripts
- `npm run dev` – start backend (4000) and Vite dev server (5173) with proxy for `/api`
- `npm run dev:server` – Express with nodemon (backend)
- `npm run dev:client` – Vite only (frontend)
- `npm run build` / `npm run preview`

## API
- `GET /api/projects` – top 5 non-fork repos from GitHub user `jxtnz`
- `POST /api/chat` – `{ message, sessionId? }` relayed to Flowise endpoint

## Notes
- Frontend sections: Home, About, Projects, Skills, Chatbot.
- Chatbot UI streams through the backend so the Flowise URL stays server-side.

