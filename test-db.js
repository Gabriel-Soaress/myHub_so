async function run() {
  const id = '123e4567-e89b-12d3-a456-426614174000';
  
  // Test 1: Node
  const resNode = await fetch('https://my-hub-so.vercel.app/api/nodes?tenant=teste', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type: 'folder', name: 'test' })
  });
  console.log('Node res:', resNode.status, await resNode.text());

  // Test 2: File
  const resFile = await fetch(`https://my-hub-so.vercel.app/api/files/${id}?tenant=teste`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: 'data:text/plain;base64,SGVsbG8=' })
  });
  console.log('File res:', resFile.status, await resFile.text());
}
run();
