CREATE TABLE IF NOT EXISTS gifts (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  village    TEXT        NOT NULL,
  kind       TEXT        NOT NULL CHECK (kind IN ('cash', 'gift')),
  amount     INTEGER     CHECK (amount > 0),
  gift_item  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (kind = 'cash' AND amount IS NOT NULL) OR
    (kind = 'gift' AND gift_item IS NOT NULL AND gift_item <> '')
  )
);

CREATE INDEX IF NOT EXISTS gifts_name_idx    ON gifts (lower(name));
CREATE INDEX IF NOT EXISTS gifts_village_idx ON gifts (lower(village));
