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

    const defaultColors = ['#4f46e5', '#7c3aed', '#2563eb', '#059669', '#d97706', '#db2777'];
    const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    const defaultSettings = JSON.stringify({
      landingTitle: 'Portfólio Reflexivo',
      landingSubtitle: 'Engenharia de Software',
      landingDescription: 'Uma coleção organizada de atividades, reflexões e projetos desenvolvidos ao longo da disciplina.',
      landingColor: randomColor,
      landingFooter: 'Universidade · Engenharia de Software'
    });

    await sql`
      INSERT INTO users (name, email, slug, password_hash, landing_settings)
      VALUES (${name}, ${email}, ${slug}, ${passwordHash}, ${defaultSettings}::jsonb)
    `;

    return res.status(200).json({ success: true, slug });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
