// app.js
// Mantive suas rotas de script originais e reimplementei as novas funcionalidades
document.addEventListener('DOMContentLoaded', () => {

  // ----- CONTROLE DE TELAS (mantendo comportamento original) -----
  const menu = document.getElementById('menu');
  const formChamado = document.getElementById('formChamado');
  const formGuarita = document.getElementById('formGuarita');
  const aplicacoes = document.getElementById('aplicacoes');
  const sistemas = document.getElementById('sistemas');
  const linksArea = document.getElementById('linksArea');

  document.getElementById('btnChamado').addEventListener('click', ()=>{ hideAll(); formChamado.style.display='block'; });
  document.getElementById('btnGuarita').addEventListener('click', ()=>{ hideAll(); formGuarita.style.display='block'; });
  document.getElementById('btnAplicacoes').addEventListener('click', ()=>{ hideAll(); aplicacoes.style.display='block'; });
  document.getElementById('btnSistemas').addEventListener('click', ()=>{ hideAll(); sistemas.style.display='block'; });
  document.getElementById('btnLinks').addEventListener('click', ()=>{ hideAll(); linksArea.style.display='block'; });

  function hideAll(){
    menu.style.display='none';
    [formChamado, formGuarita, aplicacoes, sistemas, linksArea].forEach(el=>el.style.display='none');
    menu.style.display='none';
  }
  window.voltarMenu = function(){
    [formChamado, formGuarita, aplicacoes, sistemas, linksArea].forEach(el=>el.style.display='none');
    menu.style.display='flex';
  };

  // ----- SEUS SCRIPTS ORIGINAIS (Chamado TI e Guarita) -----
  const scriptChamado='https://script.google.com/macros/s/AKfycbw8bt5spo8b1Ve77XhYHC0N9jiMH6c-je-84C1zvsld1gHCcpUxAm-K9I1ySlW4huiJ/exec';
  const form = document.getElementById('form');
  const outroInput = document.getElementById('outro-problema');
  const problemaSelect = document.getElementById('problema');
  const mensagem = document.getElementById('mensagem');

  const tempos = { /* ... mesmos tempos ... */ 
    "Falha de impressão":"10 minutos",
    "Impressora travada":"10 minutos",
    "Abertura de tabela de preço":"10 minutos",
    "Precificação de produtos":"20 minutos",
    "Computador travando/lento":"20 minutos",
    "Problemas de rede":"20 minutos",
    "Sistema indisponível":"30 minutos",
    "Cadastro RCA":"20 minutos",
    "Erro Transmissão NFE":"30 minutos",
    "Troca Toner Impressora":"15 minutos",
    "Solicitar Periféricos (fones,mouse)":"15 minutos",
    "Outros":"15 minutos"
  };

  problemaSelect.addEventListener('change',()=>{ outroInput.classList.toggle('hidden',problemaSelect.value!=='Outros'); });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const data=new FormData(form);
    const tempo=tempos[problemaSelect.value]||"15 minutos";
    mensagem.textContent="⏳ Enviando chamado...";
    mensagem.style.color="#ffd700";
    mensagem.style.opacity=1;

    fetch(scriptChamado,{method:'POST',body:new URLSearchParams(data)})
    .then(r=>r.json())
    .then(result=>{
      if(result.result==="success"){ 
        mensagem.innerHTML=`✅ Chamado enviado com sucesso!<br>⏳ Em até <b>${tempo}</b> nossa equipe entrará em contato ou resolverá o problema.`;
        mensagem.style.color="#00ff88";
      }else{mensagem.textContent="❌ Erro ao enviar. Tente novamente."; mensagem.style.color="#ff4444";}
    })
    .catch(()=>{mensagem.textContent="❌ Erro na conexão. Tente novamente."; mensagem.style.color="#ff4444";})
    .finally(()=>{ form.reset(); outroInput.classList.add("hidden"); setTimeout(()=>mensagem.style.opacity=0,5000); });
  });

  // Guarita (mantido)
  const scriptGuarita='https://script.google.com/macros/s/AKfycbwsLgZxTwI4jod2SlL6IU1xZmYYj5hWy0-X_1Wki9GeNGlW40x8Bv5bbADRkjOiqHaM/exec';
  const formG=document.getElementById('formGuaritaForm');
  const mensagemG=document.getElementById('mensagemGuarita');

  formG.addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(formG);
    mensagemG.textContent="⏳ Enviando agendamento...";
    mensagemG.style.color="#ffd700";
    mensagemG.style.opacity=1;

    fetch(scriptGuarita,{method:'POST',body:new URLSearchParams(data)})
    .then(r=>r.json())
    .then(result=>{
      if(result.result==="success"){ 
        mensagemG.textContent="✅ Agendamento enviado com sucesso!";
        mensagemG.style.color="#00ff88";
      }else{
        mensagemG.textContent="❌ Erro ao enviar. Tente novamente."; 
        mensagemG.style.color="#ff4444";
      }
    })
    .catch(()=>{mensagemG.textContent="❌ Erro na conexão. Tente novamente."; mensagemG.style.color="#ff4444";})
    .finally(()=>{ formG.reset(); setTimeout(()=>mensagemG.style.opacity=0,5000); });
  });


  // ----- BANNER DE ATUALIZAÇÃO (exemplo) -----
  const updateBanner = document.getElementById('updateBanner');
  const dismissBanner = document.getElementById('dismissBanner');
  // exemplo: mostrar banner (você pode controlar via localStorage ou backend)
  if(!localStorage.getItem('bannerDismissed')) updateBanner.classList.remove('hidden');
  dismissBanner.addEventListener('click', ()=>{ updateBanner.classList.add('hidden'); localStorage.setItem('bannerDismissed','1'); });


  // =========================
  // APLICACOES: QR + SCAN -> PDF
  // =========================

  // ----- QR Generator -----
  const qrText = document.getElementById('qrText');
  const qrFileName = document.getElementById('qrFileName');
  const qrLogoInput = document.getElementById('qrLogo');
  const genQR = document.getElementById('genQR');
  const downloadQR = document.getElementById('downloadQR');
  const qrPreview = document.getElementById('qrPreview');

  let lastQRCanvas = null;
  let logoDataUrl = null;

  qrLogoInput.addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    if(!f) { logoDataUrl = null; return; }
    const reader = new FileReader();
    reader.onload = e => { logoDataUrl = e.target.result; };
    reader.readAsDataURL(f);
  });

  async function generateQRWithLogo(text){
    // cria canvas para QR
    const size = 600;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext('2d');

    // gera QR em canvas (usando qrcode lib para gerar dataURL)
    const qrDataUrl = await QRCode.toDataURL(text, { width: size, margin: 1 });

    // desenha QR
    const img = await loadImage(qrDataUrl);
    ctx.drawImage(img, 0, 0, size, size);

    // se houver logo, desenha centralizado
    if(logoDataUrl){
      const logo = await loadImage(logoDataUrl);
      // tamanho do logo = 20% do QR
      const logoSize = Math.floor(size * 0.2);
      const x = (size - logoSize)/2;
      const y = (size - logoSize)/2;
      // opcional: desenhar círculo branco atrás para contraste
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const pad = 10;
      ctx.beginPath();
      roundRect(ctx, x - pad/2, y - pad/2, logoSize + pad, logoSize + pad, 12);
      ctx.fill();
      ctx.drawImage(logo, x, y, logoSize, logoSize);
    }
    return tempCanvas;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function loadImage(src){
    return new Promise((res, rej)=>{
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = ()=>res(i);
      i.onerror = e=>rej(e);
      i.src = src;
    });
  }

  genQR.addEventListener('click', async ()=>{
    const text = (qrText.value || '').trim();
    if(!text){ alert('Digite texto ou URL para gerar o QR'); return; }
    try{
      const canvas = await generateQRWithLogo(text);
      qrPreview.innerHTML = '';
      canvas.style.maxWidth = '320px';
      canvas.style.height = 'auto';
      qrPreview.appendChild(canvas);
      lastQRCanvas = canvas;
    }catch(e){
      console.error(e);
      alert('Erro ao gerar QR');
    }
  });

  downloadQR.addEventListener('click', ()=>{
    if(!lastQRCanvas){ alert('Gere o QR antes de baixar'); return; }
    const filename = (qrFileName.value && qrFileName.value.trim()) ? qrFileName.value.trim() + '.png' : 'qr_code.png';
    const link = document.createElement('a');
    link.href = lastQRCanvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  });

  // ----- Digitalizador + export PDF -----
  const startScan = document.getElementById('startScan');
  const stopScan = document.getElementById('stopScan');
  const scanVideo = document.getElementById('scanVideo');
  const captureBtn = document.getElementById('captureBtn');
  const capturesContainer = document.getElementById('captures');
  const exportPDF = document.getElementById('exportPDF');
  const clearCaptures = document.getElementById('clearCaptures');
  const pdfNameInput = document.getElementById('pdfName');

  let scanStream = null;
  startScan.addEventListener('click', async ()=>{
    if(scanStream){ stopTracks(scanStream); scanVideo.srcObject = null; scanStream = null; }
    try{
      scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      scanVideo.srcObject = scanStream;
      await scanVideo.play();
    }catch(e){
      alert('Erro ao acessar a câmera: ' + e.message);
    }
  });

  stopScan.addEventListener('click', ()=>{
    if(scanStream){ stopTracks(scanStream); scanVideo.srcObject = null; scanStream = null; }
  });

  function stopTracks(s){
    if(!s) return;
    s.getTracks().forEach(t=>t.stop());
  }

  captureBtn.addEventListener('click', async ()=>{
    if(!scanVideo || scanVideo.readyState < 2){ alert('Câmera não iniciada'); return; }
    const c = document.createElement('canvas');
    c.width = scanVideo.videoWidth;
    c.height = scanVideo.videoHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(scanVideo, 0, 0);
    const url = c.toDataURL('image/jpeg', 0.9);

    const thumb = document.createElement('img');
    thumb.src = url;
    thumb.style.width = '160px';
    thumb.style.borderRadius = '8px';
    const wrapper = document.createElement('div');
    wrapper.appendChild(thumb);
    // botão remover
    const rm = document.createElement('button');
    rm.textContent = 'Remover';
    rm.className = 'small';
    rm.addEventListener('click', ()=>{ wrapper.remove(); });
    wrapper.appendChild(rm);
    capturesContainer.appendChild(wrapper);
  });

  exportPDF.addEventListener('click', async ()=>{
    const name = (pdfNameInput.value && pdfNameInput.value.trim()) ? pdfNameInput.value.trim() : 'scan_document';
    const imgs = Array.from(capturesContainer.querySelectorAll('img'));
    if(imgs.length === 0){ alert('Nenhuma captura para exportar'); return; }

    // criar PDF com jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [imgs[0].naturalWidth, imgs[0].naturalHeight]
    });

    for(let i=0;i<imgs.length;i++){
      // por segurança, usar html2canvas para garantir tamanho
      const imgEl = imgs[i];
      // converte data URL (já JPEG) para imágem no PDF
      const w = imgEl.naturalWidth;
      const h = imgEl.naturalHeight;
      if(i > 0) pdf.addPage([w,h]);
      pdf.addImage(imgEl.src, 'JPEG', 0, 0, w, h);
    }
    pdf.save(name + '.pdf');
  });

  clearCaptures.addEventListener('click', ()=>{ if(confirm('Limpar todas as capturas?')) capturesContainer.innerHTML = ''; });


  // =========================
  // SISTEMAS: Proteção por senha + Scanner existente
  // =========================
  const unlockBtn = document.getElementById('unlockSistema');
  const cancelUnlock = document.getElementById('cancelUnlock');
  const sistemaPass = document.getElementById('sistemaPass');
  const sistemaContent = document.getElementById('sistemaContent');
  const sistemaLocked = document.getElementById('sistemaLocked');

  const MASTER_PASS = 'TIESQUADROMIL'; // senha conforme solicitado

  unlockBtn.addEventListener('click', ()=>{
    const val = (sistemaPass.value || '').trim();
    if(val === MASTER_PASS){
      sistemaLocked.classList.add('hidden');
      sistemaContent.classList.remove('hidden');
      sessionStorage.setItem('sistemas_unlocked','1');
      // inicializar scanner (reutiliza o bloco do seu scanner original)
      initOriginalScanner();
    }else{
      alert('Senha incorreta');
    }
  });
  cancelUnlock.addEventListener('click', ()=>{
    voltarMenu();
  });

  // se já desbloqueado na sessão, mostrar direto
  if(sessionStorage.getItem('sistemas_unlocked') === '1'){
    sistemaLocked.classList.add('hidden');
    sistemaContent.classList.remove('hidden');
    initOriginalScanner();
  }

  // =========================
  // LINKS & ARQUIVOS (simples manager localStorage)
  // =========================
  const addLinkBtn = document.getElementById('addLink');
  const linkTitle = document.getElementById('linkTitle');
  const linkUrl = document.getElementById('linkUrl');
  const linksList = document.getElementById('linksList');
  const clearAllLinks = document.getElementById('clearAllLinks');

  function loadLinks(){
    linksList.innerHTML = '';
    const arr = JSON.parse(localStorage.getItem('esquad_links') || '[]');
    arr.forEach((l, i) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = l.url;
      a.target = '_blank';
      a.textContent = l.title || l.url;
      li.appendChild(a);
      const rm = document.createElement('button');
      rm.textContent = 'Remover';
      rm.className = 'small';
      rm.addEventListener('click', ()=>{
        arr.splice(i,1);
        localStorage.setItem('esquad_links', JSON.stringify(arr));
        loadLinks();
      });
      li.appendChild(rm);
      linksList.appendChild(li);
    });
  }
  addLinkBtn.addEventListener('click', ()=>{
    const title = (linkTitle.value || '').trim();
    const url = (linkUrl.value || '').trim();
    if(!url) { alert('Informe a URL ou caminho'); return; }
    const arr = JSON.parse(localStorage.getItem('esquad_links') || '[]');
    arr.push({ title, url });
    localStorage.setItem('esquad_links', JSON.stringify(arr));
    linkTitle.value = ''; linkUrl.value = '';
    loadLinks();
  });
  clearAllLinks.addEventListener('click', ()=>{
    if(confirm('Remover todos os links?')){ localStorage.removeItem('esquad_links'); loadLinks(); }
  });
  loadLinks();

  // =========================
  // INICIALIZAÇÃO DO SCANNER ORIGINAL (mantendo seu código)
  // =========================
  function initOriginalScanner(){
    // evita múltiplas inicializações
    if(window.__esquad_scanner_init) return;
    window.__esquad_scanner_init = true;

    // seletores do scanner (mantidos)
    const video = document.getElementById('video');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const historyEl = document.getElementById('history');

    let codeReader = new ZXing.BrowserQRCodeReader();
    let stream;

    // Histórico
    let scannedCodes = JSON.parse(localStorage.getItem('scannedCodes') || '[]');
    updateHistory();

    function feedback() {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
      gainNode.gain.setValueAtTime(1, ctx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.3);
      if ("vibrate" in navigator) {
        navigator.vibrate(1000);
      }
    }

    function updateHistory(){
      historyEl.innerHTML = '';
      scannedCodes.forEach(code => {
          const li = document.createElement('li');
          li.innerHTML = `<span>${code}</span>`;
          historyEl.appendChild(li);
      });
      localStorage.setItem('scannedCodes', JSON.stringify(scannedCodes));
    }

    startBtn.addEventListener('click', async () => {
      if(stream){
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
      }

      const constraints = { video: { facingMode: { exact: "environment" } } };

      try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch(e) {
          alert('Câmera traseira não encontrada neste dispositivo.');
          return;
      }

      video.srcObject = stream;
      video.play();

      codeReader.decodeFromVideoDevice(null, video, (result, err) => {
          if(result && !scannedCodes.includes(result.text)){
              scannedCodes.push(result.text);
              updateHistory();
              feedback();
          }
      });
    });

    stopBtn.addEventListener('click', () => {
      if(stream){
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
      }
    });

    exportBtn.addEventListener('click', () => {
      if(scannedCodes.length === 0){ alert('Nenhum QR Code escaneado!'); return; }

      const ws_data = [['QR Code']];
      scannedCodes.forEach(code => ws_data.push([code]));
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Scans');
      XLSX.writeFile(wb, 'scanned_codes.xlsx');
    });

    clearBtn.addEventListener('click', () => {
      if(confirm('Deseja realmente limpar todo o histórico?')){
          scannedCodes = [];
          updateHistory();
      }
    });
  }

});
