require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
sql`SELECT id FROM users LIMIT 1`.then(res => {
  console.log(res.rows[0]);
  process.exit(0);
});
