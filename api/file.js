import { getDb } from './db.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Vercel max for serverless is usually 4.5mb, but we try 10mb
    },
  },
};

export default async function handler(req, res) {
  const sql = getDb();
  const { nodeId } = req.query;

  if (!nodeId) {
    return res.status(400).json({ error: 'Node ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const files = await sql`SELECT data FROM files WHERE node_id = ${nodeId}`;
      if (files.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      return res.status(200).json({ data: files[0].data });
    } catch (error) {
      console.error('GET file error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { data, append } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'File data is required' });
    }
    
    try {
      // Upsert or Append
      const existing = await sql`SELECT node_id FROM files WHERE node_id = ${nodeId}`;
      if (existing.length > 0) {
        if (append) {
          await sql`UPDATE files SET data = data || ${data} WHERE node_id = ${nodeId}`;
        } else {
          await sql`UPDATE files SET data = ${data} WHERE node_id = ${nodeId}`;
        }
      } else {
        await sql`INSERT INTO files (node_id, data) VALUES (${nodeId}, ${data})`;
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('POST file error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
