// Client à copier dans chacune de tes apps (Fagent, InterviewPrep AI, etc.)
// pour appeler l'API partagée. Ne mets JAMAIS APP_SECRET dans le code
// front-end React/Vite exposé au navigateur : ce fichier est fait pour être
// utilisé côté SERVEUR (ta propre fonction serverless), qui elle-même est
// appelée par ton front-end. Voir README pour le schéma complet.

const SHARED_API_URL = process.env.SHARED_API_URL || "https://ton-api.vercel.app/api/chat";
const APP_SECRET = process.env.APP_SECRET;

async function askSharedAI({ message, history = [], systemInstruction }) {
  const res = await fetch(SHARED_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-secret": APP_SECRET,
    },
    body: JSON.stringify({ message, history, systemInstruction }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erreur API (${res.status})`);
  }
  return data.reply;
}

module.exports = { askSharedAI };
