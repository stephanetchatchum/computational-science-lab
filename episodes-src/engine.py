"""Episode engine: Nova on the left, one panel on the right, calm by design.
A script module provides META, LINES, SCENES (panel draw functions) and RECAP."""
import os, sys, math, json, importlib, subprocess, cairo, numpy as np, soundfile as sf
import gfx
from gfx import ease, back, font, text, rrect, circ, arrow, glow, star5, W, H, FPS, FG, MUTED, AMB, RED, GRN, BLU, PUR
gfx.POSES['wave']=(115,95,-25,-80)
PX,PY,PW,PH=330,62,920,505; PCX,PCY=PX+PW/2,PY+PH/2
PANEL=(0.086,0.106,0.150); BGTOP=(0.035,0.043,0.085); BGBOT=(0.06,0.045,0.11)
CHCOL=[RED,AMB,GRN,BLU,PUR]
def carry(lines):
    st={}; out=[]
    for d in lines:
        st.update({k:v for k,v in d.items() if k in('ch','scene','emo','pose')}); out.append(dict(d,**{k:st[k] for k in st}))
    return out
class Ep:
    def __init__(self,folder):
        sys.path.insert(0,folder); self.S=importlib.import_module('script'); self.dir=folder
        J=json.load(open(f'{folder}/lines.json')); self.L=J['lines']; self.TOTAL=J['total']; self.byid={l['id']:l for l in self.L}
        self.env={}
        for w in 'NBP':
            a,sr=sf.read(f'{folder}/voice_{w}.wav'); n=int(self.TOTAL*FPS)+2
            self.env[w]=np.clip(np.array([np.sqrt(np.mean(a[int(i/FPS*sr):int((i+1)/FPS*sr)]**2)+1e-12) if int(i/FPS*sr)<len(a) else 0 for i in range(n)])/0.07,0,1)
        gfx.ENV=self.env['N']; gfx.state=self.nstate; gfx.speaking=lambda t:self.speaking(t,'N')
        chs=[]; [chs.append(l['ch']) for l in self.L if l['ch'] not in chs]; self.chs=chs
        self.chs_start={c:(min(l['start'] for l in self.L if l['ch']==c)-0.35 if i else 0) for i,c in enumerate(chs)}
        self.chs_end={c:(self.chs_start[chs[i+1]] if i+1<len(chs) else self.TOTAL) for i,c in enumerate(chs)}
        self.INS=[l['start']+l['dur']+0.2 for l in self.L if l.get('ev')=='insight']
        self.scene_start={}
        prev=None
        for l in self.L:
            if l['scene']!=prev: self.scene_start.setdefault(l['scene'],l['start']-0.3); prev=l['scene']
    # timing helpers for scripts
    def ls(self,i): return self.byid[i]['start']
    def le(self,i): l=self.byid[i]; return l['start']+l['dur']
    def idx(self,t):
        i=0
        for j,l in enumerate(self.L):
            if t>=l['start']-0.05: i=j
        return i
    def cur(self,t): return self.L[self.idx(t)]
    def speaking(self,t,w): l=self.cur(t); return l.get('who')==w and t<l['start']+l['dur']
    def nstate(self,t):
        i=0
        for j,l in enumerate(self.L):
            if t>=l['start']-0.25: i=j
        c=self.L[i]; prev=self.L[i-1]['pose'] if i>0 else 'idle'
        return c['emo'],c['pose'],prev,ease((t-c['start']+0.25)/0.35),c
    # ---------- drawing
    def caption(self,c,t):
        l=self.cur(t)
        if not l.get('who') or t>l['start']+l['dur']+0.3: return
        words=l['t'].split(' '); wts=[len(w)+(4 if w[-1] in ',.:?!' else 1) for w in words]
        cum=np.cumsum(wts)/sum(wts); prog=(t-l['start'])/l['dur']; wi=min(int(np.searchsorted(cum,prog)),len(words)-1)
        a=ease((t-l['start']+0.15)/0.2); font(c,27,True); sp=12; rows=[[]]; cx=0
        for i,w in enumerate(words):
            wd=c.text_extents(w).x_advance
            if cx+wd>880 and rows[-1]: rows.append([]); cx=0
            rows[-1].append((i,w,wd)); cx+=wd+sp
        y0=668-(len(rows)-1)*20
        for r,row in enumerate(rows):
            tw=sum(wd for *_,wd in row)+sp*(len(row)-1); x=PCX-tw/2; y=y0+r*40
            c.set_source_rgba(*AMB,0.18*a); rrect(c,x-14,y-30,tw+28,41,10); c.fill()
            for i,w,wd in row:
                if i==wi and prog<=1.02: c.set_source_rgba(*AMB,a); rrect(c,x-5,y-29,wd+10,38,8); c.fill(); text(c,w,x,y,27,(0.08,0.06,0.04),True,alpha=a)
                else: text(c,w,x,y,27,FG,True,alpha=a*0.92)
                x+=wd+sp
    def hud(self,c,t):
        x0,x1,y=PX,PX+PW-130,26; tot=x1-x0
        for k,ch in enumerate(self.chs):
            a_,b_=self.chs_start[ch],self.chs_end[ch]; xa=x0+a_/self.TOTAL*tot; xb=x0+b_/self.TOTAL*tot-8; cur=a_<=t<b_; done=t>=b_
            c.set_source_rgba(1,1,1,0.12); rrect(c,xa,y,xb-xa,5,2.5); c.fill(); f=min(1,max(0,(t-a_)/(b_-a_)))
            if f>0: c.set_source_rgba(*(AMB if cur else GRN),0.95); rrect(c,xa,y,max(5,(xb-xa)*f),5,2.5); c.fill()
            if cur: text(c,self.S.CHAPTERS[ch],xa,y+24,14,FG,True)
        for i,ti in enumerate(self.INS):
            sx=PX+PW-80+i*28; got=t>=ti; s=back((t-ti)/0.5) if got else 1
            star5(c,sx,y+3,10*(max(s,0.01) if got else 1),0)
            if got: c.set_source_rgb(*AMB); c.fill()
            else: c.set_source_rgba(1,1,1,0.3); c.set_line_width(1.5); c.stroke()
            if got and t-ti<1.5: text(c,'+1 insight',sx,y+40,14,AMB,True,align='c',alpha=1-(t-ti)/1.5)
    def ribbon(self,c,t):
        for k,ch in enumerate(self.chs[1:],1):
            u=t-self.chs_start[ch]; lab=self.S.RIBBONS.get(ch)
            if lab and 0<=u<2.3:
                s=back(u/0.45); al=min(1,(2.3-u)/0.4); col=CHCOL[(k-1)%5]
                c.save(); c.translate(PCX,PY+56); c.scale(max(.01,s),max(.01,s)); c.set_source_rgba(0.04,0.04,0.09,0.92*al); rrect(c,-240,-30,480,60,30); c.fill()
                c.set_source_rgba(*col,al); c.set_line_width(2.5); rrect(c,-240,-30,480,60,30); c.stroke(); text(c,lab,0,10,28,col,True,align='c',alpha=al); c.restore()
    def count_overlay(self,c,t):
        for l in self.L:
            if l.get('ev')=='count':
                for i in range(3):
                    ci=l['start']+0.1+i*1.1
                    if ci<=t<ci+1.1:
                        u=(t-ci)/1.1; s=back(u/0.3); c.set_source_rgba(0.02,0.02,0.05,0.8); circ(c,PCX,PCY+10,92); c.fill()
                        c.set_source_rgb(*AMB); c.set_line_width(6); c.new_path(); c.arc(PCX,PCY+10,92,-math.pi/2,-math.pi/2+2*math.pi*(1-u)); c.stroke()
                        text(c,str(3-i),PCX,PCY+48,108,AMB,True,align='c',scale=max(.01,s))
    # built-in scenes
    def sc_context(self,c,T):
        M=self.S.META; u=T-self.scene_start['context']
        text(c,M['stage_label'],PCX,PY+150,22,BLU,True,align='c',alpha=ease(u/0.4))
        text(c,M['title'],PCX,PY+225,52,FG,True,align='c',scale=max(.01,back(u/0.6)))
        if M.get('subtitle'): text(c,M['subtitle'],PCX,PY+270,22,MUTED,True,align='c',alpha=ease((u-0.4)/0.4))
        q=ease((u-0.8)/0.4)
        c.set_source_rgba(*AMB,0.14*q); rrect(c,PCX-250,PY+330,500,64,32); c.fill(); c.set_source_rgba(*AMB,0.8*q); c.set_line_width(2); rrect(c,PCX-250,PY+330,500,64,32); c.stroke()
        text(c,'▶  '+M['when'],PCX,PY+371,24,AMB,True,align='c',alpha=q)
    def sc_recap(self,c,T):
        text(c,'RECAP',PCX,PY+92,28,AMB,True,align='c',scale=max(.01,back((T-self.scene_start['recap'])/0.4)))
        for i,(s_,lid) in enumerate(self.S.RECAP):
            t0=self.ls(lid)-0.1; p=back((T-t0)/0.45) if T>t0 else 0
            if not p: continue
            y=PY+130+i*112; nxt=self.ls(self.S.RECAP[i+1][1])-0.1 if i+1<len(self.S.RECAP) else 1e9; cur=t0<=T<nxt; col=CHCOL[i%5]
            c.save(); c.translate(PCX,y+40); c.scale(max(.01,p),max(.01,p)); c.translate(-PCX,-y-40)
            c.set_source_rgba(*col,0.13 if cur else 0.05); rrect(c,PX+60,y,PW-120,80,18); c.fill(); c.set_source_rgba(*col,0.8 if cur else 0.3); c.set_line_width(2); rrect(c,PX+60,y,PW-120,80,18); c.stroke()
            c.set_source_rgb(*col); circ(c,PX+110,y+40,21); c.fill(); text(c,'✓',PX+110,y+50,24,(0.05,0.05,0.08),True,align='c')
            text(c,s_,PX+150,y+50,26,FG if cur else (0.8,0.82,0.88),True); c.restore()
    def sc_next(self,c,T):
        M=self.S.META; u=T-self.scene_start['next']
        text(c,'Your next move',PCX,PY+150,26,MUTED,True,align='c',alpha=ease(u/0.4))
        text(c,M['next'],PCX,PY+225,46,FG,True,align='c',scale=max(.01,back(u/0.5)))
        if M.get('next_sub'): text(c,M['next_sub'],PCX,PY+275,22,MUTED,True,align='c',alpha=ease((u-0.4)/0.4))
        q=back((u-0.9)/0.5) if u>0.9 else 0
        if q: c.save(); c.translate(PCX,PY+370); c.scale(q,q); c.set_source_rgba(*BLU,0.22); rrect(c,-200,-30,400,60,30); c.fill(); text(c,'▶  Open the build guide',0,9,24,BLU,True,align='c'); c.restore()
    def frame(self,fi):
        t=fi/FPS; surf=cairo.ImageSurface(cairo.FORMAT_RGB24,W,H); c=cairo.Context(surf)
        g=cairo.LinearGradient(0,0,W,H); g.add_color_stop_rgb(0,*BGTOP); g.add_color_stop_rgb(1,*BGBOT); c.set_source(g); c.paint()
        c.set_source_rgba(*PANEL,0.95); rrect(c,PX,PY,PW,PH,22); c.fill()
        l=self.cur(t); sc=l['scene']
        c.save(); rrect(c,PX,PY,PW,PH,22); c.clip()
        fn={'context':self.sc_context,'recap':self.sc_recap,'next':self.sc_next}.get(sc) or self.S.SCENES[sc]
        fn(c,t) if sc in('context','recap','next') else fn(c,t,self)
        self.count_overlay(c,t)
        u=(t-self.scene_start[sc])/0.35
        if 0<=u<1: c.set_source_rgba(*PANEL,1-u); rrect(c,PX,PY,PW,PH,22); c.fill()
        self.ribbon(c,t); c.restore()
        self.hud(c,t); gfx.nova(c,t,fi); self.caption(c,t)
        if t<0.4: c.set_source_rgba(0,0,0,1-t/0.4); c.paint()
        if t>self.TOTAL-0.8: c.set_source_rgba(0,0,0,min(1,(t-self.TOTAL+0.8)/0.8)); c.paint()
        return surf
