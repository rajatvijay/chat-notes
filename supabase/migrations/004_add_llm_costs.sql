-- Create llm_costs table to track AI usage costs
CREATE TABLE llm_costs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  endpoint TEXT NOT NULL, -- 'classify' or 'extract-metadata'
  model TEXT NOT NULL DEFAULT 'gpt-4o',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0, -- Cost in USD with 6 decimal precision
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_llm_costs_date ON llm_costs(date DESC);
CREATE INDEX idx_llm_costs_endpoint ON llm_costs(endpoint);
CREATE INDEX idx_llm_costs_created_at ON llm_costs(created_at DESC);

-- Create a composite index for daily cost aggregation
CREATE INDEX idx_llm_costs_date_endpoint ON llm_costs(date, endpoint);