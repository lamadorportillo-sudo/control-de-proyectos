(()=>{
  'use strict';

  const R=window.RM,$=R.$;
  let rec=null,stream=null,chunks=[],tick=null,speech=null,speechOn=false;
  let startedAt=0,pausedAt=0,pausedMs=0;

  const db=()=>new Promise((ok,no)=>{
    const q=indexedDB.open('reuniones_audio_v2',1);
    q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('audio'))q.result.createObjectStore('audio')};
    q.onsuccess=()=>ok(q.result);
    q.onerror=()=>no(q.error);
  });

  R.putAudio=async(id,b)=>{
    const d=await db();
    return new Promise((ok,no)=>{
      const t=d.transaction('audio','readwrite');
      t.objectStore('audio').put(b,id);
      t.oncomplete=()=>{d.close();ok()};
      t.onerror=()=>no(t.error);
    });
  };

  R.getAudio=async id=>{
    const d=await db();
    return new Promise((ok,no)=>{
      const q=d.transaction('audio').objectStore('audio').get(id);
      q.onsuccess=()=>{d.close();ok(q.result||null)};
      q.onerror=()=>no(q.error);
    });
  };

  R.delAudio=async id=>{
    const d=await db();
    return new Promise(ok=>{
      const t=d.transaction('audio','readwrite');
      t.objectStore('audio').delete(id);
      t.oncomplete=()=>{d.close();ok()};
    });
  };

  const nativeKeeper={
    available:()=>typeof window.AndroidRecorder!=='undefined',
    start:()=>{try{window.AndroidRecorder?.startKeepAlive()}catch{}},
    stop:()=>{try{window.AndroidRecorder?.stopKeepAlive()}catch{}},
    running:()=>{try{return !!window.AndroidRecorder?.isKeepAliveRunning()}catch{return false}}
  };

  const env=()=>{
    const n=$('#secureNotice');
    if(!isSecureContext){
      n.className='notice bad';
      n.innerHTML='<b>🎙️ Micrófono bloqueado.</b> Abre la versión HTTPS oficial.';
    }else if(!navigator.mediaDevices?.getUserMedia||!MediaRecorder){
      n.className='notice bad';
      n.textContent='Navegador no compatible con grabación.';
    }else{
      n.className='notice good';
      n.innerHTML=nativeKeeper.available()?'<b>✓ Micrófono disponible.</b> En la APK la grabación continúa al minimizar o bloquear el teléfono.':'<b>✓ Micrófono disponible.</b>';
    }
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    $('#speechNotice').innerHTML=SR?'<b>🗣️ Transcripción en vivo disponible.</b> Es opcional; el audio completo se transcribirá con IA al finalizar.':'<b>Transcripción en vivo no disponible.</b> No afecta el análisis: el audio completo se procesa al finalizar.';
  };

  const elapsedSeconds=()=>{
    if(!startedAt)return R.secs||0;
    const end=pausedAt||Date.now();
    return Math.max(0,Math.floor((end-startedAt-pausedMs)/1000));
  };

  const timer=()=>{
    if(rec&&rec.state!=='inactive')R.secs=elapsedSeconds();
    const s=R.secs,h=String(Math.floor(s/3600)).padStart(2,'0'),m=String(Math.floor((s%3600)/60)).padStart(2,'0');
    $('#timer').textContent=`${h}:${m}:${String(s%60).padStart(2,'0')}`;
  };

  const startTick=()=>{
    clearInterval(tick);
    tick=setInterval(timer,500);
  };

  const setRecordingUi=()=>{
    $('#micBtn').classList.add('live');
    $('#recStatus').textContent='Grabando… puedes salir de esta pantalla. Solo “Finalizar y analizar” detiene la grabación.';
    $('#pauseBtn').disabled=false;
    $('#stopBtn').disabled=false;
  };

  async function start(){
    if(rec&&rec.state!=='inactive'){
      setRecordingUi();
      return;
    }
    if(!isSecureContext)return alert('Usa el enlace HTTPS oficial.');

    if($('#autoProcessStatus'))$('#autoProcessStatus').classList.add('hidden');

    try{
      stream=await navigator.mediaDevices.getUserMedia({
        audio:{
          channelCount:1,
          echoCancellation:true,
          noiseSuppression:true,
          autoGainControl:true
        }
      });

      nativeKeeper.start();
      if(nativeKeeper.available())await new Promise(ok=>setTimeout(ok,100));

      const mt=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t))||'';
      const o={audioBitsPerSecond:32000};
      if(mt)o.mimeType=mt;

      rec=new MediaRecorder(stream,o);
      chunks=[];
      rec.ondataavailable=e=>e.data?.size&&chunks.push(e.data);
      rec.onstop=()=>{
        R.secs=elapsedSeconds();
        timer();
        R.audioBlob=new Blob(chunks,{type:rec.mimeType||mt||'audio/webm'});
        $('#preview').src=URL.createObjectURL(R.audioBlob);
        $('#audioInfo').textContent=`${R.audioBlob.type} · ${(R.audioBlob.size/1024).toFixed(1)} KB · voz optimizada ~32 kbps`;
        $('#audioBox').classList.remove('hidden');
        stream?.getTracks().forEach(t=>t.stop());
        stream=null;
        nativeKeeper.stop();
        $('#recStatus').textContent='Grabación lista. Analizando…';
        setTimeout(()=>R.quickSaveAndProcess?.(),80);
      };

      rec.onerror=()=>nativeKeeper.stop();
      rec.start(1000);
      R.secs=0;
      startedAt=Date.now();
      pausedAt=0;
      pausedMs=0;
      timer();
      startTick();
      setRecordingUi();
    }catch(e){
      nativeKeeper.stop();
      stream?.getTracks().forEach(t=>t.stop());
      stream=null;
      alert(e.name==='NotAllowedError'?'Permite el micrófono en la configuración de la aplicación.':'No se pudo abrir el micrófono.');
    }
  }

  function stop(){
    if(!rec||rec.state==='inactive')return;
    if(rec.state==='paused'&&pausedAt){
      pausedMs+=Date.now()-pausedAt;
      pausedAt=0;
    }
    R.secs=elapsedSeconds();
    if(rec.state!=='inactive')rec.stop();
    clearInterval(tick);
    tick=null;
    $('#micBtn').classList.remove('live');
    $('#recStatus').textContent='Finalizando grabación…';
    $('#pauseBtn').disabled=true;
    $('#stopBtn').disabled=true;
    $('#pauseBtn').textContent='⏸ Pausar';
    if(speechOn)toggleSpeech();
  }

  $('#micBtn').onclick=()=>{
    if(rec&&rec.state!=='inactive'){
      setRecordingUi();
      timer();
      return;
    }
    start();
  };

  $('#stopBtn').onclick=stop;

  $('#pauseBtn').onclick=()=>{
    if(!rec)return;
    if(rec.state==='recording'){
      rec.pause();
      pausedAt=Date.now();
      R.secs=elapsedSeconds();
      clearInterval(tick);
      tick=null;
      timer();
      $('#pauseBtn').textContent='▶ Reanudar';
      $('#recStatus').textContent='Pausada. La sesión sigue activa hasta que pulses Finalizar.';
    }else if(rec.state==='paused'){
      if(pausedAt){
        pausedMs+=Date.now()-pausedAt;
        pausedAt=0;
      }
      rec.resume();
      startTick();
      $('#pauseBtn').textContent='⏸ Pausar';
      $('#recStatus').textContent='Grabando… puedes salir de esta pantalla. Solo “Finalizar y analizar” detiene la grabación.';
    }
  };

  R.refreshRecordingUi=()=>{
    timer();
    if(rec&&rec.state!=='inactive'){
      setRecordingUi();
      if(rec.state==='paused'){
        $('#pauseBtn').textContent='▶ Reanudar';
        $('#recStatus').textContent='Pausada. La sesión sigue activa hasta que pulses Finalizar.';
      }
    }
  };

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)R.refreshRecordingUi();
  });

  function toggleSpeech(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return env();
    if(speechOn){
      speechOn=false;
      speech?.stop();
      $('#liveTranscriptBtn').textContent='🗣️ Transcripción en vivo';
      return;
    }
    if(!speech){
      speech=new SR();
      speech.lang='es-HN';
      speech.continuous=true;
      speech.interimResults=true;
      speech.onresult=e=>{
        let f='',i='';
        for(let n=e.resultIndex;n<e.results.length;n++){
          const t=e.results[n][0].transcript;
          e.results[n].isFinal?f+=t+' ':i+=t;
        }
        if(f){
          const a=$('#meetingTranscript');
          a.value=(a.value.trim()?a.value.trim()+' ':'')+f.trim();
        }
        $('#liveTranscriptBtn').textContent=i?`🗣️ ${i.slice(0,24)}…`:'🗣️ Transcribiendo…';
      };
      speech.onend=()=>{if(speechOn)try{speech.start()}catch{}};
    }
    speechOn=true;
    $('#liveTranscriptBtn').textContent='⏹ Detener transcripción';
    try{speech.start()}catch{}
  }

  $('#liveTranscriptBtn').onclick=toggleSpeech;
  env();
})();