# ---------- audio
def audio(E):
    from scipy.signal import resample_poly, lfilter, butter
    SR=44100; TOT=E.TOTAL; N=int(TOT*SR); rng=np.random.default_rng(3)
    V=np.zeros(N)
    for w in 'NBP':
        v,_=sf.read(f'{E.dir}/voice_{w}.wav'); v=resample_poly(v,147,80)[:N]; V[:len(v)]+=v
    def lp(x,f): b,a=butter(2,f/(SR/2)); return lfilter(b,a,x)
    def env(n,a,r): t=np.arange(n)/SR; return np.minimum(t/a,1)*np.exp(-t/r)
    def add(buf,t0,x,g=1):
        i=int(t0*SR)
        if 0<=i<N: x=x[:N-i]; buf[i:i+len(x)]+=g*x
    def hz(m): return 440*2**((m-69)/12)
    def ding(f=1318,d=1.4): n=int(d*SR); t=np.arange(n)/SR; return sum(a*np.sin(2*np.pi*f*h*t) for a,h in ((1,1),(0.4,2.76),(0.2,5.4)))*env(n,0.002,0.4)
    def pop(): n=int(0.12*SR); t=np.arange(n)/SR; f=500+900*np.exp(-t*40); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,0.04)
    def chime():
        out=np.zeros(int(1.4*SR))
        for j,f in enumerate((1046,1318,1568)): x=ding(f,1.3); o=int(j*0.08*SR); m=min(len(x),len(out)-o); out[o:o+m]+=x[:m]
        return out
    key=E.S.META.get('key',0); prog=[[57,60,64,67],[53,57,60,64],[48,52,55,60],[55,59,62,67]]
    mus=np.zeros(N); beat=60/88; bar=4*beat; t=0; k=0
    while t<TOT:
        ch=[m+key for m in prog[k%4]]; n=int(bar*SR)+SR; tt=np.arange(n)/SR
        pad=sum(np.sin(2*np.pi*hz(m)*tt*d) for m in ch for d in (0.997,1.003)); pad*=np.minimum(tt/0.5,1)*np.clip((bar+0.8-tt)/0.8,0,1); add(mus,t,lp(pad,1100),0.014)
        add(mus,t,np.sin(2*np.pi*hz(ch[0]-12)*tt)*env(n,0.02,1.0),0.10)
        for j in range(4):
            m=ch[[0,2,1,3][j]]+12; nn=int(0.6*SR); t2=np.arange(nn)/SR; add(mus,t+j*beat,np.sin(2*np.pi*hz(m)*t2)*env(nn,0.004,0.25),0.03)
        t+=bar; k+=1
    mus*=np.clip(np.arange(N)/SR/2,0,1)*np.clip((TOT-np.arange(N)/SR)/2.5,0,1)
    ve=np.sqrt(lfilter([1],[1,-0.9995],V**2)*0.0005); mus*=1-0.8*np.clip(ve/0.03,0,1)
    sfx=np.zeros(N)
    for l in E.L:
        if l.get('ev')=='insight': add(sfx,l['start']+l['dur']+0.2,chime(),0.08)
        if l.get('ev')=='count':
            for i in range(3): add(sfx,l['start']+0.1+i*1.1,pop(),0.2); add(sfx,l['start']+0.1+i*1.1,ding(880 if i<2 else 1175,0.5),0.07)
        if l.get('ev')=='reveal': add(sfx,l['start'],ding(1568),0.1)
        if l.get('ev')=='pop': add(sfx,l['start']+l.get('at',0),pop(),0.15)
    for ch in E.chs[1:]: add(sfx,E.chs_start[ch]+0.1,ding(1046,0.9),0.04)
    mix=V*0.95+mus+sfx; mix/=max(1,np.abs(mix).max()/0.95); sf.write(f'{E.dir}/mix.wav',np.c_[mix,mix].astype(np.float32),SR)
def render(folder,a,b,name):
    E=Ep(folder); f0,f1=round(a*FPS),min(round(b*FPS),int(E.TOTAL*FPS))
    p=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','bgra','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',f'{folder}/tmp_{name}.mp4'],stdin=subprocess.PIPE)
    for fi in range(f0,f1): p.stdin.write(bytes(E.frame(fi).get_data()))
    p.stdin.close()
    if p.wait()==0: os.replace(f'{folder}/tmp_{name}.mp4',f'{folder}/{name}.mp4')
if __name__=='__main__':
    cmd,folder=sys.argv[1],sys.argv[2]
    if cmd=='voice':
        sys.path.insert(0,folder); S=importlib.import_module('script'); import tts; print(round(tts.build(carry(S.LINES),folder),1))
    elif cmd=='audio': audio(Ep(folder))
    elif cmd=='png':
        E=Ep(folder)
        for v in sys.argv[3:]: E.frame(int(float(v)*FPS)).write_to_png(f'{folder}/f_{v}.png')
    elif cmd=='render': render(folder,float(sys.argv[3]),float(sys.argv[4]),sys.argv[5])
