import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const schema = fs.readFileSync('schema.sql', 'utf8');
  
  console.log('Running migration...');
  
  try {
    const client = await pool.connect();
    // Pool allows multiple statements separated by semicolon naturally!
    await client.query(schema);
    client.release();
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
