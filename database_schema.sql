-- Drop existing table if you need to recreate it
-- DROP TABLE IF EXISTS form_evaluations;

CREATE TABLE form_evaluations (
  eval_id SERIAL PRIMARY KEY,
  form_id VARCHAR(50) NOT NULL,
  title TEXT,
  description TEXT,
  type VARCHAR(20),
  layout VARCHAR(50),
  input_to_llm TEXT,
  field_eval JSONB NOT NULL,
  fixed_field_score DECIMAL(5, 2),
  dynamic_field_score DECIMAL(5, 2),
  overall_accuracy DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_form_id ON form_evaluations(form_id);
CREATE INDEX idx_created_at ON form_evaluations(created_at);
CREATE INDEX idx_overall_accuracy ON form_evaluations(overall_accuracy);

-- Example of field_eval structure:
-- {
--   "email": {
--     "expected": "user@example.com",
--     "submitted": "user@example.com",
--     "score": 1.0,
--     "dynamic": false,
--     "inputType": "email"
--   },
--   "fullName": {
--     "expected": "John Doe",
--     "submitted": "John D.",
--     "score": 0.85,
--     "dynamic": true,
--     "inputType": "text",
--     "feedback": "Close match with minor abbreviation"
--   }
-- }

