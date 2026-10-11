-- ==============================================================================
-- ROOTIFY — Origin Passport & Product Authenticity System Migration
-- Migration ID: 20261012000001_origin_passport_system.sql
-- Description: Creates tables, constraints, indexes, RLS policies, and seed data
--              for Vendor QR codes, Product Batch QR codes, Origin Passports,
--              audited claims, media moderation, and privacy-preserving scan logs.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. VENDORS TABLE (If not already present in Supabase)
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL CHECK (district IN ('North Goa', 'South Goa')),
  description TEXT,
  story TEXT,
  category TEXT,
  product_categories JSONB DEFAULT '[]'::jsonb,
  banner_image TEXT,
  profile_image TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  reviewed_by TEXT,
  vendor_qr_code TEXT UNIQUE,
  is_shg_or_mahila_mandal BOOLEAN DEFAULT false,
  shg_name TEXT,
  serviceable_talukas JSONB DEFAULT '[]'::jsonb,
  vendor_score JSONB DEFAULT '{"overall": 90, "certificationScore": 90, "ratingScore": 90, "consistencyScore": 90, "originAuthenticityScore": 90}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCT BATCHES TABLE
-- Stores unique, unpredictable batch identifiers & production records
CREATE TABLE IF NOT EXISTS public.product_batches (
  id TEXT PRIMARY KEY,
  batch_code TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  production_date DATE NOT NULL,
  best_before_date DATE,
  units_produced INTEGER NOT NULL DEFAULT 1 CHECK (units_produced > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'active', 'rejected', 'revoked')),
  qr_code_url TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  revocation_reason TEXT,
  scan_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast batch lookup via QR scans
CREATE INDEX IF NOT EXISTS idx_product_batches_code ON public.product_batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_product_batches_vendor ON public.product_batches(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_status ON public.product_batches(status);

-- 4. ORIGIN PASSPORTS TABLE
-- The digital passport holding audited heritage claims, step-by-step methods, and sourcing
CREATE TABLE IF NOT EXISTS public.origin_passports (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES public.product_batches(id) ON DELETE CASCADE,
  batch_code TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  verification_status TEXT NOT NULL DEFAULT 'pending_review' 
    CHECK (verification_status IN ('unverified', 'pending_review', 'verified_with_evidence', 'rejected', 'revoked')),
  origin_village TEXT NOT NULL,
  origin_taluka TEXT NOT NULL,
  origin_district TEXT NOT NULL,
  traditional_method_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients_sourcing JSONB NOT NULL DEFAULT '[]'::jsonb,
  claims_reviewed JSONB NOT NULL DEFAULT '[]'::jsonb,
  independent_testing_status TEXT DEFAULT 'Not Independently Lab Tested - Verified via Field Audit',
  anti_tamper_disclaimer TEXT NOT NULL DEFAULT 'This QR verifies the registered Rootify digital batch and audited origin claims. A physical label scan alone cannot prove the physical container has not been refilled or tampered with.',
  public_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_origin_passports_batch_code ON public.origin_passports(batch_code);
CREATE INDEX IF NOT EXISTS idx_origin_passports_vendor ON public.origin_passports(vendor_id);

-- 5. PASSPORT MEDIA TABLE
-- Moderated producer photos, workspace images, and making-of videos
CREATE TABLE IF NOT EXISTS public.passport_media (
  id TEXT PRIMARY KEY,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('vendor', 'batch', 'product')),
  owner_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  category TEXT NOT NULL CHECK (category IN ('profile', 'farm_workspace', 'making_process', 'final_product', 'artisan_interview')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  description TEXT,
  alt_text TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passport_media_owner ON public.passport_media(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_passport_media_moderation ON public.passport_media(moderation_status);

-- 6. QR SCAN LOGS TABLE
-- Privacy-preserving scan analytics and anti-counterfeit velocity monitoring
CREATE TABLE IF NOT EXISTS public.qr_scan_logs (
  id TEXT PRIMARY KEY,
  qr_type TEXT NOT NULL CHECK (qr_type IN ('vendor', 'batch')),
  identifier TEXT NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  ip_hash TEXT,
  device_type TEXT,
  taluka_detected TEXT,
  scan_sequence_number INTEGER NOT NULL DEFAULT 1,
  is_flagged_for_review BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_identifier ON public.qr_scan_logs(identifier);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_flagged ON public.qr_scan_logs(is_flagged_for_review);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.origin_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scan_logs ENABLE ROW LEVEL SECURITY;

-- 7.1 VENDORS POLICIES
-- Public can view approved vendors
CREATE POLICY "Public can view approved vendors" 
  ON public.vendors FOR SELECT 
  USING (status = 'approved');

-- Vendors can view and update their own vendor profile
CREATE POLICY "Vendors can view own profile" 
  ON public.vendors FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = user_id OR auth.uid()::text = id);

CREATE POLICY "Vendors can update own profile" 
  ON public.vendors FOR UPDATE 
  TO authenticated 
  USING (auth.uid()::text = user_id OR auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid()::text = id);

-- Admins have full access
CREATE POLICY "Admins have full access to vendors" 
  ON public.vendors FOR ALL 
  TO authenticated 
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- 7.2 PRODUCT BATCHES POLICIES
-- Public can view active batches
CREATE POLICY "Public can view active product batches" 
  ON public.product_batches FOR SELECT 
  USING (status = 'active');

-- Vendors can view and insert their own batches
CREATE POLICY "Vendors can view own batches" 
  ON public.product_batches FOR SELECT 
  TO authenticated 
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()::text));

CREATE POLICY "Approved vendors can create product batches" 
  ON public.product_batches FOR INSERT 
  TO authenticated 
  WITH CHECK (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()::text AND status = 'approved')
    AND status = 'pending'
  );

-- Admins can update/approve/revoke batches
CREATE POLICY "Admins have full access to batches" 
  ON public.product_batches FOR ALL 
  TO authenticated 
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- 7.3 ORIGIN PASSPORTS POLICIES
-- Public can view passports of active batches
CREATE POLICY "Public can view origin passports" 
  ON public.origin_passports FOR SELECT 
  USING (
    verification_status IN ('verified_with_evidence', 'pending_review', 'revoked')
  );

-- Vendors can manage own passport drafts
CREATE POLICY "Vendors can view own passports" 
  ON public.origin_passports FOR SELECT 
  TO authenticated 
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()::text));

