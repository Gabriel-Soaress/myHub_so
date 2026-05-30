import { getDb } from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, passwordHash, slugOverride } = req.body;
  const sql = getDb();

  try {
    let users;
    
    // Suporte ao fluxo legado: login direto pelo slug, se fornecido
    if (slugOverride) {
      users = await sql`SELECT slug, password_hash FROM users WHERE slug = ${slugOverride}`;
    } else if (email) {
      users = await sql`SELECT slug, password_hash FROM users WHERE email = ${email}`;
    } else {
      return res.status(400).json({ error: 'Faltando email ou slug' });
    }
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    }

    const user = users[0];
    
    if (user.password_hash === passwordHash) {
      return res.status(200).json({ success: true, slug: user.slug });
    } else {
      return res.status(401).json({ success: false, error: 'Senha incorreta.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
