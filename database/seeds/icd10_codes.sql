-- ICD-10 Diagnosis Codes for Primary Care / Family Medicine
-- Common diagnoses seen at Quinio Family Medicine

INSERT INTO icd10_codes (code, description, category, is_billable)
VALUES
  -- Preventive/Wellness
  ('Z00.00', 'General adult medical examination without abnormal findings', 'Wellness', true),
  ('Z00.01', 'General adult medical examination with abnormal findings', 'Wellness', true),
  ('Z00.121', 'Encounter for routine child health examination with abnormal findings', 'Wellness', true),
  ('Z00.129', 'Encounter for routine child health examination without abnormal findings', 'Wellness', true),
  ('Z23', 'Encounter for immunization', 'Immunization', true),
  ('Z12.31', 'Encounter for screening mammogram for malignant neoplasm of breast', 'Screening', true),
  ('Z12.11', 'Encounter for screening for malignant neoplasm of colon', 'Screening', true),
  ('Z13.1', 'Encounter for screening for diabetes mellitus', 'Screening', true),
  ('Z13.220', 'Encounter for screening for lipid disorders', 'Screening', true),

  -- Hypertension
  ('I10', 'Essential (primary) hypertension', 'Cardiovascular', true),
  ('I11.9', 'Hypertensive heart disease without heart failure', 'Cardiovascular', true),
  ('I12.9', 'Hypertensive chronic kidney disease with stage 1-4 CKD', 'Cardiovascular', true),
  ('I13.10', 'Hypertensive heart and CKD without heart failure, stage 1-4 CKD', 'Cardiovascular', true),

  -- Diabetes
  ('E11.9', 'Type 2 diabetes mellitus without complications', 'Endocrine', true),
  ('E11.65', 'Type 2 diabetes mellitus with hyperglycemia', 'Endocrine', true),
  ('E11.21', 'Type 2 diabetes mellitus with diabetic nephropathy', 'Endocrine', true),
  ('E11.40', 'Type 2 diabetes mellitus with diabetic neuropathy, unspecified', 'Endocrine', true),
  ('E11.319', 'Type 2 diabetes mellitus with unspecified diabetic retinopathy', 'Endocrine', true),
  ('E10.9', 'Type 1 diabetes mellitus without complications', 'Endocrine', true),
  ('R73.03', 'Prediabetes', 'Endocrine', true),

  -- Lipid Disorders
  ('E78.00', 'Pure hypercholesterolemia, unspecified', 'Metabolic', true),
  ('E78.1', 'Pure hyperglyceridemia', 'Metabolic', true),
  ('E78.2', 'Mixed hyperlipidemia', 'Metabolic', true),
  ('E78.5', 'Hyperlipidemia, unspecified', 'Metabolic', true),

  -- Thyroid
  ('E03.9', 'Hypothyroidism, unspecified', 'Endocrine', true),
  ('E05.90', 'Thyrotoxicosis, unspecified without thyrotoxic crisis', 'Endocrine', true),
  ('E06.3', 'Autoimmune thyroiditis', 'Endocrine', true),
  ('R94.6', 'Abnormal results of thyroid function studies', 'Endocrine', true),

  -- Respiratory
  ('J06.9', 'Acute upper respiratory infection, unspecified', 'Respiratory', true),
  ('J20.9', 'Acute bronchitis, unspecified', 'Respiratory', true),
  ('J02.9', 'Acute pharyngitis, unspecified', 'Respiratory', true),
  ('J01.90', 'Acute sinusitis, unspecified', 'Respiratory', true),
  ('J45.20', 'Mild intermittent asthma, uncomplicated', 'Respiratory', true),
  ('J45.30', 'Mild persistent asthma, uncomplicated', 'Respiratory', true),
  ('J45.40', 'Moderate persistent asthma, uncomplicated', 'Respiratory', true),
  ('J44.1', 'COPD with acute exacerbation', 'Respiratory', true),
  ('J44.9', 'COPD, unspecified', 'Respiratory', true),
  ('U07.1', 'COVID-19', 'Respiratory', true),

  -- GI
  ('K21.0', 'GERD with esophagitis', 'GI', true),
  ('K21.9', 'GERD without esophagitis', 'GI', true),
  ('K30', 'Functional dyspepsia', 'GI', true),
  ('K52.9', 'Noninfective gastroenteritis and colitis, unspecified', 'GI', true),
  ('K59.00', 'Constipation, unspecified', 'GI', true),
  ('K58.9', 'Irritable bowel syndrome without diarrhea', 'GI', true),

  -- Musculoskeletal
  ('M54.5', 'Low back pain', 'MSK', true),
  ('M54.2', 'Cervicalgia', 'MSK', true),
  ('M25.561', 'Pain in right knee', 'MSK', true),
  ('M25.562', 'Pain in left knee', 'MSK', true),
  ('M79.3', 'Panniculitis, unspecified', 'MSK', true),
  ('M25.511', 'Pain in right shoulder', 'MSK', true),
  ('M25.512', 'Pain in left shoulder', 'MSK', true),
  ('M19.011', 'Primary osteoarthritis, right shoulder', 'MSK', true),
  ('M17.11', 'Primary osteoarthritis, right knee', 'MSK', true),
  ('M17.12', 'Primary osteoarthritis, left knee', 'MSK', true),

  -- Mental Health
  ('F32.9', 'Major depressive disorder, single episode, unspecified', 'Mental Health', true),
  ('F33.0', 'Major depressive disorder, recurrent, mild', 'Mental Health', true),
  ('F41.1', 'Generalized anxiety disorder', 'Mental Health', true),
  ('F41.9', 'Anxiety disorder, unspecified', 'Mental Health', true),
  ('F90.9', 'ADHD, unspecified type', 'Mental Health', true),
  ('G47.00', 'Insomnia, unspecified', 'Mental Health', true),

  -- Dermatology
  ('L30.9', 'Dermatitis, unspecified', 'Dermatology', true),
  ('L20.9', 'Atopic dermatitis, unspecified', 'Dermatology', true),
  ('B35.1', 'Tinea unguium (nail fungus)', 'Dermatology', true),
  ('L70.0', 'Acne vulgaris', 'Dermatology', true),
  ('L50.9', 'Urticaria, unspecified', 'Dermatology', true),

  -- Genitourinary
  ('N39.0', 'Urinary tract infection, site not specified', 'GU', true),
  ('N30.00', 'Acute cystitis without hematuria', 'GU', true),
  ('N40.0', 'BPH without lower urinary tract symptoms', 'GU', true),
  ('N95.1', 'Menopausal and female climacteric states', 'GU', true),

  -- Obesity
  ('E66.9', 'Obesity, unspecified', 'Metabolic', true),
  ('E66.01', 'Morbid (severe) obesity due to excess calories', 'Metabolic', true),
  ('Z68.30', 'BMI 30.0-30.9, adult', 'Metabolic', true),
  ('Z68.35', 'BMI 35.0-35.9, adult', 'Metabolic', true),
  ('Z68.40', 'BMI 40.0-44.9, adult', 'Metabolic', true),

  -- Pain
  ('R51.9', 'Headache, unspecified', 'Pain', true),
  ('G43.909', 'Migraine, unspecified, not intractable', 'Pain', true),
  ('R10.9', 'Unspecified abdominal pain', 'Pain', true),
  ('R07.9', 'Chest pain, unspecified', 'Pain', true),

  -- Vitamin Deficiencies
  ('E55.9', 'Vitamin D deficiency, unspecified', 'Nutritional', true),
  ('E53.8', 'Deficiency of other specified B group vitamins', 'Nutritional', true),
  ('D50.9', 'Iron deficiency anemia, unspecified', 'Hematologic', true),

  -- Ears/Eyes
  ('H66.90', 'Otitis media, unspecified, unspecified ear', 'ENT', true),
  ('H10.9', 'Unspecified conjunctivitis', 'Ophthalmology', true),
  ('H61.20', 'Impacted cerumen, unspecified ear', 'ENT', true),

  -- Allergies
  ('J30.9', 'Allergic rhinitis, unspecified', 'Allergy', true),
  ('J30.1', 'Allergic rhinitis due to pollen', 'Allergy', true),
  ('T78.40XA', 'Allergy, unspecified, initial encounter', 'Allergy', true),

  -- Long-term Medication Use
  ('Z79.01', 'Long term (current) use of anticoagulants', 'Status', true),
  ('Z79.4', 'Long term (current) use of insulin', 'Status', true),
  ('Z79.84', 'Long term (current) use of oral hypoglycemic drugs', 'Status', true),
  ('Z79.899', 'Other long term (current) drug therapy', 'Status', true),
  ('Z79.82', 'Long term (current) use of aspirin', 'Status', true),
  ('Z79.891', 'Long term (current) use of opiate analgesic', 'Status', true),

  -- Tobacco/Nicotine
  ('F17.210', 'Nicotine dependence, cigarettes, uncomplicated', 'Substance', true),
  ('Z87.891', 'Personal history of nicotine dependence', 'Status', true),
  ('Z72.0', 'Tobacco use', 'Status', true),

  -- General Symptoms
  ('R53.83', 'Other fatigue', 'Symptoms', true),
  ('R00.0', 'Tachycardia, unspecified', 'Symptoms', true),
  ('R42', 'Dizziness and giddiness', 'Symptoms', true),
  ('R05.9', 'Cough, unspecified', 'Symptoms', true),
  ('R50.9', 'Fever, unspecified', 'Symptoms', true),
  ('R63.4', 'Abnormal weight loss', 'Symptoms', true),
  ('R63.5', 'Abnormal weight gain', 'Symptoms', true),

  -- Follow-up/Aftercare
  ('Z09', 'Encounter for follow-up examination after treatment', 'Follow-up', true),
  ('Z51.81', 'Encounter for therapeutic drug level monitoring', 'Follow-up', true),
  ('Z48.89', 'Encounter for other specified surgical aftercare', 'Follow-up', true)

ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_billable = EXCLUDED.is_billable;
