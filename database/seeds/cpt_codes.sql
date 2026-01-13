-- CPT Codes for Primary Care / Family Medicine
-- Common codes used by Quinio Family Medicine

INSERT INTO cpt_codes (code, short_description, long_description, category, default_fee)
VALUES
  -- Evaluation & Management (E/M) - Office Visits (Established Patients)
  ('99211', 'Office Visit Level 1', 'Office visit for est patient, may not require physician presence', 'E/M', 50.00),
  ('99212', 'Office Visit Level 2', 'Office visit for est patient, straightforward MDM', 'E/M', 100.00),
  ('99213', 'Office Visit Level 3', 'Office visit for est patient, low MDM', 'E/M', 150.00),
  ('99214', 'Office Visit Level 4', 'Office visit for est patient, moderate MDM', 'E/M', 200.00),
  ('99215', 'Office Visit Level 5', 'Office visit for est patient, high MDM', 'E/M', 275.00),

  -- E/M - Office Visits (New Patients)
  ('99201', 'New Patient Level 1', 'Office visit for new patient, straightforward MDM', 'E/M', 75.00),
  ('99202', 'New Patient Level 2', 'Office visit for new patient, straightforward MDM', 'E/M', 125.00),
  ('99203', 'New Patient Level 3', 'Office visit for new patient, low MDM', 'E/M', 200.00),
  ('99204', 'New Patient Level 4', 'Office visit for new patient, moderate MDM', 'E/M', 300.00),
  ('99205', 'New Patient Level 5', 'Office visit for new patient, high MDM', 'E/M', 375.00),

  -- Preventive Medicine - Established Patients
  ('99391', 'Preventive Visit <1 yr', 'Preventive visit, established patient, infant', 'Preventive', 175.00),
  ('99392', 'Preventive Visit 1-4 yr', 'Preventive visit, established patient, early childhood', 'Preventive', 200.00),
  ('99393', 'Preventive Visit 5-11 yr', 'Preventive visit, established patient, late childhood', 'Preventive', 200.00),
  ('99394', 'Preventive Visit 12-17 yr', 'Preventive visit, established patient, adolescent', 'Preventive', 225.00),
  ('99395', 'Preventive Visit 18-39 yr', 'Preventive visit, established patient, 18-39', 'Preventive', 250.00),
  ('99396', 'Preventive Visit 40-64 yr', 'Preventive visit, established patient, 40-64', 'Preventive', 250.00),
  ('99397', 'Preventive Visit 65+ yr', 'Preventive visit, established patient, 65+', 'Preventive', 275.00),

  -- Preventive Medicine - New Patients
  ('99381', 'New Preventive <1 yr', 'Preventive visit, new patient, infant', 'Preventive', 200.00),
  ('99382', 'New Preventive 1-4 yr', 'Preventive visit, new patient, early childhood', 'Preventive', 225.00),
  ('99383', 'New Preventive 5-11 yr', 'Preventive visit, new patient, late childhood', 'Preventive', 225.00),
  ('99384', 'New Preventive 12-17 yr', 'Preventive visit, new patient, adolescent', 'Preventive', 250.00),
  ('99385', 'New Preventive 18-39 yr', 'Preventive visit, new patient, 18-39', 'Preventive', 275.00),
  ('99386', 'New Preventive 40-64 yr', 'Preventive visit, new patient, 40-64', 'Preventive', 275.00),
  ('99387', 'New Preventive 65+ yr', 'Preventive visit, new patient, 65+', 'Preventive', 300.00),

  -- Medicare Wellness Visits
  ('G0438', 'AWV Initial', 'Annual wellness visit, initial', 'Medicare', 175.00),
  ('G0439', 'AWV Subsequent', 'Annual wellness visit, subsequent', 'Medicare', 125.00),
  ('G0402', 'Welcome to Medicare', 'Initial preventive physical exam', 'Medicare', 175.00),

  -- Immunizations Administration
  ('90471', 'Immunization Admin 1st', 'Immunization admin, 1st injection', 'Immunization', 25.00),
  ('90472', 'Immunization Admin Add', 'Immunization admin, each additional', 'Immunization', 15.00),
  ('90473', 'Immunization Admin Nasal', 'Immunization admin, intranasal/oral', 'Immunization', 25.00),

  -- Common Vaccines
  ('90658', 'Flu Vaccine', 'Influenza vaccine, quadrivalent', 'Vaccine', 35.00),
  ('90670', 'Pneumococcal PCV13', 'Pneumococcal conjugate vaccine, 13-valent', 'Vaccine', 225.00),
  ('90732', 'Pneumococcal PPSV23', 'Pneumococcal polysaccharide vaccine', 'Vaccine', 125.00),
  ('90715', 'Tdap Vaccine', 'Tetanus, diphtheria, pertussis vaccine', 'Vaccine', 65.00),
  ('90746', 'Hepatitis B Vaccine', 'Hepatitis B vaccine, adult', 'Vaccine', 85.00),
  ('90750', 'Shingrix Vaccine', 'Zoster vaccine recombinant', 'Vaccine', 200.00),

  -- Lab Specimen Collection
  ('36415', 'Venipuncture', 'Collection of venous blood by venipuncture', 'Lab', 10.00),
  ('36416', 'Fingerstick', 'Collection of capillary blood specimen', 'Lab', 5.00),

  -- Common In-Office Labs
  ('81002', 'Urinalysis', 'Urinalysis, non-automated, without microscopy', 'Lab', 15.00),
  ('81003', 'Urinalysis Auto', 'Urinalysis, automated, with microscopy', 'Lab', 20.00),
  ('82962', 'Glucose POC', 'Glucose, blood by glucose monitoring device', 'Lab', 15.00),
  ('85013', 'Hematocrit', 'Blood count; spun microhematocrit', 'Lab', 10.00),
  ('87880', 'Strep Test Rapid', 'Infectious agent detection, Strep A, rapid', 'Lab', 25.00),
  ('87804', 'Flu Test Rapid', 'Infectious agent detection, influenza, rapid', 'Lab', 35.00),
  ('87426', 'COVID Rapid Test', 'Infectious agent detection, SARS-CoV-2', 'Lab', 45.00),

  -- Common Procedures
  ('10060', 'I&D Abscess Simple', 'Incision and drainage of abscess, simple', 'Procedure', 200.00),
  ('10120', 'Foreign Body Removal', 'Incision and removal of foreign body, simple', 'Procedure', 175.00),
  ('11200', 'Skin Tag Removal 1-15', 'Removal of skin tags, up to 15', 'Procedure', 150.00),
  ('11102', 'Biopsy Skin First', 'Tangential biopsy of skin, single lesion', 'Procedure', 175.00),
  ('17000', 'Destruction Lesion 1st', 'Destruction of benign lesion, first', 'Procedure', 100.00),
  ('17003', 'Destruction Lesion Add', 'Destruction of benign lesion, 2-14', 'Procedure', 25.00),
  ('29125', 'Splint Short Arm', 'Application of short arm splint', 'Procedure', 75.00),
  ('29540', 'Strapping Ankle', 'Strapping; ankle and/or foot', 'Procedure', 65.00),
  ('69210', 'Cerumen Removal', 'Removal impacted cerumen, irrigation', 'Procedure', 75.00),

  -- Injections
  ('20610', 'Joint Injection Large', 'Arthrocentesis, aspiration, major joint', 'Injection', 150.00),
  ('20605', 'Joint Injection Intermed', 'Arthrocentesis, aspiration, intermediate joint', 'Injection', 125.00),
  ('20600', 'Joint Injection Small', 'Arthrocentesis, aspiration, small joint', 'Injection', 100.00),
  ('96372', 'Injection SC/IM', 'Therapeutic, prophylactic, or diagnostic injection', 'Injection', 25.00),

  -- EKG
  ('93000', 'EKG 12-Lead Complete', 'Electrocardiogram, routine ECG with interpretation', 'Diagnostic', 75.00),
  ('93005', 'EKG Tracing Only', 'Electrocardiogram, tracing only', 'Diagnostic', 35.00),

  -- Spirometry
  ('94010', 'Spirometry', 'Spirometry, including FVC, FEV1', 'Diagnostic', 85.00),
  ('94060', 'Spirometry Pre/Post', 'Bronchospasm evaluation, spirometry pre and post', 'Diagnostic', 125.00),

  -- Telehealth
  ('99441', 'Phone E/M 5-10 min', 'Telephone E/M service, 5-10 minutes', 'Telehealth', 50.00),
  ('99442', 'Phone E/M 11-20 min', 'Telephone E/M service, 11-20 minutes', 'Telehealth', 100.00),
  ('99443', 'Phone E/M 21-30 min', 'Telephone E/M service, 21-30 minutes', 'Telehealth', 150.00),

  -- Prolonged Services
  ('99354', 'Prolonged Service 1st hr', 'Prolonged service, outpatient, first hour', 'Prolonged', 125.00),
  ('99355', 'Prolonged Service Add', 'Prolonged service, each additional 30 min', 'Prolonged', 65.00),

  -- Care Management
  ('99490', 'Chronic Care Mgmt 20 min', 'Chronic care management services, 20 minutes', 'Care Mgmt', 75.00),
  ('99491', 'Chronic Care Mgmt 30 min', 'Chronic care management services, 30 minutes', 'Care Mgmt', 100.00),

  -- Modifier Reference (for documentation)
  -- ('25', 'Significant E/M', 'Significant, separately identifiable E/M service', 'Modifier', 0.00),
  -- ('59', 'Distinct Procedure', 'Distinct procedural service', 'Modifier', 0.00),
  -- ('GT', 'Telehealth', 'Via interactive audio and video telecommunications', 'Modifier', 0.00)

  -- CLIA Waived Tests
  ('G0480', 'Drug Test Presumptive', 'Drug test, definitive, 1-7 drug classes', 'Lab', 45.00)

ON CONFLICT (code) DO UPDATE SET
  short_description = EXCLUDED.short_description,
  long_description = EXCLUDED.long_description,
  category = EXCLUDED.category,
  default_fee = EXCLUDED.default_fee;
