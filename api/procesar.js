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
    return new Response(JSON.stringify({ error: 'Faltan datos: archivo, nombre o email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Obtener variables de entorno
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  const secretKey = process.env.N8N_SECRET_KEY;

  if (!n8nUrl || !secretKey) {
    console.error('Faltan variables de entorno: N8N_WEBHOOK_URL o N8N_SECRET_KEY');
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Reenviar a n8n con cabecera secreta
    const n8nRes = await fetch(n8nUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'x-n8n-secret': secretKey
      }
    });

    if (!n8nRes.ok) {
      const errorText = await n8nRes.text();
      console.error('Error de n8n:', errorText);
      return new Response(JSON.stringify({ error: 'Servicio temporalmente no disponible' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const n8nData = await n8nRes.json();

    if (!n8nData.mercadoPagoUrl) {
      console.error('n8n no devolvió mercadoPagoUrl:', n8nData);
      return new Response(JSON.stringify({ error: 'No se pudo generar el pago' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      urlPago: n8nData.mercadoPagoUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Excepción en procesar.js:', err);
    return new Response(JSON.stringify({ error: 'Error inesperado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}