export const config = {
  api: {
    bodyParser: false, // Obligatorio para manejar archivos binarios (audio)
  },
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  try {
    // 1. Obtenemos los datos del formulario (Nombre, Email, Archivo)
    const formData = await req.formData();
    
    // 2. Enviamos todo a n8n incluyendo nuestro Secreto de seguridad
    // Usamos la URL de producción que configuramos antes
    const n8nRes = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'x-n8n-secret': process.env.N8N_SECRET_KEY // La llave "1234"
      }
    });

    // 3. Recibimos la respuesta de n8n
    const n8nData = await n8nRes.json();

    // 4. Validamos usando el nombre EXACTO que pusimos en n8n
    if (!n8nData.checkout_url) { 
      console.error('n8n no devolvió checkout_url:', n8nData);
      return new Response(JSON.stringify({ error: 'No se pudo generar el pago' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. Enviamos la URL de vuelta al frontend
    return new Response(JSON.stringify({
      urlPago: n8nData.checkout_url 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en procesar.js:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}