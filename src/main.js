import './styles.css';
import { STR } from './i18n.js';
import { Sound } from './audio.js';
import { rr, el, CHARBUF, drawEfe, drawMogi, buildChars, blitChar, avatarTo } from './characters.js';

"use strict";
const $=id=>document.getElementById(id);const clamp=(v,a,b)=>v<a?a:v>b?b:v;const lerp=(a,b,t)=>a+(b-a)*t;const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}const other=c=>c==='efe'?'mogi':'efe';
function LS(k,v){try{if(v===undefined)return localStorage.getItem('em_'+k);localStorage.setItem('em_'+k,v);}catch(e){return null;}}

/* themes */
const THEMES={
  wood:{'--bg1':'#4a3622','--bg2':'#2a1d10','--cream':'#f1e3c6','--card':'#5a4530','--ink':'#f6ead0','--ink2':'#d3bf96','--peach':'#d6a05a','--peach2':'#bd8440','--mint':'#7fb89a','--mint2':'#5f9a7c','--rose':'#e09aa2','--rose2':'#c47079','--gold':'#f0bd55','--gold2':'#cf962f','--sky':'#7fb4d0','--line':'#6a5236','--line2':'#33271a','--inset':'#33271a','--planks':'repeating-linear-gradient(0deg,rgba(255,238,200,.06) 0 2px,transparent 2px 74px),repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 2px,transparent 2px 120px)'},
  pastel:{'--bg1':'#ffe9d0','--bg2':'#ffd6b8','--cream':'#fffaf1','--card':'#fffdf9','--ink':'#5a4632','--ink2':'#9a7a58','--peach':'#ff9e72','--peach2':'#ffc39a','--mint':'#6fd0b0','--mint2':'#9ee3cf','--rose':'#ef8aa6','--rose2':'#f7b8c7','--gold':'#ffc24a','--gold2':'#f3a030','--sky':'#8fcdec','--line':'#f0d2ad','--line2':'#e3bd8e','--inset':'#fff3e2','--planks':'radial-gradient(120% 80% at 25% 10%,rgba(255,150,110,.22),transparent 55%),radial-gradient(120% 80% at 90% 100%,rgba(120,210,180,.18),transparent 55%)'},
  night:{'--bg1':'#2e2e4e','--bg2':'#16162a','--cream':'#e8e8f5','--card':'#36365a','--ink':'#ececff','--ink2':'#b6b6da','--peach':'#8fa8ff','--peach2':'#6a86e0','--mint':'#62d0c0','--mint2':'#3fa090','--rose':'#ff8fb4','--rose2':'#e06a92','--gold':'#ffd35c','--gold2':'#e0a838','--sky':'#7fb4f0','--line':'#50507a','--line2':'#28283e','--inset':'#1e1e38','--planks':'radial-gradient(100% 60% at 50% 0%,rgba(140,160,255,.12),transparent 60%)'}
};
function applyTheme(name){App.theme=name;const th=THEMES[name]||THEMES.wood;for(const k in th)document.documentElement.style.setProperty(k,th[k]);
  document.querySelectorAll('#themeRow .pillBtn').forEach(b=>b.classList.toggle('on',b.dataset.theme===name));LS('theme',name);if(CHARBUF.efe)titleArt();}

function t(k,vars){let s=(STR[k]&&STR[k][App.lang])||(STR[k]&&STR[k].en)||k;if(vars)for(const v in vars)s=s.replace('{'+v+'}',vars[v]);return s;}
function up(s){return (s||'').toLocaleUpperCase(App.lang==='tr'?'tr-TR':App.lang);}
function applyLang(){document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.getAttribute('data-i18n');if(STR[k])e.textContent=t(k);});
  document.querySelectorAll('.langBtn').forEach(b=>b.classList.toggle('on',b.dataset.lang===App.lang));LS('lang',App.lang);document.documentElement.lang=App.lang;
  document.querySelectorAll('[data-i18n-title]').forEach(e=>{const k=e.getAttribute('data-i18n-title');if(STR[k])e.title=t(k);});
  const s=App.screen;if(s==='screen-lobby')refreshLobby();else if(s==='screen-howto')enterHowto(Pending.game,Pending.index);else if(s==='screen-dare')showDare();else if(s==='screen-pick')renderPick();}

/* screens / responsive */
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));$(id).classList.add('on');App.screen=id;}
const STAGE=$('stage');
function fitStage(){setVDims();STAGE.style.width=vpW()+'px';STAGE.style.height=vpH()+'px';document.body.classList.toggle('land',landscape());fitCanvas();}
window.addEventListener('resize',fitStage);
let VW=480,VH=560;function vpW(){return Math.max(window.innerWidth||0,document.documentElement.clientWidth||0,320);}function vpH(){return Math.max(window.innerHeight||0,document.documentElement.clientHeight||0,400);}function landscape(){return vpW()/vpH()>1.25;}function setVDims(){if(landscape()){VW=960;VH=540;}else{VW=480;VH=560;}}
const cv=$('gcanvas'),ctx=cv.getContext('2d');let CS=1,COX=0,COY=0;
function fitCanvas(){const r=$('playArea').getBoundingClientRect();if(r.width<2||r.height<2)return;const dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cv.style.width=r.width+'px';cv.style.height=r.height+'px';const s=Math.min(cv.width/VW,cv.height/VH);CS=s;COX=(cv.width-VW*s)/2;COY=(cv.height-VH*s)/2;ctx.imageSmoothingEnabled=false;}
function applyVT(){ctx.setTransform(CS,0,0,CS,COX,COY);}
function clientToV(cx_,cy_){const r=cv.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);const x=(cx_-r.left)*dpr,y=(cy_-r.top)*dpr;return{x:(x-COX)/CS,y:(y-COY)/CS};}

/* app */
const MYPLAT=(matchMedia('(pointer:coarse)').matches||/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))?'📱':'💻';
const App={me:null,opp:null,isHost:false,connected:false,screen:'screen-title',lang:'en',theme:'wood',myPick:null,oppPick:null,oppSel:'mid',
  names:{efe:'Efe',mogi:'Mogi'},plats:{efe:MYPLAT,mogi:MYPLAT},score:{efe:0,mogi:0},roundIndex:0,order:[],
  pool:['quiz','kebab','ttt','durian','tnt','snow','tug','memory','simon'],winTarget:3,mode:'firstto',roundCount:5,guestReady:false,loser:null,dare:{deck:null,index:0,left:2},dareBoth:null};
const CN={efe:'Efe',mogi:'Mogi'},CF={efe:'🇹🇷',mogi:'🇮🇩'};
const ALLGAMES=['quiz','kebab','ttt','durian','tnt','snow','tug','memory','simon'];

/* networking */
const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'},{urls:'turn:openrelay.metered.ca:80',username:'openrelayproject',credential:'openrelayproject'},{urls:'turn:openrelay.metered.ca:443',username:'openrelayproject',credential:'openrelayproject'}]};
const Net={peer:null,conn:null,code:null,h:{},on(t,fn){this.h[t]=fn;},send(o){try{if(this.conn&&this.conn.open)this.conn.send(o);}catch(e){}},
  _rx(o){this.lastRx=performance.now();if(!o||!o.t)return;const f=this.h[o.t];if(f)f(o);},_wire(conn){this.conn=conn;conn.on('data',d=>this._rx(d));conn.on('open',()=>{App.connected=true;onConnected();});conn.on('close',()=>onLost());conn.on('error',()=>onLost());}};
let hbIv=null,wdIv=null;
function startHeartbeat(){Net.lastRx=performance.now();clearInterval(hbIv);clearInterval(wdIv);hbIv=setInterval(()=>Net.send({t:'ping'}),2000);wdIv=setInterval(()=>{if(App.connected&&performance.now()-(Net.lastRx||0)>6500)onLost();},2000);}
function stopHeartbeat(){clearInterval(hbIv);clearInterval(wdIv);hbIv=wdIv=null;}
function randCode(){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];return s;}
function hostCreate(att){att=att||0;if(att>6){tStat(t('errRoom'),'err');return;}const code=randCode();tStat(t('connecting'));const peer=new Peer('emsd5-'+code.toLowerCase(),{config:ICE,debug:0});Net.peer=peer;
  peer.on('open',()=>{Net.code=code;App.isHost=true;App.me='efe';App.opp='mogi';$('waitCode').textContent=code;show('screen-wait');});peer.on('connection',c=>Net._wire(c));
  peer.on('error',e=>{const x=''+(e&&e.type);if(x.indexOf('unavailable-id')>=0){try{peer.destroy();}catch(q){}hostCreate(att+1);}else if(x.indexOf('network')>=0)tStat(t('errBusy'),'err');});}
function guestJoin(code){code=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==4){tStat(t('errCodeLen'),'err');return;}tStat(t('connecting'));const peer=new Peer({config:ICE,debug:0});Net.peer=peer;
  peer.on('open',()=>{App.isHost=false;App.me='mogi';App.opp='efe';Net.code=code;const conn=peer.connect('emsd5-'+code.toLowerCase(),{reliable:true});Net._wire(conn);setTimeout(()=>{if(!App.connected)tStat(t('errNoAnswer'),'err');},9000);});
  peer.on('error',e=>{const x=''+(e&&e.type);if(x.indexOf('peer-unavailable')>=0)tStat(t('errNoRoom'),'err');else tStat(t('errConnect'),'err');});}
function tStat(m,k){$('titleStatus').textContent=m;$('titleStatus').className='status'+(k?' '+k:'');}
function onConnected(){$('joinModal').classList.remove('on');Net.send({t:'hello',char:App.me,name:App.names[App.me],plat:MYPLAT});startHeartbeat();enterPick();}
let DISC=false;
function onLost(){if(DISC)return;DISC=true;stopHeartbeat();App.connected=false;Round.over=true;Game.running=false;cleanupRound();show('screen-title');tStat(t('partnerLeft'),'err');App.myPick=App.oppPick=null;App.guestReady=false;Rematch.me=Rematch.opp=false;}
function cancelRoom(){stopHeartbeat();try{if(Net.conn)Net.conn.close();}catch(e){}try{if(Net.peer)Net.peer.destroy();}catch(e){}Net.conn=Net.peer=Net.code=null;App.connected=false;App.isHost=false;App.myPick=App.oppPick=null;App.guestReady=false;Rematch.me=Rematch.opp=false;show('screen-title');tStat('');}
window.addEventListener('beforeunload',()=>{try{if(Net.conn&&Net.conn.open)Net.conn.send({t:'bye'});}catch(e){}});
Net.on('bye',()=>onLost());
Net.on('ping',()=>{});
Net.on('hello',m=>{App.opp=m.char;App.names[m.char]=m.name||CN[m.char];App.plats[m.char]=m.plat||'💻';if(App.me===m.char)App.me=other(m.char);});
Net.on('pickMove',m=>{App.oppSel=m.sel;if(!App.myPick&&pickSel!=='mid'&&pickSel===m.sel&&!App.isHost){pickSel='mid';Net.send({t:'pickMove',sel:'mid'});}if(App.screen==='screen-pick')renderPick();});
Net.on('pickChar',m=>{App.oppPick=m.char;App.oppSel=m.char;App.names[m.char]=m.name||CN[m.char];
  if(!App.myPick&&pickSel===m.char){pickSel='mid';Net.send({t:'pickMove',sel:'mid'});}
  if(App.myPick===m.char&&!App.isHost){App.myPick=null;pickSel='mid';Net.send({t:'pickMove',sel:'mid'});}
  if(App.myPick&&App.oppPick&&App.myPick!==App.oppPick){App.me=App.myPick;App.opp=App.oppPick;if(App.screen==='screen-pick'){enterLobby();return;}else if(App.screen==='screen-lobby')refreshLobby();}
  if(App.screen==='screen-pick')renderPick();else if(App.screen==='screen-lobby')refreshLobby();});
