// api/procesar.js
// Este archivo se ejecuta en Vercel, NO en el navegador

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Leer formulario
  const formData = await req.formData();
  const audioFile = formData.get('audioFile');
  const nombre = formData.get('nombre');
  const email = formData.get('email');

  // Validaciones básicas
  if (!audioFile || !nombre || !email) {
    return new Response(JSON.stringify({ error: 'Faltan datos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Aquí va tu webhook SECRETO de n8n
  // Guarda N8N_WEBHOOK_URL y N8N_SECRET_KEY en Vercel como variables de entorno
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  const secretKey = process.env.N8N_SECRET_KEY;

  if (!n8nUrl || !secretKey) {
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Reenviar a n8n con cabecera secreta
  const n8nRes = await fetch(n8nUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'x-n8n-secret': secretKey
    }
  });

  if (!n8nRes.ok) {
    return new Response(JSON.stringify({ error: 'Error al conectar con el servicio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const n8nData = await n8nRes.json();

  // n8n debe responder con { mercadoPagoUrl: "..." }
  return new Response(JSON.stringify({
    urlPago: n8nData.mercadoPagoUrl
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}