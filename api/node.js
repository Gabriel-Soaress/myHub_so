import { getDb } from './db.js';

export default async function handler(req, res) {
  const sql = getDb();
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Node ID is required' });
  }

  if (req.method === 'PUT') {
    const { name, metadata, content, parentId } = req.body;
    try {
      if (parentId !== undefined) {
        await sql`
          UPDATE nodes 
          SET name = COALESCE(${name}, name),
              metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}::jsonb, metadata),
              content = COALESCE(${content ? JSON.stringify(content) : null}::jsonb, content),
              parent_id = ${parentId},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      } else {
        await sql`
          UPDATE nodes 
          SET name = COALESCE(${name}, name),
              metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}::jsonb, metadata),
              content = COALESCE(${content ? JSON.stringify(content) : null}::jsonb, content),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('PUT node error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Because of ON DELETE CASCADE, deleting a parent deletes children and files!
      await sql`DELETE FROM nodes WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('DELETE node error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