Net.on('unpick',()=>{App.oppPick=null;if(App.screen==='screen-pick')renderPick();else if(App.screen==='screen-lobby')refreshLobby();});
Net.on('config',m=>{App.pool=m.pool;App.winTarget=m.winTarget;App.mode=m.mode||App.mode;App.roundCount=m.roundCount||App.roundCount;if(App.screen==='screen-lobby')refreshLobby();renderMatchModal();});
Net.on('dareBoth',m=>{App.loser='both';App.dareBoth={efe:m.efe,mogi:m.mogi};if(App.screen==='screen-dare')showDare();});
Net.on('dareBothUpd',m=>{if(App.dareBoth){App.dareBoth[m.char]={index:m.index,left:(m.left!=null?m.left:0)};if(App.screen==='screen-dare')showDare();}});
Net.on('lobbyReady',m=>{App.guestReady=m.r;refreshLobby();});
Net.on('howto',m=>enterHowto(m.game,m.index));
Net.on('ready',m=>{Ready.opp=m.r;updateReadyUI();hostCheckReady();});
Net.on('startRound',m=>beginCountdown(m.game,m.seed,m.index));
Net.on('state',m=>{Opp[m.char]={prog:m.prog,hearts:m.hearts};updateHUD();});
Net.on('pos',m=>{if(World.them){World.them.tx=m.x;World.them.ty=m.y;}});
Net.on('finish',m=>{if(App.isHost)Host.onFinish(m);});
Net.on('gm',m=>{if(Cur&&Cur.net)Cur.net(m);});
Net.on('roundResult',m=>onRoundResult(m));
Net.on('dare',m=>{App.loser=m.loser;App.dare={deck:m.deck,index:m.index,left:m.left};if(App.screen==='screen-dare')showDare();});
Net.on('redrawReq',()=>{if(App.isHost)doRedraw();});
Net.on('rematchReq',()=>{Rematch.opp=true;tryRematch();});
Net.on('emote',()=>receiveLove());

/* character pick (3-slot it-takes-two) */
let pickSel='mid';
function enterPick(){pickSel='mid';App.myPick=null;App.oppPick=null;App.oppSel='mid';show('screen-pick');
  const st=$('pickStage');st.innerHTML='';
  ['efe','mid','mogi'].forEach(k=>{const d=document.createElement('div');d.className='pslot'+(k==='mid'?' mid':'');d.id='slot_'+k;
    if(k==='mid'){d.innerHTML='<div class="midico">🤍</div><div class="pnm">—</div>';}
    else{const c=document.createElement('canvas');c.width=64;c.height=88;d.appendChild(c);avatarTo(c,k);const nm=document.createElement('div');nm.className='pnm';nm.textContent=CN[k];d.appendChild(nm);}
    d.onclick=()=>selectPick(k);const tr=document.createElement('div');tr.className='tokrow';tr.id='tok_'+k;d.appendChild(tr);st.appendChild(d);});
  renderPick();}
function renderPick(){if(App.screen!=='screen-pick')return;
  ['efe','mid','mogi'].forEach(k=>{const s=$('slot_'+k);if(!s)return;s.classList.toggle('sel',(App.myPick||pickSel)===k);s.classList.toggle('taken',App.oppPick===k||App.oppSel===k);const tr=$('tok_'+k);if(tr)tr.innerHTML='';});
  const myK=App.myPick||pickSel;const t1=$('tok_'+myK);if(t1)t1.innerHTML+='<span class="tok you">'+t('youCard')+(App.myPick?' ✔':'')+'</span>';
  const opK=App.oppPick||App.oppSel||'mid';const t2=$('tok_'+opK);if(t2)t2.innerHTML+='<span class="tok opp">'+App.names[App.opp]+(App.oppPick?' ✔':'')+'</span>';
  $('pLeft').classList.toggle('off',!!App.myPick);$('pRight').classList.toggle('off',!!App.myPick);
  const canConfirm=!App.myPick&&pickSel!=='mid'&&App.oppPick!==pickSel;$('btnPick').disabled=App.myPick?false:!canConfirm;$('btnPick').textContent=App.myPick?t('changePick'):t('confirm2');
  $('pickStatus').textContent=App.myPick?(App.oppPick?'':t('waiting')):'';}
function pOcc(k){return k!=='mid'&&(App.oppPick===k||App.oppSel===k);}
function selectPick(k){if(App.myPick)return;if(pOcc(k))return;pickSel=k;Sound.tick();Net.send({t:'pickMove',sel:k});renderPick();}
function stepPick(dir){if(App.myPick)return;const ord=['efe','mid','mogi'];let i=clamp(ord.indexOf(pickSel)+dir,0,2);let k=ord[i];if(pOcc(k))k='mid';selectPick(k);}
function confirmPick(){if(App.myPick){unconfirmPick();return;}if(pickSel==='mid'||App.oppPick===pickSel)return;App.myPick=pickSel;App.me=pickSel;App.opp=other(pickSel);Sound.good();Net.send({t:'pickChar',char:App.me,name:App.names[App.me]});
  if(App.oppPick&&App.oppPick!==App.myPick)enterLobby();else renderPick();}
function unconfirmPick(){if(App.screen!=='screen-pick'||!App.myPick)return;pickSel=App.myPick;App.myPick=null;App.me=null;App.opp=other(pickSel);Sound.tick();Net.send({t:'unpick'});Net.send({t:'pickMove',sel:pickSel});renderPick();}

/* lobby */
function enterLobby(){App.guestReady=false;Ready.me=Ready.opp=false;show('screen-lobby');refreshLobby();}
function refreshLobby(){const wrap=$('lobbyPlayers');wrap.innerHTML='';const hostChar=App.isHost?App.me:App.opp,guestChar=other(hostChar);
  [[hostChar,t('player1')],[guestChar,t('player2')]].forEach(([char,label],i)=>{const mine=char===App.me;const d=document.createElement('div');d.className='pcard'+(mine?' you':'');d.innerHTML='<div class="plabel">'+label+'</div>';
    const c=document.createElement('canvas');c.width=64;c.height=88;avatarTo(c,char);d.appendChild(c);
    const nm=document.createElement('div');nm.className='nm';nm.textContent=App.names[char];d.appendChild(nm);
    const info=document.createElement('div');info.className='info';info.textContent=CF[char]+' '+App.plats[char];d.appendChild(info);
    const rdy=document.createElement('div');rdy.className='rdy';if(mine)rdy.innerHTML='('+t('you')+')';else{const r=(char===guestChar)?App.guestReady:true;rdy.className='rdy'+(r?' on':'');rdy.textContent=r?t('readyShort'):t('notReady');}d.appendChild(rdy);
    wrap.appendChild(d);if(i===0){const v=document.createElement('div');v.className='midvs';v.textContent='VS';wrap.appendChild(v);}});
  $('btnMatchCfg').style.display='inline-block';$('btnMatchCfg').textContent=App.isHost?t('matchSettings'):t('matchView');
  $('btnStart').style.display=App.isHost?'inline-block':'none';$('btnStart').disabled=!(App.isHost&&App.guestReady);
  $('btnLobbyReady').style.display=(!App.isHost)?'inline-block':'none';
  if(!App.isHost){$('btnLobbyReady').textContent=App.guestReady?t('cancel'):t('ready');$('btnLobbyReady').className=App.guestReady?'ghost':'cool';$('lobbyStatus').textContent=App.guestReady?t('waitStart',{n:App.names[App.opp]}):t('tapReady',{n:App.names[App.opp]});}
  else $('lobbyStatus').textContent=App.guestReady?modeDesc():t('waitReady',{n:App.names[guestChar]});}
function sendCfg(){Net.send({t:'config',pool:App.pool,winTarget:App.winTarget,mode:App.mode,roundCount:App.roundCount});}
function modeDesc(){if(App.mode==='chamber')return t('chamberDesc');if(App.mode==='rounds')return t('roundsLab')+' '+App.roundCount;return t('firstTo',{n:App.winTarget});}
function mmTab(name){document.querySelectorAll('#matchModal .mTabBtn').forEach(b=>b.classList.toggle('on',b.dataset.mmtab===name));document.querySelectorAll('#matchModal .mTabPane').forEach(p=>p.classList.toggle('on',p.id==='mmPane-'+name));}
function renderMatchModal(){const ch=$('gameChips');ch.innerHTML='';ALLGAMES.forEach(g=>{const b=document.createElement('div');b.className='chip'+(App.pool.indexOf(g)>=0?' on':'');b.textContent=HOW[g].icon+' '+gname(g);
  b.onclick=()=>{if(!App.isHost)return;const i=App.pool.indexOf(g);if(i>=0){if(App.pool.length>1)App.pool.splice(i,1);}else App.pool.push(g);sendCfg();renderMatchModal();};ch.appendChild(b);});
  const mb=$('modeBtns');mb.innerHTML='';['firstto','rounds','chamber'].forEach(m=>{const b=document.createElement('div');b.className='rbtn'+(App.mode===m?' on':'');b.textContent=t('mode_'+m);b.onclick=()=>{if(!App.isHost)return;App.mode=m;sendCfg();renderMatchModal();};mb.appendChild(b);});
  const rb=$('roundBtns'),cl=$('countLab');
  if(App.mode==='chamber'){cl.textContent=t('chamberDesc');rb.style.display='none';}
  else{rb.style.display='flex';const isF=App.mode==='firstto';cl.textContent=isF?t('firstToWins'):t('roundsLab');const cur=isF?App.winTarget:App.roundCount;
    rb.innerHTML='';const dec=document.createElement('div');dec.className='rbtn';dec.textContent='◀';const val=document.createElement('div');val.style.cssText="font-family:'Baloo 2';font-weight:800;font-size:5.4cqmin;color:var(--gold);min-width:10cqmin;text-align:center;align-self:center";val.textContent=cur;const inc=document.createElement('div');inc.className='rbtn';inc.textContent='▶';
    const stp=d=>{if(!App.isHost)return;const v=clamp(cur+d,3,9);if(isF)App.winTarget=v;else App.roundCount=v;sendCfg();renderMatchModal();};dec.onclick=()=>stp(-1);inc.onclick=()=>stp(1);rb.appendChild(dec);rb.appendChild(val);rb.appendChild(inc);}
  $('mmNote').textContent=t('viewOnly');$('mmNote').style.display=App.isHost?'none':'block';}

/* tournament */
function buildOrder(){const pool=App.pool.length?App.pool.slice():ALLGAMES.slice();const maxG=App.mode==='chamber'?1:App.mode==='rounds'?App.roundCount:App.winTarget*2-1;const o=[];const rng=mulberry32((Math.random()*1e9)>>>0);
  while(o.length<maxG){const s=shuffle(pool.slice(),rng);for(const g of s){if(o.length<maxG&&o[o.length-1]!==g)o.push(g);}if(pool.length===1)break;}return o.length?o:['quiz'];}
function startTournament(){App.score={efe:0,mogi:0};App.roundIndex=0;App.order=buildOrder();sendHowto(App.order[0],0);}
function sendHowto(game,index){App.roundIndex=index;Net.send({t:'howto',game,index});enterHowto(game,index);}
function computeNext(){
  if(App.mode==='chamber')return{type:'champion',winner:App.score.efe>App.score.mogi?'efe':'mogi'};
  if(App.mode==='rounds'){const ni=App.roundIndex+1;if(ni>=App.roundCount){if(App.score.efe>App.score.mogi)return{type:'champion',winner:'efe'};if(App.score.mogi>App.score.efe)return{type:'champion',winner:'mogi'};return{type:'draw'};}return{type:'round',index:ni,game:App.order[ni]||App.pool[ni%App.pool.length]};}
  if(App.score.efe>=App.winTarget)return{type:'champion',winner:'efe'};if(App.score.mogi>=App.winTarget)return{type:'champion',winner:'mogi'};const ni=App.roundIndex+1;return{type:'round',index:ni,game:App.order[ni]||App.pool[ni%App.pool.length]};}

