function createWaveform(container, bars = 40) {
  container.innerHTML = '';
  for (let i = 0; i < bars; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    container.appendChild(bar);
  }
}

document.getElementById('audioFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('audioPreview');
  const audio = document.getElementById('audioElement');
  const waveform = document.getElementById('waveform');
  const playBtn = document.getElementById('playBtn');

  if (file) {
    const url = URL.createObjectURL(file);
    audio.src = url;
    createWaveform(waveform);
    preview.classList.remove('hidden');

    let isPlaying = false;
    playBtn.textContent = '▶ Reproducir';
    playBtn.onclick = () => {
      if (isPlaying) {
        audio.pause();
        playBtn.textContent = '▶ Reproducir';
      } else {
        audio.play();
        playBtn.textContent = '⏸ Pausar';
      }
      isPlaying = !isPlaying;
    };

    audio.onended = () => {
      playBtn.textContent = '▶ Reproducir';
      isPlaying = false;
    };
  }
});

document.getElementById('stemForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '🚀 Enviando a IA...';

  const formData = new FormData(this);

  try {
    const res = await fetch('/api/procesar', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.urlPago) {
      window.location.href = data.urlPago;
    } else {
      throw new Error(data.error || 'Error al procesar');
    }
  } catch (err) {
    alert('Error: ' + (err.message || 'Intenta de nuevo.'));
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
// Demo interactiva
const demoAudio = document.getElementById('demoAudio');
const demoPlayBtn = document.getElementById('demoPlayBtn');
const demoWaveform = document.getElementById('demoWaveform');
const stemButtons = document.querySelectorAll('.stem-btn');

let isPlaying = false;
let currentStem = 'original'; // Por defecto, reproduce todo

// Cargar audio de ejemplo
demoAudio.src = 'https://cdn.jsdelivr.net/npm/@sample-audio/billie-jean.mp3'; // Ejemplo público

// Crear waveform para demo
function createDemoWaveform() {
  demoWaveform.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    demoWaveform.appendChild(bar);
  }
}

// Inicializar
createDemoWaveform();

// Control de reproducción
demoPlayBtn.addEventListener('click', () => {
  if (isPlaying) {
    demoAudio.pause();
    demoPlayBtn.textContent = '▶ Reproducir Demo';
  } else {
    demoAudio.play();
    demoPlayBtn.textContent = '⏸ Pausar Demo';
  }
  isPlaying = !isPlaying;
});

// Activar/desactivar stems
stemButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const stem = btn.dataset.stem;
    
    // Resetear todos los botones
    stemButtons.forEach(b => b.classList.remove('active'));
    
    // Activar el seleccionado
    btn.classList.add('active');
    
    // Aquí iría la lógica de mute/unmute si tuvieras múltiples audios
    // Por ahora, solo cambiamos el estado visual
    console.log(`Activando stem: ${stem}`);
  });
});
// Drag & Drop para subida de archivos
const dropZone = document.getElementById('dropZone');
const audioFileInput = document.getElementById('audioFile');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');

// Eventos para drag & drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

// Click para abrir el explorador
dropZone.addEventListener('click', () => {
  audioFileInput.click();
});

// Cambio de archivo (manual)
audioFileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

// Manejar el archivo seleccionado
function handleFile(file) {
  // Validar tipo de archivo
  if (!file.type.startsWith('audio/')) {
    alert('Por favor, selecciona un archivo de audio (MP3, WAV).');
    return;
  }

  // Mostrar preview
  fileName.textContent = file.name;
  filePreview.classList.remove('hidden');

  // Actualizar el input oculto
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  audioFileInput.files = dataTransfer.files;

  // Aquí puedes añadir una animación de carga si quieres
  dropZone.classList.add('loading');
  setTimeout(() => {
    dropZone.classList.remove('loading');
  }, 1000);

  // Si tienes waveform, actualízalo
  if (document.getElementById('waveform')) {
    createWaveform(document.getElementById('waveform'));
  }
}

// Remover archivo
removeFile.addEventListener('click', () => {
  audioFileInput.value = '';
  filePreview.classList.add('hidden');
  if (document.getElementById('audioElement')) {
    document.getElementById('audioElement').src = '';
  }
  if (document.getElementById('audioPreview')) {
    document.getElementById('audioPreview').classList.add('hidden');
  }
});