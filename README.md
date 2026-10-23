# Alpha Telefonliste

Firmenweite Telefonliste aller aktiven Mitarbeitenden aus AlphaCore (Directus) –
im Alpha-Designsystem (wie AlphaRequestManager / AlphaContactSync: Türkis `#3EAAB8`, Inter, Tailwind 4).

- Suche über Name, Position, Firma, Niederlassung, E-Mail und Nummern – Umlaute egal („mueller" → Müller),
  Nummern in beiden Formaten („0171 …" und „+49 171 …"). `/` fokussiert die Suche, `Esc` leert sie.
  Die Suche steht in der URL (`?q=…`) und lässt sich als Link teilen.
- Filter nach Firma und Niederlassung, Kachel- und Tabellenansicht (auf dem Handy immer Kacheln)
- Klick-to-call, `mailto:`, Teams-Chat, Kopieren per Klick
- Helles/dunkles Design umschaltbar (gemerkt im Browser)

## Lokal starten

```bash
npm install
cp .env.example .env   # Werte eintragen
npm run dev
```

Mit `VITE_USE_MOCK=true` läuft die App mit Beispieldaten, ohne AlphaCore.

## AlphaCore-Anbindung

Standardwerte entsprechen dem Schema, das auch AlphaContactSync nutzt:

| Einstellung | Wert |
| --- | --- |
| Collection | `mitarbeitende` |
| Aktiv-Filter | `status` ∈ `aktiv` **und** `exit_date` leer oder ≥ gestern |
| Felder | `first_name`, `last_name`, `email`, `job_title`, `phone`, `mobile` |
| Relationen | `company.name` (→ `firmen`), `location.name` (→ `niederlassungen`) |

„Position" in der Liste ist das AlphaCore-Feld `job_title`, **nicht** `position` (Rollen-Kategorie).
Der Aktiv-Filter läuft serverseitig in Directus; Status und Austrittsdatum werden nicht geladen.

Directus-Token: eigener User mit Rolle **nur Lesen** auf `mitarbeitende` (nur die obigen Felder) sowie auf
`firmen.name` und `niederlassungen.name`. Schema-Rechte (`directus_fields`, `directus_relations`) braucht die App nicht.

## Warum ein Proxy?

Der Browser spricht nie direkt mit AlphaCore, sondern mit `/api`. Der Proxy (Vite im Dev, nginx in Produktion)
hängt den Token serverseitig an – er steht also nicht im JavaScript-Bundle. nginx lässt nur `GET /items` und
`GET /assets` durch.

## Produktion (Docker / Dokploy)

```bash
docker build -t alpha-telefonliste .
docker run -p 8080:80 -e DIRECTUS_URL=https://alphacore.example.org -e DIRECTUS_TOKEN=xxx alpha-telefonliste
```

`VITE_*`-Werte werden beim Build eingebacken (aus `.env`), `DIRECTUS_URL`/`DIRECTUS_TOKEN` erst beim Containerstart gesetzt.

**Wichtig:** Die App hat selbst keinen Login. Sie gehört nur ins interne Netz bzw. hinter euren
bestehenden SSO-/Reverse-Proxy, damit die Kontaktdaten nicht öffentlich erreichbar sind.
