import os,shutil,sys,glob,re,json
import os as _os
S=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
A=S+'app/'
rd=lambda p:open(p,encoding='utf8').read()
I18N=['core']+sorted(os.path.basename(f)[:-3] for f in glob.glob(A+'i18n/lang-*.js'))
def body(): return rd(A+'body.html')
def head_meta(): return '''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#43251A">
<meta name="color-scheme" content="light dark">'''
def build_www():
    W=S+'www/'
    if os.path.exists(W): shutil.rmtree(W)
    for d in ('css','js','fonts','icons'): os.makedirs(W+d)
    shutil.copy(A+'css/aram.css',W+'css/'); shutil.copy(A+'css/fonts.css',W+'css/')
    for f in glob.glob(A+'fonts/*.woff2'): shutil.copy(f,W+'fonts/')
    for f in ('engine.js','data.js','app.js'): shutil.copy(A+'js/'+f,W+'js/')
    os.makedirs(W+'js/i18n')
    for n in I18N: shutil.copy(A+f'i18n/{n}.js',W+f'js/i18n/{n}.js')
    for f in glob.glob(A+'icons/*'): shutil.copy(f,W+'icons/')
    shutil.copy(A+'config.js',W+'config.js')
    for f in ('manifest.webmanifest','sw.js'):
        if os.path.exists(A+f): shutil.copy(A+f,W+f)
    scripts=''.join(f'<script src="js/i18n/{n}.js"></script>\n' for n in I18N)
    html=f'''<!doctype html>
<html lang="en">
<head>
{head_meta()}
<title>அறம் · Aram</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/aram.css">
</head>
<body>
{body()}
<script src="config.js"></script>
{scripts}<script src="js/engine.js"></script>
<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>
'''
    open(W+'index.html','w',encoding='utf8').write(html)
    return W
def build_artifact(out, reader=False):
    css=rd(A+'css/aram.css')
    i18n=''.join('<script>'+rd(A+f'i18n/{n}.js')+'</script>\n' for n in I18N)
    gf='https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;600&family=Noto+Serif+Tamil:wght@500;700&family=Tiro+Tamil:ital@0;1&display=swap'
    html=f'''<title>{'அறம் · Aram Reader' if reader else 'அறம் · Aram'}</title>
<meta name="theme-color" content="#43251A">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{gf}">
<style>
{css}
</style>
{body()}
<script>window.ARAM_CONFIG = {{{'reader: true' if reader else ''}}};</script>
{i18n}<script>{rd(A+'js/engine.js')}</script>
<script>{rd(A+'js/data.js')}</script>
<script>{rd(A+'js/app.js')}</script>
'''
    open(out,'w',encoding='utf8').write(html)
    return out
if __name__=='__main__':
    what=sys.argv[1] if len(sys.argv)>1 else 'www'
    if what=='www': print(build_www())
    elif what=='reader': print(build_artifact(S+'aram-reader.html', reader=True))
    else: print(build_artifact(S+'aram-artifact.html'))