CREATE POLICY "Approved vendors can create passports" 
  ON public.origin_passports FOR INSERT 
  TO authenticated 
  WITH CHECK (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()::text AND status = 'approved')
    AND verification_status = 'pending_review'
  );

CREATE POLICY "Admins have full access to passports" 
  ON public.origin_passports FOR ALL 
  TO authenticated 
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- 7.4 PASSPORT MEDIA POLICIES
-- Public can view approved media only
CREATE POLICY "Public can view approved media" 
  ON public.passport_media FOR SELECT 
  USING (moderation_status = 'approved' AND is_public = true);

-- Vendors can view and upload own media
CREATE POLICY "Vendors can view own media" 
  ON public.passport_media FOR SELECT 
  TO authenticated 
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()::text));

CREATE POLICY "Vendors can insert own media" 
  ON public.passport_media FOR INSERT 
  TO authenticated 
  WITH CHECK (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()::text));

CREATE POLICY "Admins have full access to media" 
  ON public.passport_media FOR ALL 
  TO authenticated 
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- 7.5 QR SCAN LOGS POLICIES
-- Public can insert anonymous scan events
CREATE POLICY "Public can insert scan logs" 
  ON public.qr_scan_logs FOR INSERT 
  WITH CHECK (true);

-- Only admins and vendors can view scan analytics
CREATE POLICY "Admins can view scan logs" 
  ON public.qr_scan_logs FOR SELECT 
  TO authenticated 
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- ==============================================================================
-- 8. INITIAL SEED DATA FOR AUTHENTIC GOAN BATCHES & ORIGIN PASSPORTS
-- ==============================================================================

-- 8.1 Seed Maria's Traditional Foods Batches & Passports
INSERT INTO public.product_batches (
  id, batch_code, product_id, product_name, vendor_id, vendor_name, batch_number,
  harvest_date, production_date, best_before_date, units_produced, status,
  qr_code_url, reviewed_by, reviewed_at, review_notes, scan_count
) VALUES (
  'batch-maria-beb-01',
  'RTF-BEB-2026M01',
  'prod-bebinca-classic',
  'Royal 7-Layer Goan Bebinca',
  'v-maria-foods',
  'Maria''s Traditional Foods',
  'BATCH-2026-OCT-01',
  '2026-10-08',
  '2026-10-09',
  '2026-10-23',
  40,
  'active',
  '/passport/batch/RTF-BEB-2026M01',
  'Admin Heritage Inspector (Dr. Savio Pinto)',
  '2026-10-09T14:30:00Z',
  'Clay-oven inspection verified. All coconut milk harvested locally in Guirim and Mapusa.',
  12
) ON CONFLICT (batch_code) DO NOTHING;

