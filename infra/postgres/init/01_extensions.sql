-- UUID generation (used for all primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigram indexes for fast text search within PostgreSQL (used for reviewer search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
