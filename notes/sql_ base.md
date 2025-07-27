CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMs
CREATE TYPE fall_status AS ENUM ('offen', 'in_bearbeitung', 'abgeschlossen', 'abgelehnt', 'wartend', 'storniert');
CREATE TYPE geschlecht_enum AS ENUM ('maennlich', 'weiblich', 'divers');
CREATE TYPE bericht_status AS ENUM ('entwurf', 'final', 'uebermittelt');

-- faelle
CREATE TABLE faelle (
    fall_id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aktenzeichen           VARCHAR(100),
    vorname                VARCHAR(250) NOT NULL,
    nachname               VARCHAR(100) NOT NULL,
    geburtsdatum           DATE,
    schule                 VARCHAR(150),
    strasse                VARCHAR(150),
    plz                    VARCHAR(10),
    stadt                  VARCHAR(100),
    schule_oder_kita       VARCHAR(150),
    erstkontakt_datum      DATE,
    erstkontakt_text       TEXT,
    status                 fall_status NOT NULL DEFAULT 'offen',
    erstellt_am            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am        TIMESTAMP,
    aktualisiert_von       UUID
);

-- jugendamt_ansprechpartner (Jugendamt als VARCHAR)
CREATE TABLE jugendamt_ansprechpartner (
    ansprechpartner_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jugendamt            VARCHAR(100) NOT NULL,
    name                 VARCHAR(100) NOT NULL,
    mail                 VARCHAR(150),
    telefon              VARCHAR(30),
    erstellt_am          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am      TIMESTAMP,
    aktualisiert_von     UUID
);

-- ausgangsrechnung
CREATE TABLE ausgangsrechnung (
    rechnung_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fall_id          UUID REFERENCES faelle(fall_id),
    rechnungsnummer  VARCHAR(100) UNIQUE NOT NULL,
    arbeitsstunden   NUMERIC(7,2),
    rechnungsdatum   DATE,
    leistungsanzahl  INTEGER,
    stundensatz      NUMERIC(7,2),
    gesamtbetrag     NUMERIC(10,2),
    status           VARCHAR(30),
    gesendet_am      DATE,
    bezahlt_am       DATE,
    notiz            TEXT,
    erstellt_am      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am  TIMESTAMP,
    aktualisiert_von UUID
);

-- helfer
CREATE TABLE helfer (
    helfer_id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vorname                 VARCHAR(100) NOT NULL,
    nachname                VARCHAR(100) NOT NULL,
    strasse                 VARCHAR(150),
    plz                     VARCHAR(10),
    stadt                   VARCHAR(100),
    geburtsdatum            DATE,
    geburtsort              VARCHAR(100),
    geburtsland             VARCHAR(100),
    geschlecht              geschlecht_enum,
    staatsangehoerigkeit    TEXT,
    telefon_nummer          VARCHAR(30),
    alternative_nummer      VARCHAR(30),
    festnetznummer          VARCHAR(30),
    email                   VARCHAR(150) UNIQUE,
    hoechster_abschluss     TEXT,
    zusaetzliche_qualifikationen TEXT,
    sprachen                TEXT,
    religion                VARCHAR(50),
    besonderheiten          TEXT,
    faehigkeiten            TEXT,
    iban                    VARCHAR(34),
    steuernummer            VARCHAR(30),
    bild_bescheinigung      VARCHAR(500),
    steuer_id               VARCHAR(30),
    andere_auftraggeber     BOOLEAN,
    erstellt_am             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am         TIMESTAMP,
    aktualisiert_von        UUID
);

-- urlaube
CREATE TABLE urlaube (
    urlaub_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    von_datum       DATE NOT NULL,
    bis_datum       DATE NOT NULL,
    vertretung      UUID REFERENCES helfer(helfer_id),
    helfer_id       UUID REFERENCES helfer(helfer_id),
    freigegeben     BOOLEAN DEFAULT FALSE,
    notiz           TEXT,
    erstellt_am     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP,
    aktualisiert_von UUID
);

-- helfer_fall (n:m)
CREATE TABLE helfer_fall (
    helfer_id        UUID REFERENCES helfer(helfer_id),
    fall_id          UUID REFERENCES faelle(fall_id),
    aktiv            BOOLEAN DEFAULT TRUE,
    erstellt_am      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am  TIMESTAMP,
    aktualisiert_von UUID,
    PRIMARY KEY (helfer_id, fall_id)
);

-- leistungen
CREATE TABLE leistungen (
    leistung_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startzeit           TIMESTAMP NOT NULL,
    endzeit             TIMESTAMP NOT NULL,
    standort            VARCHAR(150),
    notiz               TEXT NOT NULL,
    erstellt_am         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    freigegeben_flag    BOOLEAN DEFAULT FALSE,
    freigegeben_von     UUID,
    freigegeben_am      TIMESTAMP,
    typ                 VARCHAR(30),
    helfer_id           UUID REFERENCES helfer(helfer_id),
    fall_id             UUID REFERENCES faelle(fall_id),
    erstellt_von        UUID,
    aktualisiert_am     TIMESTAMP,
    aktualisiert_von    UUID
);

-- berichte
CREATE TABLE berichte (
    bericht_id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    erstellt_am             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anzahl_leistungen       INTEGER,
    gesamtstunden           NUMERIC(5,2),
    status                  bericht_status DEFAULT 'entwurf',
    sichtbar_fuer_jugendamt BOOLEAN DEFAULT FALSE,
    fall_id                 UUID REFERENCES faelle(fall_id),
    titel                   VARCHAR(255),
    inhalt                  TEXT,
    pdf_url                 VARCHAR(500),
    erstellt_von            UUID,
    aktualisiert_am         TIMESTAMP,
    aktualisiert_von        UUID
);


-- Foreign Key Constraint für berichte.erstellt_von hinzufügen
ALTER TABLE berichte 
ADD CONSTRAINT berichte_erstellt_von_fkey 
FOREIGN KEY (erstellt_von) REFERENCES helfer(helfer_id);

-- Auch für aktualisiert_von falls gewünscht
ALTER TABLE berichte 
ADD CONSTRAINT berichte_aktualisiert_von_fkey 
FOREIGN KEY (aktualisiert_von) REFERENCES helfer(helfer_id);


CREATE TABLE jugendamt_fall (
  fall_id UUID REFERENCES faelle(fall_id),
  ansprechpartner_id UUID REFERENCES jugendamt_ansprechpartner(ansprechpartner_id),
  erstellt_am      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  aktualisiert_am  TIMESTAMP,
  aktualisiert_von UUID,
  PRIMARY KEY (fall_id, ansprechpartner_id)
);
