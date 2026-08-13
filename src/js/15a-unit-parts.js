/* =======================================================================
   15. RAJZOLÁS — EGYSÉGEK

   Az egységek 3/4-es nézetben, álló figuraként jelennek meg, hogy
   illeszkedjenek az épületek homlokzatos stílusához. A nézési irányból
   három póz készül — szemből, hátulról és oldalról —, az oldalirányúak
   tükrözve, így nyolc irány néz ki természetesen.

   Minden figura ugyanabból az alaktanból épül fel (láb, törzs, kar, fej),
   erre kerül a korszak és a szerep szerinti egyenruha, fejfedő és fegyver.
   A nemzeti szín a kabáton és a pajzson jelenik meg; a 20. században
   terepszínűvé tompul, és csak a sisakjelzés marad élénk.
   ===================================================================== */

/* --- Szövetséges jelölés ---
   Több félnél mindenki a saját csapatszínét viseli, de a színből még nem
   derül ki, ki a barát. A szövetséges egységek és épületek fölé ezért egy
   apró világos ék kerül — a sajátodra és az ellenségére nem.

   Miért ék, és nem szín? A színek már foglaltak (tíz fél), a színvakbarát
   módban pedig épp a szín az, amiben nem lehet bízni. Az alak minden
   beállításnál olvasható. */
function drawSzovetsegJel(e,x,y){
  if(typeof szovetsegesFel!=='function'||!szovetsegesFel(e.owner)) return;
  ctx.save();
  ctx.fillStyle='rgba(235,228,205,.9)';
  ctx.strokeStyle='rgba(20,16,10,.65)';
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x,y+5); ctx.lineTo(x-4.5,y-2); ctx.lineTo(x+4.5,y-2);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawHpBar(e,x,y,w){
  drawSzovetsegJel(e,x,y-6);
  if(e.hp>=e.maxHp-0.5&&!(e.kind==='unit'&&G.sel.includes(e))) return;
  const p=clamp(e.hp/e.maxHp,0,1);
  ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(x-w/2,y,w,4);
  ctx.fillStyle=p>.5?'#5c9e4a':(p>.25?'#c9a227':'#c0392b');
  ctx.fillRect(x-w/2+0.5,y+0.5,(w-1)*p,3);
}

