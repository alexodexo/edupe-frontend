# Supabase Storage Implementation für Helfer-Dokumente

## Übersicht

Diese Implementierung fügt Supabase Storage-Funktionalität für die Verwaltung von Helfer-Dokumenten hinzu. Admins können Dokumente hochladen und entscheiden, ob Helfer diese sehen können. Helfer können auch eigene Dokumente hochladen, die Admins immer sehen können.

## Implementierte Features

### 1. Storage-Bucket-Management
- Automatische Erstellung des `helper-documents` Buckets
- Konfigurierte Dateigrößen- und Typ-Beschränkungen
- Sichere Zugriffskontrolle

### 2. Dokument-Upload
- Drag & Drop Interface
- Dateityp-Validierung (PDF, JPG, PNG, GIF, DOC, DOCX)
- Größenbeschränkung (50MB)
- Metadaten-Verwaltung (Dokumententyp, Beschreibung, Gültigkeitsdatum)
- Sichtbarkeits-Einstellungen für Helfer

### 3. Dokument-Verwaltung
- Anzeige aller Dokumente mit Metadaten
- Download-Funktionalität
- Lösch-Funktionalität (nur für Admins)
- Gültigkeitsstatus-Anzeige (gültig, läuft ab, abgelaufen)

### 4. Berechtigungssystem
- **Admins**: Können alle Dokumente sehen, hochladen und löschen
- **Helfer**: Können nur sichtbar markierte Dokumente sehen und eigene hochladen

## API-Endpunkte

### GET `/api/helpers/[id]/documents`
Lädt alle Dokumente für einen Helfer basierend auf der Benutzerrolle.

### POST `/api/helpers/[id]/documents`
Lädt ein neues Dokument hoch.

**Parameter:**
- `document`: Die Datei (multipart/form-data)
- `documentType`: Typ des Dokuments
- `description`: Beschreibung (optional)
- `isVisibleToHelper`: Boolean für Helfer-Sichtbarkeit
- `validUntil`: Gültigkeitsdatum (optional)
- `uploadedBy`: Benutzerrolle

### DELETE `/api/helpers/[id]/documents`
Löscht ein Dokument.

**Body:**
```json
{
  "filePath": "helper-id/timestamp-filename.ext"
}
```

### GET `/api/helpers/[id]/documents/download?filePath=...`
Lädt ein Dokument herunter.

## Komponenten

### DocumentUpload
- Drag & Drop Interface
- Dateivalidierung
- Metadaten-Formular
- Upload-Fortschritt

### DocumentList
- Anzeige aller Dokumente
- Download- und Lösch-Funktionen
- Gültigkeitsstatus-Anzeige
- Sichtbarkeits-Indikatoren

## Storage-Struktur

```
helper-documents/
├── helper-id-1/
│   ├── 2024-01-15T10-30-00-document1.pdf
│   └── 2024-01-15T11-45-00-document2.jpg
└── helper-id-2/
    └── 2024-01-16T09-15-00-document3.pdf
```

## Metadaten-Struktur

Jedes Dokument enthält folgende Metadaten:
```json
{
  "helperId": "helper-id",
  "originalName": "original-filename.pdf",
  "fileSize": 1234567,
  "mimeType": "application/pdf",
  "uploadedBy": "admin|helper",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "isVisibleToHelper": true|false,
  "documentType": "fuehrungszeugnis|qualifikation|vertrag|rechnung|identifikation|other",
  "description": "Optional description",
  "validUntil": "2024-12-31" // optional
}
```

## Sicherheit

- Dateityp-Validierung auf Client und Server
- Größenbeschränkungen
- Rollenbasierte Zugriffskontrolle
- Sichere Dateinamen-Generierung
- Bucket-Zugriffskontrolle

## Installation

1. Installiere die Abhängigkeiten:
```bash
npm install multer
```

2. Stelle sicher, dass die Supabase-Umgebungsvariablen gesetzt sind:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Der Storage-Bucket wird automatisch beim ersten Upload erstellt.

## Verwendung

### Für Admins:
1. Gehe zur Helfer-Detailseite
2. Klicke auf "Dokument hochladen"
3. Wähle eine Datei aus oder ziehe sie per Drag & Drop
4. Fülle die Metadaten aus
5. Entscheide über die Sichtbarkeit für den Helfer
6. Klicke auf "Hochladen"

### Für Helfer:
1. Gehe zur eigenen Profilseite
2. Verwende die gleiche Upload-Funktionalität
3. Dokumente sind automatisch für Admins sichtbar

## Fehlerbehandlung

- Dateityp-Validierung mit benutzerfreundlichen Fehlermeldungen
- Größenbeschränkungen mit klaren Hinweisen
- Netzwerk-Fehler mit Retry-Optionen
- Berechtigungsfehler mit entsprechenden Meldungen

## Erweiterte Features

### Geplante Erweiterungen:
- Dokument-Vorschau für PDFs und Bilder
- Bulk-Upload-Funktionalität
- Dokument-Versionierung
- Automatische OCR für gescannte Dokumente
- E-Mail-Benachrichtigungen bei ablaufenden Dokumenten 