/* howto */
const Ready={me:false,opp:false};let Pending={game:'quiz',index:0};
const HOW={
  quiz:{icon:'❓',name:{en:'QUICK QUIZ',tr:'HIZLI QUIZ',id:'KUIS CEPAT'},music:'calm',lines:{en:['A question with 4 answers pops up.','<b>First to tap the correct one wins!</b>','Wrong tap = locked 2s 🧠'],tr:['4 cevaplı bir soru çıkar.','<b>Doğruya ilk basan kazanır!</b>','Yanlış = 2sn kilit 🧠'],id:['Pertanyaan 4 jawaban muncul.','<b>Pertama tekan yang benar menang!</b>','Salah = terkunci 2 detik 🧠']}},
  kebab:{icon:'🍳',name:{en:'KEBAB vs RENDANG',tr:'KEBAP vs RENDANG',id:'KEBAB vs RENDANG'},music:'bouncy',lines:{en:['Grab <b>only your glowing</b> ingredients.','Drop them in <b>your pot</b> 🍲.','First to all 6 wins.'],tr:['Sadece <b>parlayan kendi</b> malzemeni al.','<b>Kazanına</b> 🍲 bırak.','Altısını ilk toplayan kazanır.'],id:['Ambil <b>bahan bersinar milikmu</b>.','Taruh di <b>panci-mu</b> 🍲.','Pertama kumpulkan 6 menang.']}},
  ttt:{icon:'⭕',name:{en:'TIC-TAC-TOE',tr:'XOX',id:'TIC-TAC-TOE'},music:'calm',lines:{en:['Take turns. Efe = <b>✖</b>, Mogi = <b>⭕</b>.','<b>3 in a row wins.</b>'],tr:['Sırayla. Efe = <b>✖</b>, Mogi = <b>⭕</b>.','<b>Üç taşı yan yana dizen kazanır.</b>'],id:['Bergiliran. Efe = <b>✖</b>, Mogi = <b>⭕</b>.','<b>3 sebaris menang.</b>']}},
  durian:{icon:'☄️',name:{en:'FALLING CHAOS',tr:'GÖKTEN KAOS',id:'KEKACAUAN LANGIT'},music:'tense',lines:{en:['Stuff falls — <b>DODGE it!</b>','💖 = catch (+1 life). Most lives wins ✨'],tr:['Bir şeyler yağar — <b>KAÇ!</b>','💖 = yakala (+1 can). En çok can kazanır ✨'],id:['Benda jatuh — <b>HINDARI!</b>','💖 = tangkap (+1 nyawa). Terbanyak menang ✨']}},
  tnt:{icon:'💣',name:{en:'TNT TAG',tr:'TNT EBE',id:'TNT TAG'},music:'tense',lines:{en:['You hold a <b>bomb</b> (hidden timer).','<b>Touch partner to pass it.</b> Holder has a <b>💨 dash</b> (long cooldown).','Holding it when it blows = LOSE 💥'],tr:['Birinizde <b>gizli zamanlı bomba</b>.','<b>Dokunup devret.</b> Bombalıda <b>💨 dash</b> var (uzun bekleme).','Patlarken sendeyse KAYBEDERSİN 💥'],id:['Salah satu pegang <b>bom</b>.','<b>Sentuh untuk oper.</b> Pemegang punya <b>💨 dash</b>.','Pegang saat meledak = KALAH 💥']}},
  snow:{icon:'⛄',name:{en:'SNOWBALL FIGHT',tr:'KAR TOPU SAVAŞI',id:'PERANG SALJU'},music:'snowy',lines:{en:['Move with WASD, <b>aim with mouse / drag</b>.','Space or ⛄ throws where you aim ❄️.','<b>First one hit loses!</b>'],tr:['WASD ile gez, <b>fareyle / sürükleyerek nişan al</b>.','Space ya da ⛄ nişana atar ❄️.','<b>İlk vurulan kaybeder!</b>'],id:['Gerak WASD, <b>arahkan dgn mouse / seret</b>.','Space atau ⛄ melempar ❄️.','<b>Yang kena duluan kalah!</b>']}},
  tug:{icon:'🪢',name:{en:'TUG OF WAR',tr:'HALAT ÇEKME',id:'TARIK TAMBANG'},music:'bouncy',lines:{en:['<b>Mash Space</b> / tap 💪 fast!','Pull the rope to your side to win 😤'],tr:['<b>Space tuşuna hızlı bas</b> / 💪 butonu!','Halatı kendi tarafına çek, kazan 😤'],id:['<b>Pencet Space</b> / tombol 💪 cepat!','Tarik tali ke sisimu untuk menang 😤']}},
  memory:{icon:'🃏',name:{en:'MEMORY MATCH',tr:'HAFIZA EŞLEŞTİRME',id:'CARI PASANGAN'},music:'calm',lines:{en:['Take turns flipping 2 cards.','Match = keep going! No match = partner’s turn.','<b>Most pairs wins.</b>'],tr:['Sırayla 2 kart aç.','Eşleşme = devam! Eşleşmezse = partnerin sırası.','<b>En çok çift kazanır.</b>'],id:['Bergiliran buka 2 kartu.','Cocok = lanjut! Tidak = giliran pasangan.','<b>Pasangan terbanyak menang.</b>']}},
  simon:{icon:'🎶',name:{en:'SIMON SAYS',tr:'SIMON SAYS',id:'SIMON SAYS'},music:'bouncy',lines:{en:['Watch the colour sequence, then repeat it.','It grows & speeds up each round.','<b>First to slip up loses!</b>'],tr:['Renk dizisini izle, sonra tekrarla.','Her turda uzar ve hızlanır.','<b>İlk hata yapan kaybeder!</b>'],id:['Lihat urutan warna, lalu ulangi.','Bertambah & cepat tiap ronde.','<b>Yang salah duluan kalah!</b>']}}
};
function gname(g){return HOW[g].name[App.lang]||HOW[g].name.en;}
function enterHowto(game,index){App.roundIndex=index;Pending={game,index};Ready.me=Ready.opp=false;const h=HOW[game];show('screen-howto');Sound.setTrack('menu');
  $('howRound').textContent=t('roundN',{n:index+1})+' · '+modeDesc();$('howIcon').textContent=h.icon;$('howName').textContent=gname(game);$('howList').innerHTML=(h.lines[App.lang]||h.lines.en).map(l=>'• '+l).join('<br>');$('btnReady').disabled=false;$('btnReady').textContent=t('ready');updateReadyUI();}
function updateReadyUI(){const r=$('readyRow');r.innerHTML='';[[App.me,Ready.me],[App.opp,Ready.opp]].forEach(([c,ok])=>{const d=document.createElement('div');d.className='readyTag';d.innerHTML='<span style="font-size:3.6cqmin;font-weight:700">'+CF[c]+' '+App.names[c]+'</span><span class="dot'+(ok?' on':'')+'"></span>'+(ok?t('readyShort'):t('notReady'));r.appendChild(d);});}
function hostCheckReady(){if(App.isHost&&Ready.me&&Ready.opp){const seed=(Math.random()*1e9)>>>0;Net.send({t:'startRound',game:Pending.game,seed,index:Pending.index});beginCountdown(Pending.game,seed,Pending.index);}}

/* countdown */
let cdT=null;
function beginCountdown(game,seed,index){App.roundIndex=index;show('screen-cd');$('cdName').textContent=gname(game);let n=3;$('cdNum').textContent=n;Sound.tick();clearInterval(cdT);cdT=setInterval(()=>{n--;if(n<=0){clearInterval(cdT);$('cdNum').textContent='GO!';Sound.go();setTimeout(()=>startRound(game,seed,index),360);}else{$('cdNum').textContent=n;Sound.tick();}},760);}

/* engine */
const Game={running:false,last:0};const Round={game:null,seed:0,index:0,start:0,over:true,_done:false};
const Opp={efe:{prog:0,hearts:5},mogi:{prog:0,hearts:5}};const World={me:null,them:null};let Cur=null;
const Input={left:false,right:false,up:false,down:false,px:null,py:null,pdown:false,act:false,aimx:VW/2,aimy:VH/2};
let stateIv=null,posIv=null,LastResult=null;
function startRound(game,seed,index){Round.game=game;Round.seed=seed>>>0;Round.index=index;Round.start=performance.now();Round.over=false;Round._done=false;
  Game.running=true;Opp.efe={prog:0,hearts:5};Opp.mogi={prog:0,hearts:5};Input.left=Input.right=Input.up=Input.down=Input.pdown=Input.act=false;Input.px=Input.py=null;
  World.me=null;World.them=null;Host.reset();FX.parts=[];FX.shake=0;Sound.setTrack(HOW[game].music);
  show('screen-game');$('scoreMid').textContent=App.score.efe+'–'+App.score.mogi;avatarTo($('avL'),'efe');avatarTo($('avR'),'mogi');$('nmL').textContent=CF.efe+' '+App.names.efe;$('nmR').textContent=App.names.mogi+' '+CF.mogi;
  const G=GAMES[game];$('gdom').style.display=G.dom?'flex':'none';cv.style.display=G.dom?'none':'block';$('gdom').innerHTML='';$('recipeHud').style.display='none';$('actBtn').style.display=(G.actBtn&&MYPLAT==='📱')?'flex':'none';$('actBtn').disabled=false;if(G.actBtn)$('actBtn').textContent=G.actBtn;
  setVDims();fitCanvas();Cur=G;Cur.init(mulberry32(Round.seed),seed);updateHUD();clearInterval(stateIv);stateIv=setInterval(sendState,120);if(G.world){clearInterval(posIv);posIv=setInterval(sendPos,45);}requestAnimationFrame(loop);}
function cleanupRound(){clearInterval(stateIv);clearInterval(posIv);stateIv=posIv=null;}
function endRoundLocal(){Game.running=false;Round.over=true;cleanupRound();}
function selfState(){return(Cur&&Cur.selfState)?Cur.selfState():{prog:0,hearts:5};}
function sendState(){if(!Game.running)return;const s=selfState();Net.send({t:'state',char:App.me,prog:s.prog,hearts:s.hearts});}
function sendPos(){if(!Game.running||!World.me)return;Net.send({t:'pos',char:App.me,x:Math.round(World.me.x),y:Math.round(World.me.y)});}
function loop(now){if(!Game.running)return;let dt=(now-Game.last)/1000;if(dt>0.05)dt=0.05;if(dt<0)dt=0;Game.last=now;if(Cur)Cur.update(dt);if(!GAMES[Round.game].dom)render();if(App.isHost&&!Round.over&&Cur.hostTick)Cur.hostTick();updateHUD();FX.step(dt);requestAnimationFrame(loop);}
function render(){applyVT();ctx.clearRect(-COX/CS-2,-COY/CS-2,cv.width/CS+4,cv.height/CS+4);const sx=FX.shake>0?(Math.random()*FX.shake-FX.shake/2):0,sy=FX.shake>0?(Math.random()*FX.shake-FX.shake/2):0;ctx.save();ctx.translate(sx,sy);if(Cur&&Cur.render)Cur.render();FX.render(ctx);ctx.restore();}
function updateHUD(){const me=selfState(),st={};st[App.me]=me;st[App.opp]=Opp[App.opp];renderMeter('mL','efe',st.efe||{prog:0,hearts:5});renderMeter('mR','mogi',st.mogi||{prog:0,hearts:5});}
function renderMeter(id,char,s){const el2=$(id),g=Round.game;if(g==='durian'){let h='';for(let i=0;i<5;i++)h+='<span class="pip h">'+(i<(s.hearts||0)?'❤️':'🤍')+'</span>';el2.innerHTML=h;}else if(g==='kebab'){let h='';for(let i=0;i<6;i++)h+='<span class="pip'+(i<(s.prog||0)?' on':'')+'"></span>';el2.innerHTML=h;}else el2.innerHTML='';}
const FX={parts:[],shake:0,burst(x,y,n,col,spd){for(let i=0;i<n;i++){const a=Math.random()*7,s=(spd||60)*(0.4+Math.random());this.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,life:0.6+Math.random()*0.5,t:0,col:col||'#ffd34e',r:1.5+Math.random()*2.4});}},
  ring(x,y,col){this.parts.push({ring:true,x,y,t:0,life:0.5,col:col||'#fff',r:6});},step(dt){this.shake=Math.max(0,this.shake-dt*40);for(let i=this.parts.length-1;i>=0;i--){const p=this.parts[i];p.t+=dt;if(p.t>=p.life){this.parts.splice(i,1);continue;}if(!p.ring){p.vy+=180*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}}},
  render(c){for(const p of this.parts){const k=1-p.t/p.life;if(p.ring){c.strokeStyle=p.col;c.globalAlpha=k;c.lineWidth=2.4;c.beginPath();c.arc(p.x,p.y,p.r+(1-k)*26,0,7);c.stroke();c.globalAlpha=1;}else{c.fillStyle=p.col;c.globalAlpha=Math.min(1,k*1.6);c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill();c.globalAlpha=1;}}}};
