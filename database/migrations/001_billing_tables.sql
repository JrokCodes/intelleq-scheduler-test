-- IntelleQ Medical Billing System - Database Schema
-- Version: 1.0.0
-- Target: quinio-db (test environment uses *_test suffix)
-- Hawaii payers: HMSA, UHA, Medicare (Noridian JE), HMAA

-- ============================================
-- INSURANCE CARRIERS (Reference Table)
-- ============================================
CREATE TABLE IF NOT EXISTS insurance_carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  payer_id VARCHAR(20) NOT NULL,          -- EDI Payer ID
  payer_type VARCHAR(50),                 -- 'commercial', 'medicare', 'medicaid'
  clearinghouse VARCHAR(50),              -- 'availity', 'direct', 'hawaii_xchange'
  address_line1 VARCHAR(100),
  address_line2 VARCHAR(100),
  city VARCHAR(50),
  state VARCHAR(2) DEFAULT 'HI',
  zip VARCHAR(10),
  phone VARCHAR(20),
  claims_email VARCHAR(100),
  claims_fax VARCHAR(20),
  eligibility_enabled BOOLEAN DEFAULT true,
  claims_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_carriers_payer_id ON insurance_carriers(payer_id);
CREATE INDEX IF NOT EXISTS idx_insurance_carriers_name ON insurance_carriers(name);

