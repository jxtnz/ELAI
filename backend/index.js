import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FLOWISE_API_URL = process.env.FLOWISE_API_URL || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/projects", async (_req, res) => {
  try {
    const response = await axios.get(
      "https://api.github.com/users/jxtnz/repos?per_page=100"
    );
    const repos = Array.isArray(response.data) ? response.data : [];
    const sorted = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 5)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        updatedAt: repo.updated_at,
      }));

    res.json(sorted);
  } catch (error) {
    console.error("Failed to fetch GitHub repos", error.message);
    res.status(500).json({ error: "Unable to load projects right now." });
  }
});

app.post("/api/chat", async (req, res) => {
  if (!FLOWISE_API_URL) {
    return res.status(500).json({ error: "FLOWISE_API_URL is not configured." });
  }

  const { message, sessionId } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Optional API key support if your Flowise instance requires it
    if (process.env.FLOWISE_API_KEY) {
      headers.Authorization = `Bearer ${process.env.FLOWISE_API_KEY}`;
    }

    const response = await axios.post(
      FLOWISE_API_URL,
      {
        question: message,
        overrideConfig: {
          sessionId: sessionId || undefined,
        },
      },
      { headers }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Chat relay failed",
      error.message,
      error.response?.status,
      error.response?.data
    );
    const status = error.response?.status || 500;
    const data =
      error.response?.data || { error: "Unable to reach chatbot service." };
    res.status(status).json(data);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

