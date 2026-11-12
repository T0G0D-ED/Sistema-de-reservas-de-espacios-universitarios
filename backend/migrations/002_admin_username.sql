ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS username VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_username
ON usuarios (username)
WHERE username IS NOT NULL;
