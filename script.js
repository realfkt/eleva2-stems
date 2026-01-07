// --- FUNCIONES DE UTILIDAD ---
function createWaveform(container, bars = 40) {
    container.innerHTML = '';
    for (let i = 0; i < bars; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        container.appendChild(bar);
    }
}

// --- MANEJO DE ARCHIVOS Y PREVIEW ---
const audioFileInput = document.getElementById('audioFile');
const dropZone = document.getElementById('dropZone');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');
const audioPreview = document.getElementById('audioPreview');
const audioElement = document.getElementById('audioElement');
const playBtn = document.getElementById('playBtn');
const waveform = document.getElementById('waveform');

function handleFile(file) {
    if (!file.type.startsWith('audio/')) {
        alert('Por favor, selecciona un archivo de audio (MP3, WAV).');
        return;
    }

    // Mostrar nombre en la zona de drop
    fileName.textContent = file.name;
    filePreview.classList.remove('hidden');

    // Sincronizar archivo con el input (para que FormData lo vea)
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    audioFileInput.files = dataTransfer.files;

    // Configurar Reproductor de Preview
    const url = URL.createObjectURL(file);
    audioElement.src = url;
    createWaveform(waveform);
    audioPreview.classList.remove('hidden');

    // Feedback visual de carga
    dropZone.classList.add('loading');
    setTimeout(() => dropZone.classList.remove('loading'), 1000);
}

// Eventos de Reproducción Preview
let isPreviewPlaying = false;
playBtn.onclick = () => {
    if (isPreviewPlaying) {
        audioElement.pause();
        playBtn.textContent = '▶ Reproducir';
    } else {
        audioElement.play();
        playBtn.textContent = '⏸ Pausar';
    }
    isPreviewPlaying = !isPreviewPlaying;
};

audioElement.onended = () => {
    playBtn.textContent = '▶ Reproducir';
    isPreviewPlaying = false;
};

// --- DRAG & DROP EVENTS ---
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
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
    audioPreview.classList.add('hidden');
    audioElement.src = '';
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

        const data = await res.json();

        // VALIDACIÓN CLAVE: Buscamos urlPago que viene de tu procesar.js
        if (data.urlPago) {
            window.location.href = data.urlPago; // Redirección automática a Mercado Pago
        } else {
            throw new Error(data.error || 'No se pudo generar el link de pago');
        }
    } catch (err) {
        alert('Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

// --- DEMO INTERACTIVA ---
const demoAudio = document.getElementById('demoAudio');
const demoPlayBtn = document.getElementById('demoPlayBtn');
const demoWaveform = document.getElementById('demoWaveform');
const stemButtons = document.querySelectorAll('.stem-btn');

let isDemoPlaying = false;
demoAudio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // URL de test estable

createWaveform(demoWaveform, 40);

demoPlayBtn.addEventListener('click', () => {
    if (isDemoPlaying) {
        demoAudio.pause();
        demoPlayBtn.textContent = '▶ Reproducir Demo';
    } else {
        demoAudio.play();
        demoPlayBtn.textContent = '⏸ Pausar Demo';
    }
    isDemoPlaying = !isDemoPlaying;
});

stemButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        stemButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        console.log(`Stem seleccionado: ${btn.dataset.stem}`);
    });
});