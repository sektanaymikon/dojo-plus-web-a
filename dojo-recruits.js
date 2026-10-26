// Optional Chapter 5 recruit unlock. Existing inventory, story flags and slots are preserved.
(() => {
 'use strict';
 let instance,api,enabled=false;
 for(const key of ['instantiate','instantiateStreaming']){
  const previous=WebAssembly[key];if(!previous)continue;
  WebAssembly[key]=async function(...args){const result=await previous.apply(this,args),candidate=result.instance||result;if(Object.values(candidate.exports||{}).some(x=>x instanceof WebAssembly.Table&&x.length===5691))instance=candidate;return result;};
 }
 const ids=[5,6,11,13,14,15,22,23,30,31,32,33,34,35,36,40,42,44,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77];
 function nativeApi(){
  const memory=Object.values(instance.exports).find(x=>x instanceof WebAssembly.Memory),table=Object.values(instance.exports).find(x=>x instanceof WebAssembly.Table),alloc=instance.exports.Sh;
  const out=alloc(32),args=alloc(16*8),cache=new Map();
  function builtin(name,argc){if(cache.has(name))return cache.get(name);const bytes=new Uint8Array(memory.buffer,0,2097152),words=new Uint32Array(memory.buffer),pattern=new TextEncoder().encode(name+'\0');for(let p=bytes.indexOf(pattern[0]);p>=0;p=bytes.indexOf(pattern[0],p+1)){if(!pattern.every((v,i)=>bytes[p+i]===v))continue;for(let w=words.indexOf(p);w>=0;w=words.indexOf(p,w+1)){const index=words[w+1];if(index>0&&index<table.length&&words[w+2]===argc&&table.get(index)?.length===5){cache.set(name,table.get(index));return table.get(index);}}}throw Error('Missing runner function: '+name);}
  function str(value){const bytes=new TextEncoder().encode(value+'\0'),chars=alloc(bytes.length),ref=alloc(16),raw=new Uint8Array(16);new Uint8Array(memory.buffer,chars,bytes.length).set(bytes);const d=new DataView(memory.buffer);d.setUint32(ref,chars,true);d.setUint32(ref+4,1,true);d.setUint32(ref+8,bytes.length-1,true);d.setUint32(ref+12,0,true);new DataView(raw.buffer).setUint32(0,ref,true);new DataView(raw.buffer).setInt32(12,1,true);return raw;}
  function number(raw){const d=new DataView(raw.buffer,raw.byteOffset,16),type=d.getInt32(12,true);return type===0||type===13?d.getFloat64(0,true):type===7?d.getInt32(0,true):NaN;}
  function call(name,values){const d=new DataView(memory.buffer);for(let i=0;i<values.length;i++){const p=args+i*16;if(values[i] instanceof Uint8Array)new Uint8Array(memory.buffer,p,16).set(values[i]);else{d.setFloat64(p,values[i],true);d.setInt32(p+8,0,true);d.setInt32(p+12,0,true);}}builtin(name,values.length)(out,0,0,values.length,args);return new Uint8Array(memory.buffer,out,16).slice();}
  const flagName=str('flag'),chapterName=str('chapter');
  return {unlock(){const chapter=number(call('variable_global_get',[chapterName]));if(chapter!==5)return {waiting:true};let flags=call('variable_global_get',[flagName]);if(new DataView(flags.buffer).getInt32(12,true)!==2)return {waiting:true};const length=number(call('array_length_1d',[flags]));if(length<678)return {waiting:true};let changed=0;for(const id of ids){const index=600+id,current=number(call('array_get',[flags,index]));if(current>=1)continue;call('array_set',[flags,index,1]);flags=new Uint8Array(memory.buffer,args,16).slice();changed++;}if(changed)call('variable_global_set',[flagName,flags]);let count=0;for(const id of ids)if(number(call('array_get',[flags,600+id]))>=1)count++;return {count,total:ids.length,changed};}};
 }
 function setup(){
  const box=document.createElement('label');box.style.cssText='background:#111b2de8;border:1px solid #8999b6;border-radius:7px;padding:8px 10px;font:12px system-ui;display:flex;align-items:center;gap:7px';
  const input=document.createElement('input');input.type='checkbox';input.id='dojoAllRecruits';input.style.cssText='width:auto;margin:0;padding:0';box.append(input,document.createTextNode('All recruits (Chapter 5)'));document.querySelector('.toolbar').append(box);
  const status=document.createElement('span');status.id='recruitStatus';status.style.cssText='color:#bfe5ce;font:12px system-ui;background:#111b2de8;padding:7px;border-radius:6px';status.hidden=true;document.querySelector('.toolbar').append(status);
  input.onchange=()=>{enabled=input.checked;status.hidden=false;status.textContent=enabled?'Load a Chapter 5 file to enable all recruits.':'Disabled. Reload your saved game to undo unsaved unlocks.';};
  setInterval(()=>{if(!enabled||!instance||typeof window.getGameMusicState!=='function')return;try{api??=nativeApi();const result=api.unlock();status.textContent=result.waiting?'Waiting for a Chapter 5 file…':'Recruits ready: '+result.count+' / '+result.total+'. Save in-game to keep them.';}catch(e){enabled=false;input.checked=false;status.textContent='Recruit option unavailable: '+e.message;console.error('[recruits]',e);}},1000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
