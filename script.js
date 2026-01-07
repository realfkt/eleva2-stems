// --- MANEJO DE ARCHIVOS Y PREVIEW ---
const audioFileInput = document.getElementById('audioFile');
const dropZone = document.getElementById('dropZone');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');

function handleFile(file) {
    if (!file.type.startsWith('audio/')) {
        alert('Por favor, selecciona un archivo de audio (MP3, WAV).');
        return;
    }

    // Mostrar nombre en la interfaz
    fileName.textContent = file.name;
    filePreview.classList.remove('hidden');

    // Sincronizar archivo con el input para que FormData lo detecte
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    audioFileInput.files = dataTransfer.files;

    // Feedback visual
    dropZone.classList.add('loading');
    setTimeout(() => dropZone.classList.remove('loading'), 1000);
}

// --- DRAG & DROP EVENTS ---
dropZone.addEventListener('dragover', (e) => { 
    e.preventDefault(); 
    dropZone.classList.add('dragover'); 
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});

dropZone.addEventListener('click', () => audioFileInput.click());

audioFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

removeFile.addEventListener('click', (e) => {
    e.stopPropagation();
    audioFileInput.value = '';
    filePreview.classList.add('hidden');
});

// --- ENVÍO DEL FORMULARIO (CONEXIÓN CON VERCEL -> n8n) ---
document.getElementById('stemForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    const originalText = btn.textContent;
    
    // UI Loading State
    btn.disabled = true;
    btn.textContent = '🚀 Procesando con IA...';

    const formData = new FormData(this);

    try {
        const res = await fetch('/api/procesar', {
            method: 'POST',
            body: formData
        });

        // Verificamos si la respuesta es JSON antes de leerla
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            throw new Error(`Respuesta inesperada del servidor: ${text}`);
        }

        const data = await res.json();

        if (data.urlPago) {
            window.location.href = data.urlPago; // Redirección a Mercado Pago
        } else {
            throw new Error(data.error || 'No se pudo generar el link de pago');
        }
    } catch (err) {
        alert('Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
});