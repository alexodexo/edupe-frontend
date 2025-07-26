// src/lib/types.js
// Type definitions and constants for Edupe Digital - angepasst an Supabase Schema

export const USER_ROLES = {
  ADMIN: 'admin',
  HELPER: 'helper', 
  JUGENDAMT: 'jugendamt'
}

// Entspricht fall_status ENUM aus der Datenbank
export const CASE_STATUS = {
  OFFEN: 'offen',
  IN_BEARBEITUNG: 'in_bearbeitung', 
  ABGESCHLOSSEN: 'abgeschlossen',
  ABGELEHNT: 'abgelehnt',
  WARTEND: 'wartend',
  STORNIERT: 'storniert'
}

// Service Typen basierend auf dem 'typ' Feld in leistungen
export const SERVICE_TYPES = {
  WITH_CLIENT_FACE_TO_FACE: 'mit_klient_persoenlich',
  WITH_CLIENT_REMOTE: 'mit_klient_remote',
  WITHOUT_CLIENT: 'ohne_klient'
}

// Service Status basierend auf freigegeben_flag
export const SERVICE_STATUS = {
  DRAFT: 'entwurf',
  SUBMITTED: 'eingereicht', 
  APPROVED: 'freigegeben',
  REJECTED: 'abgelehnt'
}

// Entspricht geschlecht_enum aus der Datenbank
export const GESCHLECHT = {
  MAENNLICH: 'maennlich',
  WEIBLICH: 'weiblich', 
  DIVERS: 'divers'
}

// Entspricht bericht_status ENUM aus der Datenbank
export const BERICHT_STATUS = {
  ENTWURF: 'entwurf',
  FINAL: 'final',
  UEBERMITTELT: 'uebermittelt'
}

export const HELPER_AVAILABILITY = {
  AVAILABLE: 'verfuegbar',
  PARTIALLY_AVAILABLE: 'teilweise_verfuegbar', 
  UNAVAILABLE: 'nicht_verfuegbar'
}

export const QUALIFICATION_TYPES = [
  'Familienhelfer',
  'Erziehungsbeistand',
  'Sozialpädagoge', 
  'Sozialarbeiter',
  'Jugendhelfer',
  'Familienpfleger'
]

export const PRIORITY_LEVELS = {
  LOW: 'niedrig',
  MEDIUM: 'mittel',
  HIGH: 'hoch', 
  URGENT: 'dringend'
}