function caption(s){const c=$('caption');c.textContent=s;c.classList.remove('show');void c.offsetWidth;c.classList.add('show');}
function spawnHearts(n){const fx=$('fx');for(let i=0;i<n;i++){const e=document.createElement('div');e.className='fh';e.textContent=pick(['❤️','💖','💕','✨','💞','🌟']);e.style.left=(15+Math.random()*70)+'%';e.style.top=(60+Math.random()*25)+'%';const dx=Math.random()*40-20,dur=1.1+Math.random()*0.8;e.animate([{transform:'translate(0,0) scale(.6)',opacity:0},{opacity:1,offset:.2},{transform:'translate('+dx+'px,-'+(120+Math.random()*80)+'px) scale(1.3)',opacity:0}],{duration:dur*1000,easing:'ease-out'});fx.appendChild(e);setTimeout(()=>e.remove(),dur*1000+60);}}
function sendLove(){if(!App.connected)return;Net.send({t:'emote'});spawnHearts(6);Sound.love();}
function receiveLove(){spawnHearts(10);Sound.love();const b=$('emoteBanner');b.textContent=t('loveFrom',{n:App.names[App.opp]});b.classList.remove('show');void b.offsetWidth;b.classList.add('show');}
const Host={my:null,opp:null,reset(){this.my=null;this.opp=null;},onFinish(m){this.opp=m;if(Round.game==='kebab'&&!Round.over)resolveRound(App.opp);},setMy(o){this.my=o;if(Round.game==='kebab'&&!Round.over)resolveRound(App.me);}};
function resolveRound(winner){if(!App.isHost||Round._done)return;Round._done=true;endRoundLocal();App.score[winner]++;const next=computeNext();Net.send({t:'roundResult',winner,scoreEfe:App.score.efe,scoreMogi:App.score.mogi,next});enterResult(winner,next);}
function onRoundResult(m){App.score={efe:m.scoreEfe,mogi:m.scoreMogi};endRoundLocal();Round._done=true;enterResult(m.winner,m.next);}
const TEASE={en:['So close!','Rematch energy 😤','Robbed 😅','Comeback time.','Not today!'],tr:['Az kaldı!','İntikam vakti 😤','Yandın 😅','Geri dönüş!','Bugün olmaz!'],id:['Hampir!','Waktunya balas 😤','Apes 😅','Saatnya bangkit.','Belum hari ini!']};
const CAP_JUNK={en:['Yuck!','Ew!','Not food!'],tr:['İyy!','Öff!','Yiyecek değil!'],id:['Hiii!','Iyuh!','Bukan makanan!']};
const CAP_HIT={en:['BONK! 💥','Splat!','Oof!','💀'],tr:['BONK! 💥','Pat!','Of!','💀'],id:['BONK! 💥','Pletak!','Aduh!','💀']};
function enterResult(winner,next){Round.over=true;Game.running=false;cleanupRound();LastResult={w:winner,next};show('screen-result');Sound.setTrack('menu');avatarTo($('resWinCv'),winner);$('resWin').innerHTML=CF[winner]+' '+up(App.names[winner])+' '+t('wins');$('resWin').style.color=(winner===App.me)?'var(--gold)':'var(--rose)';$('resTease').textContent=(winner===App.me)?t('yoursWin'):pick(TEASE[App.lang]||TEASE.en);$('resScore').textContent=App.score.efe+' – '+App.score.mogi;(winner===App.me)?Sound.win():Sound.lose();
  if(next.type==='champion'){App.loser=other(next.winner);$('resNext').textContent=t('finalScore');if(App.isHost){App.dare={deck:App.loser,index:Math.floor(Math.random()*DARES[App.loser].length),left:2};Net.send({t:'dare',loser:App.loser,deck:App.loser,index:App.dare.index,left:2});}setTimeout(()=>showChampion(next.winner),2200);}
  else if(next.type==='draw'){App.loser='both';$('resNext').textContent=t('drawResult');if(App.isHost){App.dareBoth={efe:{index:Math.floor(Math.random()*DARES.efe.length),left:2},mogi:{index:Math.floor(Math.random()*DARES.mogi.length),left:2}};Net.send({t:'dareBoth',efe:App.dareBoth.efe,mogi:App.dareBoth.mogi});}setTimeout(()=>showChampion('draw'),2200);}
  else{$('resNext').textContent=t('next')+' '+gname(next.game);setTimeout(()=>{if(App.isHost)sendHowto(next.game,next.index);},2600);}}
let dareCdT=null;
function showChampion(winner){show('screen-champ');if(winner==='draw'){$('champCv').style.visibility='hidden';$('champName').textContent=t('drawTitle');}else{$('champCv').style.visibility='visible';avatarTo($('champCv'),winner);$('champName').innerHTML=CF[winner]+' '+up(App.names[winner]);}$('champScore').textContent=t('finalLabel')+' '+App.score.efe+' – '+App.score.mogi;confetti();Sound.win();Sound.cheer();Rematch.me=Rematch.opp=false;let n=5;$('dareCd').textContent=t('dareIn',{n});clearInterval(dareCdT);dareCdT=setInterval(()=>{n--;if(n<=0){clearInterval(dareCdT);showDare();}else{$('dareCd').textContent=t('dareIn',{n});Sound.tick();}},1000);}
function confetti(){const c=$('confetti');c.innerHTML='';const cols=['#dd8b94','#e8b34a','#7fb89a','#7fb4d0','#c47079','#d09a55'];for(let i=0;i<80;i++){const d=document.createElement('div');d.className='cf';d.style.left=Math.random()*100+'%';d.style.background=cols[i%cols.length];const dur=1.8+Math.random()*1.8;d.animate([{transform:'translateY(0) rotate(0)',opacity:1},{transform:'translateY(170cqmax) rotate(540deg)',opacity:.9}],{duration:dur*1000,delay:Math.random()*700,easing:'ease-in'});c.appendChild(d);}setTimeout(()=>c.innerHTML='',4200);}
function showDare(){show('screen-dare');
  if(App.loser==='both'){const de=DARES.efe[App.dareBoth.efe.index],dm=DARES.mogi[App.dareBoth.mogi.index];$('dareWho').textContent=t('bothDare');const meEfe=App.me==='efe';
    $('dareText').innerHTML='<div style="margin-bottom:2cqmin;'+(meEfe?'color:var(--rose2)':'')+'">'+CF.efe+' <b>'+App.names.efe+'</b>'+(meEfe?' ('+t('you')+')':'')+': '+(de[App.lang]||de.en)+'</div><div style="'+(!meEfe?'color:var(--rose2)':'')+'">'+CF.mogi+' <b>'+App.names.mogi+'</b>'+(!meEfe?' ('+t('you')+')':'')+': '+(dm[App.lang]||dm.en)+'</div>';
    const myLeft=App.dareBoth[App.me]?App.dareBoth[App.me].left:0;$('btnRedraw').style.display='inline-block';$('btnRedraw').disabled=myLeft<=0;$('btnRedraw').textContent=t('redrawMine');$('dareSeen').textContent=t('redrawsLeft',{n:myLeft});$('rematchStatus').textContent=Rematch.me?t('rematchWait',{n:App.names[App.opp]}):'';$('btnRematch').disabled=Rematch.me;$('btnRematch').textContent=Rematch.me?'✔':t('rematch');return;}
  const owner=App.loser,amOwner=App.me===owner;$('dareWho').textContent=t('dareFor',{n:CF[owner]+' '+up(App.names[owner])});$('dareText').textContent=DARES[App.dare.deck][App.dare.index][App.lang]||DARES[App.dare.deck][App.dare.index].en;$('btnRedraw').style.display=amOwner?'inline-block':'none';$('btnRedraw').disabled=App.dare.left<=0;$('dareSeen').textContent=amOwner?t('redrawsLeft',{n:App.dare.left}):t('ownerRedraws',{n:App.names[owner],k:App.dare.left});$('rematchStatus').textContent=Rematch.me?t('rematchWait',{n:App.names[App.opp]}):'';$('btnRematch').disabled=Rematch.me;$('btnRematch').textContent=Rematch.me?'✔':t('rematch');}
function doRedraw(){if(!App.isHost)return;
  if(App.loser==='both'){App.dareBoth={efe:{index:Math.floor(Math.random()*DARES.efe.length),left:2},mogi:{index:Math.floor(Math.random()*DARES.mogi.length),left:2}};Net.send({t:'dareBoth',efe:App.dareBoth.efe,mogi:App.dareBoth.mogi});Sound.pick();showDare();return;}
  if(App.dare.left<=0)return;let idx;do{idx=Math.floor(Math.random()*DARES[App.dare.deck].length);}while(idx===App.dare.index&&DARES[App.dare.deck].length>1);App.dare.index=idx;App.dare.left--;Sound.pick();Net.send({t:'dare',loser:App.loser,deck:App.dare.deck,index:idx,left:App.dare.left});showDare();}
const Rematch={me:false,opp:false};
function tryRematch(){if(Rematch.me&&Rematch.opp){Rematch.me=Rematch.opp=false;resetTournament();enterLobby();}else if(App.screen==='screen-dare')showDare();}
function resetTournament(){App.score={efe:0,mogi:0};App.roundIndex=0;Round.over=true;Round._done=false;Game.running=false;cleanupRound();}

/* dares (remote-friendly only) */
function D(en,tr,id){return{en,tr,id};}
const DARES={
  efe:[D("Say 'Aku cinta kamu' to Mogi 🇮🇩❤️","Mogi'ye 'Aku cinta kamu' de 🇮🇩❤️","Ucapkan 'Aku cinta kamu' ke Mogi 🇮🇩❤️"),
    D("Compliment Mogi in Bahasa Indonesia right now.","Mogi'ye şu an Endonezce iltifat et.","Puji Mogi dalam Bahasa Indonesia sekarang."),
    D("Do a dramatic Stardew villager impression, 10s.","10sn dramatik Stardew köylüsü taklidi yap.","Tiru penduduk Stardew dramatis 10 detik."),
    D("Send Mogi your goofiest selfie right now 🤳.","Mogi'ye şu an en komik selfie'ni yolla 🤳.","Kirim selfie terkonyolmu ke Mogi sekarang 🤳."),
    D("Sing 10s of Mogi's favourite song out loud.","Mogi'nin sevdiği şarkıdan 10sn söyle.","Nyanyikan 10 detik lagu favorit Mogi."),
    D("Tell Mogi one specific thing you love about her ❤️.","Mogi'de sevdiğin somut bir şeyi söyle ❤️.","Sebut satu hal spesifik yang kamu suka dari Mogi ❤️."),
    D("Talk like a robot until Mogi laughs 🤖.","Mogi gülene kadar robot gibi konuş 🤖.","Bicara seperti robot sampai Mogi tertawa 🤖."),
    D("Do a 10s victory dance for the WINNER on camera 💃.","Kamerada KAZANAN için 10sn zafer dansı 💃.","Tarian kemenangan 10 detik di kamera 💃."),
    D("Name 3 things to do together on your next call 🌟.","Sıradaki görüşmede yapacağınız 3 şeyi say 🌟.","Sebut 3 hal untuk panggilan berikutnya 🌟."),
    D("Blow Mogi a big dramatic kiss on camera 😘.","Kamerada Mogi'ye kocaman öpücük yolla 😘.","Kirim ciuman dramatis ke kamera 😘."),
    D("Make your saddest puppy face for 10s 🥺.","10sn en üzgün surat 🥺.","Pasang wajah memelas 10 detik 🥺."),
    D("Speak in a movie-trailer voice for 15s 🎬.","15sn film fragmanı sesiyle konuş 🎬.","Bicara ala trailer film 15 detik 🎬."),
    D("Give Mogi a cute nickname & use it all call.","Mogi'ye tatlı lakap tak, görüşme boyu kullan.","Beri Mogi nama panggilan & pakai sepanjang panggilan."),
    D("Describe your dream date with Mogi in 20s 🌹.","Mogi ile hayalindeki buluşmayı 20sn anlat 🌹.","Ceritakan kencan impian dgn Mogi 20 detik 🌹."),
    D("Confess your most embarrassing Stardew mistake 😳.","En utanç verici Stardew hatanı itiraf et 😳.","Akui kesalahan Stardew paling memalukan 😳."),
    D("Send a voice note: why Mogi is the best 💌.","Sesli not yolla: Mogi neden en iyisi 💌.","Kirim voice note: kenapa Mogi terbaik 💌."),
    D("Teach Mogi one Turkish word right now 📚.","Mogi'ye hemen bir Türkçe kelime öğret 📚.","Ajari Mogi satu kata Turki sekarang 📚."),
    D("Describe Mogi using only food words 🥙.","Mogi'yi sadece yemek kelimeleriyle anlat 🥙.","Gambarkan Mogi pakai kata makanan 🥙.")],
  mogi:[D("Say 'Seni seviyorum' to Efe 🇹🇷❤️","Efe'ye 'Seni seviyorum' de 🇹🇷❤️","Ucapkan 'Seni seviyorum' ke Efe 🇹🇷❤️"),
    D("Compliment Efe in Turkish right now.","Efe'ye şu an Türkçe iltifat et.","Puji Efe dalam Bahasa Turki sekarang."),
    D("Do your best dramatic villain laugh, 10s 😈.","10sn en dramatik kötü adam kahkahası at 😈.","Tawa penjahat paling dramatis, 10 detik 😈."),
    D("Send Efe your goofiest selfie right now 🤳.","Efe'ye şu an en komik selfie'ni yolla 🤳.","Kirim selfie terkonyolmu ke Efe sekarang 🤳."),
    D("Sing 10s of Efe's favourite song out loud.","Efe'nin sevdiği şarkıdan 10sn söyle.","Nyanyikan 10 detik lagu favorit Efe."),
    D("Tell Efe one specific thing you love about him ❤️.","Efe'de sevdiğin somut bir şeyi söyle ❤️.","Sebut satu hal spesifik yang kamu suka dari Efe ❤️."),
    D("Make cute Junimo noises until Efe laughs 🟩.","Efe gülene kadar sevimli Junimo sesi çıkar 🟩.","Buat suara Junimo lucu sampai Efe tertawa 🟩."),
    D("Do a 10s victory dance for the WINNER on camera 💃.","Kamerada KAZANAN için 10sn zafer dansı 💃.","Tarian kemenangan 10 detik di kamera 💃."),
    D("Name 3 things to do together on your next call 🌟.","Sıradaki görüşmede yapacağınız 3 şeyi say 🌟.","Sebut 3 hal untuk panggilan berikutnya 🌟."),
    D("Blow Efe a big dramatic kiss on camera 😘.","Kamerada Efe'ye kocaman öpücük yolla 😘.","Kirim ciuman dramatis ke kamera 😘."),
    D("Make your saddest puppy face for 10s 🥺.","10sn en üzgün surat 🥺.","Pasang wajah memelas 10 detik 🥺."),
    D("Speak in a movie-trailer voice for 15s 🎬.","15sn film fragmanı sesiyle konuş 🎬.","Bicara ala trailer film 15 detik 🎬."),
    D("Give Efe a cute nickname & use it all call.","Efe'ye tatlı lakap tak, görüşme boyu kullan.","Beri Efe nama panggilan & pakai sepanjang panggilan."),
    D("Describe your dream date with Efe in 20s 🌹.","Efe ile hayalindeki buluşmayı 20sn anlat 🌹.","Ceritakan kencan impian dgn Efe 20 detik 🌹."),
    D("Confess your most embarrassing Stardew mistake 😳.","En utanç verici Stardew hatanı itiraf et 😳.","Akui kesalahan Stardew paling memalukan 😳."),
    D("Send a voice note: why Efe is the best 💌.","Sesli not yolla: Efe neden en iyisi 💌.","Kirim voice note: kenapa Efe terbaik 💌."),
    D("Teach Efe one word in Bahasa right now 📚.","Efe'ye hemen bir Endonezce kelime öğret 📚.","Ajari Efe satu kata Bahasa sekarang 📚."),
    D("Describe Efe using only Stardew items 💎.","Efe'yi sadece Stardew eşyalarıyla anlat 💎.","Gambarkan Efe pakai item Stardew 💎.")]
};

