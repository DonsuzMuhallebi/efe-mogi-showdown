/* audio */
const Sound=(()=>{let ctx=null,sfx=0.7,mus=0.45,mt=null,step=0,track='menu';
  function ac(){if(!ctx){try{ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}return ctx;}
  function resume(){const c=ac();if(c&&c.state==='suspended')c.resume();}
  function tone(f,d,type,vol,when){if(sfx<=0||!f)return;const c=ac();if(!c)return;const t0=c.currentTime+(when||0);const o=c.createOscillator(),g=c.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t0);g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime((vol||0.05)*sfx*1.3,t0+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t0+(d||0.12));o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+(d||0.12)+0.02);}
  const TRACKS={menu:{l:[440,0,523,0,587,0,523,0,494,0,440,0,392,0,440,0],b:[220,0,0,0,196,0,0,0,165,0,0,0,196,0,0,0],t:'triangle',bt:'sine',tempo:220},
    calm:{l:[523,0,659,0,587,0,494,0,523,0,440,0,494,0,0,0],b:[262,0,0,0,196,0,0,0,220,0,0,0,247,0,0,0],t:'sine',bt:'sine',tempo:230},
    bouncy:{l:[659,784,659,523,587,784,587,440,523,659,523,392,440,523,659,0],b:[131,0,131,0,98,0,98,0,110,0,110,0,123,0,123,0],t:'square',bt:'triangle',tempo:155},
    tense:{l:[330,330,392,330,440,392,330,0,294,294,349,294,392,349,294,0],b:[110,110,0,110,87,87,0,87,98,98,0,98,73,73,0,73],t:'sawtooth',bt:'square',tempo:150},
    snowy:{l:[784,988,1175,988,880,1047,880,0,784,932,1175,932,880,784,659,0],b:[196,0,247,0,220,0,165,0,196,0,247,0,220,0,196,0],t:'triangle',bt:'sine',tempo:200}};
  function tn(f,d,ty,v){const c=ac();const t0=c.currentTime;const o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(v*mus,t0+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+d);o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+d+0.05);}
  function mloop(){const c=ac();if(!c||mus<=0)return;const T=TRACKS[track]||TRACKS.menu;const i=step%16;if(T.l[i])tn(T.l[i],0.2,T.t,0.05);if(T.b[i])tn(T.b[i],0.32,T.bt,0.06);step++;}
  function restart(){clearInterval(mt);mt=null;if(mus>0){const T=TRACKS[track]||TRACKS.menu;mt=setInterval(mloop,T.tempo);}}
  function cheer(){if(sfx<=0)return;const c=ac();if(!c)return;const dur=0.9,t0=c.currentTime;const buf=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,1.5);
    const src=c.createBufferSource();src.buffer=buf;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(700,t0);bp.frequency.exponentialRampToValueAtTime(2200,t0+0.5);bp.Q.value=0.8;const g=c.createGain();g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(0.18*sfx,t0+0.1);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);src.connect(bp);bp.connect(g);g.connect(c.destination);src.start(t0);[523,659,784,1047].forEach((f,i)=>tone(f,0.18,'square',0.05,i*0.09));}
  return {resume,setTrack(name){if(track===name)return;track=name;restart();},setSfx(v){sfx=v;},setMus(v){mus=v;restart();},
    good(){tone(660,0.1,'square',0.05);tone(990,0.12,'square',0.05,0.06);},pick(){tone(740,0.07,'triangle',0.05);tone(1100,0.06,'triangle',0.04,0.04);},
    bad(){tone(180,0.18,'sawtooth',0.06);tone(120,0.2,'sawtooth',0.05,0.05);},hit(){tone(130,0.16,'square',0.07);tone(90,0.18,'sawtooth',0.05,0.03);},
    tick(){tone(520,0.05,'square',0.04);},go(){tone(880,0.18,'square',0.06);tone(1320,0.16,'square',0.04,0.05);},boom(){tone(80,0.4,'sawtooth',0.09);[110,140,170].forEach(f=>tone(f,0.3,'square',0.04));},
    place(){tone(560,0.08,'triangle',0.05);},pad(n){tone([392,494,587,698][n%4],0.18,'sine',0.06);},whoosh(){tone(360,0.12,'sine',0.05);tone(220,0.14,'sine',0.04,0.03);},
    pull(){tone(300+Math.random()*120,0.06,'square',0.04);},dash(){tone(700,0.1,'sawtooth',0.05);tone(1100,0.08,'sine',0.04,0.03);},
    win(){[523,659,784,1046,1318].forEach((f,i)=>tone(f,0.16,'square',0.055,i*0.1));},lose(){[440,392,330,247].forEach((f,i)=>tone(f,0.2,'sawtooth',0.05,i*0.13));},
    love(){[659,784,988,1318].forEach((f,i)=>tone(f,0.18,'triangle',0.05,i*0.08));},cheer};
})();

export { Sound };
