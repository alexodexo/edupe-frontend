-- Supabase RLS Policies für Edupe Digital
-- Diese Policies stellen sicher, dass Benutzer nur auf ihre eigenen Daten zugreifen können

-- Enable RLS on all tables
ALTER TABLE faelle ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugendamt_ansprechpartner ENABLE ROW LEVEL SECURITY;
ALTER TABLE ausgangsrechnung ENABLE ROW LEVEL SECURITY;
ALTER TABLE helfer ENABLE ROW LEVEL SECURITY;
ALTER TABLE urlaube ENABLE ROW LEVEL SECURITY;
ALTER TABLE helfer_fall ENABLE ROW LEVEL SECURITY;
ALTER TABLE leistungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE berichte ENABLE ROW LEVEL SECURITY;

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

-- Helper function to get user ID based on role
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
DECLARE
  user_email TEXT;
  user_id UUID;
BEGIN
  user_email := auth.jwt() ->> 'email';
  
  -- Check if user is a helper
  SELECT helfer_id INTO user_id FROM helfer WHERE email = user_email;
  IF user_id IS NOT NULL THEN
    RETURN user_id;
  END IF;
  
  -- Check if user is a jugendamt contact
  SELECT ansprechpartner_id INTO user_id FROM jugendamt_ansprechpartner WHERE mail = user_email;
  IF user_id IS NOT NULL THEN
    RETURN user_id;
  END IF;
  
  -- Return auth user id for admin
  RETURN (auth.jwt() ->> 'sub')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get jugendamt for current user
CREATE OR REPLACE FUNCTION get_user_jugendamt()
RETURNS VARCHAR AS $$
DECLARE
  user_email TEXT;
  ja_name VARCHAR;
BEGIN
  user_email := auth.jwt() ->> 'email';
  SELECT jugendamt INTO ja_name FROM jugendamt_ansprechpartner WHERE mail = user_email;
  RETURN ja_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- FAELLE (Cases) Policies
-- ================================================

-- Admin can see all cases
CREATE POLICY "Admin can view all cases" ON faelle
  FOR SELECT USING (get_user_role() = 'admin');

-- Helper can only see assigned cases
CREATE POLICY "Helper can view assigned cases" ON faelle
  FOR SELECT USING (
    get_user_role() = 'helper' AND 
    EXISTS (
      SELECT 1 FROM helfer_fall 
      WHERE helfer_fall.fall_id = faelle.fall_id 
      AND helfer_fall.helfer_id = get_user_id()
      AND helfer_fall.aktiv = true
    )
  );

-- Jugendamt can only see their own cases
CREATE POLICY "Jugendamt can view own cases" ON faelle
  FOR SELECT USING (
    get_user_role() = 'jugendamt' AND 
    schule_oder_kita = get_user_jugendamt()
  );

-- Insert policies
CREATE POLICY "Admin can insert cases" ON faelle
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

-- Update policies
CREATE POLICY "Admin can update all cases" ON faelle
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Helper can update assigned cases" ON faelle
  FOR UPDATE USING (
    get_user_role() = 'helper' AND 
    EXISTS (
      SELECT 1 FROM helfer_fall 
      WHERE helfer_fall.fall_id = faelle.fall_id 
      AND helfer_fall.helfer_id = get_user_id()
      AND helfer_fall.aktiv = true
    )
  );

-- ================================================
-- HELFER (Helpers) Policies
-- ================================================

-- Admin can see all helpers
CREATE POLICY "Admin can view all helpers" ON helfer
  FOR SELECT USING (get_user_role() = 'admin');

-- Helper can only see their own profile
CREATE POLICY "Helper can view own profile" ON helfer
  FOR SELECT USING (
    get_user_role() = 'helper' AND 
    helfer_id = get_user_id()
  );

-- Jugendamt can see helpers assigned to their cases
CREATE POLICY "Jugendamt can view assigned helpers" ON helfer
  FOR SELECT USING (
    get_user_role() = 'jugendamt' AND 
    EXISTS (
      SELECT 1 FROM helfer_fall hf
      JOIN faelle f ON f.fall_id = hf.fall_id
      WHERE hf.helfer_id = helfer.helfer_id 
      AND f.schule_oder_kita = get_user_jugendamt()
      AND hf.aktiv = true
    )
  );

-- Insert/Update policies for helpers
CREATE POLICY "Admin can insert helpers" ON helfer
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin can update all helpers" ON helfer
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Helper can update own profile" ON helfer
  FOR UPDATE USING (
    get_user_role() = 'helper' AND 
    helfer_id = get_user_id()
  );

-- ================================================
-- LEISTUNGEN (Services) Policies
-- ================================================

-- Admin can see all services
CREATE POLICY "Admin can view all services" ON leistungen
  FOR SELECT USING (get_user_role() = 'admin');

-- Helper can only see their own services
CREATE POLICY "Helper can view own services" ON leistungen
  FOR SELECT USING (
    get_user_role() = 'helper' AND 
    helfer_id = get_user_id()
  );

-- Jugendamt can see services for their cases
CREATE POLICY "Jugendamt can view own case services" ON leistungen
  FOR SELECT USING (
    get_user_role() = 'jugendamt' AND 
    EXISTS (
      SELECT 1 FROM faelle f
      WHERE f.fall_id = leistungen.fall_id 
      AND f.schule_oder_kita = get_user_jugendamt()
    )
  );

-- Insert policies
CREATE POLICY "Helper can insert own services" ON leistungen
  FOR INSERT WITH CHECK (
    get_user_role() = 'helper' AND 
    helfer_id = get_user_id()
  );