/* backgrounds */
function bgGrad(c,a,b){const g=c.createLinearGradient(0,0,0,VH);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(0,0,VW,VH);}
function seededProps(c,seed,list){const r=mulberry32(seed);c.textAlign='center';c.textBaseline='middle';for(let i=0;i<list.count;i++){const x=12+r()*(VW-24),y=70+r()*(VH-120);c.globalAlpha=list.alpha||0.85;c.font=(list.size||22)+'px serif';c.fillText(list.items[Math.floor(r()*list.items.length)],x,y);}c.globalAlpha=1;}
function bgGarden(c){bgGrad(c,'#a9dd86','#7cc35f');c.fillStyle='#9ad277';for(let i=0;i<6;i++){const r=mulberry32(i*7+3);el(c,r()*VW,80+r()*(VH-120),40,26);}seededProps(c,42,{items:['🌳','🌿','🌷','🌼','🪴','🍀'],count:9,size:22,alpha:0.8});c.fillStyle='#caa86e';c.fillRect(0,VH-18,VW,18);}
function bgStorm(c){const k=VW/480;bgGrad(c,'#8a87b8','#5a5588');c.fillStyle='#b6b3d8';for(let i=0;i<6;i++){const x=(i*97)%VW;el(c,x,42*k+(i%2)*10*k,50*k,18*k);el(c,x+34*k,50*k+(i%2)*10*k,40*k,15*k);}c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=2*k;for(let i=0;i<16;i++){const x=(i*53)%VW;c.beginPath();c.moveTo(x,80*k);c.lineTo(x-12*k,VH);c.stroke();}}
function bgArena(c){bgGrad(c,'#e6c79a','#cba36e');c.fillStyle='rgba(255,255,255,.10)';for(let i=-VH;i<VW;i+=48){c.beginPath();c.moveTo(i,0);c.lineTo(i+VH,VH);c.lineTo(i+VH+20,VH);c.lineTo(i+20,0);c.closePath();c.fill();}c.strokeStyle='#a9743a';c.lineWidth=6;c.strokeRect(12,40,VW-24,VH-56);}
function bgSnow(c){bgGrad(c,'#dff1fb','#a9d4ec');c.fillStyle='#f3fbff';el(c,VW*0.2,VH-6,140,42);el(c,VW*0.72,VH+4,160,46);el(c,VW*0.45,VH-2,130,38);const r=mulberry32(5);c.fillStyle='#fff';for(let i=0;i<36;i++){c.globalAlpha=.7;el(c,r()*VW,40+r()*(VH-40),1.6+r()*2,1.6+r()*2);}c.globalAlpha=1;}
function bgField(c){bgGrad(c,'#bfe6a8','#92c971');c.fillStyle='#caa86e';c.fillRect(0,VH/2-30,VW,60);c.fillStyle='#b9954f';for(let x=0;x<VW;x+=24){c.fillRect(x,VH/2-30,12,60);}seededProps(c,3,{items:['🌳','🌿'],count:5,size:22,alpha:0.8});}

/* GAMES */
const GAMES={};
function worldInit(meS,themS){World.me={x:meS.x,y:meS.y,f:0};World.them={x:themS.x,y:themS.y,tx:themS.x,ty:themS.y};}
function worldMove(dt,speed,r){const me=World.me;let dx=0,dy=0;if(Input.pdown&&Input.px!=null){const vx=Input.px-me.x,vy=Input.py-me.y,d=Math.hypot(vx,vy);if(d>6){dx=vx/d;dy=vy/d;}}else{if(Input.left)dx-=1;if(Input.right)dx+=1;if(Input.up)dy-=1;if(Input.down)dy+=1;const d=Math.hypot(dx,dy);if(d>0){dx/=d;dy/=d;}}me.x=clamp(me.x+dx*speed*dt,r,VW-r);me.y=clamp(me.y+dy*speed*dt,r+50,VH-r);const th=World.them;th.x=lerp(th.x,th.tx,0.25);th.y=lerp(th.y,th.ty,0.25);}

const QUIZ=[{q:{en:"Which season comes after Spring in Stardew?",tr:"Stardew'de Bahar'dan sonra hangi mevsim?",id:"Setelah Spring di Stardew, musim apa?"},o:[{en:"Summer",tr:"Yaz",id:"Musim Panas"},{en:"Winter",tr:"Kış",id:"Musim Dingin"},{en:"Fall",tr:"Sonbahar",id:"Musim Gugur"},{en:"Harvest",tr:"Hasat",id:"Panen"}],a:0},
  {q:{en:"What animal gives wool in Stardew?",tr:"Stardew'de yün veren hayvan?",id:"Hewan apa penghasil wol di Stardew?"},o:[{en:"Cow",tr:"İnek",id:"Sapi"},{en:"Sheep",tr:"Koyun",id:"Domba"},{en:"Pig",tr:"Domuz",id:"Babi"},{en:"Chicken",tr:"Tavuk",id:"Ayam"}],a:1},
  {q:{en:"Capital of Indonesia? 🇮🇩",tr:"Endonezya'nın başkenti? 🇮🇩",id:"Ibu kota Indonesia? 🇮🇩"},o:["Bali","Bandung","Jakarta","Surabaya"],a:2},
  {q:{en:"Capital of Turkey? 🇹🇷",tr:"Türkiye'nin başkenti? 🇹🇷",id:"Ibu kota Turki? 🇹🇷"},o:["Istanbul","Ankara","Izmir","Bursa"],a:1},
  {q:{en:"2 + 2 × 2 = ?",tr:"2 + 2 × 2 = ?",id:"2 + 2 × 2 = ?"},o:["8","6","4","16"],a:1},
  {q:{en:"Heavier: 1kg feathers or 1kg kebab?",tr:"Hangisi ağır: 1kg tüy mü 1kg kebap mı?",id:"Lebih berat: 1kg bulu atau 1kg kebab?"},o:[{en:"Feathers",tr:"Tüy",id:"Bulu"},{en:"Kebab",tr:"Kebap",id:"Kebab"},{en:"Equal",tr:"Eşit",id:"Sama"},{en:"Depends",tr:"Duruma göre",id:"Tergantung"}],a:2},
  {q:{en:"Rendang comes from which country?",tr:"Rendang hangi ülkeden gelir?",id:"Rendang dari negara mana?"},o:["Thailand","Indonesia","India","Japan"],a:1},
  {q:{en:"What do you get from a cow in Stardew?",tr:"Stardew'de inekten ne alırsın?",id:"Apa yang didapat dari sapi di Stardew?"},o:[{en:"Wool",tr:"Yün",id:"Wol"},{en:"Milk",tr:"Süt",id:"Susu"},{en:"Eggs",tr:"Yumurta",id:"Telur"},{en:"Honey",tr:"Bal",id:"Madu"}],a:1},
  {q:{en:"Hearts to marry in Stardew (after bouquet)?",tr:"Stardew'de evlenmek için kaç kalp? (buketten sonra)",id:"Berapa hati untuk menikah di Stardew? (setelah buket)"},o:["8","10","12","14"],a:1},
  {q:{en:"Blue + Yellow = ?",tr:"Mavi + Sarı = ?",id:"Biru + Kuning = ?"},o:[{en:"Purple",tr:"Mor",id:"Ungu"},{en:"Orange",tr:"Turuncu",id:"Oranye"},{en:"Green",tr:"Yeşil",id:"Hijau"},{en:"Brown",tr:"Kahverengi",id:"Cokelat"}],a:2},
  {q:{en:"A universally loved Stardew gift?",tr:"Stardew'de herkesin sevdiği hediye?",id:"Hadiah Stardew disukai semua?"},o:["Sea Cucumber","Prismatic Shard",{en:"Wood",tr:"Odun",id:"Kayu"},{en:"Trash",tr:"Çöp",id:"Sampah"}],a:1},
  {q:{en:"Which is the Red Planet?",tr:"Kızıl Gezegen hangisi?",id:"Planet Merah yang mana?"},o:["Venus","Mars","Jupiter","Saturn"],a:1},
  {q:{en:"Days in one Stardew season?",tr:"Bir Stardew mevsimi kaç gün?",id:"Berapa hari satu musim Stardew?"},o:["28","30","31","7"],a:0}];
GAMES.quiz={dom:true,world:false,init(rng){this.qi=Math.floor(rng()*QUIZ.length);this.locked=false;this.lockT=0;this.answered=false;this.startT=performance.now();this.build();},
  build(){const q=QUIZ[this.qi],dom=$('gdom');dom.innerHTML='<div class="qtext heading">'+(q.q[App.lang]||q.q.en)+'</div>';const grid=document.createElement('div');grid.className='opts';q.o.forEach((txt,i)=>{const b=document.createElement('div');b.className='opt';b.textContent=(txt&&typeof txt==='object')?(txt[App.lang]||txt.en):txt;b.onclick=()=>this.answer(i,b);grid.appendChild(b);});dom.appendChild(grid);const lk=document.createElement('div');lk.className='qlock';lk.id='qlock';dom.appendChild(lk);},
  answer(i,el2){if(this.locked||this.answered||Round.over)return;const q=QUIZ[this.qi];if(i===q.a){this.answered=true;el2.classList.add('good');Sound.good();caption('✅');if(App.isHost)resolveRound(App.me);else Net.send({t:'gm',quiz:'correct',char:App.me});}else{el2.classList.add('bad');Sound.bad();this.locked=true;this.lockT=2;$('qlock').textContent='❌ -2s';Net.send({t:'gm',quiz:'wrong',char:App.me});}},
  update(dt){if(this.locked){this.lockT-=dt;if(this.lockT<=0){this.locked=false;$('qlock').textContent='';document.querySelectorAll('#gdom .opt.bad').forEach(e=>e.classList.remove('bad'));}else $('qlock').textContent='❌ '+this.lockT.toFixed(1)+'s';}if(App.isHost&&!Round.over&&(performance.now()-this.startT)>20000){this.qi=(this.qi+1)%QUIZ.length;Net.send({t:'gm',quiz:'newq',qi:this.qi});this.startT=performance.now();this.answered=false;this.locked=false;this.build();}},
  net(m){if(m.quiz==='correct'){if(App.isHost)resolveRound(m.char);}else if(m.quiz==='wrong')caption(App.names[m.char]+' ❌');else if(m.quiz==='newq'){this.qi=m.qi;this.startT=performance.now();this.answered=false;this.locked=false;this.build();}},selfState(){return{prog:0,hearts:5};}};

