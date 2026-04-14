# 🚀 Crackord Player – Netlify Deployment Guide

## Schnell-Anleitung (3 Schritte)

### 1. GitHub Repository erstellen
```bash
cd iptv-player-netlify
git init
git add .
git commit -m "Initial Crackord Player for Netlify"
git remote add origin https://github.com/DEIN-USERNAME/crackord-player.git
git push -u origin main
```

### 2. Auf Netlify deployen
1. Gehe zu **[app.netlify.com](https://app.netlify.com)**
2. Klicke **"Add new site"** → **"Import an existing project"**
3. Wähle **GitHub** und dein Repository
4. Netlify erkennt die `netlify.toml` automatisch — keine Einstellungen nötig!
5. Klicke **"Deploy site"**

### 3. Environment Variables setzen
1. Gehe zu **Site settings** → **Environment variables**
2. Füge folgende Variablen hinzu:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://fzkmaxmbgmbyscovazsz.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_1310J508OViAtN0aBRGC5w_miBGQbma`
3. Klicke **"Redeploy"** unter Deploys → Trigger deploy

---

## ⚠️ Wichtige Hinweise

### Was funktioniert auf Netlify:
- ✅ **Login/Auth** (Supabase)
- ✅ **Xtream Codes API** (Channels laden, Kategorien, Serien)
- ✅ **M3U Playlist** laden & parsen
- ✅ **Video Proxy** (VOD/Movies/Series — einzelne Chunks)
- ✅ **VLC Download** (M3U-Datei generieren)
- ✅ **Suche, Favoriten, Sidebar, Bottom Navigation**

### Einschränkungen auf Netlify:
- ⚠️ **Live TV Streaming**: Netlify Functions haben ein **Timeout von 10s (Free) / 26s (Pro)**. Long-running Live-Streams können unterbrochen werden. VOD (Filme/Serien) funktioniert besser.
- ❌ **FFmpeg Transcoding**: Wurde durch einen Fallback-Endpunkt ersetzt. HEVC-Streams müssen nativ vom Browser unterstützt werden.

### Für volles Live-TV-Streaming empfohlen:
Deploye auf **Railway**, **Render** oder einem **VPS** (Hetzner ~4€/Monat).

---

## 🔧 Lokales Testen

```bash
npm install
npm run dev
```

Öffne http://localhost:3005

---

## 📁 Projektstruktur

```
iptv-player-netlify/
├── netlify.toml          # Netlify-Konfiguration
├── package.json          # Abhängigkeiten (ohne FFmpeg)
├── next.config.ts        # Next.js für Netlify optimiert
├── src/
│   ├── app/
│   │   ├── page.tsx      # Hauptseite (identisch zum Original)
│   │   ├── layout.tsx    # Layout
│   │   ├── globals.css   # Crackord Premium Design
│   │   └── api/
│   │       ├── proxy/    # Video-Proxy (angepasst)
│   │       ├── xtream/   # Xtream API (identisch)
│   │       ├── playlist/ # M3U Parser (identisch)
│   │       ├── vlc/      # VLC Download (identisch)
│   │       └── transcode/# Fallback (kein FFmpeg)
│   ├── components/       # Alle UI-Komponenten (identisch)
│   └── lib/              # Supabase, M3U Parser, Xtream Client
└── public/               # Logo, Favicons etc.
```
