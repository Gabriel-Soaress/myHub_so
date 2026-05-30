import { getDb } from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, slug, passwordHash } = req.body;
  
  if (!name || !email || !slug || !passwordHash) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = getDb();

  try {
    // Check if slug or email exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} OR slug = ${slug}
    `;
    
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'E-mail ou link já em uso.' });
    }

    await sql`
      INSERT INTO users (name, email, slug, password_hash)
      VALUES (${name}, ${email}, ${slug}, ${passwordHash})
    `;

    return res.status(200).json({ success: true, slug });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