// Database field mappings - Frontend zu Datenbank
export const DB_FIELD_MAPPINGS = {
  cases: {
    id: 'fall_id',
    caseNumber: 'aktenzeichen', 
    firstName: 'vorname',
    lastName: 'nachname',
    birthDate: 'geburtsdatum',
    school: 'schule',
    address: 'strasse',
    zipCode: 'plz',
    city: 'stadt',
    schoolOrKita: 'schule_oder_kita',
    firstContactDate: 'erstkontakt_datum',
    firstContactText: 'erstkontakt_text',
    status: 'status',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  helpers: {
    id: 'helfer_id',
    firstName: 'vorname',
    lastName: 'nachname', 
    street: 'strasse',
    zipCode: 'plz',
    city: 'stadt',
    birthDate: 'geburtsdatum',
    birthPlace: 'geburtsort',
    birthCountry: 'geburtsland',
    gender: 'geschlecht',
    nationality: 'staatsangehoerigkeit',
    phone: 'telefon_nummer',
    alternativePhone: 'alternative_nummer',
    landlinePhone: 'festnetznummer',
    email: 'email',
    highestEducation: 'hoechster_abschluss',
    additionalQualifications: 'zusaetzliche_qualifikationen',
    languages: 'sprachen',
    religion: 'religion',
    specialties: 'besonderheiten',
    skills: 'faehigkeiten',
    iban: 'iban',
    taxNumber: 'steuernummer',
    certificateImage: 'bild_bescheinigung',
    taxId: 'steuer_id',
    otherClients: 'andere_auftraggeber',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  services: {
    id: 'leistung_id',
    startTime: 'startzeit',
    endTime: 'endzeit',
    location: 'standort',
    note: 'notiz',
    createdAt: 'erstellt_am',
    approved: 'freigegeben_flag',
    approvedBy: 'freigegeben_von',
    approvedAt: 'freigegeben_am',
    type: 'typ',
    helperId: 'helfer_id',
    caseId: 'fall_id',
    createdBy: 'erstellt_von',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  reports: {
    id: 'bericht_id',
    createdAt: 'erstellt_am',
    serviceCount: 'anzahl_leistungen',
    totalHours: 'gesamtstunden',
    status: 'status',
    visibleToJugendamt: 'sichtbar_fuer_jugendamt',
    caseId: 'fall_id',
    title: 'titel',
    content: 'inhalt',
    pdfUrl: 'pdf_url',
    createdBy: 'erstellt_von',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  invoices: {
    id: 'rechnung_id',
    caseId: 'fall_id',
    invoiceNumber: 'rechnungsnummer',
    workHours: 'arbeitsstunden',
    invoiceDate: 'rechnungsdatum',
    serviceCount: 'leistungsanzahl',
    hourlyRate: 'stundensatz',
    totalAmount: 'gesamtbetrag',
    status: 'status',
    sentAt: 'gesendet_am',
    paidAt: 'bezahlt_am',
    note: 'notiz',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  jugendamt: {
    id: 'ansprechpartner_id',
    jugendamt: 'jugendamt',
    name: 'name',
    email: 'mail',
    phone: 'telefon',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  vacation: {
    id: 'urlaub_id',
    fromDate: 'von_datum',
    toDate: 'bis_datum',
    substitute: 'vertretung',
    helperId: 'helfer_id',
    approved: 'freigegeben',
    note: 'notiz',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  }
}

// Transform functions für Frontend/Backend Mapping
export const transformToFrontend = {
  case: (dbCase) => ({
    id: dbCase.fall_id,
    caseNumber: dbCase.aktenzeichen,
    title: `Betreuung ${dbCase.vorname} ${dbCase.nachname}`,
    client: {
      firstName: dbCase.vorname,
      lastName: dbCase.nachname,
      birthDate: dbCase.geburtsdatum,
      address: `${dbCase.strasse}, ${dbCase.plz} ${dbCase.stadt}`,
      school: dbCase.schule_oder_kita
    },
    status: dbCase.status,
    firstContact: {
      date: dbCase.erstkontakt_datum,
      text: dbCase.erstkontakt_text
    },
    createdAt: dbCase.erstellt_am,
    updatedAt: dbCase.aktualisiert_am
  }),

  helper: (dbHelper) => ({
    id: dbHelper.helfer_id,
    firstName: dbHelper.vorname,
    lastName: dbHelper.nachname,
    email: dbHelper.email,
    phone: dbHelper.telefon_nummer,
    address: {
      street: dbHelper.strasse,
      zipCode: dbHelper.plz,
      city: dbHelper.stadt
    },
    personalInfo: {
      birthDate: dbHelper.geburtsdatum,
      birthPlace: dbHelper.geburtsort,
      birthCountry: dbHelper.geburtsland,
      gender: dbHelper.geschlecht,
      nationality: dbHelper.staatsangehoerigkeit,
      religion: dbHelper.religion
    },
    qualifications: dbHelper.zusaetzliche_qualifikationen ? 
      dbHelper.zusaetzliche_qualifikationen.split(',').map(q => q.trim()) : [],
    languages: dbHelper.sprachen ? 
      dbHelper.sprachen.split(',').map(l => l.trim()) : [],
    banking: {
      iban: dbHelper.iban,
      taxNumber: dbHelper.steuernummer,
      taxId: dbHelper.steuer_id
    },
    otherClients: dbHelper.andere_auftraggeber,
    createdAt: dbHelper.erstellt_am,
    updatedAt: dbHelper.aktualisiert_am
  }),

  service: (dbService) => ({
    id: dbService.leistung_id,
    date: new Date(dbService.startzeit).toISOString().split('T')[0],
    startTime: new Date(dbService.startzeit).toTimeString().slice(0, 5),
    endTime: new Date(dbService.endzeit).toTimeString().slice(0, 5),
    duration: (new Date(dbService.endzeit) - new Date(dbService.startzeit)) / (1000 * 60 * 60),
    location: dbService.standort,
    description: dbService.notiz,
    type: dbService.typ,
    status: dbService.freigegeben_flag === true ? SERVICE_STATUS.APPROVED :
            dbService.freigegeben_flag === false && dbService.freigegeben_von ? SERVICE_STATUS.REJECTED :
            SERVICE_STATUS.SUBMITTED,
    helperId: dbService.helfer_id,
    caseId: dbService.fall_id,
    createdAt: dbService.erstellt_am,
    approvedAt: dbService.freigegeben_am,
    approvedBy: dbService.freigegeben_von
  }),

  report: (dbReport) => ({
    id: dbReport.bericht_id,
    title: dbReport.titel,
    content: dbReport.inhalt,
    status: dbReport.status,
    serviceCount: dbReport.anzahl_leistungen,
    totalHours: dbReport.gesamtstunden,
    visibleToJugendamt: dbReport.sichtbar_fuer_jugendamt,
    caseId: dbReport.fall_id,
    pdfUrl: dbReport.pdf_url,
    createdAt: dbReport.erstellt_am,
    createdBy: dbReport.erstellt_von
  }),

  invoice: (dbInvoice) => ({
    id: dbInvoice.rechnung_id,
    invoiceNumber: dbInvoice.rechnungsnummer,
    caseId: dbInvoice.fall_id,
    workHours: dbInvoice.arbeitsstunden,
    serviceCount: dbInvoice.leistungsanzahl,
    hourlyRate: dbInvoice.stundensatz,
    totalAmount: dbInvoice.gesamtbetrag,
    status: dbInvoice.status,
    invoiceDate: dbInvoice.rechnungsdatum,
    sentAt: dbInvoice.gesendet_am,
    paidAt: dbInvoice.bezahlt_am,
    note: dbInvoice.notiz,
    createdAt: dbInvoice.erstellt_am
  })
}

export const transformToDatabase = {
  case: (frontendCase) => ({
    aktenzeichen: frontendCase.caseNumber,
    vorname: frontendCase.client?.firstName,
    nachname: frontendCase.client?.lastName,
    geburtsdatum: frontendCase.client?.birthDate,
    strasse: frontendCase.client?.street,
    plz: frontendCase.client?.zipCode,
    stadt: frontendCase.client?.city,
    schule_oder_kita: frontendCase.client?.school,
    erstkontakt_datum: frontendCase.firstContact?.date,
    erstkontakt_text: frontendCase.firstContact?.text,
    status: frontendCase.status || CASE_STATUS.OFFEN
  }),

  helper: (frontendHelper) => ({
    vorname: frontendHelper.firstName,
    nachname: frontendHelper.lastName,
    email: frontendHelper.email,
    telefon_nummer: frontendHelper.phone,
    strasse: frontendHelper.address?.street,
    plz: frontendHelper.address?.zipCode,
    stadt: frontendHelper.address?.city,
    geburtsdatum: frontendHelper.personalInfo?.birthDate,
    geburtsort: frontendHelper.personalInfo?.birthPlace,
    geburtsland: frontendHelper.personalInfo?.birthCountry,
    geschlecht: frontendHelper.personalInfo?.gender,
    staatsangehoerigkeit: frontendHelper.personalInfo?.nationality,
    zusaetzliche_qualifikationen: Array.isArray(frontendHelper.qualifications) ? 
      frontendHelper.qualifications.join(', ') : frontendHelper.qualifications,
    sprachen: Array.isArray(frontendHelper.languages) ? 
      frontendHelper.languages.join(', ') : frontendHelper.languages,
    religion: frontendHelper.personalInfo?.religion,
    iban: frontendHelper.banking?.iban,
    steuernummer: frontendHelper.banking?.taxNumber,
    steuer_id: frontendHelper.banking?.taxId,
    andere_auftraggeber: frontendHelper.otherClients || false
  }),

  service: (frontendService) => {
    const startDateTime = new Date(`${frontendService.date}T${frontendService.startTime}`)
    const endDateTime = new Date(`${frontendService.date}T${frontendService.endTime}`)
    
    return {
      startzeit: startDateTime.toISOString(),
      endzeit: endDateTime.toISOString(),
      standort: frontendService.location,
      notiz: frontendService.description,
      typ: frontendService.type,
      helfer_id: frontendService.helperId,
      fall_id: frontendService.caseId,
      freigegeben_flag: frontendService.status === SERVICE_STATUS.APPROVED
    }
  }
}

// Utility functions
export const formatDuration = (hours) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  }).format(new Date(dateString))
}

export const formatDateTime = (dateString) => {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

// Default hourly rates per qualification
export const DEFAULT_HOURLY_RATES = {
  'Familienhelfer': 25.50,
  'Erziehungsbeistand': 28.00,
  'Sozialpädagoge': 32.00,
  'Sozialarbeiter': 30.00,
  'Jugendhelfer': 26.00,
  'Familienpfleger': 24.00
}

// Status display mappings
export const STATUS_LABELS = {
  [CASE_STATUS.OFFEN]: 'Offen',
  [CASE_STATUS.IN_BEARBEITUNG]: 'In Bearbeitung',
  [CASE_STATUS.ABGESCHLOSSEN]: 'Abgeschlossen', 
  [CASE_STATUS.ABGELEHNT]: 'Abgelehnt',
  [CASE_STATUS.WARTEND]: 'Wartend',
  [CASE_STATUS.STORNIERT]: 'Storniert',
  
  [SERVICE_STATUS.DRAFT]: 'Entwurf',
  [SERVICE_STATUS.SUBMITTED]: 'Eingereicht',
  [SERVICE_STATUS.APPROVED]: 'Freigegeben',
  [SERVICE_STATUS.REJECTED]: 'Abgelehnt',
  
  [BERICHT_STATUS.ENTWURF]: 'Entwurf',
  [BERICHT_STATUS.FINAL]: 'Final',
  [BERICHT_STATUS.UEBERMITTELT]: 'Übermittelt'
}
