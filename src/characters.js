/* characters (Efe new hair) */
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.fill();}
function el(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();}
const CHARBUF={};
function drawEfe(c){const cx=32;
  c.fillStyle='rgba(0,0,0,.16)';el(c,cx,85,15,3.2);
  c.fillStyle='#3c4452';rr(c,cx-10,68,9,16,3);rr(c,cx+1,68,9,16,3);c.fillStyle='#2a2a30';rr(c,cx-11,82,10,5,2);rr(c,cx+1,82,10,5,2);
  c.fillStyle='#f4ecd7';rr(c,cx-15,44,30,26,7);c.fillStyle='#717784';rr(c,cx-15,50,9,20,5);rr(c,cx+6,50,9,20,5);
  c.beginPath();c.moveTo(cx-15,52);c.lineTo(cx-15,68);c.quadraticCurveTo(cx,72,cx+15,68);c.lineTo(cx+15,52);c.quadraticCurveTo(cx-6,50,cx-9,46);c.closePath();c.fill();
  c.fillStyle='#5a6070';rr(c,cx+7,52,6,18,4);c.fillStyle='#f4ecd7';c.beginPath();c.moveTo(cx-7,46);c.lineTo(cx+7,46);c.lineTo(cx,60);c.closePath();c.fill();
  c.fillStyle='#2f333a';el(c,cx,54,1.3,1.3);el(c,cx,60,1.3,1.3);c.fillStyle='#f4ecd7';rr(c,cx-18,47,7,17,3);rr(c,cx+11,47,7,17,3);c.fillStyle='#f6cda3';el(c,cx-14.5,64,3,3);el(c,cx+14.5,64,3,3);
  c.fillStyle='#e3ad82';rr(c,cx-4,39,8,8,2);
  c.fillStyle='#4a3015';el(c,cx,22,17.5,15);
  c.fillStyle='#f6cda3';el(c,cx,28,15,16.5);c.fillStyle='#f6cda3';el(c,cx-14.5,30,2.4,3.2);el(c,cx+14.5,30,2.4,3.2);c.fillStyle='#f0b896';el(c,cx-8,34,3,1.9);el(c,cx+8,34,3,1.9);
  // fuller side-swept hair
  c.fillStyle='#4a3015';rr(c,cx-15.5,21,4,12,2);rr(c,cx+11.5,21,4,12,2);
  c.beginPath();c.moveTo(cx-16,27);c.quadraticCurveTo(cx-19,5,cx+1,4);c.quadraticCurveTo(cx+19,5,cx+16,26);c.quadraticCurveTo(cx+11,16,cx+5,19);c.quadraticCurveTo(cx-2,13,cx-9,19);c.quadraticCurveTo(cx-13,15,cx-16,27);c.closePath();c.fill();
  c.fillStyle='#6b4422';c.beginPath();c.moveTo(cx-15,24);c.quadraticCurveTo(cx-12,8,cx+3,9);c.quadraticCurveTo(cx+15,10,cx+15,23);c.quadraticCurveTo(cx+10,15,cx+4,18);c.quadraticCurveTo(cx-3,13,cx-9,19);c.quadraticCurveTo(cx-12,15,cx-15,24);c.closePath();c.fill();
  c.strokeStyle='#4a3015';c.lineWidth=1;c.beginPath();c.moveTo(cx-8,20);c.quadraticCurveTo(cx-7,12,cx-2,10);c.moveTo(cx,18);c.quadraticCurveTo(cx+2,11,cx+8,11);c.moveTo(cx+8,18);c.quadraticCurveTo(cx+11,12,cx+13,14);c.stroke();
  c.fillStyle='#8f6230';c.save();c.translate(cx,0);c.rotate(-0.18);rr(c,-7,8,2.2,8,1);rr(c,0,7,2.2,8,1);rr(c,7,8,1.8,7,1);c.restore();
  c.fillStyle='#b08850';c.save();c.translate(cx,0);c.rotate(-0.18);rr(c,-6.5,8,0.9,6,.5);rr(c,0.5,7,0.9,6,.5);c.restore();
  c.fillStyle='#4a2f18';rr(c,cx-10,24,7,1.9,1);rr(c,cx+3,24,7,1.9,1);
  c.fillStyle='#fbf7ef';el(c,cx-7,29,3.4,3.8);el(c,cx+7,29,3.4,3.8);c.fillStyle='#6e4d2e';el(c,cx-6.6,29.6,2.2,2.7);el(c,cx+7.4,29.6,2.2,2.7);
  c.fillStyle='#2a1a10';el(c,cx-6.6,29.9,1.1,1.4);el(c,cx+7.4,29.9,1.1,1.4);c.fillStyle='#fff';el(c,cx-7.6,28.2,.9,.9);el(c,cx+6.4,28.2,.9,.9);
  c.fillStyle='#e3ad82';rr(c,cx-1,33,2,3,1);c.strokeStyle='#b56a55';c.lineWidth=1.5;c.beginPath();c.arc(cx,36.5,3.6,0.18*Math.PI,0.82*Math.PI);c.stroke();}