const KEBAB_R=['🥩','🫓','🍅','🧅','🫑','🧂'],RENDANG_R=['🥥','🌶️','🌿','🧄','🫚','🍚'];function myRecipe(){return App.me==='efe'?KEBAB_R:RENDANG_R;}
GAMES.kebab={dom:false,world:true,init(rng){this.recipe=myRecipe();this.have=[];this.carry=[];this.cap=2;this.finished=false;this.myPot=App.me==='efe'?{x:60,y:VH-44}:{x:VW-60,y:VH-44};
    const all=KEBAB_R.concat(RENDANG_R).map(em=>({em,junk:false})).concat([{em:'🦠',junk:true},{em:'👟',junk:true},{em:'🧦',junk:true},{em:'🪨',junk:true}]);shuffle(all,rng);const cols=landscape()?7:4,rows=landscape()?3:4,cellW=(VW-60)/cols,cellH=(VH-200)/rows;this.items=[];
    for(let i=0;i<all.length;i++){const cxi=i%cols,cyi=Math.floor(i/cols);const x=30+cxi*cellW+cellW/2+(rng()-0.5)*cellW*0.4,y=120+cyi*cellH+cellH/2+(rng()-0.5)*cellH*0.4;this.items.push({x,y,em:all[i].em,junk:all[i].junk,taken:false});}
    worldInit({x:App.me==='efe'?90:VW-90,y:VH-90},{x:App.me==='efe'?VW-90:90,y:VH-90});const hud=$('recipeHud');hud.style.display='flex';this.renderHud();},
  renderHud(){$('recipeHud').innerHTML='<span class="lab">'+(App.me==='efe'?'KEBAB':'RENDANG')+'</span>'+this.recipe.map(em=>'<span class="it'+(this.have.indexOf(em)>=0?' got':'')+'">'+em+'</span>').join('');},
  update(dt){if(Round.over)return;worldMove(dt,165,14);const me=World.me;for(const it of this.items){if(it.taken)continue;if(dist(me.x,me.y,it.x,it.y)<24){if(it.junk){it.taken=true;FX.shake=7;Sound.bad();caption(pick(CAP_JUNK[App.lang]||CAP_JUNK.en));this.carry.forEach(em=>this.items.push({x:clamp(me.x+(Math.random()*70-35),30,VW-30),y:clamp(me.y-20+(Math.random()*40-20),100,VH-100),em,junk:false,taken:false}));this.carry=[];}else if(this.recipe.indexOf(it.em)>=0&&this.have.indexOf(it.em)<0&&this.carry.indexOf(it.em)<0&&this.carry.length<this.cap){it.taken=true;this.carry.push(it.em);Sound.pick();FX.burst(it.x,it.y,6,'#9ff0bb',50);}}}
    if(this.carry.length&&dist(me.x,me.y,this.myPot.x,this.myPot.y)<32){let add=false;this.carry.forEach(em=>{if(this.have.indexOf(em)<0){this.have.push(em);add=true;FX.burst(this.myPot.x,this.myPot.y,9,'#ffd34e',70);}});this.carry=[];if(add){Sound.good();caption(this.have.length+'/6 🍲');this.renderHud();}}
    if(!this.finished&&this.have.length>=6){this.finished=true;Sound.win();caption(t('capDone'));const ft=performance.now()-Round.start;if(App.isHost)Host.setMy({time:ft});else Net.send({t:'finish',char:App.me,game:'kebab',time:ft});}},
  render(){const c=ctx;bgGarden(c);[['efe',{x:60,y:VH-44}],['mogi',{x:VW-60,y:VH-44}]].forEach(([who,p])=>{const mine=who===App.me;c.globalAlpha=mine?1:0.5;if(mine){c.fillStyle='rgba(255,201,77,.3)';el(c,p.x,p.y,26,26);}c.font='36px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🍲',p.x,p.y);c.globalAlpha=1;if(mine){c.fillStyle='#fff7d0';c.font='800 13px Baloo 2,sans-serif';c.fillText(t('youCaps'),p.x,p.y-28);}});
    c.font='27px serif';c.textAlign='center';c.textBaseline='middle';for(const it of this.items){if(it.taken)continue;const mine=!it.junk&&this.recipe.indexOf(it.em)>=0;if(mine){c.save();c.fillStyle='rgba(159,240,187,.45)';el(c,it.x,it.y,18,18);c.strokeStyle='#4fc28a';c.lineWidth=2.4;c.beginPath();c.arc(it.x,it.y,18,0,7);c.stroke();c.restore();}else c.globalAlpha=it.junk?1:0.45;c.fillText(it.em,it.x,it.y);c.globalAlpha=1;}
    const th=World.them;blitChar(c,App.opp,th.x,th.y,0.85);const me=World.me;blitChar(c,App.me,me.x,me.y,0.92);c.font='18px serif';this.carry.forEach((em,i)=>c.fillText(em,me.x-9+i*18,me.y-84));},hostTick(){},selfState(){return{prog:this.have?this.have.length:0,hearts:5};}};

const FALL=['🧊','🍖','🐈','⚓','🧱','🥥','🪨','📦','🍩'];
GAMES.durian={dom:false,world:false,init(rng){this.rng=rng;this.items=[];this.spawnT=0;this.t=0;this.x=VW/2;this.w=34*VW/480;this.hearts=5;this.inv=0;this.flinch=0;this.diedAt=null;},
  update(dt){if(Round.over)return;this.t+=dt;if(this.inv>0)this.inv-=dt;if(this.flinch>0)this.flinch-=dt;if(Input.pdown&&Input.px!=null)this.x=lerp(this.x,clamp(Input.px,this.w/2,VW-this.w/2),0.4);else{if(Input.left)this.x-=380*dt;if(Input.right)this.x+=380*dt;}this.x=clamp(this.x,this.w/2,VW-this.w/2);this.spawnT+=dt;const iv=Math.max(0.26,0.72-this.t*0.009);if(this.spawnT>=iv){this.spawnT=0;const heart=this.rng()<0.12;this.items.push(heart?{x:24+this.rng()*(VW-48),y:-20,vy:150+this.rng()*60,em:'💖',heart:true}:{x:24+this.rng()*(VW-48),y:-20,vy:170+this.rng()*150,em:FALL[Math.floor(this.rng()*FALL.length)]});}
    const py=VH-58;const tol=16*VW/480;for(let i=this.items.length-1;i>=0;i--){const it=this.items[i];it.y+=it.vy*dt;if(it.y>py-20&&it.y<py+22&&Math.abs(it.x-this.x)<this.w/2+tol){if(it.heart){this.items.splice(i,1);if(this.hearts<5){this.hearts++;Sound.good();spawnHearts(1);caption('+1 ❤️');}else Sound.pick();}else if(this.inv<=0){this.items.splice(i,1);this.hearts--;this.inv=0.9;this.flinch=0.4;FX.shake=9;Sound.hit();caption(pick(CAP_HIT[App.lang]||CAP_HIT.en));if(this.hearts<=0&&this.diedAt==null){this.diedAt=performance.now()-Round.start;if(App.isHost)Host.setMy({diedAt:this.diedAt});else Net.send({t:'finish',char:App.me,game:'durian',diedAt:this.diedAt});}}}else if(it.y>VH+30)this.items.splice(i,1);}},
  render(){const c=ctx;const k=VW/480;bgStorm(c);c.font=Math.round(28*k)+'px serif';c.textAlign='center';c.textBaseline='middle';for(const it of this.items)c.fillText(it.em,it.x,it.y);const blink=this.inv>0&&Math.floor(this.t*20)%2===0;if(!blink)blitChar(c,App.me,this.x,VH-24*k,0.95*k);const left=Math.max(0,35-this.t);c.fillStyle='#bfae8c';c.fillRect(0,0,VW,7);c.fillStyle='#ffc94d';c.fillRect(0,0,VW*(left/35),7);},
  hostTick(){if(Round.over)return;if(this.diedAt!=null||Opp[App.opp].hearts<=0||this.t>=35)this.decide();},decide(){const meH=this.hearts,opH=Opp[App.opp].hearts;let w;if(this.diedAt!=null&&opH>0)w=App.opp;else if(opH<=0&&this.diedAt==null)w=App.me;else if(meH!==opH)w=meH>opH?App.me:App.opp;else w=this.rng()<0.5?App.me:App.opp;resolveRound(w);},selfState(){return{prog:0,hearts:this.hearts!=null?this.hearts:5};}};

function markSVG(who){const col=who==='efe'?'#7fb0ff':'#ef93ab';if(who==='efe')return '<svg viewBox="0 0 100 100"><line x1="22" y1="22" x2="78" y2="78" stroke="'+col+'" stroke-width="15" stroke-linecap="round"/><line x1="78" y1="22" x2="22" y2="78" stroke="'+col+'" stroke-width="15" stroke-linecap="round"/></svg>';return '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="29" fill="none" stroke="'+col+'" stroke-width="15"/></svg>';}
GAMES.ttt={dom:true,world:false,init(){this.board=Array(9).fill(null);this.turn='efe';this.starter='efe';this.build();},
  build(){const dom=$('gdom');dom.innerHTML='';const n=document.createElement('div');n.className='turnote heading';n.id='tttNote';dom.appendChild(n);const b=document.createElement('div');b.className='board';for(let i=0;i<9;i++){const cell=document.createElement('div');cell.className='cell';cell.onclick=()=>this.tap(i);b.appendChild(cell);}dom.appendChild(b);this.bEl=b;this.refresh();},
  refresh(){$('tttNote').innerHTML=(this.turn===App.me)?'<span style="color:var(--gold)">'+t('yourTurn')+'</span>':t('waitTurn',{n:App.names[this.turn]});[...this.bEl.children].forEach((cell,i)=>{cell.innerHTML=this.board[i]?markSVG(this.board[i]):'';});},
  tap(i){if(Round.over||this.turn!==App.me||this.board[i])return;this.place(i,App.me);Net.send({t:'gm',ttt:'move',cell:i,by:App.me});},
  place(i,who){this.board[i]=who;Sound.place();this.turn=other(who);this.refresh();const w=this.winLine();if(w){[...this.bEl.children].forEach((c,j)=>{if(w.line.indexOf(j)>=0)c.classList.add('win');});if(App.isHost)setTimeout(()=>resolveRound(w.who),550);}else if(this.board.every(Boolean)){caption(t('draw'));this.starter=other(this.starter);setTimeout(()=>{this.board=Array(9).fill(null);this.turn=this.starter;this.refresh();},900);}},
  net(m){if(m.ttt==='move'&&this.board[m.cell]==null)this.place(m.cell,m.by);},winLine(){const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(const l of L){const[a,b,c]=l;if(this.board[a]&&this.board[a]===this.board[b]&&this.board[a]===this.board[c])return{who:this.board[a],line:l};}return null;},update(){},selfState(){return{prog:0,hearts:5};}};

