-- Beispiel-Jugendämter mit Ansprechpartner
INSERT INTO jugendamt_ansprechpartner (jugendamt, name, mail, telefon)
VALUES 
('Jugendamt Frankfurt', 'Anna Müller', 'anna.mueller@jugendamt-ffm.de', '069-123456'),
('Jugendamt Offenbach', 'Thomas Becker', 'thomas.becker@jugendamt-of.de', '069-987654');

-- Beispiel-Helfer:innen
INSERT INTO helfer (vorname, nachname, strasse, plz, stadt, geburtsdatum, geschlecht, email, telefon_nummer)
VALUES 
('Lisa', 'Schmidt', 'Musterstraße 1', '60311', 'Frankfurt', '1990-05-10', 'weiblich', 'lisa.schmidt@example.com', '0176-1111111'),
('Markus', 'Klein', 'Beispielweg 5', '63065', 'Offenbach', '1985-09-23', 'maennlich', 'markus.klein@example.com', '0176-2222222');

-- Beispiel-Fälle
INSERT INTO faelle (aktenzeichen, vorname, nachname, geburtsdatum, schule, strasse, plz, stadt, schule_oder_kita, erstkontakt_datum, erstkontakt_text, status)
VALUES 
('AZ-2025-001', 'Max', 'Muster', '2010-03-15', 'Grundschule Nord', 'Teststraße 2', '60311', 'Frankfurt', 'Schule', '2025-05-01', 'Erstkontakt telefonisch.', 'offen'),
('AZ-2025-002', 'Lena', 'Beispiel', '2008-11-05', 'Kita Süd', 'Demoweg 4', '63065', 'Offenbach', 'Kita', '2025-05-03', 'Erstkontakt per Mail.', 'in_bearbeitung');

-- Fälle den Helfer:innen zuordnen (helfer_fall)
INSERT INTO helfer_fall (helfer_id, fall_id)
SELECT h.helfer_id, f.fall_id
FROM helfer h, faelle f
WHERE h.email = 'lisa.schmidt@example.com' AND f.aktenzeichen = 'AZ-2025-001';

INSERT INTO helfer_fall (helfer_id, fall_id)
SELECT h.helfer_id, f.fall_id
FROM helfer h, faelle f
WHERE h.email = 'markus.klein@example.com' AND f.aktenzeichen = 'AZ-2025-002';

-- Beispiel-Leistungen
INSERT INTO leistungen (startzeit, endzeit, standort, notiz, typ, helfer_id, fall_id, erstellt_von)
SELECT 
    '2025-06-01 09:00', '2025-06-01 11:00', 'Frankfurt', 'Einzelförderung in Schule', 'förderung',
    h.helfer_id, f.fall_id, h.helfer_id
FROM helfer h, faelle f
WHERE h.email = 'lisa.schmidt@example.com' AND f.aktenzeichen = 'AZ-2025-001';

INSERT INTO leistungen (startzeit, endzeit, standort, notiz, typ, helfer_id, fall_id, erstellt_von)
SELECT 
    '2025-06-03 14:00', '2025-06-03 16:00', 'Offenbach', 'Gespräch mit Eltern', 'elterngespraech',
    h.helfer_id, f.fall_id, h.helfer_id
FROM helfer h, faelle f
WHERE h.email = 'markus.klein@example.com' AND f.aktenzeichen = 'AZ-2025-002';

-- Beispiel-Berichte
INSERT INTO berichte (anzahl_leistungen, gesamtstunden, fall_id, titel, inhalt, status, erstellt_von)
SELECT 
    1, 2.0, f.fall_id, 'Monatsbericht Mai', 'Zusammenfassung der Fördermaßnahmen im Mai', 'final', h.helfer_id
FROM helfer h, faelle f
WHERE h.email = 'lisa.schmidt@example.com' AND f.aktenzeichen = 'AZ-2025-001';

-- Beispiel-Ausgangsrechnungen
INSERT INTO ausgangsrechnung (fall_id, rechnungsnummer, arbeitsstunden, rechnungsdatum, leistungsanzahl, stundensatz, gesamtbetrag, status, gesendet_am, bezahlt_am)
SELECT 
    f.fall_id, 'RE-2025-001', 2.0, '2025-06-05', 1, 45.00, 90.00, 'offen', '2025-06-06', NULL
FROM faelle f
WHERE f.aktenzeichen = 'AZ-2025-001';

-- Beispiel-Urlaub
INSERT INTO urlaube (von_datum, bis_datum, helfer_id, vertretung, notiz)
SELECT 
    '2025-08-01', '2025-08-14', h1.helfer_id, h2.helfer_id, 'Sommerurlaub'
FROM helfer h1, helfer h2
WHERE h1.email = 'lisa.schmidt@example.com' AND h2.email = 'markus.klein@example.com';
