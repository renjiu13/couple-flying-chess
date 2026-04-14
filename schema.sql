CREATE TABLE IF NOT EXISTS keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  submit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_count INTEGER DEFAULT 0,
  submitter_nickname TEXT
);

CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
