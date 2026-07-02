-- Tabelle erstellen
CREATE TABLE hunde (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  foto TEXT,
  rasse TEXT NOT NULL DEFAULT '',
  alter TEXT NOT NULL DEFAULT '',
  geschlecht TEXT NOT NULL DEFAULT 'Weiblich',
  status TEXT NOT NULL DEFAULT 'verfuegbar',
  kurzbeschreibung TEXT NOT NULL DEFAULT '',
  beschreibung TEXT NOT NULL DEFAULT '',
  groesse TEXT NOT NULL DEFAULT 'mittel',
  vertraeglichkeit TEXT NOT NULL DEFAULT '',
  kastriert BOOLEAN NOT NULL DEFAULT false,
  erfasst_am TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Öffentliches Lesen erlauben (für API + WordPress Plugin)
ALTER TABLE hunde ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Öffentlich lesbar" ON hunde
  FOR SELECT USING (true);

CREATE POLICY "Alle Schreibrechte" ON hunde
  FOR ALL USING (true);

-- Storage Bucket für Fotos erstellen (im Supabase Dashboard unter Storage)
-- Bucket-Name: fotos
-- Public: JA (damit Fotos öffentlich abrufbar sind)