GAMES.tnt={dom:false,world:true,actBtn:'💨',init(rng){this.rng=rng;this.holder=rng()<0.5?'efe':'mogi';this.fuse=8+rng()*7;this.cool=0;this.exploded=false;this.t=0;this.dashCool=0;this.dashT=0;worldInit({x:App.me==='efe'?100:VW-100,y:200},{x:App.me==='efe'?VW-100:100,y:400});},
  update(dt){if(Round.over)return;this.t+=dt;if(this.cool>0)this.cool-=dt;if(this.dashCool>0)this.dashCool-=dt;if(this.dashT>0)this.dashT-=dt;
    if(Input.act){Input.act=false;if(this.holder===App.me&&this.dashCool<=0){this.dashT=0.28;this.dashCool=5;Sound.dash();FX.ring(World.me.x,World.me.y,'#7fb4d0');}}
    const spd=this.dashT>0?470:185;worldMove(dt,spd,14);
    $('actBtn').disabled=!(this.holder===App.me&&this.dashCool<=0);
    if(App.isHost){this.fuse-=dt;const me=World.me,th=World.them;if(this.cool<=0&&dist(me.x,me.y,th.x,th.y)<32){this.holder=other(this.holder);this.cool=0.7;Sound.tick();Net.send({t:'gm',tnt:'pass',holder:this.holder});FX.ring((me.x+th.x)/2,(me.y+th.y)/2,'#ffc94d');}
      if(this.fuse<=0&&!this.exploded){this.exploded=true;const hx=(this.holder===App.me)?World.me.x:World.them.x,hy=(this.holder===App.me)?World.me.y:World.them.y;FX.burst(hx,hy,36,'#ff7a3a',180);FX.shake=16;Sound.boom();caption(t('capBoom'));Net.send({t:'gm',tnt:'boom',x:Math.round(hx),y:Math.round(hy)});resolveRound(other(this.holder));}}},
  net(m){if(m.tnt==='pass'){this.holder=m.holder;this.cool=0.7;Sound.tick();}else if(m.tnt==='boom'){FX.burst(m.x,m.y,36,'#ff7a3a',180);FX.shake=16;Sound.boom();caption(t('capBoom'));}},
  render(){const c=ctx;bgArena(c);const th=World.them,me=World.me;this.drawC(c,App.opp,th,this.holder===App.opp);this.drawC(c,App.me,me,this.holder===App.me);
    if(this.holder===App.me){c.fillStyle=this.dashCool<=0?'#7fb4d0':'rgba(127,180,208,.4)';c.font='800 13px Baloo 2,sans-serif';c.textAlign='center';c.fillText(this.dashCool<=0?t('dashReady'):'💨 '+Math.ceil(this.dashCool)+'s',VW/2,VH-44);}},
  drawC(c,who,p,bomb){blitChar(c,who,p.x,p.y,0.95);if(bomb){const pl=0.5+0.5*Math.sin(performance.now()/160);c.strokeStyle='rgba(255,90,60,'+(0.45+pl*0.4).toFixed(2)+')';c.lineWidth=2.5;c.beginPath();c.ellipse(p.x,p.y-5,21,9,0,0,7);c.stroke();c.font='30px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('💣',p.x,p.y-94);if(Math.floor(performance.now()/100)%2===0){c.fillStyle='#ff5a3a';c.beginPath();c.arc(p.x+9,p.y-110,3.5,0,7);c.fill();}c.fillStyle='#e8675a';c.font='800 11px Baloo 2,sans-serif';c.fillText(t('bombLabel'),p.x,p.y-122);}},selfState(){return{prog:0,hearts:5};}};

GAMES.snow={dom:false,world:true,actBtn:'⛄',init(rng){this.balls=[];this.cool=0;this.inv=1.0;Input.aimx=VW/2;Input.aimy=120;worldInit({x:App.me==='efe'?100:VW-100,y:VH-160},{x:App.me==='efe'?VW-100:100,y:160});},
  throwBall(){if(this.cool>0||Round.over)return;const me=World.me;let dx=Input.aimx-me.x,dy=Input.aimy-(me.y-40),d=Math.hypot(dx,dy);if(d<8){const th=World.them;dx=th.x-me.x;dy=th.y-me.y;d=Math.hypot(dx,dy)||1;}const sp=320,vx=dx/d*sp,vy=dy/d*sp;this.cool=0.6;Sound.whoosh();this.balls.push({x:me.x,y:me.y-40,vx,vy,owner:App.me,t:0});Net.send({t:'gm',snow:'throw',x:Math.round(me.x),y:Math.round(me.y-40),vx:Math.round(vx),vy:Math.round(vy),owner:App.me});},
  hitBox(px,py,bx,by){return Math.abs(bx-px)<19 && by>py-82 && by<py-2;},
  update(dt){if(Round.over)return;if(this.cool>0)this.cool-=dt;if(this.inv>0)this.inv-=dt;const me=World.me;let dx=0,dy=0;if(Input.left)dx-=1;if(Input.right)dx+=1;if(Input.up)dy-=1;if(Input.down)dy+=1;const dd=Math.hypot(dx,dy);if(dd>0){dx/=dd;dy/=dd;}me.x=clamp(me.x+dx*180*dt,14,VW-14);me.y=clamp(me.y+dy*180*dt,64,VH-14);const th=World.them;th.x=lerp(th.x,th.tx,0.25);th.y=lerp(th.y,th.ty,0.25);
    if(Input.act){Input.act=false;this.throwBall();}
    for(let i=this.balls.length-1;i>=0;i--){const b=this.balls[i];const steps=4;let done=false;for(let s=0;s<steps;s++){b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;b.t+=dt/steps;if(App.isHost){if(b.owner!==App.me&&this.inv<=0&&this.hitBox(me.x,me.y,b.x,b.y)){this.hit(App.me,b.x,b.y);return;}if(b.owner!==App.opp&&this.hitBox(World.them.x,World.them.y,b.x,b.y)){this.hit(App.opp,b.x,b.y);return;}}}if(b.x<-20||b.x>VW+20||b.y<-20||b.y>VH+20||b.t>4){this.balls.splice(i,1);}}},
  hit(loser,x,y){if(Round.over)return;FX.burst(x,y,22,'#ffffff',130);FX.shake=10;Sound.hit();caption(t('capSnowHit'));Net.send({t:'gm',snow:'hit',x:Math.round(x),y:Math.round(y)});resolveRound(other(loser));},
  net(m){if(m.snow==='throw')this.balls.push({x:m.x,y:m.y,vx:m.vx,vy:m.vy,owner:m.owner,t:0});else if(m.snow==='hit'){FX.burst(m.x,m.y,22,'#ffffff',130);FX.shake=10;Sound.hit();caption(t('capSnowHit'));}},
  render(){const c=ctx;bgSnow(c);const me=World.me,th=World.them;c.strokeStyle='rgba(120,160,200,.55)';c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();c.moveTo(me.x,me.y-40);c.lineTo(Input.aimx,Input.aimy);c.stroke();c.setLineDash([]);c.fillStyle='#4a8fc0';c.beginPath();c.arc(Input.aimx,Input.aimy,5,0,7);c.fill();
    for(const b of this.balls){c.fillStyle='#fff';c.beginPath();c.arc(b.x,b.y,7,0,7);c.fill();c.strokeStyle='#aaccea';c.lineWidth=1.2;c.stroke();}blitChar(c,App.opp,th.x,th.y,0.95);const blink=this.inv>0&&Math.floor(performance.now()/100)%2===0;if(!blink)blitChar(c,App.me,me.x,me.y,0.95);if(this.cool>0){c.fillStyle='rgba(90,140,180,.6)';c.fillRect(me.x-15,me.y+8,30*(1-this.cool/0.6),3);}},selfState(){return{prog:0,hearts:5};}};

GAMES.tug={dom:false,world:false,actBtn:'💪',init(rng){this.rope=0;this.myPull=0;this.oppPull=0;this.t=0;this.lastSend=0;},
  update(dt){if(Round.over)return;this.t+=dt;if(Input.act){Input.act=false;this.myPull++;Sound.pull();FX.burst(App.me==='efe'?VW*0.5-30:VW*0.5+30,VH/2,3,'#ffd34e',40);}if(this.t-this.lastSend>0.1){this.lastSend=this.t;Net.send({t:'gm',tug:'pull',n:this.myPull});}
    if(App.isHost){const efePull=App.me==='efe'?this.myPull:this.oppPull,mogiPull=App.me==='mogi'?this.myPull:this.oppPull;this.rope=clamp((mogiPull-efePull)*0.018,-1,1);Net.send({t:'gm',tug:'rope',r:this.rope});if(this.rope<=-1)resolveRound('efe');else if(this.rope>=1)resolveRound('mogi');}},
  net(m){if(m.tug==='pull')this.oppPull=m.n;else if(m.tug==='rope')this.rope=m.r;},
  render(){const c=ctx;bgField(c);const midY=VH/2,cx=VW/2+this.rope*(VW*0.32);c.strokeStyle='#8a5a2a';c.lineWidth=6;c.beginPath();c.moveTo(40,midY);c.lineTo(VW-40,midY);c.stroke();c.fillStyle='#e8675a';c.fillRect(cx-2,midY-30,4,26);c.beginPath();c.moveTo(cx+2,midY-30);c.lineTo(cx+22,midY-24);c.lineTo(cx+2,midY-18);c.closePath();c.fill();
    c.strokeStyle='rgba(127,176,255,.7)';c.lineWidth=3;c.beginPath();c.moveTo(VW*0.18,midY-40);c.lineTo(VW*0.18,midY+40);c.stroke();c.strokeStyle='rgba(239,147,171,.7)';c.beginPath();c.moveTo(VW*0.82,midY-40);c.lineTo(VW*0.82,midY+40);c.stroke();
    blitChar(c,'efe',cx-46,midY+40,0.9);blitChar(c,'mogi',cx+46,midY+40,0.9);c.fillStyle='var(--ink)';c.fillStyle='#f1e3c6';c.font='800 16px Baloo 2,sans-serif';c.textAlign='center';c.fillText(App.me==='efe'?t('tugLeft'):t('tugRight'),VW/2,VH-30);},selfState(){return{prog:0,hearts:5};}};

/* MEMORY MATCH (turn-based) */
GAMES.memory={dom:true,world:false,init(rng){const ems=['🍓','🍰','⭐','🌙','🐱','🎈','🌻','🍩'];const deck=ems.concat(ems);shuffle(deck,rng);this.cards=deck.map(e=>({e,flip:false,done:false}));this.turn='efe';this.first=null;this.second=null;this.lock=false;this.pairs={efe:0,mogi:0};this.build();},
  build(){const dom=$('gdom');dom.innerHTML='';const n=document.createElement('div');n.className='turnote heading';n.id='memNote';dom.appendChild(n);const g=document.createElement('div');g.className='memgrid';this.cards.forEach((cd,i)=>{const e=document.createElement('div');e.className='memc';e.onclick=()=>this.tap(i);g.appendChild(e);});dom.appendChild(g);this.gEl=g;this.refresh();},
  refresh(){$('memNote').innerHTML=((this.turn===App.me)?'<span style="color:var(--gold)">'+t('yourTurn')+'</span>':t('waitTurn',{n:App.names[this.turn]}))+'<br><span style="font-size:3cqmin">'+App.names.efe+': '+this.pairs.efe+'   ·   '+App.names.mogi+': '+this.pairs.mogi+'</span>';
    [...this.gEl.children].forEach((e,i)=>{const cd=this.cards[i];e.className='memc'+(cd.flip||cd.done?' flip':'')+(cd.done?' done':'');e.textContent=(cd.flip||cd.done)?cd.e:'';});},
  tap(i){if(Round.over||this.lock||this.turn!==App.me)return;const cd=this.cards[i];if(cd.flip||cd.done)return;this.doFlip(i);Net.send({t:'gm',mem:'flip',i});},
  doFlip(i){this.cards[i].flip=true;Sound.pick();if(this.first==null){this.first=i;this.refresh();}else{this.second=i;this.lock=true;this.refresh();setTimeout(()=>this.resolve(),750);}},
  resolve(){const a=this.first,b=this.second;if(this.cards[a].e===this.cards[b].e){this.cards[a].done=this.cards[b].done=true;this.pairs[this.turn]++;Sound.good();FX&&0;}else{this.cards[a].flip=this.cards[b].flip=false;this.turn=other(this.turn);Sound.bad();}this.first=this.second=null;this.lock=false;this.refresh();
    if(this.cards.every(c=>c.done)&&App.isHost){const w=this.pairs.efe>this.pairs.mogi?'efe':(this.pairs.mogi>this.pairs.efe?'mogi':(Math.random()<0.5?'efe':'mogi'));setTimeout(()=>resolveRound(w),500);}},
  net(m){if(m.mem==='flip'&&!this.cards[m.i].flip&&!this.cards[m.i].done)this.doFlip(m.i);},update(){},selfState(){return{prog:0,hearts:5};}};

/* SIMON SAYS */
const SIMCOL=['#e8675a','#5fc28a','#7fb4f0','#ffc94d'];
GAMES.simon={dom:true,world:false,init(rng,seed){this.srng=mulberry32((seed>>>0)^0x9e3779b9);this.seq=[];this.level=0;this.turn='efe';this.starter='efe';this.done={efe:false,mogi:false};this.inputIdx=0;this.phase='watch';this.over=false;this.build();setTimeout(()=>this.nextLevel(),600);},
  build(){const dom=$('gdom');dom.innerHTML='';const n=document.createElement('div');n.className='simnote heading';n.id='simNote';n.textContent=t('watch');dom.appendChild(n);const g=document.createElement('div');g.className='simgrid';this.pads=[];for(let i=0;i<4;i++){const p=document.createElement('div');p.className='simpad';p.style.background=SIMCOL[i];p.onclick=()=>this.tap(i);g.appendChild(p);this.pads.push(p);}dom.appendChild(g);this.gEl=g;},
  note(h){$('simNote').innerHTML=h;},
  showTurn(){this.note(this.turn===App.me?'<span style="color:var(--gold)">'+t('repeat')+'</span>':t('waitTurn',{n:App.names[this.turn]}));},
  nextLevel(){if(Round.over)return;this.level++;const add=this.level<=1?3:1;for(let k=0;k<add;k++)this.seq.push(Math.floor(this.srng()*4));this.done={efe:false,mogi:false};this.turn=this.starter;this.inputIdx=0;this.phase='watch';this.note(t('watch')+' ('+this.seq.length+')');this.playSeq();},
  playSeq(){let i=0;const iv=Math.max(280,640-this.level*45);const step=()=>{if(Round.over)return;if(i>=this.seq.length){this.phase='input';this.showTurn();return;}this.flash(this.seq[i]);i++;setTimeout(step,iv);};setTimeout(step,450);},
  flash(n){const p=this.pads[n];if(!p)return;p.classList.add('lit');Sound.pad(n);setTimeout(()=>p.classList.remove('lit'),Math.max(160,300-this.level*15));},
  tap(n){if(Round.over||this.phase!=='input'||this.turn!==App.me)return;this.flash(n);if(n===this.seq[this.inputIdx]){this.inputIdx++;if(this.inputIdx>=this.seq.length){this.complete(App.me);Net.send({t:'gm',simon:'ok',char:App.me});}}else{this.fail(App.me);Net.send({t:'gm',simon:'fail',char:App.me});}},
  complete(char){if(this.over)return;this.done[char]=true;Sound.good();if(this.done.efe&&this.done.mogi){this.phase='watch';this.note('✔');setTimeout(()=>this.nextLevel(),750);}else{this.turn=other(char);this.inputIdx=0;this.phase='input';this.showTurn();}},
  fail(char){if(this.over||Round.over)return;this.over=true;Sound.bad();caption('❌ '+App.names[char]);this.note('❌');if(App.isHost)resolveRound(other(char));},
  net(m){if(m.simon==='ok')this.complete(m.char);else if(m.simon==='fail')this.fail(m.char);},update(){},selfState(){return{prog:0,hearts:5};}};

/* input */
function tryAct(){const n=performance.now();if(n-(Input._actAt||0)<55)return;Input._actAt=n;Input.act=true;}
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='f11'){if(window.desktop)window.desktop.toggleFullscreen();e.preventDefault();return;}if(k===' '){if(!e.repeat&&(Round.game==='snow'||Round.game==='tug'||Round.game==='tnt')&&!Round.over)tryAct();e.preventDefault();return;}if(k==='arrowup'||k==='arrowdown'||k==='arrowleft'||k==='arrowright')e.preventDefault();if(e.repeat)return;
  if(k==='arrowleft'||k==='a')Input.left=true;if(k==='arrowright'||k==='d')Input.right=true;if(k==='arrowup'||k==='w')Input.up=true;if(k==='arrowdown'||k==='s')Input.down=true;
  if(App.screen==='screen-pick'){if(k==='arrowleft')stepPick(-1);if(k==='arrowright')stepPick(1);if(k==='enter')confirmPick();}});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')Input.left=false;if(k==='arrowright'||k==='d')Input.right=false;if(k==='arrowup'||k==='w')Input.up=false;if(k==='arrowdown'||k==='s')Input.down=false;});
