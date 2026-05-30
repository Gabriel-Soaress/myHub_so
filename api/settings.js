import { getDb } from '../db.js';

export default async function handler(req, res) {
  const sql = getDb();
  
  if (req.method === 'GET') {
    const { tenant } = req.query;
    if (!tenant) return res.status(400).json({ error: 'Tenant required' });
    
    try {
      const users = await sql`SELECT landing_settings FROM users WHERE slug = ${tenant}`;
      if (users.length === 0) return res.status(404).json({ error: 'Tenant not found' });
      return res.status(200).json(users[0].landing_settings || {});
    } catch (err) {
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  if (req.method === 'PUT') {
    const { tenant, settings } = req.body;
    if (!tenant || !settings) return res.status(400).json({ error: 'Missing tenant or settings' });
    
    try {
      await sql`UPDATE users SET landing_settings = ${settings} WHERE slug = ${tenant}`;
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
