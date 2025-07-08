# Heizungssteuerung 2025

Eine moderne, mobile-optimierte Web-App zur intelligenten Steuerung von Heizung und Warmwasser mit PV-Integration und Wettervorhersage.

## 🚀 Features

- **Dashboard** mit Echtzeit-Übersicht aller Systeme
- **Warmwassersteuerung** mit PV-Überschussstrom-Integration
- **Heizungssteuerung** mit wetterbasierter Optimierung
- **Detaillierte Statistiken** mit interaktiven Charts
- **Systemkonfiguration** für alle Sensoren und Parameter
- **PWA-fähig** - installierbar auf iOS und Android
- **Vollständig responsiv** - optimiert für iPhone SE und größer

## 📋 Voraussetzungen

- Node.js 18+ 
- NPM oder Yarn
- Supabase Account mit konfigurierter Datenbank
- Laufende Python-Poller für Datenaggregation

## 🛠️ Installation

1. Repository klonen:
```bash
git clone [repository-url]
cd heating-control-app
```

2. Dependencies installieren:
```bash
npm install
# oder
yarn install
```

3. Umgebungsvariablen konfigurieren:
```bash
cp .env.local.example .env.local
```

Dann `.env.local` mit deinen Supabase-Zugangsdaten ausfüllen:
```
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
WEATHER_LATITUDE=50.1109
WEATHER_LONGITUDE=8.6821
```

4. Entwicklungsserver starten:
```bash
npm run dev
# oder mit Turbopack (empfohlen)
npm run dev --turbo
```

Die App ist nun unter `http://localhost:3000` verfügbar.

## 🏗️ Build für Produktion

```bash
npm run build
npm start
```

## 📱 Mobile Installation

Die App ist als PWA (Progressive Web App) konzipiert:

### iOS:
1. Öffne die App in Safari
2. Tippe auf das Teilen-Symbol
3. Wähle "Zum Home-Bildschirm"

### Android:
1. Öffne die App in Chrome
2. Tippe auf das Menü (3 Punkte)
3. Wähle "App installieren"

## 🗄️ Datenbankstruktur

Die App erwartet folgende Tabellen in Supabase:

### em3Data
- `unix_time`: bigint
- `total_power`: numeric
- `a_power`: numeric
- `b_power`: numeric
- `c_power`: numeric
- `created_at`: timestamp

### temperatureSensors
- `t1`: numeric (Warmwasser)
- `t2`: numeric (Vorlauf Heizung)
- `t3`: numeric (Rücklauf Heizung)
- `created_at`: timestamp

### weather
- `timestamp_utc`: timestamp
- `temperature`: numeric
- `cloud_cover`: numeric
- `sunshine`: integer
- ... (weitere Wetterfelder gemäß BrightSky API)

### weatherraw
- `api_response`: jsonb
- `latitude`: numeric
- `longitude`: numeric
- `request_timestamp`: timestamp

## 🔧 Konfiguration

### Temperatursensoren
Die Kalibrierung der Sensoren kann in den Systemeinstellungen vorgenommen werden. Offset-Werte werden in °C angegeben.

### Strompreis
Der aktuelle Strompreis (€/kWh) wird für alle Kostenberechnungen verwendet und kann in den Systemeinstellungen angepasst werden.

### Wetterbasierte Steuerung
- Temperaturreduzierung bei Sonnenschein
- Temperaturerhöhung bei extremer Kälte
- Konfigurierbare Schwellwerte

## 🛡️ Fehlerbehandlung

Die App verfügt über umfassende Fehlerbehandlung:
- Error Boundaries für unerwartete Fehler
- Verbindungsfehler-Anzeigen
- Automatische Wiederholungsversuche
- Graceful Degradation bei fehlenden Daten

## 📊 API Endpoints

- `GET /api/em3/latest` - Aktuelle Stromverbrauchsdaten
- `GET /api/temperature/latest` - Aktuelle Temperaturdaten
- `GET /api/weather/latest` - Aktuelle Wetterdaten
- `GET /api/statistics/[range]` - Historische Daten (10h, 24h, 7d, 30d, 365d)

## 🎨 Design System

Die App verwendet ein Apple iOS-inspiriertes Design mit:
- Tailwind CSS für Styling
- Framer Motion für Animationen
- Heroicons für Icons
- Chart.js für Datenvisualisierung

## 🤝 Mitwirkende

- Frontend-Entwicklung: [Sohn]
- Konzept & Design: [Vater]
- Backend/IoT: Python-Poller auf Ubuntu Server

## 📄 Lizenz

Dieses Projekt ist privat und nicht zur öffentlichen Nutzung bestimmt.