cv.addEventListener('pointerdown',e=>{Input.pdown=true;const v=clientToV(e.clientX,e.clientY);Input.px=v.x;Input.py=v.y;Input.aimx=v.x;Input.aimy=v.y;});
cv.addEventListener('pointermove',e=>{const v=clientToV(e.clientX,e.clientY);Input.aimx=v.x;Input.aimy=v.y;if(Input.pdown){Input.px=v.x;Input.py=v.y;}});
window.addEventListener('pointerup',()=>{Input.pdown=false;});cv.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});$('actBtn').onclick=()=>{tryAct();};

/* buttons */
function needPeer(){if(!window.Peer){alert(t('errNetLib2'));return false;}return true;}
$('btnCreate').onclick=()=>{Sound.resume();if(needPeer())hostCreate(0);};
$('btnJoinShow').onclick=()=>{Sound.resume();$('joinModal').classList.add('on');setTimeout(()=>$('codeInput').focus(),60);};
$('closeJoin').onclick=()=>$('joinModal').classList.remove('on');
$('joinModal').addEventListener('click',e=>{if(e.target.id==='joinModal')$('joinModal').classList.remove('on');});
$('btnJoin').onclick=()=>{Sound.resume();if(needPeer()){guestJoin($('codeInput').value);$('joinModal').classList.remove('on');}};
$('codeInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('btnJoin').click();});$('codeInput').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'');});
$('btnCopy').onclick=()=>{try{navigator.clipboard.writeText(Net.code);$('btnCopy').textContent='✓';setTimeout(()=>$('btnCopy').textContent=t('copy'),1200);}catch(e){}};
$('btnWaitBack').onclick=()=>cancelRoom();
$('pLeft').onclick=()=>stepPick(-1);$('pRight').onclick=()=>stepPick(1);$('btnPick').onclick=confirmPick;
document.querySelectorAll('#matchModal .mTabBtn').forEach(b=>b.onclick=()=>mmTab(b.dataset.mmtab));
$('btnMatchCfg').onclick=()=>{renderMatchModal();mmTab('games');$('matchModal').classList.add('on');};$('closeMatch').onclick=()=>$('matchModal').classList.remove('on');$('matchModal').addEventListener('click',e=>{if(e.target.id==='matchModal')$('matchModal').classList.remove('on');});
$('btnLobbyReady').onclick=()=>{if(!App.connected)return;App.guestReady=!App.guestReady;Net.send({t:'lobbyReady',r:App.guestReady});refreshLobby();};
$('btnStart').onclick=()=>{if(App.isHost&&App.guestReady)startTournament();};
$('btnReady').onclick=()=>{Ready.me=!Ready.me;$('btnReady').textContent=Ready.me?t('cancel'):t('ready');Net.send({t:'ready',r:Ready.me});updateReadyUI();hostCheckReady();};
$('btnRedraw').onclick=()=>{if(App.loser==='both'){const mine=App.dareBoth[App.me];if(!mine||mine.left<=0)return;const deck=DARES[App.me];let idx;do{idx=Math.floor(Math.random()*deck.length);}while(idx===mine.index&&deck.length>1);const left=mine.left-1;App.dareBoth[App.me]={index:idx,left:left};Net.send({t:'dareBothUpd',char:App.me,index:idx,left:left});Sound.pick();showDare();return;}if(App.me!==App.loser)return;if(App.isHost)doRedraw();else Net.send({t:'redrawReq'});};
$('btnRematch').onclick=()=>{if(!App.connected)return;Rematch.me=true;Net.send({t:'rematchReq'});tryRematch();};
$('btnLoveRes').onclick=sendLove;$('btnLoveChamp').onclick=sendLove;
$('setBtn').onclick=()=>{Sound.resume();$('modal').classList.add('on');};$('closeSet').onclick=()=>$('modal').classList.remove('on');$('modal').addEventListener('click',e=>{if(e.target.id==='modal')$('modal').classList.remove('on');});
$('sfxSlider').oninput=e=>{const v=+e.target.value;$('sfxVal').textContent=v+'%';Sound.setSfx(v/100);LS('sfx',v);};
$('musSlider').oninput=e=>{const v=+e.target.value;$('musVal').textContent=v+'%';Sound.setMus(v/100);LS('mus',v);};$('sfxSlider').onchange=()=>Sound.pick();
document.querySelectorAll('.langBtn').forEach(b=>b.onclick=()=>{App.lang=b.dataset.lang;applyLang();});
document.querySelectorAll('#themeRow .pillBtn').forEach(b=>b.onclick=()=>applyTheme(b.dataset.theme));
document.querySelectorAll('.setTabs .pillBtn').forEach(b=>b.onclick=()=>{const t=b.dataset.tab;document.querySelectorAll('.setTabs .pillBtn').forEach(x=>x.classList.toggle('on',x.dataset.tab===t));document.querySelectorAll('#modal .tabPanel').forEach(p=>p.classList.toggle('on',p.dataset.tabpanel===t));});
if(window.desktop&&window.desktop.isDesktop){$('displayRow').style.display='';$('tabDisplay').style.display='';
  let lastWin='max';
  function dispMode(m){$('dispFull').classList.toggle('on',m==='full');$('dispMax').classList.toggle('on',m==='max');$('dispWin').classList.toggle('on',m==='win');if(m!=='full')lastWin=m;}
  $('dispFull').onclick=()=>{window.desktop.setFullscreen(true);dispMode('full');};
  $('dispMax').onclick=()=>{window.desktop.maximize();dispMode('max');};
  $('dispWin').onclick=()=>{window.desktop.windowed();dispMode('win');};
  dispMode('max'); // window opens maximized by default
  if(window.desktop.onFullscreen)window.desktop.onFullscreen(on=>dispMode(on?'full':lastWin));}

/* version label (real installed version on desktop, fallback in browser) */
const VERSION=(window.desktop&&window.desktop.version)||'1.0.3';
if($('verTag'))$('verTag').textContent='v'+VERSION;

/* boot splash + in-game updater card */
let _splashDone=false;
function dismissSplash(){if(_splashDone)return;_splashDone=true;const sp=$('splash');if(sp)sp.classList.add('gone');}
function setTitleLock(locked){['btnCreate','btnJoinShow'].forEach(id=>{const b=$(id);if(b)b.disabled=!!locked;});}
if(window.desktop&&window.desktop.onUpdate){
  const upCard=$('updateCard');
  const showUp=()=>upCard.classList.add('on');
  const mb=n=>(n/1048576).toFixed(1);
  const fb=setTimeout(dismissSplash,5500); // fallback so the splash never hangs (offline/no events)
  window.desktop.onUpdate.available(v=>{clearTimeout(fb);dismissSplash();setTitleLock(true);$('upIcon').textContent='⬇️';upCard.classList.remove('ready');$('upVer').textContent=v?('v'+v):'';$('upBar').style.width='0%';$('upPct').style.display='';$('upPct').textContent='0%';$('upRestart').style.display='none';showUp();});
  window.desktop.onUpdate.progress(p=>{clearTimeout(fb);dismissSplash();setTitleLock(true);const pct=Math.max(0,Math.min(100,Math.round((p&&p.percent)||0)));$('upBar').style.width=pct+'%';$('upPct').textContent=(p&&p.total)?(pct+'% · '+mb(p.transferred)+'/'+mb(p.total)+' MB'):(pct+'%');showUp();});
  window.desktop.onUpdate.ready(v=>{if(v)$('upVer').textContent='v'+v;upCard.classList.add('ready');$('upIcon').textContent='✅';$('upBar').style.width='100%';$('upPct').style.display='none';$('upRestart').style.display='';showUp();try{if(Sound.cheer)Sound.cheer();}catch(e){}});
  window.desktop.onUpdate.none(()=>{clearTimeout(fb);setTitleLock(false);dismissSplash();});
  $('upRestart').onclick=()=>{$('upRestart').textContent='…';window.desktop.restart();};
}else{
  setTimeout(dismissSplash,1200); // plain browser: brief splash then dismiss
}

/* boot */
function titleArt(){const t2=$('titleCv'),c=t2.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,t2.width,t2.height);c.drawImage(CHARBUF.efe,20,8,80,110);c.drawImage(CHARBUF.mogi,t2.width-100,8,80,110);c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--rose')||'#dd8b94';c.font='800 24px Baloo 2,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('VS',t2.width/2,60);}
window.addEventListener('load',()=>{buildChars();
  const th=LS('theme')||'wood';applyTheme(th);const lg=LS('lang');if(lg)App.lang=lg;const sv=LS('sfx'),mv=LS('mus');if(sv!=null){$('sfxSlider').value=sv;$('sfxVal').textContent=sv+'%';Sound.setSfx(sv/100);}if(mv!=null){$('musSlider').value=mv;$('musVal').textContent=mv+'%';}
  titleArt();applyLang();fitStage();Sound.setMus((mv!=null?mv:45)/100);Sound.setTrack('menu');if(!window.Peer)tStat(t('errNetLib'),'err');});
buildChars();applyTheme('wood');fitStage();


/* dev-only: expose key objects for debugging/verification (stripped from prod build) */
if (import.meta.env && import.meta.env.DEV) { try { Object.assign(window, { App, STR, GAMES, QUIZ, Net, Sound, t, applyLang, showDare }); } catch (e) {} }