function drawMogi(c){const cx=32;
  c.fillStyle='rgba(0,0,0,.16)';el(c,cx,85,15,3.2);
  c.fillStyle='#e8bd92';rr(c,cx-8,70,7,14,3);rr(c,cx+1,70,7,14,3);c.fillStyle='#2a2a30';rr(c,cx-9,82,8,5,2);rr(c,cx+1,82,8,5,2);
  c.fillStyle='#3a3a46';c.beginPath();c.moveTo(cx-13,62);c.lineTo(cx+13,62);c.lineTo(cx+17,74);c.lineTo(cx-17,74);c.closePath();c.fill();
  c.fillStyle='#1c1420';el(c,cx,25,19,18);c.fillStyle='#2a1f2e';[[-16,46],[-13,54],[16,46],[13,54]].forEach(p=>el(c,cx+p[0],p[1],7,8));el(c,cx-18,40,6,9);el(c,cx+18,40,6,9);
  c.fillStyle='#d3d8df';rr(c,cx-15,46,30,20,7);c.fillStyle='#b9bfc8';rr(c,cx+3,48,11,16,5);c.fillStyle='#49b39c';rr(c,cx-9,46,18,3.2,1.6);
  c.fillStyle='#f3f6fa';[[-8,52],[2,50],[7,56],[-3,58],[9,52]].forEach(p=>el(c,cx+p[0],p[1],1.1,1.1));
  c.fillStyle='#d3d8df';rr(c,cx-18,47,6,11,3);rr(c,cx+12,47,6,11,3);c.fillStyle='#e8bd92';rr(c,cx-18,56,5,9,2);rr(c,cx+13,56,5,9,2);
  c.fillStyle='#dba87a';rr(c,cx-4,40,8,8,2);c.fillStyle='#e8bd92';el(c,cx,28,14.5,16);c.fillStyle='#e8bd92';el(c,cx-14,30,2.4,3.2);el(c,cx+14,30,2.4,3.2);
  c.fillStyle='#2a1f2e';c.beginPath();c.moveTo(cx-15,30);c.quadraticCurveTo(cx-18,10,cx-5,7);c.lineTo(cx-5,15);c.quadraticCurveTo(cx-11,17,cx-12,44);c.quadraticCurveTo(cx-16,40,cx-15,30);c.closePath();c.fill();
  c.beginPath();c.moveTo(cx+15,30);c.quadraticCurveTo(cx+18,10,cx+5,7);c.lineTo(cx+5,15);c.quadraticCurveTo(cx+11,17,cx+12,44);c.quadraticCurveTo(cx+16,40,cx+15,30);c.closePath();c.fill();
  c.fillStyle='#e0473a';c.beginPath();c.moveTo(cx-15,16);c.quadraticCurveTo(cx,3,cx+15,16);c.quadraticCurveTo(cx,9.5,cx-15,16);c.closePath();c.fill();
  c.fillStyle='#f06a5b';for(let i=-13;i<=13;i+=3.6)el(c,cx+i,10+Math.abs(i)*0.16,1.5,1.3);
  c.fillStyle='#b53026';c.beginPath();c.moveTo(cx-15,16);c.quadraticCurveTo(cx,11.5,cx+15,16);c.quadraticCurveTo(cx,13.5,cx-15,16);c.closePath();c.fill();
  c.fillStyle='rgba(240,150,130,.55)';el(c,cx-8,33.5,2.6,1.7);el(c,cx+8,33.5,2.6,1.7);
  c.fillStyle='#3a2a28';rr(c,cx-9.5,23.5,6,1.7,.9);rr(c,cx+3.5,23.5,6,1.7,.9);
  c.fillStyle='#fbf7ef';el(c,cx-6.8,29,3.4,3.9);el(c,cx+6.8,29,3.4,3.9);c.fillStyle='#5a3a2e';el(c,cx-6.4,29.7,2.3,2.9);el(c,cx+7.2,29.7,2.3,2.9);
  c.fillStyle='#1a1012';el(c,cx-6.4,30,1.2,1.5);el(c,cx+7.2,30,1.2,1.5);c.fillStyle='#fff';el(c,cx-7.4,28.1,1,1);el(c,cx+6.2,28.1,1,1);
  c.fillStyle='#dba87a';rr(c,cx-1,33,2,2.6,1);c.strokeStyle='#d2606a';c.lineWidth=1.6;c.beginPath();c.arc(cx,36,3,0.1*Math.PI,0.9*Math.PI);c.stroke();c.fillStyle='#e98a94';el(c,cx,36.6,2,0.9);}
function buildChars(){['efe','mogi'].forEach(who=>{const b=document.createElement('canvas');b.width=64;b.height=88;const c=b.getContext('2d');c.imageSmoothingEnabled=false;(who==='efe'?drawEfe:drawMogi)(c);CHARBUF[who]=b;});}
function blitChar(ctx,who,x,y,s){ctx.drawImage(CHARBUF[who],Math.round(x-32*s),Math.round(y-88*s),Math.round(64*s),Math.round(88*s));}
function avatarTo(cv2,who){const c=cv2.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,cv2.width,cv2.height);c.drawImage(CHARBUF[who],0,0,cv2.width,cv2.height);}

export { rr, el, CHARBUF, drawEfe, drawMogi, buildChars, blitChar, avatarTo };