CREATE POLICY "Admin can insert services" ON leistungen
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

-- Update policies
CREATE POLICY "Admin can update all services" ON leistungen
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Helper can update own services" ON leistungen
  FOR UPDATE USING (
    get_user_role() = 'helper' AND 
    helfer_id = get_user_id() AND
    freigegeben_flag = false -- Can only update if not yet approved
  );

CREATE POLICY "Jugendamt can approve own case services" ON leistungen
  FOR UPDATE USING (
    get_user_role() = 'jugendamt' AND 
    EXISTS (
      SELECT 1 FROM faelle f
      WHERE f.fall_id = leistungen.fall_id 
      AND f.schule_oder_kita = get_user_jugendamt()
    )
  );

-- ================================================
-- HELFER_FALL (Helper-Case Assignment) Policies
-- ================================================

-- Admin can see all assignments
CREATE POLICY "Admin can view all assignments" ON helfer_fall
  FOR SELECT USING (get_user_role() = 'admin');

-- Helper can see their own assignments
CREATE POLICY "Helper can view own assignments" ON helfer_fall
  FOR SELECT USING (
    get_user_role() = 'helper' AND 
    helfer_id = get_user_id()
  );

-- Jugendamt can see assignments for their cases
CREATE POLICY "Jugendamt can view own case assignments" ON helfer_fall
  FOR SELECT USING (
    get_user_role() = 'jugendamt' AND 
    EXISTS (
      SELECT 1 FROM faelle f
      WHERE f.fall_id = helfer_fall.fall_id 
      AND f.schule_oder_kita = get_user_jugendamt()
    )
  );

-- Insert/Update policies
CREATE POLICY "Admin can manage assignments" ON helfer_fall
  FOR ALL USING (get_user_role() = 'admin');

-- ================================================
-- URLAUBE (Vacations) Policies
-- ================================================

-- Admin can see all vacations
CREATE POLICY "Admin can view all vacations" ON urlaube
  FOR SELECT USING (get_user_role() = 'admin');

-- Helper can only see their own vacations
CREATE POLICY "Helper can view own vacations" ON urlaube
  FOR SELECT USING (
    get_user_role() = 'helper' AND 
    helfer_id = get_user_id()
  );

-- Insert/Update policies
CREATE POLICY "Helper can manage own vacations" ON urlaube
  FOR ALL USING (
    get_user_role() = 'helper' AND 
    helfer_id = get_user_id()
  );

CREATE POLICY "Admin can manage all vacations" ON urlaube
  FOR ALL USING (get_user_role() = 'admin');

-- ================================================
-- BERICHTE (Reports) Policies
-- ================================================

-- Admin can see all reports
CREATE POLICY "Admin can view all reports" ON berichte
  FOR SELECT USING (get_user_role() = 'admin');

-- Jugendamt can see reports for their cases
CREATE POLICY "Jugendamt can view own case reports" ON berichte
  FOR SELECT USING (
    get_user_role() = 'jugendamt' AND 
    EXISTS (
      SELECT 1 FROM faelle f
      WHERE f.fall_id = berichte.fall_id 
      AND f.schule_oder_kita = get_user_jugendamt()
    ) AND 
    sichtbar_fuer_jugendamt = true
  );

-- Helper can see reports for their cases (if allowed)
CREATE POLICY "Helper can view own case reports" ON berichte
  FOR SELECT USING (
    get_user_role() = 'helper' AND 
    EXISTS (
      SELECT 1 FROM helfer_fall hf
      WHERE hf.fall_id = berichte.fall_id 
      AND hf.helfer_id = get_user_id()
      AND hf.aktiv = true
    )
  );

-- Insert/Update policies
CREATE POLICY "Admin can manage all reports" ON berichte
  FOR ALL USING (get_user_role() = 'admin');

-- ================================================
-- AUSGANGSRECHNUNG (Invoices) Policies
-- ================================================

-- Admin can see all invoices
CREATE POLICY "Admin can view all invoices" ON ausgangsrechnung
  FOR SELECT USING (get_user_role() = 'admin');

-- Jugendamt can see invoices for their cases
CREATE POLICY "Jugendamt can view own case invoices" ON ausgangsrechnung
  FOR SELECT USING (
    get_user_role() = 'jugendamt' AND 
    EXISTS (
      SELECT 1 FROM faelle f
      WHERE f.fall_id = ausgangsrechnung.fall_id 
      AND f.schule_oder_kita = get_user_jugendamt()
    )
  );

-- Insert/Update policies
CREATE POLICY "Admin can manage all invoices" ON ausgangsrechnung
  FOR ALL USING (get_user_role() = 'admin');

-- ================================================
-- JUGENDAMT_ANSPRECHPARTNER Policies
-- ================================================

-- Admin can see all contacts
CREATE POLICY "Admin can view all jugendamt contacts" ON jugendamt_ansprechpartner
  FOR SELECT USING (get_user_role() = 'admin');

-- Jugendamt user can see their own profile
CREATE POLICY "Jugendamt can view own profile" ON jugendamt_ansprechpartner
  FOR SELECT USING (
    get_user_role() = 'jugendamt' AND 
    ansprechpartner_id = get_user_id()
  );

-- Update policies
CREATE POLICY "Admin can manage jugendamt contacts" ON jugendamt_ansprechpartner
  FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Jugendamt can update own profile" ON jugendamt_ansprechpartner
  FOR UPDATE USING (
    get_user_role() = 'jugendamt' AND 
    ansprechpartner_id = get_user_id()
  );

-- ================================================
-- Grant necessary permissions
-- ================================================

-- Grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_jugendamt() TO authenticated;