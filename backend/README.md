## Backend Setup

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```
cd backend
npm i
npm run dev
# or build & start
npm run build
npm start
```

### Environment Variables

Copy `ENV.EXAMPLE` to `.env` and fill in values:

```
PORT=3001
NODE_ENV=development

# Hugging Face
# Create a token at: https://huggingface.co/settings/tokens
HUGGINGFACE_API_TOKEN=hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: override default text generation model
# e.g. mistralai/Mixtral-8x7B-Instruct-v0.1
HUGGINGFACE_MODEL_ID=mistralai/Mixtral-8x7B-Instruct-v0.1
```

### Hugging Face Integration

- `src/ai.service.ts` uses Hugging Face Inference when `HUGGINGFACE_API_TOKEN` is set.
- If the token is missing or a request fails, it falls back to built‑in placeholder responses.
- Change the model via `HUGGINGFACE_MODEL_ID` if desired.

### API Endpoints

- `POST /api/v1/ask` — Ask a question. Body: `{ text: string, mode?: 'explain' | string }`
- `POST /api/v1/quiz/start` — Start a quiz.
- `POST /api/v1/quiz/answer` — Grade answer.
- `POST /api/v1/plan/generate` — Generate study plan.
