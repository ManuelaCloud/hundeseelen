# Hundevermittlung App – Verlorene Hundeseelen Südpfalz e.V.

## Setup in 4 Schritten

### 1. Supabase einrichten
1. Neues Projekt auf supabase.com erstellen
2. Unter SQL Editor den Inhalt von `supabase-setup.sql` einfügen und ausführen
3. Unter Storage → New Bucket: Bucket `fotos` erstellen, Public: AN
4. Unter Project Settings → API die Werte kopieren:
   - Project URL → für NEXT_PUBLIC_SUPABASE_URL
   - anon public Key → für NEXT_PUBLIC_SUPABASE_ANON_KEY

### 2. Auf Vercel deployen
1. Diesen Ordner als GitHub-Repository pushen
2. Auf vercel.com → New Project → GitHub-Repo auswählen
3. Unter Environment Variables eintragen:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_APP_PASSWORD (Passwort für Helfer:innen)
4. Deploy klicken

### 3. WordPress Plugin installieren
Separat als tierschutzhunde-plugin.zip geliefert.
1. WordPress Backend → Plugins → Installieren → Plugin hochladen
2. Einstellungen → Tierschutzhunde → API-URL eintragen
3. Shortcode [tierschutzhunde] auf der gewünschten Seite einfügen

### 4. Helfer:innen einweisen
- Link: https://DEINE-APP.vercel.app
- Auf dem Handy: "Zum Homescreen hinzufügen"

## Öffentliche API
GET /api/dogs – alle verfügbaren Hunde als JSON
