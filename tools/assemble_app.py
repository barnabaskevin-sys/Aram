import re,sys,io
import os as _os
S=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
orig=open(S+'src/app.js',encoding='utf8').read()
P=lambda n:open(S+'app/modules/'+n,encoding='utf8').read()
def cut(s,a,b,new,keep_b=True):
    i=s.index(a); assert s.count(a)==1,('dup start',a[:40])
    j=s.index(b,i+len(a)); assert s.count(b)>=1
    return s[:i]+new+(s[j:] if keep_b else s[j+len(b):])
def rep(s,a,b,n=1):
    assert s.count(a)==n,(s.count(a),a[:70])
    return s.replace(a,b)
s=orig
s=cut(s,"  // ----- languages -----","  // ----- tabs -----",P('lang.js'))
s=cut(s,"  // ----- tabs -----","  // ----- verse card -----",P('views.js'))
s=cut(s,"  // ----- verse card -----","  // ----- asking Claude -----",P('card.js'))
s=cut(s,"  // ----- asking Claude -----","  const CH_LIST =",P('sample.js'))
# examples: from the array to the end of the click handler line
i=s.index("  const EXAMPLES = ["); j=s.index("  let ctl = null;")
s=s[:i]+P('examples.js')+"\n"+s[j:]
# ask() strings
s=rep(s,"$('ask-status').textContent = 'Write your question first.'","$('ask-status').textContent = t('ask.empty_q')")
s=rep(s,"st.textContent = 'Asking needs Claude, which is not available in this view. Use Browse instead.'","st.textContent = t('ask.offline')")
s=rep(s,"const langs = LORDER.filter(l => active.has(l));","const langs = activeList();",2)
s=rep(s,"st.textContent = 'Finding the right chapters…';","st.textContent = t('ask.finding');")
s=rep(s,"st.textContent = 'Reading ' + pool.length + ' verses…';","st.textContent = t('ask.reading', { n: pool.length });")
s=rep(s,"st.textContent = e && e.code === 'empty' ? 'No chapter matched. Try describing the situation differently.' : errCopy(e);","st.textContent = e && e.code === 'empty' ? t('ask.no_chapter') : errCopy(e);")
s=cut(s,"  function renderAnswer(a, out) {","  $('ask').addEventListener('click', ask);",P('answer.js'))
# explainOne strings
s=rep(s,"if (!sample) { st.className = 'status err'; st.textContent = 'Claude is not available in this view.'; return; }","if (!sample) { st.className = 'status err'; st.textContent = t('ask.offline'); return; }")
s=rep(s,"btn.disabled = true; st.className = 'status'; st.textContent = 'Reading…';","btn.disabled = true; st.className = 'status'; st.textContent = t('lib.reading');")
s=rep(s,"showInterp(el, r, 'browse'); st.textContent = '';","showInterp(el, r, el.closest('#v-home') ? 'home' : el.closest('#v-check') ? 'check' : 'browse'); st.textContent = '';")
s=cut(s,"  // ----- check a quote -----","  // ----- browse -----",P('check.js'))
s=rep(s,"SRCV[src].filter(v => v.ch === i).forEach(v => out.appendChild(card(v, { explain: true })));","SRCV[src].filter(v => v.ch === i).forEach((v, k) => out.appendChild(card(v, { explain: true, i: k })));")
tail="""  $('bsrc').addEventListener('change', () => { fillChapters(); browse(); });
  $('bch').addEventListener('change', browse);
  fillChapters();
"""
assert tail in s
s=s.replace(tail,"  $('bch').addEventListener('change', browse);\n"+P('library.js')+P('sheets.js')+P('init.js'))

# --- Ask: put the large fixed lists BEFORE the question, so a server can cache everything up to the question ---
Q_BLOCK = "\\n\\nQuestion (in any language):\\n${q}"
LISTS_START = "\\n\\nChapters (id | Tamil | English):\\n${CH_LIST}"
i = s.index("`You help people find verses"); k = s.index("{ modelTier: 'quick', signal: ctl.signal }", i)
seg = s[i:k]
a = seg.index(Q_BLOCK); b = seg.index("\\n\\nChoose the 3 to 5 chapters")
assert seg.index(LISTS_START) == a + len(Q_BLOCK)
lists = seg[a + len(Q_BLOCK):b]
seg2 = seg[:a] + lists + Q_BLOCK + seg[b:]
s = s[:i] + seg2 + s[k:]
s = rep(s, "{ modelTier: 'quick', signal: ctl.signal }", "{ modelTier: 'quick', signal: ctl.signal, stable: 'Question (in any language):' }")
open(S+'app/js/app.js','w',encoding='utf8').write(s)
print(len(s))
