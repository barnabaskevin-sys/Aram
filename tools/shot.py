import os as _os
ROOT=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
os_chdir=_os.chdir(ROOT)
import sys,asyncio,json
from playwright.sync_api import sync_playwright
def run(jobs, base='file://'+ROOT+'/www/index.html', w=390, h=844, scale=2):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome') if False else p.chromium.launch()
        out=[]
        for j in jobs:
            ctx=b.new_context(viewport={'width':j.get('w',w),'height':j.get('h',h)},device_scale_factor=scale,color_scheme=j.get('scheme','light'),locale=j.get('locale','en-US'))
            pg=ctx.new_page()
            errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e)))
            pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
            pg.goto(j.get('url',base))
            pg.wait_for_timeout(j.get('wait',1200))
            for step in j.get('steps',[]):
                if step[0]=='click': pg.click(step[1])
                elif step[0]=='fill': pg.fill(step[1],step[2])
                elif step[0]=='eval': pg.evaluate(step[1])
                elif step[0]=='wait': pg.wait_for_timeout(step[1])
                elif step[0]=='select': pg.select_option(step[1],step[2])
            pg.wait_for_timeout(j.get('settle',800))
            pg.screenshot(path=j['out'],full_page=j.get('full',False))
            out.append((j['out'],errs))
            ctx.close()
        b.close()
    return out
if __name__=='__main__':
    jobs=json.load(open(sys.argv[1]))
    for o,e in run(jobs): print(o,e[:5])
