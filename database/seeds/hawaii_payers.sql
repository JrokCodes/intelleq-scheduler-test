-- Hawaii Insurance Payers Seed Data
-- Major payers for Oahu medical billing

INSERT INTO insurance_carriers (name, payer_id, payer_type, clearinghouse, address_line1, city, state, zip, phone, eligibility_enabled, claims_enabled)
VALUES
  -- HMSA (Hawaii Medical Service Association) - Largest Hawaii payer
  (
    'HMSA',
    '34192',
    'commercial',
    'availity',
    'P.O. Box 860',
    'Honolulu',
    'HI',
    '96808',
    '808-948-6330',
    true,
    true
  ),

  -- HMSA Quest (Medicaid managed care)
  (
    'HMSA Quest',
    '34192',
    'medicaid',
    'availity',
    'P.O. Box 860',
    'Honolulu',
    'HI',
    '96808',
    '808-948-6486',
    true,
    true
  ),

  -- UHA (University Health Alliance)
  (
    'UHA',
    '99024',
    'commercial',
    'availity',
    '700 Bishop Street, Suite 300',
    'Honolulu',
    'HI',
    '96813',
    '808-532-4000',
    true,
    true
  ),

  -- Medicare (Noridian - Jurisdiction E)
  (
    'Medicare',
    '12502',
    'medicare',
    'availity',
    'P.O. Box 6704',
    'Fargo',
    'ND',
    '58108',
    '855-609-9960',
    true,
    true
  ),

  -- HMAA (Hawaii Management Alliance Association)
  (
    'HMAA',
    '99012',
    'commercial',
    'availity',
    '1000 Bishop Street, Suite 805',
    'Honolulu',
    'HI',
    '96813',
    '808-791-4600',
    true,
    true
  ),

  -- Kaiser Permanente Hawaii
  (
    'Kaiser Permanente',
    '91051',
    'commercial',
    'availity',
    '711 Kapiolani Boulevard',
    'Honolulu',
    'HI',
    '96813',
    '808-432-5955',
    true,
    true
  ),

  -- AlohaCare (Medicaid)
  (
    'AlohaCare',
    '99914',
    'medicaid',
    'availity',
    '1357 Kapiolani Boulevard, Suite 1250',
    'Honolulu',
    'HI',
    '96814',
    '808-973-0712',
    true,
    true
  ),

  -- United Healthcare
  (
    'United Healthcare',
    '87726',
    'commercial',
    'availity',
    'P.O. Box 740800',
    'Atlanta',
    'GA',
    '30374',
    '800-842-2656',
    true,
    true
  ),

  -- Aetna
  (
    'Aetna',
    '60054',
    'commercial',
    'availity',
    'P.O. Box 981106',
    'El Paso',
    'TX',
    '79998',
    '800-872-3862',
    true,
    true
  ),

  -- Cigna
  (
    'Cigna',
    '62308',
    'commercial',
    'availity',
    'P.O. Box 188061',
    'Chattanooga',
    'TN',
    '37422',
    '800-244-6224',
    true,
    true
  ),

  -- TRICARE (Military)
  (
    'TRICARE',
    '99726',
    'commercial',
    'availity',
    'P.O. Box 7031',
    'Camden',
    'SC',
    '29020',
    '800-444-5445',
    true,
    true
  ),

  -- Workers Comp - Hawaii Employers Mutual
  (
    'HEMIC',
    'HEMIC1',
    'workers_comp',
    'direct',
    '1003 Bishop Street, Suite 1200',
    'Honolulu',
    'HI',
    '96813',
    '808-524-3642',
    false,
    true
  )
ON CONFLICT DO NOTHING;

-- Insert Quinio Family Medicine practice info
INSERT INTO practice_info (
  practice_name,
  practice_npi,
  tax_id,
  address_line1,
  city,
  state,
  zip,
  phone,
  place_of_service_code,
  is_default
)
VALUES (
  'Quinio Family Medicine',
  '1234567890',  -- Placeholder - update with actual NPI
  '123456789',   -- Placeholder - update with actual TIN
  '98-211 Pali Momi Street, Suite 700',
  'Aiea',
  'HI',
  '96701',
  '808-487-5437',
  '11',          -- Office
  true
)
ON CONFLICT DO NOTHING;

-- Insert provider billing info
INSERT INTO provider_billing_info (provider_id, provider_name, npi, taxonomy_code, billing_name)
VALUES
  ('anna_lia', 'Dr. Anna-Lia Quinio', '1234567891', '207Q00000X', 'Quinio, Anna-Lia MD'),
  ('cherie', 'Cherie Ng PA', '1234567892', '363A00000X', 'Ng, Cherie PA-C')
ON CONFLICT (provider_id) DO NOTHING;

-- Insert appointment type to CPT code mappings
INSERT INTO appointment_type_cpt_mapping (appointment_type, default_cpt_code, default_fee)
VALUES
  ('Office Visit', '99213', 150.00),
  ('Follow-up', '99213', 150.00),
  ('New Patient', '99203', 200.00),
  ('Complete Physical Exam', '99396', 250.00),
  ('Medicare Wellness Visit', '99387', 275.00),
  ('Well Child Check', '99392', 200.00),
  ('Same Day', '99213', 150.00),
  ('Procedure', '99213', 150.00),
  ('Shots Only', '90471', 25.00),
  ('Video Visit', '99213', 150.00)
ON CONFLICT (appointment_type) DO NOTHING;
