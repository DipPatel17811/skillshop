-- Skillshop database schema (PostgreSQL)
-- Run on Render's managed PostgreSQL or locally with psql

CREATE TABLE IF NOT EXISTS skillshop_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),           -- NULL for Google-only accounts
  provider VARCHAR(20) NOT NULL DEFAULT 'local',  -- 'local' or 'google'
  google_id VARCHAR(255) UNIQUE,
  avatar_color VARCHAR(20) DEFAULT '#D8F26B',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skillshop_courses (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  topic_slug VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'book',
  color VARCHAR(20) DEFAULT '#B9E6FF',
  accent VARCHAR(20) DEFAULT '#F6F2EA',
  badge_name VARCHAR(100) DEFAULT 'Course badge',
  badge_icon VARCHAR(50) DEFAULT 'award',
  skills TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  course_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skillshop_progress (
  user_id INTEGER REFERENCES skillshop_users(id) ON DELETE CASCADE,
  course_id VARCHAR(100) REFERENCES skillshop_courses(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS skillshop_certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES skillshop_users(id) ON DELETE CASCADE,
  course_id VARCHAR(100) REFERENCES skillshop_courses(id) ON DELETE CASCADE,
  credential_id VARCHAR(100) UNIQUE NOT NULL,
  learner_name VARCHAR(255) NOT NULL,
  badge_name VARCHAR(100),
  skills JSONB DEFAULT '[]',
  score INTEGER,
  duration VARCHAR(50),
  topic VARCHAR(100),
  level VARCHAR(50),
  issued_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skillshop_sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_user ON skillshop_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON skillshop_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_topic ON skillshop_courses(topic_slug);
