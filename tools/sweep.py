import os as _os
ROOT=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
os_chdir=_os.chdir(ROOT)
import json,sys
from playwright.sync_api import sync_playwright
LOC={'zht':'zh-TW','zh':'zh-CN','nb':'nb-NO','fil':'fil-PH'}
langs=[l for l in json.loads(sys.argv[1])] if len(sys.argv)>1 else None
JS="""()=>{
 const vw=document.documentElement.clientWidth, bad=[];
 if(document.documentElement.scrollWidth>vw+1) bad.push('page scrollWidth '+document.documentElement.scrollWidth+' > '+vw);
 document.querySelectorAll('body *').forEach(e=>{
   const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden') return;
   const r=e.getBoundingClientRect(); if(!r.width||!r.height) return;
   if(e.closest('[hidden]')) return;
   if(r.right>vw+1||r.left<-1){ if(!e.closest('.strand,.cord,.medal-bg')) bad.push('out '+e.tagName+'.'+(e.className&&e.className.baseVal===undefined?e.className:'')+' '+Math.round(r.left)+'..'+Math.round(r.right)); }
   if(e.matches('.dock button span,.tab, .btn, button.go, .chip') && e.scrollWidth>e.clientWidth+1) bad.push('clip '+e.tagName+' "'+(e.textContent||'').trim().slice(0,20)+'" '+e.scrollWidth+'>'+e.clientWidth);
 });
 return bad.slice(0,8);
}"""
with sync_playwright() as p:
    b=p.chromium.launch()
    # get list of languages from page
    ctx=b.new_context(viewport={'width':390,'height':844})
    pg=ctx.new_page(); pg.goto('file://'+ROOT+'/www/index.html'); pg.wait_for_timeout(800)
    ids=pg.evaluate("ARAM_UI.LANGS.map(l=>l[0])"); ctx.close()
    if langs: ids=langs
    errs_total=0
    for L in ids:
        ctx=b.new_context(viewport={'width':390,'height':844},locale=LOC.get(L,L),device_scale_factor=1)
        pg=ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+ROOT+'/www/index.html'); pg.wait_for_timeout(700)
        uil=pg.evaluate("document.documentElement.lang+'|'+document.documentElement.dir")
        res={}
        for v in ['home','ask','check','library']:
            if v!='home': pg.click(f'#d-{v}'); pg.wait_for_timeout(250)
            r=pg.evaluate(JS)
            if r: res[v]=r
        # settings sheet
        pg.click('#btn-set'); pg.wait_for_timeout(400)
        r=pg.evaluate(JS)
        if r: res['settings']=r
        pg.screenshot(path=f'shots/sw_{L}.png') if L in ('ar','ta','ja','th','hi') else None
        print(L,uil,'OK' if not res and not errs else json.dumps(res,ensure_ascii=False)[:400],errs[:2])
        ctx.close()
    b.close()
