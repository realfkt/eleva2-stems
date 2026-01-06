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