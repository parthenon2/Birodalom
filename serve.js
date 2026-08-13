#!/usr/bin/env node
/* Apró statikus kiszolgáló a helyi teszteléshez.
   A manifest, a telepíthetőség és a telefonos próba csak http:// alatt
   működik — file:// protokollon a böngésző ezeket letiltja.
   Használat:  node serve.js   majd  http://localhost:8080
   Telefonról ugyanazon a Wi-Fin: http://<a-géped-IP-címe>:8080          */
const http=require('http'), fs=require('fs'), path=require('path');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css',
  '.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
  let f=decodeURIComponent(req.url.split('?')[0]);
  if(f==='/') f='/index.html';
  const p=path.join(__dirname,f);
  if(!p.startsWith(__dirname)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){
    res.writeHead(404); return res.end('nincs ilyen fájl');
  }
  res.writeHead(200,{'Content-Type':TYPES[path.extname(p)]||'application/octet-stream'});
  fs.createReadStream(p).pipe(res);
}).listen(8080,()=>console.log('Fut: http://localhost:8080'));
