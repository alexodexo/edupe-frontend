# Edupe Frontend

Eine moderne, vollständig responsive Web-Anwendung für die Verwaltung von Dokumenten, Fällen, Helfern und Berichten mit integrierter Suchfunktionalität und Authentifizierung.

## 🚀 Features

- **Authentifizierung & Autorisierung** mit Supabase Auth
- **Dokumentenverwaltung** mit Upload, Download und Kategorisierung
- **Fallmanagement** mit detaillierter Fallverfolgung
- **Helferverwaltung** mit Profilmanagement und Dokumentenzuordnung
- **Berichtssystem** mit generierten Berichten und Export-Funktionen
- **Globale Suche** mit erweiterten Filtern
- **Service-Buchungssystem** mit Genehmigungsprozessen
- **Echtzeit-Updates** mit Supabase Realtime
- **Responsive Design** für Desktop und Mobile
- **PWA-fähig** - installierbar auf allen Geräten

## 📋 Voraussetzungen

- Node.js 18+
- NPM oder Yarn
- Supabase Account mit konfigurierter Datenbank
- Supabase Storage für Dokumentenverwaltung

## 🛠️ Installation

1. Repository klonen:
```bash
git clone [repository-url]
cd edupe-frontend
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
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
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

## 📁 Projektstruktur

```
src/
├── components/          # React-Komponenten
│   ├── DocumentList.js     # Dokumentenliste
│   ├── DocumentUpload.js   # Dokumenten-Upload
│   ├── GlobalSearch.js     # Globale Suche
│   ├── Layout.js          # Layout-Komponente
│   ├── SearchFilter.js     # Suchfilter
│   ├── ServiceBooking.js   # Service-Buchung
│   └── StatusCard.js       # Status-Karten
├── hooks/              # Custom React Hooks
│   ├── useData.js         # Daten-Hook
│   └── useRealtimeData.js # Echtzeit-Daten
├── lib/                # Utility-Bibliotheken
│   ├── api.js            # API-Funktionen
│   ├── auth.js           # Authentifizierung
│   ├── storage.js        # Storage-Funktionen
│   ├── supabase.js       # Supabase-Konfiguration
│   └── types.js          # TypeScript-Typen
├── pages/              # Next.js Seiten
│   ├── api/             # API-Routen
│   │   ├── auth/        # Auth-Endpoints
│   │   ├── cases/       # Fall-Endpoints
│   │   ├── helpers/     # Helfer-Endpoints
│   │   ├── reports/     # Bericht-Endpoints
│   │   ├── search/      # Such-Endpoints
│   │   └── services/    # Service-Endpoints
│   ├── auth/            # Auth-Seiten
│   ├── cases/           # Fall-Seiten
│   ├── helpers/         # Helfer-Seiten
│   └── reports/         # Bericht-Seiten
└── styles/             # CSS-Styles
    └── globals.css      # Globale Styles
