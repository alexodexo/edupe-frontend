// src/pages/api/auth/register.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      // Helfer-spezifische Felder
      strasse,
      plz,
      stadt,
      geburtsdatum,
      geburtsort,
      geburtsland,
      geschlecht,
      staatsangehoerigkeit,
      telefon_nummer,
      alternative_nummer,
      festnetznummer,
      hoechster_abschluss,
      zusaetzliche_qualifikationen,
      sprachen,
      religion,
      besonderheiten,
      faehigkeiten,
      iban,
      steuernummer,
      bild_bescheinigung,
      steuer_id,
      andere_auftraggeber,
      // Jugendamt-spezifische Felder
      jugendamt,
      telefon
    } = req.body

    // Validierung
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt werden' })
    }

    // Role-spezifische Validierung
    if (role === 'helper') {
      if (!strasse || !plz || !stadt || !telefon_nummer) {
        return res.status(400).json({ error: 'Bitte füllen Sie alle Pflichtfelder für Helfer aus' })
      }
    } else if (role === 'jugendamt') {
      if (!jugendamt || !telefon) {
        return res.status(400).json({ error: 'Bitte füllen Sie alle Pflichtfelder für Jugendamt aus' })
      }
    }

    // 1. Auth-User erstellen
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return res.status(400).json({ error: authError.message })
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Benutzer konnte nicht erstellt werden' })
    }

    // 2. Profil in der entsprechenden Tabelle erstellen
    let profileError = null
    let isVerified = false

    if (role === 'helper') {
      const { error } = await supabase
        .from('helfer')
        .insert({
          vorname: firstName,
          nachname: lastName,
          email: email,
          strasse: strasse,
          plz: plz,
          stadt: stadt,
          geburtsdatum: geburtsdatum || null,
          geburtsort: geburtsort || null,
          geburtsland: geburtsland || null,
          geschlecht: geschlecht || null,
          staatsangehoerigkeit: staatsangehoerigkeit || null,
          telefon_nummer: telefon_nummer,
          alternative_nummer: alternative_nummer || null,
          festnetznummer: festnetznummer || null,
          hoechster_abschluss: hoechster_abschluss || null,
          zusaetzliche_qualifikationen: zusaetzliche_qualifikationen || null,
          sprachen: sprachen || null,
          religion: religion || null,
          besonderheiten: besonderheiten || null,
          faehigkeiten: faehigkeiten || null,
          iban: iban || null,
          steuernummer: steuernummer || null,
          bild_bescheinigung: bild_bescheinigung || null,
          steuer_id: steuer_id || null,
          andere_auftraggeber: andere_auftraggeber || false
        })

      profileError = error
      isVerified = true
    } else if (role === 'jugendamt') {
      // Prüfen, ob bereits ein Jugendamt-Eintrag mit dieser E-Mail existiert
      const { data: existingJugendamt, error: checkError } = await supabase
        .from('jugendamt_ansprechpartner')
        .select('ansprechpartner_id')
        .eq('mail', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        profileError = checkError
      } else if (existingJugendamt) {
        // Jugendamt existiert bereits mit dieser E-Mail - Eintrag aktualisieren
        const { error } = await supabase
          .from('jugendamt_ansprechpartner')
          .update({
            name: `${firstName} ${lastName}`,
            telefon: telefon
          })
          .eq('ansprechpartner_id', existingJugendamt.ansprechpartner_id)

        profileError = error
        isVerified = true
      } else {
        // Jugendamt existiert nicht - nur Auth-User erstellen, kein Profil
        // Kein Fehler, da das normal ist für unverifizierte Jugendämter
        isVerified = false
      }
    }

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Versuche den Auth-User zu löschen, wenn das Profil nicht erstellt werden konnte
      await supabase.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({ error: 'Fehler beim Erstellen des Profils' })
    }

    return res.status(200).json({
      success: true,
      message: role === 'jugendamt' && !isVerified
        ? 'Registrierung erfolgreich! Ihr Account wird nach Überprüfung durch einen Administrator freigeschaltet. Bitte bestätigen Sie zunächst Ihre E-Mail-Adresse.'
        : 'Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.',
      user: authData.user
    })

  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Interner Serverfehler' })
  }
} 