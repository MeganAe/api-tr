const SHARED_API_URL = process.env.SHARED_API_URL || "https://metoush-api.vercel.app/api/chat";
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