```

## 🗄️ Datenbankstruktur

Die App erwartet folgende Tabellen in Supabase:

### users
- `id`: uuid (Primary Key)
- `email`: text
- `role`: text
- `created_at`: timestamp

### cases
- `id`: uuid (Primary Key)
- `title`: text
- `description`: text
- `status`: text
- `created_at`: timestamp
- `updated_at`: timestamp

### helpers
- `id`: uuid (Primary Key)
- `name`: text
- `email`: text
- `phone`: text
- `specialization`: text
- `created_at`: timestamp

### documents
- `id`: uuid (Primary Key)
- `case_id`: uuid (Foreign Key)
- `helper_id`: uuid (Foreign Key)
- `filename`: text
- `file_path`: text
- `file_size`: integer
- `mime_type`: text
- `created_at`: timestamp

### services
- `id`: uuid (Primary Key)
- `case_id`: uuid (Foreign Key)
- `helper_id`: uuid (Foreign Key)
- `service_type`: text
- `status`: text
- `created_at`: timestamp

### reports
- `id`: uuid (Primary Key)
- `case_id`: uuid (Foreign Key)
- `title`: text
- `content`: text
- `generated_at`: timestamp

## 🔧 Konfiguration

### Supabase Setup
1. Erstelle ein neues Supabase-Projekt
2. Konfiguriere die Authentifizierung
3. Erstelle die erforderlichen Tabellen
4. Konfiguriere Storage-Buckets für Dokumente
5. Setze Row Level Security (RLS) Policies

### Storage-Konfiguration
Die App verwendet Supabase Storage für die Dokumentenverwaltung:
- `documents` Bucket für Fall-Dokumente
- `helpers` Bucket für Helfer-Dokumente
- `reports` Bucket für generierte Berichte

## 🛡️ Sicherheit

- **Row Level Security (RLS)** für alle Tabellen
- **Authentifizierung** mit Supabase Auth
- **Autorisierung** basierend auf Benutzerrollen
- **Sichere Datei-Uploads** mit Validierung
- **CSRF-Schutz** für alle API-Endpoints

## 📊 API Endpoints

### Authentifizierung
- `POST /api/auth/register` - Benutzerregistrierung
- `POST /api/auth/invite` - Benutzer einladen
- `POST /api/auth/update-password` - Passwort aktualisieren

### Fälle
- `GET /api/cases` - Alle Fälle abrufen
- `POST /api/cases` - Neuen Fall erstellen
- `GET /api/cases/[id]` - Fall-Details abrufen
- `PUT /api/cases/[id]` - Fall aktualisieren

### Helfer
- `GET /api/helpers` - Alle Helfer abrufen
- `POST /api/helpers` - Neuen Helfer erstellen
- `GET /api/helpers/[id]` - Helfer-Details abrufen
- `PUT /api/helpers/[id]` - Helfer aktualisieren

### Dokumente
- `GET /api/helpers/[id]/documents` - Helfer-Dokumente abrufen
- `POST /api/helpers/[id]/documents` - Dokument hochladen
- `GET /api/helpers/[id]/documents/download` - Dokument herunterladen

### Services
- `GET /api/services` - Alle Services abrufen
- `POST /api/services` - Neuen Service erstellen
- `POST /api/services/bulk-approve` - Services genehmigen
- `POST /api/services/[id]/approve` - Service genehmigen

### Berichte
- `GET /api/reports` - Alle Berichte abrufen
- `GET /api/reports/[id]` - Bericht-Details abrufen

### Suche
- `GET /api/search/global` - Globale Suche

## 🎨 Design System

Die App verwendet ein modernes, benutzerfreundliches Design mit:
- **Tailwind CSS** für Styling
- **Responsive Design** für alle Bildschirmgrößen
- **Dark/Light Mode** Unterstützung
- **Accessibility** Features
- **Loading States** und Error Boundaries

## 🔍 Suchfunktionen

- **Globale Suche** über alle Entitäten
- **Erweiterte Filter** für präzise Ergebnisse
- **Echtzeit-Suche** mit Debouncing
- **Fuzzy Search** für Tippfehler-Toleranz

## 📱 Mobile Optimierung

- **Touch-optimierte** Benutzeroberfläche
- **Swipe-Gesten** für Navigation
- **Offline-Funktionalität** mit Service Workers
- **PWA-Installation** auf allen Geräten

## 🚀 Deployment

### Vercel (Empfohlen)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Linting
npm run lint
```

## 📈 Performance

- **Code Splitting** für optimale Ladezeiten
- **Image Optimization** mit Next.js
- **Caching-Strategien** für bessere Performance
- **Bundle Analysis** für Optimierungen

## 🤝 Mitwirkende

- Frontend-Entwicklung: [Ihr Name]
- Backend-Integration: Supabase
- Design & UX: [Designer Name]

## 📄 Lizenz

Dieses Projekt ist privat und nicht zur öffentlichen Nutzung bestimmt.

## 📞 Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam oder erstellen Sie ein Issue im Repository.

---

**Entwickelt mit ❤️ für Edupe**