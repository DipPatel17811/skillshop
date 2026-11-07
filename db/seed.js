const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const catalog = JSON.parse(fs.readFileSync('courses/catalog.json', 'utf8'));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const entry of catalog.courses) {
      const fullPath = path.resolve(entry.path);
      const courseJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      await client.query(
        `INSERT INTO skillshop_courses (id, title, topic, topic_slug, level, duration, description, icon, color, accent, badge_name, badge_icon, skills, featured, course_json)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO UPDATE SET
           title=EXCLUDED.title, topic=EXCLUDED.topic, topic_slug=EXCLUDED.topic_slug,
           level=EXCLUDED.level, duration=EXCLUDED.duration, description=EXCLUDED.description,
           icon=EXCLUDED.icon, color=EXCLUDED.color, accent=EXCLUDED.accent,
           badge_name=EXCLUDED.badge_name, badge_icon=EXCLUDED.badge_icon,
           skills=EXCLUDED.skills, featured=EXCLUDED.featured, course_json=EXCLUDED.course_json`,
        [
          entry.id, entry.title, entry.topic, entry.topicSlug, entry.level, entry.duration,
          entry.description, entry.icon || 'book', entry.color || '#B9E6FF', entry.accent || '#F6F2EA',
          entry.badge ? entry.badge.name : 'Course badge', entry.badge ? entry.badge.icon : 'award',
          entry.skills || [], entry.featured === true, JSON.stringify(courseJson)
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`Seeded ${catalog.courses.length} courses.`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
