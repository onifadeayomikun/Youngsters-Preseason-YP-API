ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);

UPDATE clubs
SET country_code = 'GB'
WHERE LOWER(TRIM(country)) = 'england'
  AND country_code IS NULL;