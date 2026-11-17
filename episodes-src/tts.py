import json, hashlib, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
SR=24000; VOICES={'N':('af_bella','en-us',1.0),'B':('bf_emma','en-gb',0.98),'P':('af_aoede','en-us',1.05)}
_k=None
def say(who,txt):
    global _k
    v=VOICES[who]; h=hashlib.md5(f'{v}|{txt}'.encode()).hexdigest()[:16]; p=f'/home/claude/episodes/.cache/{h}.wav'
    if os.path.exists(p): return sf.read(p)[0]
    if _k is None: _k=Kokoro('/tmp/tts/kokoro.onnx','/tmp/tts/voices.bin')
    s,_=_k.create(txt,voice=v[0],speed=v[2],lang=v[1]); s=np.asarray(s,float); os.makedirs(os.path.dirname(p),exist_ok=True); sf.write(p,s,SR); return s
def build(lines,out):
    t=0.6; meta=[]; segs=[]; prev=None
    for i,d in enumerate(lines):
        d=dict(d); d.setdefault('id',f'l{i}')
        if prev is not None and d.get('ch')!=prev: t+=0.7
        if d.get('who'): s=say(d['who'],d['t']); dur=len(s)/SR; segs.append((d['who'],t,s))
        else: dur=d['d']
        meta.append(dict(d,start=t,dur=dur)); prev=d.get('ch')
        t+=dur+(0.45 if d.get('who') and d['t'].rstrip()[-1:] in '!?' else 0.38 if d.get('who') else 0.2)
    total=t+1.6; N=int(total*SR)
    for w in 'NBP':
        a=np.zeros(N)
        for ww,t0,s in segs:
            if ww==w: i=int(t0*SR); a[i:i+len(s)]+=s
        sf.write(f'{out}/voice_{w}.wav',a,SR)
    json.dump(dict(total=total,lines=meta),open(f'{out}/lines.json','w'),indent=0); return total