/* ---------- szín-segédek ---------- */
function parseCol(c){
  if(c[0]==='#'){const n=parseInt(c.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}
  const m=c.match(/\d+/g); return [+m[0],+m[1],+m[2]];
}
function mix(a,b,t){
  const A=parseCol(a),B=parseCol(b);
  return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')';
}
const SKIN=['#e3b78e','#d3a377','#c08f63','#eec49f'];
// A figurákat sprite-vászonra is rajzoljuk, ezért a kontextus cserélhető
let UX=ctx;
const STEEL='#c3c8ce', STEEL_D='#7d848c', LEATHER='#6b4a2c', DARKW='#4a3a26';

/* ---------- nézési irány -> póz ---------- */
function poseOf(face){
  const a=((face%TAU)+TAU)%TAU;           // 0 = jobbra, PI/2 = a néző felé
  const s=Math.round(a/(TAU/8))%8;        // 0:K 1:DK 2:D 3:DNy 4:Ny 5:ÉNy 6:É 7:ÉK
  if(s===0) return {p:'side',f:1};
  if(s===1) return {p:'front',f:1};
  if(s===2) return {p:'front',f:1};
  if(s===3) return {p:'front',f:-1};
  if(s===4) return {p:'side',f:-1};
  if(s===5) return {p:'back',f:-1};
  if(s===6) return {p:'back',f:1};
  return {p:'back',f:1};
}
// A "előre" irány a pózhoz képest: hova mutasson a fegyver
function fwd(pose){ return pose==='side'?{x:1,y:0.05}:(pose==='front'?{x:0.72,y:0.5}:{x:0.72,y:-0.5}); }

/* ---------- közös testrészek (a kontextus már a talpponthoz igazítva) -- */
function partLegs(pose,phase,moving,trouser,boot){
  const sw=moving?Math.sin(phase)*3.2:0;
  if(pose==='side'){
    UX.fillStyle=shade(trouser,-0.3);  UX.fillRect(-1.7-sw,-5,3.4,7.6);
    UX.fillStyle=shade(boot,-0.25);    UX.fillRect(-2.4-sw,1.4,4.8,2.6);
    UX.fillStyle=trouser;              UX.fillRect(-1.7+sw,-5,3.4,7.6);
    UX.fillStyle=boot;                 UX.fillRect(-2.4+sw,1.4,5,2.8);
  }else{
    const o=moving?Math.abs(Math.sin(phase))*1.4:0;
    UX.fillStyle=shade(trouser,-0.25); UX.fillRect(-3.7,-5,3.3,7.6-o);
    UX.fillStyle=shade(boot,-0.2);     UX.fillRect(-4.1,1.2-o,4.2,2.6);
    UX.fillStyle=trouser;              UX.fillRect(0.4,-5,3.3,7.6+o*0.5);
    UX.fillStyle=boot;                 UX.fillRect(0,1.4+o*0.5,4.2,2.7);
  }
}
// A kabát színe a nemzet egyenruha-palettájából jön, a csapatszínnel
// keverve: így a magyar huszár vörös, a porosz kék, a brit vöröskabátos —
// de a két fél azért ránézésre is elkülönül.
function coatOf(owner,age,col){
  const nk=(typeof nationOf==='function')?nationOf(owner):(owner?(G.ai&&G.ai.nation||'de'):G.nation);
  const u=NATIONS[nk]&&NATIONS[nk].uni;
  return u?mix(u[age],col,0.30):col;
}
function partTorso(pose,age,coat,trim){
  const hw=pose==='side'?3.3:4.2;                // oldalról keskenyebb sziluett
  UX.fillStyle=coat;
  if(age===1){                                   // bő szoknyájú kabát
    UX.beginPath(); UX.moveTo(-hw,-12.4); UX.lineTo(hw,-12.4);
    UX.lineTo(hw+1.4,-1.2); UX.lineTo(-hw-1.4,-1.2); UX.closePath(); UX.fill();
    UX.fillStyle=trim;                          // hajtóka
    UX.beginPath(); UX.moveTo(-4.4,-12.4); UX.lineTo(-1.4,-12.4); UX.lineTo(-2.6,-4); UX.lineTo(-4.9,-4); UX.closePath(); UX.fill();
    UX.beginPath(); UX.moveTo(4.4,-12.4); UX.lineTo(1.4,-12.4); UX.lineTo(2.6,-4); UX.lineTo(4.9,-4); UX.closePath(); UX.fill();
  }else if(age===2){                             // testhezálló zubbony
    UX.fillRect(-hw,-12.4,hw*2,9.4);
    UX.fillStyle=shade(coat,-0.22); UX.fillRect(-hw-0.5,-4,hw*2+1,3.2);
  }else{
    UX.fillRect(-hw,-12.4,hw*2,10.4);
  }
  UX.fillStyle='rgba(255,255,255,.10)'; UX.fillRect(-hw,-12.4,hw*2,1.6);
  UX.fillStyle='rgba(0,0,0,.20)';       UX.fillRect(hw-1.8,-12.4,1.9,10);
  if(pose==='back'){ UX.fillStyle='rgba(0,0,0,.16)'; UX.fillRect(-hw,-12.4,hw*2,10); }
}
function partHead(pose,skin,age){
  UX.fillStyle=skin;
  UX.beginPath(); UX.arc(0,-15.4,3.9,0,TAU); UX.fill();
  UX.fillStyle='rgba(0,0,0,.18)';
  UX.beginPath(); UX.arc(1.4,-15.4,3.9,-1.1,1.1); UX.fill();
  if(pose==='front'){
    UX.fillStyle='#2b1d14';
    UX.fillRect(-2,-15.1,1.2,1.2); UX.fillRect(0.8,-15.1,1.2,1.2);
    UX.fillStyle='rgba(90,50,35,.5)'; UX.fillRect(-1,-13.2,2,0.8);
  }else if(pose==='back'){
    UX.fillStyle=shade(skin,-0.45);                     // tarkó
    UX.beginPath(); UX.arc(0,-15.6,3.7,0,TAU); UX.fill();
  }else{
    UX.fillStyle='#2b1d14'; UX.fillRect(1.6,-15.1,1.2,1.2);
    UX.fillStyle=shade(skin,-0.3); UX.beginPath(); UX.arc(-1.7,-15.2,3.3,0,TAU); UX.fill();
    UX.fillStyle=skin; UX.beginPath(); UX.arc(2.6,-14.2,1.1,0,TAU); UX.fill();   // orr
  }
}
function partArm(pose,ang,len,sleeve,hand){    // váll-kar a fegyver irányába
  const f=fwd(pose);
  const sx=1.2, sy=-10.6;
  UX.save(); UX.translate(sx,sy); UX.rotate(ang);
  UX.fillStyle=sleeve; UX.fillRect(0,-1.5,len,3);
  UX.fillStyle=hand||'#d9a97e'; UX.beginPath(); UX.arc(len,0,1.6,0,TAU); UX.fill();
  UX.restore();
  return {x:sx,y:sy,f:f};
}
function muzzleFlash(x,y,ang,size){
  UX.save(); UX.translate(x,y); UX.rotate(ang);
  UX.fillStyle='rgba(255,232,150,.95)';
  UX.beginPath(); UX.moveTo(0,0); UX.lineTo(size*1.7,-size*0.55);
  UX.lineTo(size*2.4,0); UX.lineTo(size*1.7,size*0.55); UX.closePath(); UX.fill();
  UX.fillStyle='rgba(255,180,60,.75)';
  UX.beginPath(); UX.arc(size*0.7,0,size*0.75,0,TAU); UX.fill();
  UX.restore();
}
function powderSmoke(x,y,ang,t){
  const n=3;
  for(let i=0;i<n;i++){
    const k=t+i*0.18;
    if(k>1) continue;
    UX.fillStyle='rgba(228,226,215,'+(0.5*(1-k))+')';
    UX.beginPath();
    UX.arc(x+Math.cos(ang)*(5+k*11), y+Math.sin(ang)*(5+k*11)-k*3, 1.8+k*4.2, 0, TAU);
    UX.fill();
  }
}