-- ============================================
-- PATIENT INSURANCE (Links patients to carriers)
-- ============================================
CREATE TABLE IF NOT EXISTS patient_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,               -- References patients table
  insurance_carrier_id UUID REFERENCES insurance_carriers(id),
  subscriber_id VARCHAR(50) NOT NULL,     -- Member ID on card
  group_number VARCHAR(50),
  subscriber_first_name VARCHAR(50),
  subscriber_last_name VARCHAR(50),
  subscriber_dob DATE,
  relationship_to_subscriber VARCHAR(20) DEFAULT 'self', -- 'self', 'spouse', 'child', 'other'
  coverage_type VARCHAR(20) NOT NULL,     -- 'primary', 'secondary', 'tertiary'
  effective_date DATE,
  termination_date DATE,

  -- Eligibility info (populated from 271)
  is_verified BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  copay_pcp DECIMAL(10,2),
  copay_specialist DECIMAL(10,2),
  deductible_amount DECIMAL(10,2),
  deductible_met DECIMAL(10,2),
  out_of_pocket_max DECIMAL(10,2),
  out_of_pocket_met DECIMAL(10,2),
  plan_type VARCHAR(50),                  -- 'HMO', 'PPO', 'POS', etc.
  verification_response JSONB,            -- Full 271 response stored

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient ON patient_insurance(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_carrier ON patient_insurance(insurance_carrier_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_subscriber ON patient_insurance(subscriber_id);

-- ============================================
-- ELIGIBILITY CHECKS (Audit log of verifications)
-- ============================================
CREATE TABLE IF NOT EXISTS eligibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  patient_insurance_id UUID REFERENCES patient_insurance(id),
  insurance_carrier_id UUID REFERENCES insurance_carriers(id),

  -- Request info
  check_date DATE NOT NULL,
  service_type_code VARCHAR(10) DEFAULT '30', -- '30' = general
  request_270 TEXT,                       -- Raw EDI 270 sent

  -- Response info
  response_271 TEXT,                      -- Raw EDI 271 received
  is_eligible BOOLEAN,
  coverage_active BOOLEAN,
  coverage_begin_date DATE,
  coverage_end_date DATE,

  -- Benefits
  copay DECIMAL(10,2),
  deductible DECIMAL(10,2),
  deductible_remaining DECIMAL(10,2),
  out_of_pocket_max DECIMAL(10,2),
  out_of_pocket_remaining DECIMAL(10,2),
  coinsurance_percent INTEGER,

  -- Status
  error_code VARCHAR(20),
  error_message TEXT,
  response_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eligibility_checks_patient ON eligibility_checks(patient_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_date ON eligibility_checks(check_date);

-- ============================================
-- CPT CODES (Reference Table)
-- ============================================
CREATE TABLE IF NOT EXISTS cpt_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  short_description VARCHAR(100),
  long_description TEXT,
  category VARCHAR(50),                   -- 'E/M', 'Procedure', 'Lab', etc.
  default_fee DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cpt_codes_code ON cpt_codes(code);
CREATE INDEX IF NOT EXISTS idx_cpt_codes_category ON cpt_codes(category);

-- ============================================
-- ICD-10 DIAGNOSIS CODES (Reference Table)
-- ============================================
CREATE TABLE IF NOT EXISTS icd10_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(100),
  is_billable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_icd10_codes_code ON icd10_codes(code);
CREATE INDEX IF NOT EXISTS idx_icd10_codes_category ON icd10_codes(category);

-- ============================================
-- PROVIDER BILLING INFO
-- ============================================
CREATE TABLE IF NOT EXISTS provider_billing_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(50) NOT NULL UNIQUE, -- 'anna_lia', 'cherie'
  provider_name VARCHAR(100) NOT NULL,
  npi VARCHAR(10) NOT NULL,               -- National Provider Identifier
  tax_id VARCHAR(10),                     -- TIN (can use practice TIN)
  taxonomy_code VARCHAR(20),              -- Specialty taxonomy
  license_number VARCHAR(30),
  license_state VARCHAR(2) DEFAULT 'HI',
  billing_name VARCHAR(100),              -- Name as it appears on claims
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRACTICE INFO
-- ============================================
CREATE TABLE IF NOT EXISTS practice_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_name VARCHAR(100) NOT NULL,
  practice_npi VARCHAR(10),               -- Facility/Group NPI
  tax_id VARCHAR(10) NOT NULL,            -- Practice TIN
  address_line1 VARCHAR(100),
  address_line2 VARCHAR(100),
  city VARCHAR(50),
  state VARCHAR(2) DEFAULT 'HI',
  zip VARCHAR(10),
  phone VARCHAR(20),
  fax VARCHAR(20),
  place_of_service_code VARCHAR(2) DEFAULT '11', -- '11' = Office
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLAIMS
-- ============================================
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number VARCHAR(20) UNIQUE NOT NULL, -- Generated: CLM-YYYYMMDD-XXXX

  -- References
  appointment_id UUID,                    -- References appointments table
  patient_id UUID NOT NULL,
  patient_insurance_id UUID REFERENCES patient_insurance(id),
  provider_id VARCHAR(50) NOT NULL,

  -- Patient info (denormalized for claim)
  patient_name VARCHAR(100),
  patient_dob DATE,
  patient_address VARCHAR(200),
  patient_phone VARCHAR(20),

  -- Claim details
  service_date DATE NOT NULL,
  place_of_service VARCHAR(2) DEFAULT '11',
  total_charge DECIMAL(10,2) NOT NULL,

  -- Status tracking
  status VARCHAR(30) DEFAULT 'draft',     -- draft, ready, submitted, accepted, rejected, paid, denied, appealed
  submitted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- EDI data
  edi_837_content TEXT,                   -- Generated 837P
  clearinghouse_tracking_id VARCHAR(50),
  payer_claim_number VARCHAR(50),

  -- Response data
  acknowledgment_999 TEXT,                -- EDI 999 response
  claim_response_277 TEXT,                -- EDI 277 status response
  remittance_835 TEXT,                    -- EDI 835 payment response

  -- Payment info (populated from 835)
  allowed_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  patient_responsibility DECIMAL(10,2),
  adjustment_amount DECIMAL(10,2),

  -- Denial info
  denial_reason_code VARCHAR(10),
  denial_reason TEXT,
  appeal_deadline DATE,

  -- Audit
  created_by VARCHAR(50),
  submitted_by VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_claims_appointment ON claims(appointment_id);
CREATE INDEX IF NOT EXISTS idx_claims_patient ON claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_service_date ON claims(service_date);

-- ============================================
-- CLAIM LINE ITEMS (Service Lines)
-- ============================================
CREATE TABLE IF NOT EXISTS claim_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,

  -- Service details
  service_date DATE,                      -- Can differ from claim date
  cpt_code VARCHAR(10) NOT NULL,
  cpt_description VARCHAR(100),
  modifier1 VARCHAR(2),
  modifier2 VARCHAR(2),
  modifier3 VARCHAR(2),
  modifier4 VARCHAR(2),

  -- Diagnosis pointers (1-12, points to claim_diagnoses)
  diagnosis_pointer1 INTEGER,
  diagnosis_pointer2 INTEGER,
  diagnosis_pointer3 INTEGER,
  diagnosis_pointer4 INTEGER,

  -- Charges
  units DECIMAL(5,2) DEFAULT 1,
  charge_amount DECIMAL(10,2) NOT NULL,

  -- Payment info (from 835)
  allowed_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  adjustment_amount DECIMAL(10,2),
  patient_responsibility DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_lines_claim ON claim_lines(claim_id);

-- ============================================
-- CLAIM DIAGNOSES
-- ============================================
CREATE TABLE IF NOT EXISTS claim_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,       -- 1-12 (pointer reference)
  icd10_code VARCHAR(10) NOT NULL,
  diagnosis_description TEXT,
  is_primary BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(claim_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_claim_diagnoses_claim ON claim_diagnoses(claim_id);

-- ============================================
-- CLAIM DENIALS (Denial management)
-- ============================================
CREATE TABLE IF NOT EXISTS claim_denials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,

  denial_date DATE,
  carc_code VARCHAR(10),                  -- Claim Adjustment Reason Code
  rarc_code VARCHAR(10),                  -- Remittance Advice Remark Code
  denial_reason TEXT,
  denial_amount DECIMAL(10,2),

  -- Resolution
  follow_up_action VARCHAR(50),           -- 'appeal', 'resubmit', 'write_off', 'patient_bill'
  follow_up_date DATE,
  appeal_letter TEXT,
  appeal_submitted_at TIMESTAMPTZ,

  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_denials_claim ON claim_denials(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_denials_resolved ON claim_denials(resolved);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id),

  payment_date DATE NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30),             -- 'eft', 'check', 'credit_card', 'cash'
  payment_source VARCHAR(30),             -- 'insurance', 'patient', 'other'
  check_number VARCHAR(30),
  eft_trace_number VARCHAR(50),

  -- ERA data
  era_835_content TEXT,
  payer_reference VARCHAR(50),

  -- Posting info
  posted_at TIMESTAMPTZ,
  posted_by VARCHAR(50),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_claim ON payments(claim_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ============================================
-- PAYMENT ADJUSTMENTS (Line-level adjustments)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  claim_line_id UUID REFERENCES claim_lines(id),

  adjustment_group_code VARCHAR(5),       -- CO, PR, OA, PI, CR
  adjustment_reason_code VARCHAR(10),     -- CARC code
  adjustment_amount DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_adjustments_payment ON payment_adjustments(payment_id);

-- ============================================
-- CPT CODE MAPPINGS (Appointment type to CPT)
-- ============================================
CREATE TABLE IF NOT EXISTS appointment_type_cpt_mapping (
  id SERIAL PRIMARY KEY,
  appointment_type VARCHAR(100) NOT NULL,
  default_cpt_code VARCHAR(10) NOT NULL,
  default_fee DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_appt_type_cpt_mapping ON appointment_type_cpt_mapping(appointment_type);

-- ============================================
-- BILLING AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS billing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,       -- 'claim', 'payment', 'eligibility'
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,            -- 'created', 'updated', 'submitted', 'paid'
  old_values JSONB,
  new_values JSONB,
  performed_by VARCHAR(50),
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_audit_entity ON billing_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_billing_audit_date ON billing_audit_log(created_at);

-- ============================================
-- Update trigger for updated_at columns
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
    AND table_name IN ('insurance_carriers', 'patient_insurance', 'provider_billing_info',
                       'practice_info', 'claims', 'claim_denials')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
      CREATE TRIGGER update_%s_updated_at
        BEFORE UPDATE ON %s
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;