INSERT INTO public.origin_passports (
  id, batch_id, batch_code, product_id, vendor_id, verification_status,
  origin_village, origin_taluka, origin_district,
  traditional_method_steps, ingredients_sourcing, claims_reviewed,
  independent_testing_status, anti_tamper_disclaimer, public_notes
) VALUES (
  'pass-maria-beb-01',
  'batch-maria-beb-01',
  'RTF-BEB-2026M01',
  'prod-bebinca-classic',
  'v-maria-foods',
  'verified_with_evidence',
  'Guirim',
  'Bardez',
  'North Goa',
  '[
    {"stepNumber": 1, "title": "Fresh Coconut Milk Extraction", "description": "Thick first-press coconut milk squeezed by hand from fresh coconuts harvested in Guirim groves.", "duration": "45 mins"},
    {"stepNumber": 2, "title": "Egg Yolk & Spices Blending", "description": "Local free-range egg yolks whipped gently with nutmeg, cardamom, and pure cane sugar without synthetic flavorings.", "duration": "30 mins"},
    {"stepNumber": 3, "title": "Sequential 7-Layer Charcoal Baking", "description": "Each layer is baked individually for 40 minutes over slow-burning coconut husks and charcoal to produce distinct golden-brown layers.", "duration": "5 hours"},
    {"stepNumber": 4, "title": "Pure Cow Ghee Brushing", "description": "Generous brushing of Goan cow ghee between each caramelized layer to seal moisture and aroma.", "duration": "Throughout bake"},
    {"stepNumber": 5, "title": "Cooling & Heritage Packaging", "description": "Resting for 8 hours before hand-cutting and sealing in vacuum-sealed food-grade boxes.", "duration": "8 hours"}
  ]'::jsonb,
  '[
    {"ingredient": "Fresh Coconut Milk", "sourceVillage": "Guirim", "sourceTaluka": "Bardez", "isLocalGoan": true, "harvestSeason": "Year-round coastal harvest"},
    {"ingredient": "Free-Range Egg Yolks", "sourceVillage": "Aldona", "sourceTaluka": "Bardez", "isLocalGoan": true, "harvestSeason": "Weekly local farm supply"},
    {"ingredient": "Pure Cow Ghee", "sourceVillage": "Saligao", "sourceTaluka": "Bardez", "isLocalGoan": true, "harvestSeason": "Traditional Goan dairy"},
    {"ingredient": "Malabar Nutmeg & Cardamom", "sourceVillage": "Ponda Spices", "sourceTaluka": "Ponda", "isLocalGoan": true, "harvestSeason": "Post-monsoon spice crop"}
  ]'::jsonb,
  '[
    {"claimType": "GI_TAG", "claimName": "Traditional Goan Bebinca Recipe Standard", "certificateNumber": "GI-GOA-BEB-2024", "verified": true, "reviewDate": "2026-08-12", "reviewerName": "Goa Heritage Food Council", "evidenceSummary": "Verified adherence to historic 7-layer ratio without chemical emulsifiers."},
    {"claimType": "FSSAI", "claimName": "Food Safety and Standards Authority of India", "certificateNumber": "11422001000293", "verified": true, "reviewDate": "2026-08-10", "reviewerName": "FSSAI Goa District Inspector", "evidenceSummary": "Commercial kitchen safety, clean water testing, and packaging sanitation verified."},
    {"claimType": "PANCHAYAT_NOC", "claimName": "Guirim Village Panchayat Artisan License", "certificateNumber": "GVP-NOC-2026-088", "verified": true, "reviewDate": "2026-08-10", "reviewerName": "Sarpanch, Guirim", "evidenceSummary": "Registered traditional baking workshop operating in ancestral village premises since 1954."}
  ]'::jsonb,
  'Physical workshop inspected on 2026-10-09 by Rootify Lead Inspector. Laboratory nutrient test not conducted.',
  'This QR code verifies Rootify digital batch RTF-BEB-2026M01 and reviewed village origin claims. Please inspect tamper-evident seal on physical box packaging before consumption.',
  'Batch prepared fresh for festival season. Best enjoyed warm with a scoop of vanilla ice cream or black coffee.'
) ON CONFLICT (batch_code) DO NOTHING;

