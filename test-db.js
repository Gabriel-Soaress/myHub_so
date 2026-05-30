import { getDb } from './api/db.js';

async function test() {
  const sql = getDb();
  
  const uuid = crypto.randomUUID();
  try {
    const obj = {};
    const metadata = undefined;
    
    // Testing what actually gets sent
    await sql`
      INSERT INTO nodes (id, user_slug, parent_id, name, type, metadata, content, item_order)
      VALUES (${uuid}, ${'gabriel'}, null, ${'test folder'}, ${'folder'}, ${metadata || '{}'}, ${'{}'}, 0)
    `;
    console.log('Success object');
  } catch (e) {
    console.error('Error object:', e.message);
  }
}
test();
