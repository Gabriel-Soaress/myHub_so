import { getDb } from '../db.js';

export default async function handler(req, res) {
  const sql = getDb();
  const { tenant } = req.query;

  if (!tenant) {
    return res.status(400).json({ error: 'Tenant slug is required' });
  }

  if (req.method === 'GET') {
    try {
      const nodes = await sql`
        SELECT id, parent_id as "parentId", name, type, metadata, content, item_order as "order",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM nodes
        WHERE user_slug = ${tenant}
        ORDER BY item_order ASC
      `;
      return res.status(200).json(nodes);
    } catch (error) {
      console.error('GET nodes error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { id, parentId, name, type, metadata, content, order } = req.body;
    try {
      await sql`
        INSERT INTO nodes (id, user_slug, parent_id, name, type, metadata, content, item_order)
        VALUES (${id}, ${tenant}, ${parentId || null}, ${name}, ${type}, ${JSON.stringify(metadata || {})}::jsonb, ${JSON.stringify(content || {})}::jsonb, ${order || 0})
      `;
      return res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('POST nodes error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
