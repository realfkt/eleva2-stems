// 1. Recibimos la respuesta de n8n
    const n8nData = await n8nRes.json();

    // 2. Validamos usando el nombre EXACTO que pusimos en el nodo Responder a Vercel
    if (!n8nData.checkout_url) { 
      console.error('n8n no devolvió checkout_url:', n8nData);
      return new Response(JSON.stringify({ error: 'No se pudo generar el pago' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Enviamos la URL de vuelta al frontend para que el JS del navegador haga la redirección
    return new Response(JSON.stringify({
      urlPago: n8nData.checkout_url 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });