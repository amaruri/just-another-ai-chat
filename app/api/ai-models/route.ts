export async function GET() {
  const res = await fetch('http://localhost:11434/api/tags');
  const data = await res.json();
  return Response.json(data);
}