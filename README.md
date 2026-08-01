# Shared AI API

API REST minimaliste et partagée, à déployer une seule fois sur Vercel, et
réutilisable depuis toutes tes applications (Fagent, InterviewPrep AI, etc.)
pour éviter de dupliquer la logique d'appel IA dans chaque projet.

## Endpoints

### `POST /api/chat`

Headers requis :
- `Content-Type: application/json`
- `x-app-secret: <ta clé secrète>`

Body :
```json
{
  "message": "Bonjour, comment ça va ?",
  "history": [
    { "role": "user", "text": "message précédent" },
    { "role": "assistant", "text": "réponse précédente" }
  ],
  "systemInstruction": "Tu es un assistant sympathique."
}
```

Réponse (succès) :
```json
{ "success": true, "reply": "texte de réponse de l'IA" }
```

Réponse (erreur) :
```json
{ "error": "description de l'erreur" }
```

### `GET /api/health`

Vérifie que l'API tourne bien. Retourne `{ "status": "ok" }`.

## Déployer sur Vercel

1. Crée un repo GitHub avec ces fichiers
2. Sur vercel.com → "Add New" → "Project" → importe le repo
3. Dans **Settings → Environment Variables**, ajoute :

| Nom | Valeur |
|---|---|
| `AI_API_KEY` | ta clé Gemini |
| `AI_ENDPOINT` | `https://generativelanguage.googleapis.com/v1beta/models` |
| `AI_MODEL` | `gemini-3.5-flash-lite` |
| `APP_SECRET` | une chaîne secrète longue et aléatoire, choisie par toi |

4. Déploie. Ton API est accessible à `https://ton-projet.vercel.app/api/chat`

## Utiliser cette API depuis une autre app

⚠️ **Important** : `APP_SECRET` ne doit **jamais** être exposé côté
navigateur (pas dans du code React qui tourne dans le navigateur de
l'utilisateur — n'importe qui pourrait l'y lire et voler ta clé).

Le bon schéma est donc toujours en 2 sauts :

```
Navigateur de l'utilisateur
      │  (aucune clé secrète ici)
      ▼
Ton app (ex: Fagent) → sa propre fonction serveur (/api/chat de Fagent)
      │  (APP_SECRET utilisé ici, côté serveur uniquement)
      ▼
Cette API partagée (shared-ai-api) → fournisseur IA
```

Dans la fonction serveur de chaque app, copie `client-example.js` et
appelle `askSharedAI(...)`. Ajoute `SHARED_API_URL` et `APP_SECRET` dans les
variables d'environnement de **chaque app**, avec la même valeur de
`APP_SECRET` que celle définie ici.
