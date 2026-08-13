/* ---------- MUNKÁS ---------- */
function paintWorker(u,pose,phase,moving,busy,col,acc){
  const shirt=['#9a7b52','#8f7350','#7d7266','#6f6a52'][u.age];
  const trouser=['#6b5233','#655236','#4f4a44','#585441'][u.age];
  const boot=['#4a3524','#4a3524','#3b3630','#3f3b30'][u.age];
  partLegs(pose,phase,moving,trouser,boot);
  const hw=pose==='side'?3.3:4;
  UX.fillStyle=shirt; UX.fillRect(-hw,-12,hw*2,9.6);        // ing / kötény
  UX.fillStyle='rgba(255,255,255,.10)'; UX.fillRect(-hw,-12,hw*2,1.4);
  if(u.age>=2){                                               // nadrágtartó
    UX.fillStyle=shade(trouser,-0.3);
    UX.fillRect(-2.4,-12,1.2,9); UX.fillRect(1.2,-12,1.2,9);
  }else{
    UX.fillStyle=LEATHER; UX.fillRect(-hw,-5.4,hw*2,1.8);   // öv
  }
  UX.fillStyle=col; UX.fillRect(-hw,-11.4,hw*2,1.5);        // nemzeti szegély
  // hátizsák a nyersanyagnak
  if(u.carry>0){
    const c=u.carryType==='wood'?'#7a5230':(u.carryType==='stone'?'#9a9ca0':'#d4af37');
    UX.fillStyle='#8a6a45';
    UX.beginPath(); UX.ellipse(pose==='back'?0:-4.4,-9.5,3.2,3.8,0.2,0,TAU); UX.fill();
    UX.fillStyle=c;
    UX.beginPath(); UX.ellipse(pose==='back'?0:-4.4,-10.6,2.4,1.8,0.2,0,TAU); UX.fill();
  }
  // szerszám: gyűjtéskor csapkod
  const swing=busy?Math.sin(u.walk)*0.8-0.5:-0.9;
  const arm=partArm(pose,swing,5,shirt);
  const f=fwd(pose);
  UX.save(); UX.translate(arm.x,arm.y); UX.rotate(swing);
  UX.strokeStyle=DARKW; UX.lineWidth=1.5;
  UX.beginPath(); UX.moveTo(1,0); UX.lineTo(9,0); UX.stroke();
  UX.fillStyle=u.age<2?'#b7bcc2':'#8f959b';
  if(u.age<2){ UX.beginPath(); UX.moveTo(8,-3.4); UX.lineTo(11.5,-1); UX.lineTo(8,1.6); UX.closePath(); UX.fill(); }
  else { UX.fillRect(8.4,-3.6,1.7,7.2); UX.fillRect(8.4,-0.9,3.4,1.8); }
  UX.restore();
  partHead(pose,SKIN[1],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
  // fejfedő
  if(u.age<2){                                                // szalmakalap / csuklya
    UX.fillStyle='#c4a55c';
    UX.beginPath(); UX.ellipse(0,-18,4.2,1.6,0,0,TAU); UX.fill();
    UX.fillStyle='#b0914a';
    UX.beginPath(); UX.ellipse(0,-18.9,2.7,1.9,0,0,TAU); UX.fill();
    UX.fillStyle='rgba(0,0,0,.16)';
    UX.beginPath(); UX.ellipse(0,-17.6,4.2,1,0,0,Math.PI); UX.fill();
  }else{                                                      // svájcisapka
    UX.fillStyle='#4a4a44';
    UX.beginPath(); UX.ellipse(0,-18.2,3.9,2.3,0,Math.PI,TAU); UX.fill();
    UX.fillRect(-3.9,-18.4,7.8,1.5);
    UX.fillStyle='#38382f'; UX.fillRect(pose==='back'?-3:0.6,-17.6,3.6,1.1);
  }
}

/* ---------- KÖZELHARCI EGYSÉG ---------- */
function paintMelee(u,pose,phase,moving,fired,col,acc){
  const f=fwd(pose);
  if(u.age===0){                                   /* --- Lovag --- */
    partLegs(pose,phase,moving,STEEL_D,'#4b423a');
    const hw=pose==='side'?3.3:4.2;
    UX.fillStyle=col; UX.fillRect(-hw,-12.6,hw*2,10.4);           // nemzeti színű waffenrock
    UX.fillStyle=shade(col,-0.3); UX.fillRect(-hw,-4.2,hw*2,2);
    UX.fillStyle=acc; UX.fillRect(-hw,-8.6,hw*2,1.6);             // heraldikai sáv
    UX.fillStyle=STEEL;                                            // vállvért
    UX.fillRect(-hw-1,-12.6,hw*2+2,2.8);
    UX.fillStyle='rgba(255,255,255,.3)'; UX.fillRect(-hw-1,-12.6,hw*2+2,1);
    UX.fillStyle=shade(STEEL,-0.25); UX.fillRect(-hw-1,-10,hw*2+2,0.9);
    UX.fillStyle=STEEL_D; UX.fillRect(-hw,-6.2,hw*2,1.5);         // öv
    // kard, előre-lefelé tartva
    const sw=fired?-1.15:0.18;
    partArm(pose,sw,4.6,STEEL);
    UX.save(); UX.translate(1.2,-10.6); UX.rotate(sw);
    UX.fillStyle='#c6ccd3'; UX.fillRect(4.6,-0.8,7.4,1.6);
    UX.fillStyle='#eef2f6'; UX.fillRect(4.6,-0.8,7.4,0.6);
    UX.fillStyle='#8a6a2a'; UX.fillRect(4.2,-2.4,1.4,4.8);
    UX.restore();
    // pajzs
    UX.fillStyle=shade(col,-0.3);                                  // pajzs
    UX.beginPath(); UX.moveTo(-6.2,-11.2); UX.lineTo(-2.4,-11.2);
    UX.lineTo(-2.4,-6); UX.quadraticCurveTo(-4.3,-3.9,-6.2,-6); UX.closePath(); UX.fill();
    UX.strokeStyle=shade(col,-0.55); UX.lineWidth=0.9; UX.stroke();
    UX.fillStyle=acc; UX.fillRect(-5,-10.2,1.5,3.6);
    partHead(pose,SKIN[0],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle=STEEL;                                            // csöbörsisak
    UX.beginPath(); UX.arc(0,-16.9,3.5,Math.PI,TAU); UX.fill();
    UX.fillRect(-3.5,-16.9,7,3.4);
    UX.fillStyle='rgba(255,255,255,.3)';
    UX.beginPath(); UX.arc(-1.2,-17.4,2.4,Math.PI,TAU*0.85); UX.fill();
    UX.fillStyle=shade(STEEL,-0.3); UX.fillRect(-3.5,-13.8,7,0.8);
    if(pose!=='back'){ UX.fillStyle='#1b1a18'; UX.fillRect(-2.8,-15.8,5.6,1.2);
      UX.fillStyle=shade(STEEL,-0.15); UX.fillRect(-0.5,-16.9,1,3.4); }
    UX.fillStyle=acc;                                              // sisakforgó
    UX.beginPath(); UX.moveTo(0,-20.6); UX.quadraticCurveTo(-3.4,-22.4,-4.6,-18.4);
    UX.quadraticCurveTo(-2.4,-19.6,0,-19); UX.closePath(); UX.fill();
  }
  else if(u.age===1){                              /* --- Kürasszír --- */
    partLegs(pose,phase,moving,'#d8cfc0','#3a3128');
    UX.fillStyle='#3a3128'; UX.fillRect(-4,-5.6,8,4.6);           // csizmaszár
    partTorso(pose,1,coatOf(u.owner,1,col),acc);
    const hw1=pose==='side'?2.6:3.4;
    UX.fillStyle=STEEL;                                            // mellvért
    UX.beginPath(); UX.moveTo(-hw1,-12.4); UX.lineTo(hw1,-12.4);
    UX.lineTo(hw1-0.8,-5.2); UX.lineTo(-hw1+0.8,-5.2); UX.closePath(); UX.fill();
    UX.fillStyle='rgba(255,255,255,.3)'; UX.fillRect(-hw1+0.4,-12,1.6,6.4);
    UX.fillStyle='rgba(0,0,0,.2)'; UX.fillRect(hw1-1.4,-12,1.4,6.4);
    UX.fillStyle='#efe9d8'; UX.save();                            // vállszíj
    UX.translate(0,-8.4); UX.rotate(-0.6); UX.fillRect(-5,-1.1,10,2.2); UX.restore();
    const sw=fired?-1.4:-0.35;
    partArm(pose,sw,4.4,col);
    UX.save(); UX.translate(1.2,-10.6); UX.rotate(sw);
    UX.strokeStyle='#dfe4e9'; UX.lineWidth=1.7;                   // szablya
    UX.beginPath(); UX.moveTo(4.6,0.6); UX.quadraticCurveTo(10,-2.4,14.4,-0.4); UX.stroke();
    UX.fillStyle='#c9a227'; UX.beginPath(); UX.arc(4.2,0.8,1.5,0,TAU); UX.fill();
    UX.restore();
    partHead(pose,SKIN[0],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle=STEEL_D;                                          // acélsisak
    UX.beginPath(); UX.arc(0,-17.2,4,Math.PI,TAU); UX.fill();
    UX.fillStyle=STEEL; UX.beginPath(); UX.ellipse(0,-17,4.8,1.4,0,0,TAU); UX.fill();
    UX.fillStyle='rgba(255,255,255,.3)';
    UX.beginPath(); UX.arc(-1.2,-17.7,2.6,Math.PI,TAU*0.85); UX.fill();
    UX.fillStyle=acc;
    UX.beginPath(); UX.moveTo(0,-21); UX.quadraticCurveTo(4,-22.2,5,-17.8);
    UX.quadraticCurveTo(2.4,-19.6,0,-19.6); UX.closePath(); UX.fill();
  }
  else{                                            /* --- Gránátos --- */
    partLegs(pose,phase,moving,'#e2ddd0','#2f2b25');
    UX.fillStyle='#2f2b25'; UX.fillRect(-4,-5.2,8,4.2);
    partTorso(pose,2,coatOf(u.owner,2,col),acc);
    UX.fillStyle='#efe9d8'; UX.save();                            // keresztbe vetett szíjak
    UX.translate(0,-8.6); UX.rotate(-0.62); UX.fillRect(-5.2,-1.1,10.4,2.2); UX.restore();
    UX.save(); UX.translate(0,-8.6); UX.rotate(0.62); UX.fillRect(-5.2,-1.1,10.4,2.2); UX.restore();
    UX.fillStyle=acc; UX.fillRect(-4.6,-12.6,2.6,2);              // vállrojt
    UX.fillRect(2,-12.6,2.6,2);
    const sw=fired?-1.9:-0.75;
    partArm(pose,sw,4.6,col);
    UX.save(); UX.translate(1.2,-10.6); UX.rotate(sw);
    UX.fillStyle=DARKW; UX.fillRect(3.4,-1,8.6,2);                // puskatus
    UX.fillStyle='#3c4046'; UX.fillRect(10,-0.7,4.6,1.4);         // cső
    UX.fillStyle='#dfe4e9'; UX.fillRect(14.4,-0.5,4.4,1);         // szurony
    UX.restore();
    partHead(pose,SKIN[2],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle='#2a2620';                                        // medvebőr süveg
    UX.beginPath(); UX.ellipse(0,-19.8,4,4.4,0,0,TAU); UX.fill();
    UX.fillStyle='#3a352c';
    UX.beginPath(); UX.ellipse(-1.2,-20.6,2.3,2.6,0,0,TAU); UX.fill();
    UX.fillStyle=col; UX.fillRect(-4,-17.2,8,1.7);                // homlokpánt
    UX.fillStyle=acc; UX.beginPath(); UX.arc(0,-16.4,1.4,0,TAU); UX.fill();
  }
}

/* ---------- TÁVOLSÁGI EGYSÉG ---------- */
function paintRanged(u,pose,phase,moving,fired,fireT,col,acc){
  const f=fwd(pose);
  if(u.age===0){                                   /* --- Íjász --- */
    partLegs(pose,phase,moving,'#6b5233','#4a3524');
    const hw=pose==='side'?3.3:4;
    UX.fillStyle=col; UX.fillRect(-hw,-12.2,hw*2,10);             // tunika
    UX.fillStyle=shade(col,-0.25); UX.fillRect(-hw,-4.4,hw*2,2);
    UX.fillStyle=LEATHER; UX.fillRect(-hw,-9.6,hw*2,1.6);         // szíj
    UX.fillStyle=shade(col,-0.4); UX.fillRect(hw-1.6,-12.2,1.6,10);
    UX.fillStyle='#7a5230'; UX.save();                            // tegez
    UX.translate(pose==='back'?0:-4.6,-9.4); UX.rotate(0.35);
    UX.fillRect(-1.6,-4,3.2,8);
    UX.fillStyle='#e6dcc0'; UX.fillRect(-1.2,-6,0.8,2.4); UX.fillRect(0.2,-6.2,0.8,2.4);
    UX.restore();
    // íj, kifeszítve lövés előtt
    const draw=fired?0.9:0.3;
    UX.save(); UX.translate(2.6,-9.8);
    UX.strokeStyle='#7a5230'; UX.lineWidth=1.5;
    UX.beginPath(); UX.arc(2.6,0,6.4,-1.25,1.25); UX.stroke();
    UX.strokeStyle='#e8dfc4'; UX.lineWidth=0.7;
    UX.beginPath(); UX.moveTo(4.6,-6.1); UX.lineTo(4.6-draw*4,0); UX.lineTo(4.6,6.1); UX.stroke();
    if(!fired){ UX.strokeStyle='#c9b27a'; UX.lineWidth=0.9;
      UX.beginPath(); UX.moveTo(4.6-draw*4,0); UX.lineTo(11,0); UX.stroke(); }
    UX.restore();
    partArm(pose,-0.15,4,col);
    partHead(pose,SKIN[1],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle=shade(col,-0.35);                                 // csuklya
    UX.beginPath(); UX.arc(0,-16.6,4.2,Math.PI,TAU); UX.fill();
    UX.fillRect(-4.2,-16.6,8.4,1.9);
    UX.fillStyle=shade(col,-0.5);
    UX.beginPath(); UX.moveTo(-4.2,-15.2); UX.lineTo(4.2,-15.2); UX.lineTo(2.4,-12.6); UX.lineTo(-2.4,-12.6); UX.closePath();
    if(pose==='back') UX.fill();
    UX.fillStyle=acc; UX.fillRect(-4.2,-15.1,8.4,1.1);
  }
  else if(u.age===1){                              /* --- Muskétás --- */
    partLegs(pose,phase,moving,'#d8cfc0','#3a3128');
    UX.fillStyle='#3a3128'; UX.fillRect(-4,-5.4,8,4.4);
    partTorso(pose,1,coatOf(u.owner,1,col),acc);
    UX.fillStyle='#efe9d8'; UX.save();                            // bandolier
    UX.translate(0,-8.6); UX.rotate(-0.6); UX.fillRect(-5.2,-1.2,10.4,2.4); UX.restore();
    UX.fillStyle='#8a6a2a';
    for(let i=0;i<3;i++){ UX.save(); UX.translate(-3+i*2.6,-9.6+i*1.6); UX.fillRect(-0.7,-1.3,1.4,2.6); UX.restore(); }
    const sw=-0.62;
    partArm(pose,sw,4.6,col);
    UX.save(); UX.translate(1.2,-10.6); UX.rotate(sw);
    UX.fillStyle=DARKW; UX.fillRect(2.6,-1.1,9,2.2);              // muskétatus
    UX.fillStyle='#3c4046'; UX.fillRect(9.6,-0.8,7.6,1.6);        // cső
    UX.fillStyle='#8a6a2a'; UX.fillRect(8.6,-1.6,1.6,3.2);        // kakas
    if(fired){ muzzleFlash(17.2,0,0,2.6); }
    UX.restore();
    partHead(pose,SKIN[0],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle='#2a2620';                                        // háromszögletű kalap
    UX.beginPath(); UX.ellipse(0,-17.8,5.4,2.1,0,0,TAU); UX.fill();
    UX.beginPath(); UX.moveTo(-5,-18); UX.quadraticCurveTo(0,-22.6,5,-18); UX.closePath(); UX.fill();
    UX.fillStyle='rgba(0,0,0,.25)';
    UX.beginPath(); UX.ellipse(0,-17.3,5.4,1.2,0,0,Math.PI); UX.fill();
    UX.fillStyle=acc; UX.fillRect(-4.6,-18.5,9.2,1.1);
    UX.fillStyle=col; UX.beginPath(); UX.arc(-3.8,-18.8,1.4,0,TAU); UX.fill();
  }
  else if(u.age===2){                              /* --- Puskás gyalogos --- */
    partLegs(pose,phase,moving,'#5b6070','#2f2b25');
    UX.fillStyle='#2f2b25'; UX.fillRect(-4,-5.2,8,4.2);
    partTorso(pose,2,coatOf(u.owner,2,col),acc);
    UX.fillStyle='#efe9d8'; UX.save();
    UX.translate(0,-8.6); UX.rotate(-0.62); UX.fillRect(-5.2,-1.1,10.4,2.2); UX.restore();
    if(pose==='back'){ UX.fillStyle='#6b5233'; UX.fillRect(-3.4,-11.6,6.8,6.4);  // borjú
      UX.fillStyle='#54402a'; UX.fillRect(-3.4,-9.4,6.8,1.2); }
    UX.fillStyle=acc; UX.fillRect(-4.6,-12.6,2.4,1.8); UX.fillRect(2.2,-12.6,2.4,1.8);
    const sw=fired?-0.5:-0.68;
    partArm(pose,sw,4.6,col);
    UX.save(); UX.translate(1.2,-10.6); UX.rotate(sw);
    UX.fillStyle=DARKW; UX.fillRect(2.6,-1,8.4,2);
    UX.fillStyle='#3c4046'; UX.fillRect(9.4,-0.7,8,1.4);
    UX.fillStyle='#5a5f66'; UX.fillRect(8.2,-1.8,1.4,1.4);
    if(fired) muzzleFlash(17.4,0,0,2.4);
    UX.restore();
    partHead(pose,SKIN[2],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle=shade(col,-0.5);                                  // csákó
    UX.fillRect(-3.7,-22.2,7.4,5.4);
    UX.fillStyle=shade(col,-0.34); UX.fillRect(-3.7,-22.2,2.2,5.4);
    UX.fillStyle='#1e1c19';                                        // ellenző
    UX.beginPath(); UX.ellipse(0,-16.8,4.4,1.5,0,0,TAU); UX.fill();
    UX.fillStyle=acc; UX.fillRect(-3.7,-18.6,7.4,1.4);
    UX.fillStyle='#d9c27a'; UX.beginPath(); UX.arc(0,-20.2,1.3,0,TAU); UX.fill();
    UX.fillStyle=col; UX.fillRect(-0.9,-25.4,1.8,3.4);            // forgó
  }
  else{                                            /* --- Géppuskás --- */
    const fieldC=mix(col,'#6e735a',0.62);
    partLegs(pose,phase,moving,fieldC,'#3a3a30');
    UX.fillStyle='#4a4a3c';                                        // lábszártekercs
    UX.fillRect(-4.1,-1.4,4.2,2.6); UX.fillRect(0,-1.4,4.2,2.6);
    partTorso(pose,3,fieldC,acc);
    UX.fillStyle=shade(fieldC,-0.3); UX.fillRect(-4.2,-6.4,8.4,1.8);  // derékszíj
    if(pose==='back'){ UX.fillStyle='#5a5a48'; UX.fillRect(-3.6,-11.8,7.2,6.6); }
    UX.fillStyle='#8a7f52';                                        // tölténytáskák
    UX.fillRect(-3.6,-7.4,2.6,2.4); UX.fillRect(1,-7.4,2.6,2.4);
    // géppuska állványon
    const sw=-0.12;
    partArm(pose,sw,4.2,fieldC);
    UX.save(); UX.translate(1.2,-10.2); UX.rotate(sw);
    UX.fillStyle='#33372f'; UX.fillRect(1.6,-1.3,13.5,2.6);
    UX.fillStyle='#3f443a'; UX.fillRect(13,-0.9,6.5,1.8);         // hűtőköpeny
    UX.fillStyle='#2b2f28'; UX.fillRect(19.5,-0.6,3.4,1.2);
    UX.strokeStyle='#3a3f36'; UX.lineWidth=1.2;                   // kétlábú állvány
    UX.beginPath(); UX.moveTo(13.6,1); UX.lineTo(15.8,5.4);
    UX.moveTo(13.6,1); UX.lineTo(11.4,5.4); UX.stroke();
    UX.fillStyle='#b9a45a';                                        // hevedertár
    UX.fillRect(4.6,1.2,7,2.2);
    if(fired) muzzleFlash(23,0,0,2.2);
    UX.restore();
    partHead(pose,SKIN[2],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle='#5a6152';                                        // acélsisak
    UX.beginPath(); UX.arc(0,-17.2,4.2,Math.PI,TAU); UX.fill();
    UX.beginPath(); UX.ellipse(0,-17.1,5.2,1.5,0,0,TAU); UX.fill();
    UX.fillStyle='rgba(255,255,255,.16)';
    UX.beginPath(); UX.arc(-1.4,-17.8,2.9,Math.PI,TAU*0.86); UX.fill();
    UX.fillStyle='rgba(0,0,0,.22)';
    UX.beginPath(); UX.ellipse(0,-16.6,5.2,1,0,0,Math.PI); UX.fill();
    UX.fillStyle=col; UX.fillRect(-4,-18.6,2.1,1.3);              // nemzeti jelzés
  }
}

/* ---------- PIKÁS VONAL: lándzsa, alabárd, szurony, páncéltörő ---------- */
function paintSpear(u,pose,phase,moving,fired,fireT,col,acc){
  const hw=pose==='side'?3.3:4.1;
  if(u.age===0){                                   /* --- Pikás --- */
    partLegs(pose,phase,moving,'#6b5233','#4a3524');
    UX.fillStyle='#cfc4a8'; UX.fillRect(-hw,-12.4,hw*2,10.2);      // vászon gambeson
    UX.fillStyle=col; UX.fillRect(-hw,-12.4,hw*2,4.2);
    UX.fillStyle=shade(col,-0.3); UX.fillRect(-hw,-8.4,hw*2,1.4);
    UX.fillStyle=LEATHER; UX.fillRect(-hw,-5.6,hw*2,1.7);
    const lean=fired?-0.55:-0.3;
    partArm(pose,lean,4.4,'#cfc4a8');
    UX.save(); UX.translate(1.2,-10.6); UX.rotate(lean);          // hosszú pika
    UX.strokeStyle='#7a5230'; UX.lineWidth=1.7;
    UX.beginPath(); UX.moveTo(-9,2.6); UX.lineTo(20,-1.6); UX.stroke();
    UX.fillStyle='#d5d9de';
    UX.beginPath(); UX.moveTo(20,-1.6); UX.lineTo(27,-2.6); UX.lineTo(20.5,0.4); UX.closePath(); UX.fill();
    UX.restore();
    partHead(pose,SKIN[1],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle=STEEL;                                             // karimás vassisak
    UX.beginPath(); UX.ellipse(0,-17.4,5.4,1.9,0,0,TAU); UX.fill();
    UX.beginPath(); UX.arc(0,-17.6,3.4,Math.PI,TAU); UX.fill();
    UX.fillStyle='rgba(255,255,255,.28)';
    UX.beginPath(); UX.arc(-1.1,-18,2.2,Math.PI,TAU*0.85); UX.fill();
  }
  else if(u.age===1){                              /* --- Lándzsás (alabárd) --- */
    partLegs(pose,phase,moving,'#d8cfc0','#3a3128');
    UX.fillStyle='#3a3128'; UX.fillRect(-hw,-5.4,hw*2,4.4);
    partTorso(pose,1,coatOf(u.owner,1,col),acc);
    UX.fillStyle=STEEL; UX.fillRect(-hw,-12.4,hw*2,3);             // vállvért
    UX.fillStyle='rgba(255,255,255,.25)'; UX.fillRect(-hw,-12.4,hw*2,1);
    const lean=fired?-0.8:-0.42;
    partArm(pose,lean,4.4,col);
    UX.save(); UX.translate(1.2,-10.6); UX.rotate(lean);          // alabárd
    UX.strokeStyle='#6b4a2c'; UX.lineWidth=1.8;
    UX.beginPath(); UX.moveTo(-8,2.4); UX.lineTo(19,-1.4); UX.stroke();
    UX.fillStyle='#cfd4da';
    UX.beginPath(); UX.moveTo(19,-1.4); UX.lineTo(25.5,-2.2); UX.lineTo(19.6,0.2); UX.closePath(); UX.fill();
    UX.beginPath(); UX.moveTo(15.5,-1); UX.quadraticCurveTo(18,-7,13,-6.4);
    UX.lineTo(14,-1.2); UX.closePath(); UX.fill();
    UX.restore();
    partHead(pose,SKIN[0],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle=STEEL_D;                                           // morion sisak
    UX.beginPath(); UX.ellipse(0,-17.2,5.2,1.7,0,0,TAU); UX.fill();
    UX.beginPath(); UX.arc(0,-17.4,3.5,Math.PI,TAU); UX.fill();
    UX.fillStyle=STEEL; UX.fillRect(-0.7,-21.4,1.4,4.2);           // taréj
  }
  else if(u.age===2){                              /* --- Szuronyos gyalogos --- */
    partLegs(pose,phase,moving,'#4e5566','#2f2b25');
    UX.fillStyle='#2f2b25'; UX.fillRect(-hw,-5.2,hw*2,4.2);
    partTorso(pose,2,coatOf(u.owner,2,col),acc);
    UX.fillStyle='#efe9d8'; UX.save();
    UX.translate(0,-8.6); UX.rotate(-0.62); UX.fillRect(-5.2,-1.1,10.4,2.2); UX.restore();
    UX.fillStyle=acc; UX.fillRect(-hw-0.5,-12.6,2.3,1.8); UX.fillRect(hw-1.8,-12.6,2.3,1.8);
    const lean=fired?-0.95:-0.5;
    partArm(pose,lean,4.6,col);
    UX.save(); UX.translate(1.2,-10.6); UX.rotate(lean);          // puska hosszú szuronnyal
    UX.fillStyle=DARKW; UX.fillRect(1.6,-1,9.4,2);
    UX.fillStyle='#3c4046'; UX.fillRect(10.6,-0.7,5.4,1.4);
    UX.fillStyle='#e2e7ec'; UX.fillRect(15.8,-0.55,8.4,1.1);
    UX.fillStyle='#9aa1a8'; UX.fillRect(15.4,-1.4,1.4,2.8);
    UX.restore();
    partHead(pose,SKIN[2],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle=shade(col,-0.5);                                   // tányérsapka
    UX.beginPath(); UX.ellipse(0,-18.4,3.9,2.6,0,Math.PI,TAU); UX.fill();
    UX.fillRect(-3.9,-18.6,7.8,2.2);
    UX.fillStyle='#1e1c19';
    UX.beginPath(); UX.ellipse(0,-16.4,4.3,1.4,0,0,TAU); UX.fill();
    UX.fillStyle=acc; UX.fillRect(-3.9,-18.9,7.8,1.2);
  }
  else{                                            /* --- Páncéltörő --- */
    const fieldC=mix(col,'#6e735a',0.62);
    partLegs(pose,phase,moving,fieldC,'#3a3a30');
    UX.fillStyle='#4a4a3c'; UX.fillRect(-4.1,-1.4,4.2,2.6); UX.fillRect(0,-1.4,4.2,2.6);
    partTorso(pose,3,fieldC,acc);
    UX.fillStyle=shade(fieldC,-0.3); UX.fillRect(-hw,-6.4,hw*2,1.8);
    UX.fillStyle='#8a7f52'; UX.fillRect(-3.4,-7.4,2.5,2.3); UX.fillRect(0.9,-7.4,2.5,2.3);
    const lean=-0.34;
    partArm(pose,lean,4.2,fieldC);
    UX.save(); UX.translate(1.2,-11.2); UX.rotate(lean);          // vállra vett páncéltörő cső
    UX.fillStyle='#3a4036'; UX.fillRect(-7,-2.2,26,4.4);
    UX.fillStyle='#2c312a'; UX.fillRect(-9.5,-3.2,3.4,6.4);        // hátrafúvó vég
    UX.fillStyle='#4c5347'; UX.fillRect(6,-3.6,4.4,1.6);           // irányzék
    UX.fillStyle='#7a5230'; UX.fillRect(1,2.2,5,1.8);
    if(fired){ muzzleFlash(20,0,0,3);
      UX.fillStyle='rgba(220,200,170,.45)';                          // hátrafúvás
      UX.beginPath(); UX.arc(-14,0,5,0,TAU); UX.fill(); }
    UX.restore();
    partHead(pose,SKIN[2],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle='#5a6152';                                          // acélsisak
    UX.beginPath(); UX.arc(0,-17.2,4.2,Math.PI,TAU); UX.fill();
    UX.beginPath(); UX.ellipse(0,-17.1,5.2,1.5,0,0,TAU); UX.fill();
    UX.fillStyle='rgba(255,255,255,.16)';
    UX.beginPath(); UX.arc(-1.4,-17.8,2.9,Math.PI,TAU*0.86); UX.fill();
    UX.fillStyle=col; UX.fillRect(-4,-18.6,2.1,1.3);
  }
}

/* ---------- HITTÉRÍTŐ: szerzetes, prédikátor, agitátor, komisszár ---------- */
function paintPriest(u,pose,phase,moving,fired,fireT,col,acc){
  const hw=pose==='side'?3.2:4;
  if(u.age===0){                                   /* --- Szerzetes --- */
    UX.fillStyle='#6b5233'; UX.fillRect(-hw-0.6,-5,hw*2+1.2,7.6);
    UX.fillStyle='#7a5f3c'; UX.fillRect(-hw,-12.4,hw*2,10.4);
    UX.fillStyle='rgba(255,255,255,.08)'; UX.fillRect(-hw,-12.4,hw*2,1.4);
    UX.fillStyle='#d8cba8'; UX.fillRect(-hw,-6.2,hw*2,1.6);
    UX.fillStyle=col; UX.fillRect(-hw,-11.6,hw*2,1.4);
    UX.save(); UX.translate(3.4,-8.4); UX.rotate(-0.25);
    UX.fillStyle='#5b3d22'; UX.fillRect(-1,-7,2,12); UX.fillRect(-3.6,-4,7.2,2);
    UX.restore();
    partHead(pose,SKIN[1],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle='#6b5233';
    UX.beginPath(); UX.arc(0,-16.4,4.3,Math.PI,TAU); UX.fill();
    UX.fillRect(-4.3,-16.4,8.6,2);
    UX.fillStyle='#5a4327';
    UX.beginPath(); UX.ellipse(0,-13.4,4.3,2.2,0,0,Math.PI); UX.fill();
  }
  else if(u.age===1){                              /* --- Prédikátor --- */
    UX.fillStyle='#2a2620'; UX.fillRect(-hw-0.8,-5,hw*2+1.6,7.6);
    partTorso(pose,1,'#33302a','#efe9d8');
    UX.fillStyle='#efe9d8';
    UX.beginPath(); UX.ellipse(0,-12,3.4,1.8,0,0,TAU); UX.fill();
    UX.fillStyle=col; UX.fillRect(-1.2,-12,2.4,7);
    UX.fillStyle='#8a6a2a'; UX.fillRect(-4.6,-8.6,5,6.4);
    UX.fillStyle='#efe6cf'; UX.fillRect(-4.2,-8.2,4.2,5.6);
    partHead(pose,SKIN[0],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle='#1f1c18';
    UX.beginPath(); UX.ellipse(0,-17.4,5.4,1.9,0,0,TAU); UX.fill();
    UX.fillRect(-3.4,-20.8,6.8,3.6);
  }
  else if(u.age===2){                              /* --- Agitátor --- */
    partLegs(pose,phase,moving,'#4a4a44','#2f2b25');
    partTorso(pose,2,'#3c4048',acc);
    UX.fillStyle=col; UX.fillRect(-hw,-12.4,hw*2,2.2);
    UX.fillStyle='#efe6cf'; UX.fillRect(-6.6,-9,5.4,6);
    UX.fillStyle='#cfc7b4'; UX.fillRect(-6.2,-8.6,4.6,1.2); UX.fillRect(-6.2,-6.6,4.6,1.2);
    UX.save(); UX.translate(3.6,-9.6); UX.rotate(-0.5);
    UX.fillStyle='#3c4048'; UX.fillRect(0,-1.4,5,2.8);
    UX.fillStyle='#efe6cf'; UX.fillRect(4.4,-3.4,5,6.4);
    UX.restore();
    partHead(pose,SKIN[2],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle='#2f3238';
    UX.beginPath(); UX.ellipse(0,-18,3.9,2.3,0,Math.PI,TAU); UX.fill();
    UX.fillRect(-3.9,-18.2,7.8,1.5);
    UX.fillStyle='#26282c'; UX.fillRect(pose==='back'?-3:0.6,-17.4,3.6,1.1);
  }
  else{                                            /* --- Komisszár --- */
    const coat=mix(col,'#4a4d44',0.55);
    partLegs(pose,phase,moving,'#3a3a30','#2b2b25');
    UX.fillStyle=coat; UX.fillRect(-hw-0.8,-12.6,hw*2+1.6,12);
    UX.fillStyle='rgba(255,255,255,.08)'; UX.fillRect(-hw-0.8,-12.6,hw*2+1.6,1.4);
    UX.fillStyle=shade(coat,-0.3); UX.fillRect(-hw-0.8,-6.4,hw*2+1.6,1.8);
    UX.fillStyle=col; UX.fillRect(-1,-12.6,2,6);
    UX.save(); UX.translate(3.2,-10.2); UX.rotate(-0.6);
    UX.fillStyle='#5a6155'; UX.fillRect(0,-1.6,5,3.2);
    UX.beginPath(); UX.moveTo(5,-3.6); UX.lineTo(11,-5.4);
    UX.lineTo(11,5.4); UX.lineTo(5,3.6); UX.closePath(); UX.fill();
    UX.fillStyle='#2b2f28'; UX.beginPath(); UX.ellipse(11,0,1.6,5.4,0,0,TAU); UX.fill();
    UX.restore();
    partHead(pose,SKIN[2],u.age);
    if(typeof rajzNemzetiJelleg==='function'){
      /* Az ÖLTÖZÉK a törzsre kerül, a fejfedő ELŐTT: így a fejfedő
         takarja a gallért, nem fordítva. */
      if(typeof rajzNemzetiOltozek==='function')
        rajzNemzetiOltozek(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiJelleg(pose,u.owner,u.age,u.role,col,acc);
      rajzNemzetiFegyver(pose,u.owner,u.age,u.role,col,acc);
      rajzZaszlovivo(u,col,acc);
    }
    UX.fillStyle='#3a3f36';
    UX.beginPath(); UX.ellipse(0,-18.4,4,2.5,0,Math.PI,TAU); UX.fill();
    UX.fillRect(-4,-18.6,8,2.2);
    UX.fillStyle='#22261f';
    UX.beginPath(); UX.ellipse(0,-16.3,4.4,1.4,0,0,TAU); UX.fill();
    UX.fillStyle=col; UX.beginPath(); UX.arc(0,-19.6,1.6,0,TAU); UX.fill();
  }
}

/* ---------- HAJÓK ----------
   A játékban minden oldalnézetből látszik: a katonák állnak, az
   épületeknek homlokzatuk van. A hajók eddig felülnézetből készültek,
   és ezért lógtak ki a képből. Most ugyanazt a hármas pózrendszert
   használják, mint a gyalogság: oldalról teljes hajóprofil, szemből és
   hátulról rövidülő test. A vízvonalnál hab, mögötte nyomdokvíz.
   --------------------------------------------------------------- */
function shipFoam(rx,alpha,phase){
  UX.fillStyle='rgba(226,240,246,'+alpha+')';
  UX.beginPath(); UX.ellipse(0,3,rx,3.4,0,0,TAU); UX.fill();
  UX.fillStyle='rgba(255,255,255,'+(alpha*0.8)+')';
  for(let i=-2;i<=2;i++){
    const w=1.6+Math.sin(phase+i)*0.9;
    UX.beginPath(); UX.ellipse(i*rx*0.34,2.2,w,1.1,0,0,TAU); UX.fill();
  }
}
function shipWake(L,moving){
  if(!moving) return;
  UX.fillStyle='rgba(232,244,250,.22)';
  for(let i=0;i<4;i++){
    const k=((G.t*1.4+i*0.25)%1);
    UX.beginPath(); UX.ellipse(-L*0.55-k*20,3,3.5+k*9,1.6+k*2.6,0,0,TAU); UX.fill();
  }
}
// Hajótest oldalról: emelt orr és tat, palánkolás, mellvéd, vízvonal.
// Az útvonalat külön függvény rajzolja, mert a kitöltéshez, a vágáshoz és
// a körvonalhoz is szükség van rá — egyetlen path újrahasználata itt
// megbízhatatlan volt, és a sötétítő sáv kilógott a hajóból.
/* ---------- HAJÓK ----------
   A csatolt hajómodellek nyomán: a 15. században egyárbocos sloop
   ferde vitorlával, a 17.-ben kétárbocos brigg keresztvitorlákkal,
   a 19.-ben háromárbocos gálya kettős ágyúsorral, a 20.-ban páncélos
   naszád kéménnyel és ágyútoronnyal.

   Oldalnézetből teljes profil: hajótest ágyúnyílásokkal, orrsudár, kötélzet,
   árbockosár. Szemből rövidülő test, a vitorlák szinte élükkel állnak.
   ------------------------------------------------------------------ */
function shipSail(x,y,w,h,szin,dul){
  /* Egy vitorla. Az x a KÖZEPE, y a felső éle (a keresztrúd). A szél
     kihasasítja: az oldalak kifelé ívelnek, az alja lelóg. */
  const has=dul*Math.min(5,w*0.22);
  UX.fillStyle=szin;
  UX.beginPath();
  UX.moveTo(x-w/2, y);
  UX.lineTo(x+w/2, y);
  UX.quadraticCurveTo(x+w/2+has, y+h*0.55, x+w/2-1, y+h);
  UX.quadraticCurveTo(x, y+h+h*0.16, x-w/2+1, y+h);
  UX.quadraticCurveTo(x-w/2+has, y+h*0.55, x-w/2, y);
  UX.closePath(); UX.fill();
  // a hasasodás árnyéka a szél felőli oldalon
  UX.fillStyle='rgba(0,0,0,.13)';
  UX.beginPath();
  UX.moveTo(x-w/2, y);
  UX.quadraticCurveTo(x-w/2+has, y+h*0.55, x-w/2+1, y+h);
  UX.lineTo(x-w*0.18, y+h);
  UX.quadraticCurveTo(x-w*0.24, y+h*0.5, x-w*0.2, y);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(255,255,255,.16)';
  UX.fillRect(x-w/2, y, w, 1.2);
}
function shipMast(x,alj,mag,szin){
  UX.strokeStyle=szin; UX.lineWidth=1.9; UX.lineCap='round';
  UX.beginPath(); UX.moveTo(x,alj); UX.lineTo(x,alj-mag); UX.stroke();
}
/* ---------- HŐS ----------
   Nem sablonkatona: aranyszegélyes páncél, lobogó köpeny, fejdísz a
   korszak szerint. A talpa körül halvány aranykör mutatja az auráját. */
function paintHero(u,pose,moving,fired,col,acc){
  const a=u.age, narrow=(pose!=='side');
  const fem=['#c9b06a','#c0b48c','#9aa0a6','#8a9098'][a];
  // köpeny hátul
  UX.fillStyle=shade(col,-0.15);
  UX.beginPath();
  UX.moveTo(-3,-13); UX.lineTo(-9,2); UX.lineTo(-1,1); UX.closePath(); UX.fill();
  // test
  UX.fillStyle=fem;
  UX.beginPath();
  UX.moveTo(-5,0); UX.lineTo(-4.4,-12); UX.lineTo(4.4,-12); UX.lineTo(5,0);
  UX.closePath(); UX.fill();
  UX.fillStyle=acc;                         // aranyszegély
  UX.fillRect(-4.6,-12,9.2,1.6);
  UX.fillRect(-1,-11,2,10);
  UX.fillStyle=col;                          // mellvért címerszíne
  UX.fillRect(-3,-9,2.2,6);
  UX.fillStyle='rgba(0,0,0,.14)';
  UX.beginPath(); UX.moveTo(1,-12); UX.lineTo(5,0); UX.lineTo(1,0); UX.closePath(); UX.fill();
  // fej és fejdísz
  UX.fillStyle='#d8b48c';
  UX.beginPath(); UX.arc(0,-14.6,3.2,0,TAU); UX.fill();
  if(a===0){                                 // koronás sisak
    UX.fillStyle=acc;
    UX.beginPath(); UX.arc(0,-16,3.4,Math.PI,TAU); UX.fill();
    for(let i=-1;i<=1;i++) UX.fillRect(i*2.2-0.5,-19.4,1.2,2.6);
  }else if(a===1){                           // tollas kalpag
    UX.fillStyle=shade(col,-0.1);
    UX.beginPath(); UX.ellipse(0,-17,4.6,2,0,0,TAU); UX.fill();
    UX.strokeStyle=acc; UX.lineWidth=1.4;
    UX.beginPath(); UX.moveTo(2,-18); UX.quadraticCurveTo(6,-23,3,-25); UX.stroke();
  }else if(a===2){                           // csákó
    UX.fillStyle='#2f3338'; UX.fillRect(-3.4,-20,6.8,5);
    UX.fillStyle=acc; UX.fillRect(-3.4,-15.6,6.8,1.4);
  }else{                                     // tiszti sapka
    UX.fillStyle=shade(col,-0.2);
    UX.beginPath(); UX.ellipse(0,-17.6,4,2.2,0,0,TAU); UX.fill();
    UX.fillStyle='#22261f'; UX.fillRect(1,-16.6,4.6,1.4);
  }
  if(!narrow){
    // kard vagy kard-pisztoly
    UX.strokeStyle='#e8e4d8'; UX.lineWidth=1.8; UX.lineCap='round';
    const sw=fired?-0.6:0.5;
    UX.save(); UX.translate(5,-8); UX.rotate(sw);
    UX.beginPath(); UX.moveTo(0,0); UX.lineTo(13,0); UX.stroke();
    UX.strokeStyle=acc; UX.lineWidth=2.4;
    UX.beginPath(); UX.moveTo(-1,0); UX.lineTo(1,0); UX.stroke();
    UX.restore();
  }
  // zászlócska a hátán
  UX.strokeStyle=shade(fem,-0.3); UX.lineWidth=1.2;
  UX.beginPath(); UX.moveTo(-5,-10); UX.lineTo(-8,-22); UX.stroke();
  UX.fillStyle=col;
  UX.beginPath();
  UX.moveTo(-8,-22); UX.lineTo(-2,-20.4); UX.lineTo(-8,-18.6); UX.closePath(); UX.fill();
}

/* ---------- KÉM ----------
   Csuklyás köpeny, semmi fegyver. Álruhában az ellenség színeit viseli,
   és a vállán apró kereskedőbatyu — ez a fedősztorija. */
function paintSpy(u,pose,moving,fired,col,acc){
  const narrow=(pose!=='side');
  UX.fillStyle='rgba(24,30,18,.2)';
  UX.beginPath(); UX.ellipse(0,1,6.4,2.8,0,0,TAU); UX.fill();
  // köpeny
  UX.fillStyle=shade(col,-0.25);
  UX.beginPath();
  UX.moveTo(-5,0); UX.lineTo(-3.8,-11); UX.lineTo(3.8,-11); UX.lineTo(5,0);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(0,0,0,.18)';
  UX.beginPath(); UX.moveTo(1,-11); UX.lineTo(5,0); UX.lineTo(1,0); UX.closePath(); UX.fill();
  // csuklya
  UX.fillStyle=shade(col,-0.1);
  UX.beginPath(); UX.arc(0,-13.4,3.6,Math.PI*0.9,TAU*0.55); UX.fill();
  UX.fillStyle='#3a2f24';                        // árnyékos arc
  UX.beginPath(); UX.arc(0.4,-12.8,2.2,0,TAU); UX.fill();
  if(!narrow){
    UX.fillStyle=shade('#8a6a42',0.05);          // batyu a vállon
    UX.beginPath(); UX.ellipse(-5.2,-7.4,3,3.6,0.3,0,TAU); UX.fill();
    UX.strokeStyle='rgba(60,48,30,.8)'; UX.lineWidth=0.9;
    UX.beginPath(); UX.moveTo(-4.4,-10.6); UX.lineTo(-2,-9); UX.stroke();
  }
  UX.fillStyle=acc;
  UX.fillRect(-1.6,-9.6,3.2,1.2);
}

/* ---------- FALTÖRŐ KOS ÉS OSTROMTORONY ----------
   Mindkettő oldalnézetből, mint a harckocsi. A kos vaskos gerenda kosfejjel,
   ponyvatető alatt; az ostromtorony emeletes fatorony leereszthető hídpallóval. */
function paintRam(u,pose,moving,fired,col,acc){
  const a=u.age, narrow=(pose!=='side');
  const fa=['#6b4b28','#67492a','#5f5348','#54585c'][a];
  const L=narrow?16:32;
  // kerekek
  UX.fillStyle=shade(fa,-0.35);
  for(const x of (narrow?[0]:[-L*0.32,0,L*0.32])){
    UX.beginPath(); UX.arc(x,0,4.6,0,TAU); UX.fill();
  }
  // váz
  UX.fillStyle=fa;
  UX.fillRect(-L*0.44,-6,L*0.88,4);
  // ponyvatető
  UX.fillStyle=(a<2)?'#8a7a5a':shade(fa,0.1);
  UX.beginPath();
  UX.moveTo(-L*0.46,-8); UX.quadraticCurveTo(0,-19,L*0.46,-8);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(0,0,0,.16)';
  UX.beginPath();
  UX.moveTo(-L*0.46,-8); UX.quadraticCurveTo(0,-19,0,-8);
  UX.closePath(); UX.fill();
  if(!narrow){
    // a gerenda, ami lövéskor előrelendül
    const ki=fired?7:0;
    UX.strokeStyle=shade(fa,-0.15); UX.lineWidth=4.4; UX.lineCap='round';
    UX.beginPath(); UX.moveTo(-L*0.3+ki,-9); UX.lineTo(L*0.42+ki,-9); UX.stroke();
    UX.fillStyle=(a<2)?'#6a6e72':'#4a4e52';       // kosfej
    UX.beginPath(); UX.ellipse(L*0.48+ki,-9,4.6,3.4,0,0,TAU); UX.fill();
    UX.fillStyle=shade('#6a6e72',-0.3);
    UX.beginPath(); UX.moveTo(L*0.44+ki,-11.6); UX.lineTo(L*0.5+ki,-13.6);
    UX.lineTo(L*0.52+ki,-10.4); UX.closePath(); UX.fill();
    // felfüggesztő kötelek
    UX.strokeStyle='rgba(70,55,35,.8)'; UX.lineWidth=1;
    UX.beginPath(); UX.moveTo(-L*0.16,-15); UX.lineTo(-L*0.16+ki,-9); UX.stroke();
    UX.beginPath(); UX.moveTo(L*0.2,-15); UX.lineTo(L*0.2+ki,-9); UX.stroke();
  }
  UX.fillStyle=col;
  UX.beginPath(); UX.arc(-L*0.36,-12,2.2,0,TAU); UX.fill();
}
function paintSiegeTower(u,pose,moving,fired,col,acc){
  const a=u.age, narrow=(pose!=='side');
  const fa=['#6b4b28','#67492a','#5f5348','#4a5a4e'][a];
  const W=narrow?11:15, Hh=30;
  // kerekek
  UX.fillStyle=shade(fa,-0.35);
  for(const x of (narrow?[0]:[-W*0.7,W*0.7])){
    UX.beginPath(); UX.arc(x,0,4.4,0,TAU); UX.fill();
  }
  // torony teste, felfelé keskenyedve
  UX.fillStyle=fa;
  UX.beginPath();
  UX.moveTo(-W,-3); UX.lineTo(-W*0.8,-Hh); UX.lineTo(W*0.8,-Hh); UX.lineTo(W,-3);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(0,0,0,.16)';
  UX.beginPath();
  UX.moveTo(2,-3); UX.lineTo(W*0.8,-Hh); UX.lineTo(W,-3); UX.closePath(); UX.fill();
  // emeletek
  UX.fillStyle=shade(fa,-0.2);
  for(let i=1;i<3;i++) UX.fillRect(-W*0.95,-3-i*(Hh/3),W*1.9,1.8);
  // lőrések
  UX.fillStyle='#241f18';
  for(let i=0;i<2;i++) UX.fillRect(-3,-10-i*10,6,4);
  // a rakomány jelzése: fejek a tetején
  const n=(u.cargo&&u.cargo.length)||0;
  for(let i=0;i<Math.min(3,n);i++){
    UX.fillStyle='#d8b48c';
    UX.beginPath(); UX.arc(-5+i*5,-Hh-2,1.9,0,TAU); UX.fill();
  }
  if(!narrow){
    // leereszthető hídpalló elöl
    UX.fillStyle=shade(fa,0.12);
    UX.save(); UX.translate(W*0.8,-Hh+4); UX.rotate(-0.5);
    UX.fillRect(0,-2,16,3.4);
    UX.restore();
  }
  UX.fillStyle=col;
  UX.fillRect(-W*0.5,-Hh-1,W,2.6);
  UX.fillStyle=acc;
  UX.fillRect(-W*0.5,-Hh-1,W,1);
}

/* ---------- OSTROMGÉP ----------
   Négy korszak, mind oldalnézetből, mint a harckocsi: katapult vetőkarral,
   mozsár rövid, vaskos csővel, tarack lövegpajzzsal, végül vontatott
   tüzérség hosszú csővel és talpakkal. */
function paintSiege(u,pose,moving,fired,col,acc){
  const a=u.age, narrow=(pose!=='side');
  const fa=['#6b4b28','#5f5348','#54585c','#4a5a4e'][a];
  const vas=['#54585c','#4a4e52','#3f4348','#3a4a40'][a];
  const L=narrow?18:30;

  // kerekek / talp
  UX.fillStyle=shade(fa,-0.3);
  if(a<3){
    for(const x of (narrow?[0]:[-L*0.3,L*0.28])){
      UX.beginPath(); UX.arc(x,0,5.4,0,TAU); UX.fill();
      UX.strokeStyle=shade(fa,0.2); UX.lineWidth=1;
      for(let i=0;i<4;i++){
        const ang=G.t*(moving?3:0)+i*TAU/8;
        UX.beginPath();
        UX.moveTo(x-Math.cos(ang)*4,-Math.sin(ang)*4);
        UX.lineTo(x+Math.cos(ang)*4, Math.sin(ang)*4); UX.stroke();
      }
    }
  }else{
    UX.fillStyle=vas;                            // lánctalpas vontató
    UX.fillRect(-L*0.5,-2,L,6);
    UX.fillStyle=shade(vas,0.2);
    for(let x=-L*0.5;x<L*0.5;x+=5) UX.fillRect(x,-2,2,6);
  }
  // váz
  UX.fillStyle=fa;
  UX.beginPath();
  UX.moveTo(-L*0.5,-4); UX.lineTo(L*0.42,-4);
  UX.lineTo(L*0.42,-1); UX.lineTo(-L*0.5,-1);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(255,250,235,.12)';
  UX.fillRect(-L*0.5,-4,L*0.92,1.2);

  if(narrow){                                    // szemből: rövidülő cső
    UX.fillStyle=vas;
    UX.beginPath(); UX.arc(0,-9,4.2,0,TAU); UX.fill();
    UX.fillStyle='#22261f';
    UX.beginPath(); UX.arc(0,-9,2,0,TAU); UX.fill();
  }else if(a===0){                               // katapult: vetőkar
    const feszit=fired?-0.9:(-2.1);
    UX.strokeStyle=fa; UX.lineWidth=3.4; UX.lineCap='round';
    UX.save(); UX.translate(-L*0.06,-5); UX.rotate(feszit);
    UX.beginPath(); UX.moveTo(0,0); UX.lineTo(20,0); UX.stroke();
    UX.fillStyle=shade(fa,-0.2);                 // vetőkanál
    UX.beginPath(); UX.arc(21,0,3.6,0,TAU); UX.fill();
    UX.restore();
    UX.strokeStyle=shade(fa,-0.25); UX.lineWidth=1.4;   // feszítőkötél
    UX.beginPath(); UX.moveTo(-L*0.4,-4); UX.lineTo(-L*0.06,-5); UX.stroke();
    UX.fillStyle=fa;                             // állványbak
    UX.beginPath();
    UX.moveTo(-L*0.12,-4); UX.lineTo(-L*0.02,-15); UX.lineTo(L*0.06,-4);
    UX.closePath(); UX.fill();
  }else if(a===1){                               // mozsár: rövid, meredek cső
    UX.fillStyle=vas;
    UX.save(); UX.translate(0,-6); UX.rotate(-0.95);
    UX.fillRect(0,-4,15,8);
    UX.fillStyle=shade(vas,0.22); UX.fillRect(0,-4,15,2);
    UX.fillStyle='#22261f'; UX.fillRect(13,-3.4,3,6.8);
    UX.restore();
    UX.fillStyle=shade(fa,-0.1);                 // talpazat
    UX.beginPath();
    UX.moveTo(-8,-4); UX.lineTo(-5,-11); UX.lineTo(5,-11); UX.lineTo(8,-4);
    UX.closePath(); UX.fill();
  }else if(a===2){                               // tarack lövegpajzzsal
    UX.fillStyle=vas;
    UX.save(); UX.translate(1,-8); UX.rotate(-0.28);
    UX.fillRect(0,-2.2,22,4.4);
    UX.fillStyle=shade(vas,0.2); UX.fillRect(0,-2.2,22,1.2);
    UX.fillStyle='#22261f'; UX.fillRect(20,-2.6,3,5.2);
    UX.restore();
    UX.fillStyle=shade(vas,0.1);                 // pajzs
    UX.beginPath();
    UX.moveTo(-2,-2); UX.lineTo(-4,-16); UX.lineTo(6,-16); UX.lineTo(5,-2);
    UX.closePath(); UX.fill();
    UX.fillStyle='rgba(255,255,255,.1)';
    UX.fillRect(-4,-16,10,1.6);
  }else{                                         // vontatott tüzérség
    UX.fillStyle=vas;
    UX.save(); UX.translate(2,-9); UX.rotate(-0.22);
    UX.fillRect(0,-2,28,4);
    UX.fillStyle=shade(vas,0.24); UX.fillRect(0,-2,28,1.1);
    UX.fillStyle='#22261f'; UX.fillRect(26,-2.6,4,5.2);  // csőszájfék
    UX.restore();
    UX.fillStyle=shade(vas,0.08);
    UX.beginPath();
    UX.moveTo(-3,-3); UX.lineTo(-5,-17); UX.lineTo(8,-17); UX.lineTo(6,-3);
    UX.closePath(); UX.fill();
    UX.strokeStyle=shade(vas,-0.2); UX.lineWidth=2;      // szétnyíló talpak
    UX.beginPath(); UX.moveTo(-4,-2); UX.lineTo(-L*0.55,4); UX.stroke();
  }
  // felségjel
  UX.fillStyle=col;
  UX.beginPath(); UX.arc(-L*0.34,-6,2.4,0,TAU); UX.fill();
  UX.fillStyle=acc;
  UX.beginPath(); UX.arc(-L*0.34,-6,1.1,0,TAU); UX.fill();
  if(fired&&!narrow) muzzleFlash(L*0.6,-9,0,5.6);
}

/* ---------- TÁBORI SEBÉSZ ----------
   Fehér köpeny vörös kereszttel, oldalán orvosi táska. Munka közben
   halvány zöld fény jelzi, hogy éppen gyógyít. */
function paintMedic(u,pose,moving,fired,col,acc){
  const narrow=(pose!=='side');
  UX.fillStyle='rgba(24,30,18,.2)';
  UX.beginPath(); UX.ellipse(0,1,7,3,0,0,TAU); UX.fill();
  // köpeny
  UX.fillStyle='#eae6da';
  UX.beginPath();
  UX.moveTo(-5.4,0); UX.lineTo(-4.2,-11); UX.lineTo(4.2,-11); UX.lineTo(5.4,0);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(0,0,0,.12)';
  UX.beginPath(); UX.moveTo(1,-11); UX.lineTo(5.4,0); UX.lineTo(1,0); UX.closePath(); UX.fill();
  // vörös kereszt a mellén
  UX.fillStyle='#c0392b';
  UX.fillRect(-2.6,-8.4,5.2,1.8);
  UX.fillRect(-0.9,-10.1,1.8,5.2);
  // fej és sapka
  UX.fillStyle='#d8b48c';
  UX.beginPath(); UX.arc(0,-13.4,3.1,0,TAU); UX.fill();
  UX.fillStyle='#eae6da';
  UX.beginPath(); UX.arc(0,-14.6,3.2,Math.PI,TAU); UX.fill();
  UX.fillStyle='#c0392b'; UX.fillRect(-1.1,-15.6,2.2,1.2);
  if(!narrow){
    // orvosi táska
    UX.fillStyle='#6a4a2c';
    UX.fillRect(4.6,-6.4,4.6,4.2);
    UX.fillStyle='#c0392b'; UX.fillRect(6.2,-5.4,1.4,2.2);
    UX.strokeStyle='#3a2a18'; UX.lineWidth=0.9;
    UX.beginPath(); UX.moveTo(4.6,-6.4); UX.lineTo(3.4,-9.6); UX.stroke();
  }
  // gyógyítás közben halvány zöld derengés
  if(u.healing&&G.t-u.healing<0.4&&!REDUCED){
    UX.fillStyle='rgba(120,220,140,'+(0.3*(1-(G.t-u.healing)/0.4))+')';
    UX.beginPath(); UX.arc(0,-8,13,0,TAU); UX.fill();
  }
}
function paintShip(u,pose,moving,fired,col,acc){
  /* Hajóosztályok. A kalózvilágban a három modell szerint:
       SZLÚP (szállító) — kisebb test, egy árboc
       BRIGG (hadihajó) — közepes, két árboc
       GÁLYA            — hosszú test, HÁROM árboc, kettős ágyúsor */
  const galya=!!u.galleon;
  const war=(u.role==='warship'||galya), szall=!!u.transport, a=u.age;
  const narrow=(pose!=='side');
  const L=(galya?46:(war?38:(szall?34:26)))*(narrow?0.46:1);
  const H=galya?12:(war?10:(szall?9:7.6));
  const fa=['#6b4b28','#6f5230','#5f5348','#59636b'][a];
  const hull=war?mix(col,fa,0.55):(szall?mix('#7a5a34',col,0.34):mix('#8a6534',col,0.28));
  const vit=['#e0d8c0','#d8cfb4','#cfc6ad','#b8b4a8'][a];
  const ph=G.t*(moving?5:1.6);

  shipWake(L,moving);
  shipFoam(L*(narrow?0.62:0.52),moving?0.42:0.26,ph);

  const bill=Math.sin(ph*0.6)*(moving?0.05:0.03);   // hullámzás
  UX.rotate(bill);

  /* --- hajótest --- */
  UX.fillStyle=hull;
  UX.beginPath();
  UX.moveTo(-L*0.5, -H*0.35);                        // tat
  UX.lineTo(-L*0.46, H*0.30);
  UX.quadraticCurveTo(0, H*0.85, L*0.46, H*0.10);    // hasa
  UX.lineTo(L*0.52, -H*0.45);                        // orr felfelé
  UX.closePath(); UX.fill();
  UX.fillStyle=shade(hull,0.2);                      // fedélzeti perem
  UX.fillRect(-L*0.5,-H*0.35,L*1.02,2.2);
  UX.fillStyle='rgba(0,0,0,.24)';                    // vízvonal árnyéka
  UX.beginPath();
  UX.moveTo(-L*0.46,H*0.22);
  UX.quadraticCurveTo(0,H*0.7,L*0.46,H*0.04);
  UX.lineTo(L*0.46,H*0.16);
  UX.quadraticCurveTo(0,H*0.82,-L*0.46,H*0.32);
  UX.closePath(); UX.fill();

  if(war&&!narrow){
    // ágyúnyílások: a 19. századtól két sorban  (a szállítón nincs ágyú)
    const sorok=galya?2:1;             // kettős ágyúsor csak a gályán
    for(let s2=0;s2<sorok;s2++){
      const y=-H*0.12+s2*H*0.34;
      for(let i=-3;i<=3;i++){
        const x=i*L*0.115;
        UX.fillStyle='#2a2119';
        UX.fillRect(x-2,y-2,4,4);
        UX.fillStyle=shade(hull,-0.3);                // ágyúcső kikandikál
        UX.fillRect(x-0.9,y-1,4.4,2);
      }
    }
    UX.fillStyle=acc;                                 // aranyozott tatdísz
    UX.fillRect(-L*0.5,-H*0.3,3,H*0.5);
  }
  if(narrow){                                         // szemből: keskeny test
    UX.fillStyle=shade(hull,0.1);
    UX.beginPath(); UX.ellipse(0,H*0.1,L*0.5,H*0.55,0,0,TAU); UX.fill();
  }

  /* --- árbocok és vitorlák --- */
  const arboc=shade(fa,-0.18);
  if(!narrow){
    /* Az árbocszám a HAJÓOSZTÁLYT mutatja, nem a korszakot:
         SZLÚP  — egy árboc, kevés ágyú
         BRIGG  — két árboc
         GÁLYA  — három árboc, kettős ágyúsor
       Korábban a korszak döntött, ezért kalózmódban mindhárom hajó
       ugyanúgy nézett ki — nem lehetett megkülönböztetni őket. */
    const szlup=!!u.transport, brigg=(u.role==='warship');
    const arbocDb=galya?3:(brigg?2:(szlup?1:(a===0?1:(a===1?2:3))));
    if(arbocDb===1){                                  // egyárbocos szlúp
      shipMast(0,-H*0.4,30,arboc);
      shipSail(0,-H*0.4-28, 17, 22, vit, 1);
      shipSail(-L*0.3,-H*0.4-17, 12, 14, vit, -1);   // orrvitorla
      UX.strokeStyle='rgba(70,55,35,.7)'; UX.lineWidth=0.8;
      UX.beginPath(); UX.moveTo(0,-H*0.4-30); UX.lineTo(L*0.52,-H*0.5); UX.stroke();
      UX.beginPath(); UX.moveTo(0,-H*0.4-30); UX.lineTo(-L*0.48,-H*0.4); UX.stroke();
    }else if(arbocDb===2){                            // kétárbocos brigg
      for(const [x,m] of [[-L*0.16,32],[L*0.2,27]]){
        shipMast(x,-H*0.4,m,arboc);
        shipSail(x,-H*0.4-m+3, 16, m*0.42, vit, 1);
        shipSail(x,-H*0.4-m*0.5, 18, m*0.34, vit, 1);
        UX.strokeStyle=arboc; UX.lineWidth=1.2;       // keresztrudak
        UX.beginPath(); UX.moveTo(x-9,-H*0.4-m+3); UX.lineTo(x+9,-H*0.4-m+3); UX.stroke();
        UX.beginPath(); UX.moveTo(x-10,-H*0.4-m*0.5); UX.lineTo(x+10,-H*0.4-m*0.5); UX.stroke();
      }
      shipSail(-L*0.36,-H*0.4-15, 11, 12, vit, -1);
    }else if(arbocDb>=3){                             // háromárbocos gálya
      for(const [x,m] of [[-L*0.26,30],[0,38],[L*0.24,32]]){
        shipMast(x,-H*0.4,m,arboc);
        shipSail(x,-H*0.4-m+3, 15, m*0.36, vit, 1);
        shipSail(x,-H*0.4-m*0.58, 17, m*0.3, vit, 1);
        UX.strokeStyle=arboc; UX.lineWidth=1.1;
        UX.beginPath(); UX.moveTo(x-8,-H*0.4-m+3); UX.lineTo(x+8,-H*0.4-m+3); UX.stroke();
      }
      // árbockosár a főárbocon
      UX.fillStyle=arboc;
      UX.beginPath(); UX.ellipse(0,-H*0.4-38,4.4,2.4,0,0,TAU); UX.fill();
      shipSail(-L*0.4,-H*0.4-17, 12, 13, vit, -1);
    }else{                                            // páncélos naszád
      UX.fillStyle=shade(hull,0.12);                  // felépítmény
      UX.fillRect(-L*0.12,-H*1.5,L*0.3,H*1.15);
      UX.fillStyle=shade(hull,-0.16);                 // kémény
      UX.fillRect(L*0.02,-H*2.2,5.6,H*0.8);

      UX.fillStyle='rgba(80,74,68,.5)';
      for(let i=0;i<3;i++){
        const k=((G.t*0.7+i*0.34)%1);
        UX.beginPath(); UX.arc(L*0.05,-H*2.3-k*14,2+k*4,0,TAU); UX.fill();
      }
      UX.fillStyle=shade(hull,-0.1);                  // ágyútorony
      UX.beginPath(); UX.ellipse(-L*0.3,-H*0.75,6.4,4.4,0,0,TAU); UX.fill();
      UX.fillStyle='#3c4045';
      UX.fillRect(-L*0.3,-H*0.9,13,2.4);
      shipMast(L*0.24,-H*0.5,16,'#54585c');           // rádióárboc
    }
    // orrsudár
    UX.strokeStyle=arboc; UX.lineWidth=1.8;
    UX.beginPath(); UX.moveTo(L*0.44,-H*0.35); UX.lineTo(L*0.72,-H*0.75); UX.stroke();
  }else{
    // szemből: az árbocok élükkel
    const m=(a===3)?18:34;
    shipMast(0,-H*0.4,m,arboc);
    if(a<3){ UX.fillStyle=vit; UX.fillRect(-2.4,-H*0.4-m+4,4.8,m*0.62); }
  }

  /* --- csapatszállító: rakodótér és az utasok --- */
  if(szall&&!narrow){
    UX.fillStyle=shade(hull,-0.2);                  // nyitott rakodótér
    UX.fillRect(-L*0.3,-H*0.34,L*0.6,H*0.3);
    UX.fillStyle='rgba(0,0,0,.3)';
    UX.fillRect(-L*0.3,-H*0.34,L*0.6,2);
    const n=(u.cargo&&u.cargo.length)||0;
    // fejek a peremen: a rakomány mennyisége szerint, legfeljebb hat
    const db=Math.min(6,n);
    for(let i=0;i<db;i++){
      const x=-L*0.26+i*(L*0.52/Math.max(1,db-1||1));
      UX.fillStyle='#d8b48c';
      UX.beginPath(); UX.arc(x,-H*0.5,2,0,TAU); UX.fill();
      UX.fillStyle=col;
      UX.fillRect(x-2,-H*0.42,4,3);
    }
    if(n>6){
      UX.fillStyle='rgba(255,245,220,.9)';
      UX.font='6px sans-serif'; UX.textAlign='center';
      UX.fillText('+'+(n-6),L*0.36,-H*0.44);
      UX.textAlign='left';
    }
    // rakodópalló az orrnál
    UX.strokeStyle=shade(fa,-0.2); UX.lineWidth=2;
    UX.beginPath(); UX.moveTo(L*0.44,-H*0.2); UX.lineTo(L*0.6,H*0.2); UX.stroke();
  }

  /* --- lobogó --- */
  const zx=(a===3)?L*0.24:0, zy=-H*0.4-((a===0)?30:(a===1?32:(a===2?38:16)));
  UX.fillStyle=col;
  UX.beginPath();
  UX.moveTo(zx,zy);
  UX.quadraticCurveTo(zx+7,zy-1.6,zx+12,zy+1.4+Math.sin(G.t*3)*1.2);
  UX.lineTo(zx+12,zy+5.4+Math.sin(G.t*3)*1.2);
  UX.quadraticCurveTo(zx+7,zy+3,zx,zy+5);
  UX.closePath(); UX.fill();
  UX.fillStyle=acc;
  UX.fillRect(zx,zy+1.6,12,1.4);

  if(fired) muzzleFlash(narrow?0:L*0.3, H*0.05, 0, 5);
}

/* ---------- REPÜLŐGÉPEK (20. század) ----------
   Háromnegyedes nézet, ugyanazzal a pózrendszerrel, mint a gyalogságnál:
   oldalról a törzs teljes profilja látszik álló vezérsíkkal és üvegezett
   kabinnal, szemből és hátulról rövidülő test kiterjesztett szárnnyal.
   A gép magasan száll, alatta külön árnyék jelzi a magasságot.
   ------------------------------------------------------------------ */
function propDisc(x,y,r,vertical){
  UX.fillStyle='rgba(210,210,200,.20)';
  UX.beginPath();
  if(vertical) UX.ellipse(x,y,r*0.24,r,0,0,TAU);
  else UX.ellipse(x,y,r,r*0.24,0,0,TAU);
  UX.fill();
  UX.strokeStyle='rgba(240,240,230,.42)'; UX.lineWidth=1;
  const a=G.t*30;
  UX.beginPath();
  if(vertical){ UX.moveTo(x,y-Math.cos(a)*r); UX.lineTo(x,y+Math.cos(a)*r); }
  else { UX.moveTo(x-Math.cos(a)*r,y); UX.lineTo(x+Math.cos(a)*r,y); }
  UX.stroke();
  UX.fillStyle='#3a3f43';
  UX.beginPath(); UX.arc(x,y,1.7,0,TAU); UX.fill();
}
function paintPlane(u,pose,moving,fired,col,acc){
  const kind=u.role, narrow=(pose!=='side');
  const jet=(kind==='fighter');
  const L=kind==='bomber'?36:(jet?30:27);
  const body=kind==='bomber'?'#5d6358':(jet?mix(col,'#48545f',0.42):'#7c8371');
  const dark=shade(body,-0.34), light=shade(body,0.24);

  if(narrow){                                    /* --- szemből / hátulról --- */
    const span=kind==='bomber'?38:30;
    UX.fillStyle=dark;                           // távolabbi szárny
    UX.fillRect(-span/2,-2.2,span,4);
    UX.fillStyle=light;
    UX.fillRect(-span/2,-2.2,span,1.8);
    UX.fillStyle=body;                           // törzs szemből
    UX.beginPath(); UX.ellipse(0,-1,6.4,8,0,0,TAU); UX.fill();
    UX.fillStyle=light;
    UX.beginPath(); UX.ellipse(-1.6,-3.4,4,4.6,0,0,TAU); UX.fill();
    UX.fillStyle=dark;                           // vezérsík
    UX.fillRect(-1.6,-19,3.2,11);
    UX.fillStyle='#9fc4d6';                      // kabin
    UX.beginPath(); UX.ellipse(0,-6,3.4,2.6,0,0,TAU); UX.fill();
    for(const sx of [-1,1]){                     // felségjel a szárnyakon
      UX.fillStyle=col;
      UX.beginPath(); UX.arc(sx*span*0.3,0,2.6,0,TAU); UX.fill();
      UX.fillStyle=acc;
      UX.beginPath(); UX.arc(sx*span*0.3,0,1.2,0,TAU); UX.fill();
    }
    if(!jet) propDisc(0,-1,10,false);
    else{
      UX.fillStyle='rgba(255,190,90,'+(0.45+Math.sin(G.t*20)*0.15)+')';
      UX.beginPath(); UX.arc(0,4,3.4,0,TAU); UX.fill();
    }
    if(fired) muzzleFlash(0,-10,0,3.4);
    return;
  }
  /* --- oldalról --- */
  // távolabbi szárny (a törzs mögött, feljebb)
  UX.fillStyle=dark;
  UX.beginPath();
  UX.moveTo(-L*0.02,-6); UX.lineTo(L*0.2,-9.5);
  UX.lineTo(L*0.3,-7.5); UX.lineTo(L*0.06,-4.5);
  UX.closePath(); UX.fill();
  // törzs
  UX.fillStyle=body;
  UX.beginPath();
  UX.moveTo(L*0.5,-1.5);
  UX.quadraticCurveTo(L*0.34,-7, -L*0.1,-6.6);
  UX.lineTo(-L*0.42,-4.6);
  UX.quadraticCurveTo(-L*0.52,-2, -L*0.42,0.6);
  UX.lineTo(-L*0.06,2.6);
  UX.quadraticCurveTo(L*0.3,2.8, L*0.5,-1.5);
  UX.closePath(); UX.fill();
  UX.fillStyle=light;                            // felső, megvilágított felület
  UX.beginPath();
  UX.moveTo(L*0.5,-1.5);
  UX.quadraticCurveTo(L*0.34,-7, -L*0.1,-6.6);
  UX.lineTo(-L*0.42,-4.6);
  UX.lineTo(-L*0.3,-3.2);
  UX.quadraticCurveTo(L*0.1,-4.4, L*0.46,-1.8);
  UX.closePath(); UX.fill();
  // vezérsík és vízszintes farokfelület
  UX.fillStyle=shade(body,-0.16);
  UX.beginPath();
  UX.moveTo(-L*0.3,-5.4); UX.lineTo(-L*0.44,-15);
  UX.lineTo(-L*0.5,-15); UX.lineTo(-L*0.46,-4.6);
  UX.closePath(); UX.fill();
  UX.fillStyle=acc;                              // felségcsík a vezérsíkon
  UX.fillRect(-L*0.5,-12.5,L*0.13,2.4);
  UX.fillStyle=dark;
  UX.beginPath();
  UX.moveTo(-L*0.34,-3.8); UX.lineTo(-L*0.56,-5.8);
  UX.lineTo(-L*0.56,-4.2); UX.lineTo(-L*0.36,-2.6);
  UX.closePath(); UX.fill();
  // közelebbi szárny (a törzs előtt, lejjebb)
  UX.fillStyle=shade(body,0.08);
  UX.beginPath();
  UX.moveTo(L*0.02,-2.4); UX.lineTo(L*0.26,3.4);
  UX.lineTo(L*0.1,5.6); UX.lineTo(-L*0.16,0.6);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(0,0,0,.16)';
  UX.beginPath();
  UX.moveTo(L*0.02,-2.4); UX.lineTo(L*0.26,3.4);
  UX.lineTo(L*0.2,4.2); UX.lineTo(-L*0.02,-1.6);
  UX.closePath(); UX.fill();
  UX.fillStyle=col;                              // felségjel a szárnyon
  UX.beginPath(); UX.arc(L*0.08,1.6,2.8,0,TAU); UX.fill();
  UX.fillStyle=acc;
  UX.beginPath(); UX.arc(L*0.08,1.6,1.3,0,TAU); UX.fill();
  // kabin
  UX.fillStyle='#9fc4d6';
  UX.beginPath();
  UX.moveTo(L*0.06,-6.6); UX.quadraticCurveTo(L*0.2,-9.4, L*0.3,-5.6);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(255,255,255,.45)';
  UX.beginPath(); UX.ellipse(L*0.16,-7,1.8,1,0.3,0,TAU); UX.fill();
  UX.strokeStyle=shade(body,-0.3); UX.lineWidth=0.9;
  UX.beginPath(); UX.moveTo(L*0.06,-6.6); UX.lineTo(L*0.3,-5.6); UX.stroke();

  if(kind==='bomber'){                           // két hajtómű a szárnyon
    for(const p of [[L*0.12,1.2],[L*0.2,3.4]]){
      UX.fillStyle=dark;
      UX.beginPath(); UX.ellipse(p[0],p[1],4.4,2.4,0.2,0,TAU); UX.fill();
      propDisc(p[0]+5,p[1]-0.4,6,true);
    }
    if(u.atomLoad){                              // atomtöltet a hasa alatt
      UX.fillStyle='#c8ccc4';
      UX.beginPath(); UX.ellipse(-L*0.02,3.6,6,2.6,0,0,TAU); UX.fill();
      UX.fillStyle='#c0392b'; UX.fillRect(-L*0.02-1,1,2,5.2);
    }
  }else if(jet){                                 // sugárhajtómű lángja
    UX.fillStyle='rgba(255,196,96,'+(0.5+Math.sin(G.t*22)*0.2)+')';
    UX.beginPath();
    UX.moveTo(-L*0.46,-3.4); UX.lineTo(-L*0.46-9-Math.sin(G.t*30)*4,-1.8);
    UX.lineTo(-L*0.46,-0.2); UX.closePath(); UX.fill();
  }else{                                         // orrlégcsavar
    propDisc(L*0.52,-1.6,9,true);
  }
  if(kind==='scout'){                            // rögzített futómű
    UX.strokeStyle=dark; UX.lineWidth=1.4;
    UX.beginPath(); UX.moveTo(L*0.06,2.4); UX.lineTo(L*0.02,6.4); UX.stroke();
    UX.fillStyle='#2f3330';
    UX.beginPath(); UX.arc(L*0.02,7,1.9,0,TAU); UX.fill();
  }
  if(fired) muzzleFlash(L*0.56,-1.5,0,3.4);
}

function tankTracks(L,H,phase,moving,dark){
  // lánctalp: futógörgők, meghajtókerék, felül a lánc felső ága
  UX.fillStyle=dark;
  UX.beginPath();
  UX.moveTo(-L*0.5,-H*0.1); UX.lineTo(L*0.5,-H*0.1);
  UX.quadraticCurveTo(L*0.58,H*0.22, L*0.46,H*0.34);
  UX.lineTo(-L*0.46,H*0.34);
  UX.quadraticCurveTo(-L*0.58,H*0.22, -L*0.5,-H*0.1);
  UX.closePath(); UX.fill();
  UX.fillStyle=shade(dark,0.28);                  // futógörgők
  for(let i=-3;i<=3;i++){
    UX.beginPath(); UX.arc(i*L*0.135, H*0.2, H*0.11, 0, TAU); UX.fill();
  }
  UX.fillStyle=shade(dark,0.4);                   // meghajtó- és feszítőkerék
  UX.beginPath(); UX.arc(-L*0.44,H*0.14,H*0.16,0,TAU); UX.fill();
  UX.beginPath(); UX.arc( L*0.44,H*0.14,H*0.16,0,TAU); UX.fill();
  UX.strokeStyle=shade(dark,-0.3); UX.lineWidth=1.1;   // lánclemezek
  const off=(phase*7)%6;
  for(let x=-L*0.5+off;x<L*0.5;x+=6){
    UX.beginPath(); UX.moveTo(x,-H*0.1); UX.lineTo(x,H*0.34); UX.stroke();
  }
  UX.fillStyle='rgba(255,250,235,.12)';           // felső lánc megvilágítva
  UX.fillRect(-L*0.5,-H*0.1,L,2.4);
}
function paintTank(u,pose,moving,fired,col,acc){
  const narrow=(pose!=='side');
  const L=(narrow?20:34), H=17;
  const body=mix(col,'#5c6148',0.62);
  const dark=shade(body,-0.42), light=shade(body,0.2);
  const ph=G.t*(moving?4:0);

  // por a lánctalp alatt
  if(moving&&!REDUCED){
    UX.fillStyle='rgba(150,135,105,.22)';
    for(let i=0;i<3;i++){
      const k=((G.t*1.6+i*0.33)%1);
      UX.beginPath(); UX.ellipse(-L*0.5-k*12, H*0.36, 3+k*7, 1.6+k*3, 0,0,TAU); UX.fill();
    }
  }
  tankTracks(L,H,ph,moving,dark);
  // páncéltest: ferde orrlemez, sárvédő, felső lap
  UX.fillStyle=body;
  UX.beginPath();
  UX.moveTo(-L*0.46,-H*0.12);
  UX.lineTo(-L*0.34,-H*0.5);
  UX.lineTo( L*0.28,-H*0.5);
  UX.lineTo( L*0.5,-H*0.12);
  UX.closePath(); UX.fill();
  UX.fillStyle=light;                             // felső lap megvilágítva
  UX.beginPath();
  UX.moveTo(-L*0.34,-H*0.5); UX.lineTo(L*0.28,-H*0.5);
  UX.lineTo(L*0.22,-H*0.36); UX.lineTo(-L*0.3,-H*0.36);
  UX.closePath(); UX.fill();
  UX.fillStyle='rgba(0,0,0,.2)';                  // sárvédő árnyéka
  UX.fillRect(-L*0.5,-H*0.16,L,2.2);
  UX.strokeStyle=shade(body,-0.3); UX.lineWidth=1; // szerelőnyílások
  UX.beginPath(); UX.moveTo(-L*0.1,-H*0.5); UX.lineTo(-L*0.1,-H*0.14); UX.stroke();

  // torony: mantlet, kupola, ágyú
  const ty=-H*0.5;
  UX.fillStyle=shade(body,0.06);
  UX.beginPath();
  UX.moveTo(-L*0.2,ty);
  UX.lineTo(-L*0.16,ty-H*0.42);
  UX.lineTo( L*0.12,ty-H*0.42);
  UX.lineTo( L*0.2,ty);
  UX.closePath(); UX.fill();
  UX.fillStyle=light;
  UX.beginPath();
  UX.moveTo(-L*0.16,ty-H*0.42); UX.lineTo(L*0.12,ty-H*0.42);
  UX.lineTo(L*0.08,ty-H*0.3); UX.lineTo(-L*0.12,ty-H*0.3);
  UX.closePath(); UX.fill();
  UX.fillStyle=shade(body,-0.24);                 // parancsnoki kupola
  UX.beginPath(); UX.ellipse(-L*0.02,ty-H*0.44,L*0.07,H*0.09,0,0,TAU); UX.fill();
  UX.fillStyle=shade(body,0.3);
  UX.beginPath(); UX.ellipse(-L*0.03,ty-H*0.47,L*0.05,H*0.06,0,0,TAU); UX.fill();
  if(!narrow){                                    // ágyúcső oldalról
    UX.fillStyle=shade(body,-0.14);
    UX.fillRect(L*0.18,ty-H*0.3,L*0.42,3.4);
    UX.fillStyle=shade(body,-0.34);               // csőszájfék
    UX.fillRect(L*0.52,ty-H*0.33,L*0.1,4.6);
    UX.fillStyle='rgba(255,250,235,.16)';
    UX.fillRect(L*0.18,ty-H*0.3,L*0.42,1.2);
  }else{                                          // szemből: rövidülő cső
    UX.fillStyle=shade(body,-0.2);
    UX.beginPath(); UX.ellipse(0,ty-H*0.28,3.4,3,0,0,TAU); UX.fill();
    UX.fillStyle='#2a2f26';
    UX.beginPath(); UX.arc(0,ty-H*0.28,1.7,0,TAU); UX.fill();
  }
  // felségjel és rendszám
  UX.fillStyle=col;
  UX.beginPath(); UX.arc(-L*0.26,-H*0.3,2.6,0,TAU); UX.fill();
  UX.fillStyle=acc;
  UX.beginPath(); UX.arc(-L*0.26,-H*0.3,1.2,0,TAU); UX.fill();
  UX.fillStyle='rgba(240,238,228,.5)';
  UX.fillRect(L*0.06,-H*0.28,5,1.6);
  // kipufogófüst
  if(moving&&!REDUCED){
    for(let i=0;i<2;i++){
      const k=((G.t*0.9+i*0.5)%1);
      UX.fillStyle='rgba(110,104,94,'+(0.3*(1-k))+')';
      UX.beginPath(); UX.arc(-L*0.5-k*9,-H*0.34-k*7,1.6+k*3.4,0,TAU); UX.fill();
    }
  }
  if(fired) muzzleFlash(narrow?0:L*0.66, ty-H*0.28, 0, 4.2);
}
