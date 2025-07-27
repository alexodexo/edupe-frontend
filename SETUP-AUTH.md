# Supabase Authentifizierung Setup

## Übersicht

Diese Anleitung erklärt, wie Sie die Supabase-Authentifizierung für Edupe Digital korrekt konfigurieren, um sicherzustellen, dass neue Nutzer ordnungsgemäß registriert werden und Passwörter erforderlich sind.

## 1. Supabase Dashboard Konfiguration

### 1.1 Authentifizierungseinstellungen

1. Gehen Sie zu Ihrem Supabase Dashboard
2. Navigieren Sie zu **Authentication** > **Settings**
3. Konfigurieren Sie folgende Einstellungen:

#### E-Mail-Bestätigung
- ✅ **Enable email confirmations** aktivieren
- **Redirect URL**: `https://ihre-domain.com/auth/callback` (oder `http://localhost:3000/auth/callback` für Entwicklung)

#### Passwort-Richtlinien
- **Minimum password length**: 8
- ✅ **Require uppercase letters** aktivieren
- ✅ **Require lowercase letters** aktivieren
- ✅ **Require numbers** aktivieren
- ✅ **Require special characters** aktivieren

#### Sicherheitseinstellungen
- **Maximum login attempts**: 5
- **Lockout duration**: 15 Minuten
- ✅ **Enable rate limiting** aktivieren

### 1.2 E-Mail-Templates konfigurieren

Gehen Sie zu **Authentication** > **Email Templates** und konfigurieren Sie:

#### Bestätigungs-E-Mail
- **Subject**: `Bestätigen Sie Ihre E-Mail-Adresse - Edupe Digital`
- **Template**: Verwenden Sie das Standard-Template oder erstellen Sie ein benutzerdefiniertes

#### Passwort-Reset-E-Mail
- **Subject**: `Passwort zurücksetzen - Edupe Digital`
- **Template**: Verwenden Sie das Standard-Template oder erstellen Sie ein benutzerdefiniertes

### 1.3 URL-Konfiguration

Gehen Sie zu **Authentication** > **URL Configuration**:

- **Site URL**: `https://ihre-domain.com` (oder `http://localhost:3000` für Entwicklung)
- **Redirect URLs**:
  - `https://ihre-domain.com/auth/callback`
  - `https://ihre-domain.com/auth/reset-password`
  - `http://localhost:3000/auth/callback` (für Entwicklung)
  - `http://localhost:3000/auth/reset-password` (für Entwicklung)

## 2. Umgebungsvariablen

Stellen Sie sicher, dass folgende Umgebungsvariablen in Ihrer `.env.local` Datei konfiguriert sind:

```env
NEXT_PUBLIC_SUPABASE_URL=ihre-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr-supabase-anon-key
NEXT_PUBLIC_SITE_URL=https://ihre-domain.com
```

## 3. Datenbank-Setup

### 3.1 RLS-Policies aktivieren

Führen Sie folgende SQL-Befehle in der Supabase SQL Editor aus:

```sql
-- Enable RLS on all tables
ALTER TABLE faelle ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugendamt_ansprechpartner ENABLE ROW LEVEL SECURITY;
ALTER TABLE ausgangsrechnung ENABLE ROW LEVEL SECURITY;
ALTER TABLE helfer ENABLE ROW LEVEL SECURITY;
ALTER TABLE urlaube ENABLE ROW LEVEL SECURITY;
ALTER TABLE helfer_fall ENABLE ROW LEVEL SECURITY;
ALTER TABLE leistungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE berichte ENABLE ROW LEVEL SECURITY;
```

### 3.2 Helper-Funktionen erstellen

```sql
-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
  user_role TEXT := 'admin';
BEGIN
  user_email := auth.jwt() ->> 'email';
  
  -- Check if user is a helper
  IF EXISTS (SELECT 1 FROM helfer WHERE email = user_email) THEN
    RETURN 'helper';
  END IF;
  
  -- Check if user is a jugendamt contact
  IF EXISTS (SELECT 1 FROM jugendamt_ansprechpartner WHERE mail = user_email) THEN
    RETURN 'jugendamt';
  END IF;
  
  -- Default to admin
  RETURN 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 4. Testen der Konfiguration

### 4.1 Registrierung testen

1. Gehen Sie zu `/register`
2. Füllen Sie das Formular aus
3. Überprüfen Sie, dass eine E-Mail-Bestätigung gesendet wird
4. Klicken Sie auf den Link in der E-Mail
5. Stellen Sie sicher, dass Sie zur Anmeldung weitergeleitet werden

### 4.2 Passwort-Reset testen

1. Gehen Sie zu `/login`
2. Klicken Sie auf "Passwort vergessen?"
3. Geben Sie eine E-Mail-Adresse ein
4. Überprüfen Sie, dass eine Reset-E-Mail gesendet wird
5. Testen Sie das Zurücksetzen des Passworts

## 5. Sicherheitsüberprüfung

### 5.1 Überprüfen Sie, dass:

- ✅ Neue Nutzer müssen ihre E-Mail bestätigen
- ✅ Passwörter müssen den Anforderungen entsprechen
- ✅ Demo-Nutzer wurden entfernt
- ✅ Passwort-Reset funktioniert
- ✅ RLS-Policies sind aktiviert
- ✅ Rollenbasierte Berechtigungen funktionieren

### 5.2 Häufige Probleme und Lösungen

#### Problem: Nutzer können sich ohne E-Mail-Bestätigung anmelden
**Lösung**: Überprüfen Sie, dass "Enable email confirmations" in den Supabase-Einstellungen aktiviert ist.

#### Problem: Passwort-Anforderungen werden nicht erzwungen
**Lösung**: Überprüfen Sie die Passwort-Richtlinien in den Supabase-Einstellungen.

#### Problem: E-Mail-Links funktionieren nicht
**Lösung**: Überprüfen Sie die Redirect URLs in den Supabase-Einstellungen.

## 6. Produktions-Checkliste

Vor dem Deployment in die Produktion:

- [ ] Alle Umgebungsvariablen sind korrekt gesetzt
- [ ] Site URL ist auf die Produktions-Domain eingestellt
- [ ] E-Mail-Templates sind konfiguriert
- [ ] RLS-Policies sind aktiviert
- [ ] Passwort-Richtlinien sind konfiguriert
- [ ] E-Mail-Bestätigung ist aktiviert
- [ ] Alle Tests funktionieren

## 7. Monitoring

### 7.1 Logs überwachen

Überwachen Sie die Authentifizierungs-Logs im Supabase Dashboard:
- **Authentication** > **Logs**

### 7.2 Metriken verfolgen

- Anzahl der Registrierungen
- Anzahl der E-Mail-Bestätigungen
- Anzahl der Passwort-Resets
- Fehler bei der Authentifizierung

## Support

Bei Problemen:

1. Überprüfen Sie die Supabase-Logs
2. Testen Sie die Konfiguration in der Entwicklungsumgebung
3. Überprüfen Sie die Umgebungsvariablen
4. Konsultieren Sie die Supabase-Dokumentation 