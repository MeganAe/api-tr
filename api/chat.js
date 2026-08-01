// API partagée — endpoint /api/chat
// À réutiliser depuis toutes tes applications (Fagent, InterviewPrep AI, etc.)
//
// Variables d'environnement nécessaires sur Vercel :
//   AI_API_KEY   -> ta clé du fournisseur IA (ex: clé Gemini)
//   AI_ENDPOINT  -> https://generativelanguage.googleapis.com/v1beta/models
//   AI_MODEL     -> ex: gemini-3.5-flash-lite
//   APP_SECRET   -> une clé secrète que TOI seul choisis, pour protéger cette API

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée, utilise POST." });
    return;
  }

  // --- Vérification de la clé secrète envoyée par l'app appelante ---
  const providedSecret = req.headers["x-app-secret"];
  const expectedSecret = process.env.APP_SECRET;

  if (!expectedSecret) {
    res.status(500).json({ error: "APP_SECRET non configuré côté serveur." });
    return;
  }
  if (providedSecret !== expectedSecret) {
    res.status(401).json({ error: "Non autorisé : clé secrète manquante ou invalide." });
    return;
  }

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  const endpoint = process.env.AI_ENDPOINT;
  if (!apiKey || !model || !endpoint) {
    res.status(500).json({ error: "Configuration IA incomplète côté serveur." });
    return;
  }

  const { message, history, systemInstruction } = req.body || {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Le champ 'message' est requis." });
    return;
  }

  const contents = (Array.isArray(history) ? history : []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.text || "") }],
  }));
  contents.push({ role: "user", parts: [{ text: message }] });

  const body = { contents };
  if (systemInstruction && typeof systemInstruction === "string") {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  try {
    const url = `${endpoint}/${model}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Trop de requêtes vers l'IA. Réessaie dans un instant." });
      }
      if (response.status === 402) {
        return res.status(402).json({ error: "Crédits IA épuisés." });
      }
      return res.status(response.status).json({ error: "Erreur IA." });
    }

    const data = JSON.parse(text);
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "(réponse vide)";

    return res.status(200).json({ success: true, reply });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur : " + (err.message || String(err)) });
  }
};
