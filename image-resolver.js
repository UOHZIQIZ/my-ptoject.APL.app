(() => {
 const catalog=window.DiaryImageCatalog, base='https://raw.githubusercontent.com/genshindev/api/mistress/assets/images/';
 const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
 function original(path,prefs=[]){const available=catalog.api[path]||[];const chosen=prefs.find(k=>available.includes(k))||available.find(k=>/^(icon|portrait|card|flower-of-life)/.test(k))||available[0];return chosen?base+path+'/'+chosen:null;}
 function supplement(path,name){const type=path.split('/')[0];return catalog.extra[path]||catalog.names[type+'/'+norm(name||path.split('/').pop())];}
 function resolve(path,name,prefs){const extra=supplement(path,name);return {primary:original(path,prefs)||extra?.url||null,extra};}
 window.DiaryImages={original,supplement,resolve};
})();
