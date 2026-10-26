(() => {
 'use strict';if(document.querySelector('.port-credit'))return;
 const base=new URL('.',document.currentScript.src),font=new FontFace('PortPixel','url('+JSON.stringify(new URL('port-pixel.ttf',base).href)+')');font.load().then(f=>document.fonts.add(f)).catch(()=>{});
 const credit=document.createElement('div');credit.className='port-credit';credit.textContent='* Port by MIMIC765/Sekta';credit.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483647;opacity:.5;color:#fff;font:9px/1.6 PortPixel,monospace;white-space:nowrap;pointer-events:none;user-select:none;text-shadow:1px 1px #000,-1px -1px #000';document.body.append(credit);
 document.addEventListener('fullscreenchange',()=>{const host=document.fullscreenElement;if(host&&host.tagName!=='CANVAS'&&host.tagName!=='IFRAME')host.append(credit);else if(!host)document.body.append(credit);});
})();
