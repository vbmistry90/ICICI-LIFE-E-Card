# Digital Advisor Card (Next.js + MongoDB, Netlify)
1. `npm install`, copy `.env.example` to `.env.local` and fill it (free MongoDB Atlas cluster; allow 0.0.0.0/0 in Network Access).
2. `npm run dev` -> card at `/`, admin at `/admin`.
3. Push to GitHub, import in Netlify, add the same env vars in Site settings > Environment variables.
4. Daily email reminders run via the scheduled function `netlify/functions/reminders.mjs` (needs a Gmail app password).