-- 8.2 Seed Divar Island Mahila Mandal SHG Batches & Passports
INSERT INTO public.product_batches (
  id, batch_code, product_id, product_name, vendor_id, vendor_name, batch_number,
  harvest_date, production_date, best_before_date, units_produced, status,
  qr_code_url, reviewed_by, reviewed_at, review_notes, scan_count
) VALUES (
  'batch-divar-bal-01',
  'RTF-BAL-2026D01',
  'prod-prawn-balchao',
  'Authentic Goan Prawn Balchão',
  'v-divar-shg',
  'Divar Island Mahila Mandal SHG',
  'BATCH-2026-OCT-D01',
  '2026-10-05',
  '2026-10-07',
  '2027-04-07',
  50,
  'active',
  '/passport/batch/RTF-BAL-2026D01',
  'Admin Community Inspector (Anjali Prabhu)',
  '2026-10-07T11:00:00Z',
  'SHG stone grinding workshop inspected. Island coconut vinegar fermentation verified.',
  19
) ON CONFLICT (batch_code) DO NOTHING;

INSERT INTO public.origin_passports (
  id, batch_id, batch_code, product_id, vendor_id, verification_status,
  origin_village, origin_taluka, origin_district,
  traditional_method_steps, ingredients_sourcing, claims_reviewed,
  independent_testing_status, anti_tamper_disclaimer, public_notes
) VALUES (
  'pass-divar-bal-01',
  'batch-divar-bal-01',
  'RTF-BAL-2026D01',
  'prod-prawn-balchao',
  'v-divar-shg',
  'verified_with_evidence',
  'Piedade, Divar Island',
  'Tiswadi',
  'North Goa',
  '[
    {"stepNumber": 1, "title": "Sun-Drying Coastal Prawns", "description": "Fresh small estuary prawns caught by Divar island fishermen, cleaned and dried naturally under island sunlight.", "duration": "3 days"},
    {"stepNumber": 2, "title": "Stone-Mill Spice Grinding (Rogddo)", "description": "Kashmiri red chilies, garlic, cumin, and cloves ground on ancient granite grinding stones (*rogddo*) without motor heat.", "duration": "2 hours"},
    {"stepNumber": 3, "title": "Coconut Palm Vinegar Slow Simmer", "description": "Cooked in traditional terracotta pots with naturally fermented coconut palm toddy vinegar.", "duration": "90 mins"},
    {"stepNumber": 4, "title": "Glass Jar Aging", "description": "Bottled in sterile glass jars and allowed to mature for 48 hours for rich flavor infusion.", "duration": "48 hours"}
  ]'::jsonb,
  '[
    {"ingredient": "Sun-Dried Estuary Prawns", "sourceVillage": "Piedade", "sourceTaluka": "Tiswadi (Divar Island)", "isLocalGoan": true, "harvestSeason": "Island fisherman daily catch"},
    {"ingredient": "Natural Coconut Toddy Vinegar", "sourceVillage": "Malar", "sourceTaluka": "Tiswadi (Divar Island)", "isLocalGoan": true, "harvestSeason": "Fermented palm sap"},
    {"ingredient": "Stone-Ground Kashmiri Chilies", "sourceVillage": "Valpoi Farm", "sourceTaluka": "Sattari", "isLocalGoan": true, "harvestSeason": "Winter dried harvest"}
  ]'::jsonb,
  '[
    {"claimType": "SHG_CERT", "claimName": "Govt of Goa Rural Development SHG Registration", "certificateNumber": "DRDA-GOA-SHG-2012-441", "verified": true, "reviewDate": "2026-08-15", "reviewerName": "Divar Village Development Officer", "evidenceSummary": "Verified 18 active island women members sharing cooperative profits."},
    {"claimType": "FSSAI", "claimName": "FSSAI Micro-Enterprise Food Safety License", "certificateNumber": "21422003001892", "verified": true, "reviewDate": "2026-08-15", "reviewerName": "FSSAI North Goa", "evidenceSummary": "Food safety, hygiene, glass packaging, and absence of synthetic preservatives confirmed."}
  ]'::jsonb,
  'Verified via Self-Help Group physical audit and government cooperative registration.',
  'This QR code verifies Rootify digital batch RTF-BAL-2026D01. Ensure the safety button on the jar lid is depressed before opening.',
  'Traditional pickle preserve. Zero chemical preservatives added. Use clean dry spoon.'
) ON CONFLICT (batch_code) DO NOTHING;
