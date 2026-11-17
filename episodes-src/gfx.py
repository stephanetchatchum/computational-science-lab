import cairo, math, numpy as np
ENV=np.zeros(1)
WALK_AMP=0.0
WALK_PH=0.0
state=None
speaking=None
W,H,FPS=1280,720,30
BG=(0.035,0.043,0.075)
PANEL=(0.086,0.106,0.150)
FG=(0.93,0.95,0.98)
MUTED=(0.55,0.6,0.7)
AMB=(0.98,0.74,0.25)
RED=(1.0,0.42,0.42)
GRN=(0.35,0.88,0.50)
BLU=(0.42,0.72,1.0)
PUR=(0.70,0.52,1.0)
def ease(x): x=min(max(x,0),1); return x*x*(3-2*x)
def back(x):
    x=min(max(x,0),1); c1=1.9; return 1+(c1+1)*(x-1)**3+c1*(x-1)**2
def font(c,size,bold=False,mono=False):
    c.select_font_face('DejaVu Sans Mono' if mono else 'Inter',0,cairo.FONT_WEIGHT_BOLD if bold else 0); c.set_font_size(size)
def text(c,s,x,y,size,col=FG,bold=False,mono=False,align='l',alpha=1,scale=1):
    font(c,size,bold,mono); e=c.text_extents(s); dx={'l':0,'c':-e.x_advance/2,'r':-e.x_advance}[align]
    c.save(); c.translate(x,y); c.scale(scale,scale); c.set_source_rgba(*col,alpha); c.move_to(dx,0); c.show_text(s); c.new_path(); c.restore(); return e.x_advance
def rrect(c,x,y,w,h,r):
    c.new_sub_path(); c.arc(x+w-r,y+r,r,-math.pi/2,0); c.arc(x+w-r,y+h-r,r,0,math.pi/2); c.arc(x+r,y+h-r,r,math.pi/2,math.pi); c.arc(x+r,y+r,r,math.pi,1.5*math.pi); c.close_path()
def circ(c,x,y,r): c.new_path(); c.arc(x,y,r,0,2*math.pi)
def arrow(c,x0,y0,x1,y1,col,w=5,alpha=1,head=16):
    c.new_path(); c.set_source_rgba(*col,alpha); c.set_line_width(w); c.move_to(x0,y0); c.line_to(x1,y1); c.stroke()
    a=math.atan2(y1-y0,x1-x0); c.move_to(x1,y1)
    for s in (2.6,-2.6): c.line_to(x1+head*math.cos(a+s),y1+head*math.sin(a+s))
    c.close_path(); c.fill()
def glow(c,x,y,r,col,a=1):
    g=cairo.RadialGradient(x,y,0,x,y,r); g.add_color_stop_rgba(0,*col,0.9*a); g.add_color_stop_rgba(0.35,*col,0.35*a); g.add_color_stop_rgba(1,*col,0); c.set_source(g); circ(c,x,y,r); c.fill()
def star5(c,x,y,R,rot=0):
    c.new_path()
    for i in range(10):
        r=R if i%2==0 else R*0.45; a=rot-math.pi/2+i*math.pi/5; (c.move_to if i==0 else c.line_to)(x+r*math.cos(a),y+r*math.sin(a))
    c.close_path()
def orbit(v,steps=5000,dt=0.004,rc=0.18):
    r=np.array([1.0,0]); u=np.array([0,v]); P=[r.copy()]
    for _ in range(steps):
        a=-r/np.linalg.norm(r)**3; u=u+dt*a; r=r+dt*u; P.append(r.copy())
        if np.linalg.norm(r)<rc or np.linalg.norm(r)>4: break
    return np.array(P)
ORB={k:orbit(v) for k,v in (('slow',0.5),('fast',1.55),('ok',1.0))}
def dots(c,P,cx,cy,scale,col,rad=2.2,glowing=False):
    for x,y in P:
        X,Y=cx+x*scale,cy+y*scale
        if -20<X<W+20 and -20<Y<H+20:
            if glowing: c.set_source_rgba(*col,0.18); circ(c,X,Y,rad*2.6); c.fill()
            c.set_source_rgba(*col,0.95); circ(c,X,Y,rad); c.fill()
def sun(c,x,y,r=16,t=0):
    glow(c,x,y,r*3.2*(1+0.06*math.sin(t*3)),(1,0.7,0.25)); c.set_source_rgb(1,0.9,0.6); circ(c,x,y,r*0.6); c.fill()
POSES={'idle':(110,95,70,85),'point':(115,95,-12,-22),'wave':(115,95,-70,-100),'shrug':(160,-120,20,-60),
'think':(115,95,40,-150),'armsup':(-125,-100,-55,-80),'shock':(-150,-120,-30,-60),'jump':(-130,-100,-50,-80)}
SKIN=(0.42,0.26,0.16)
SKIN_HI=(0.52,0.33,0.21)
HAIRC=(0.10,0.07,0.06)
HAIRH=(0.22,0.15,0.12)
LINE=(0.13,0.07,0.04)
JACKET=(0.16,0.50,0.70)
BOOT=(0.95,0.55,0.20)
KENTE=[(0.98,0.74,0.25),(0.20,0.62,0.35),(0.85,0.25,0.22),(0.10,0.08,0.06)]
rngA=np.random.default_rng(11)
PUFFS=[(math.cos(a)*r,math.sin(a)*r*0.92,rad) for a,r,rad in zip(rngA.uniform(0,2*math.pi,46),rngA.uniform(38,62,46),rngA.uniform(14,22,46))]
CURLS=[(rngA.uniform(-60,60),rngA.uniform(-70,30),rngA.uniform(0,6.3)) for _ in range(26)]
def limb(c,pts,col=SKIN,w=7):
    c.new_path(); c.move_to(*pts[0]); [c.line_to(*p) for p in pts[1:]]; c.set_source_rgb(*FG); c.set_line_width(w+3.5); c.stroke()
    c.move_to(*pts[0]); [c.line_to(*p) for p in pts[1:]]; c.set_source_rgb(*col); c.set_line_width(w); c.stroke()
def nova(c,t,fi):
    emo,pose,prev,k,cur=state(t)
    P=[POSES[prev][j]*(1-k)+POSES[pose][j]*k for j in range(4)]
    if pose=='wave': P[3]+=28*math.sin(t*10)*k
    if pose=='point': P[3]+=6*math.sin(t*3)
    jump=0
    if pose=='jump' and cur: jump=max(0,math.sin((t-cur['start'])*5))*55
    if emo=='excited': jump=max(jump,abs(math.sin(t*4))*3)
    sad=emo=='sad'
    lean={'shock':-0.10,'curious':0.07,'smirk':0.04,'worried':-0.05,'sad':0.0}.get(emo,0.02)
    x,y=165,318+4*math.sin(t*1.8)-jump+(6 if sad else 0); hx,hy=x+lean*110,y; bx,by=x,y+160
    c.new_path(); c.set_line_cap(cairo.LINE_CAP_ROUND); c.set_line_join(cairo.LINE_JOIN_ROUND)
    c.save(); c.translate(165,578); c.scale(1,0.16); circ(c,0,0,60-jump*0.4); c.restore(); c.set_source_rgba(0,0,0,0.4); c.fill()
    # afro: squash on jumps, bounce on speech
    sq=1.0
    ax0,ay0=hx-2,hy-30
    c.save(); c.translate(ax0,ay0); c.scale(sq,1/sq)
    for px,py,r in PUFFS: c.set_source_rgb(*FG); circ(c,px,py,r+3); c.fill()
    for px,py,r in PUFFS: c.set_source_rgb(*HAIRC); circ(c,px,py,r); c.fill()
    c.set_line_width(2); 
    for cx_,cy_,ph in CURLS: c.set_source_rgba(*HAIRH,0.9); c.new_path(); c.arc(cx_,cy_,4,ph,ph+4); c.stroke()
    c.restore()
    # headband (kente) + hair pick with the star
    c.save(); c.new_path(); c.arc(hx,hy,44,math.pi*1.12,math.pi*1.88); c.set_line_width(10); 
    for i,col in enumerate(KENTE[:3]): c.set_source_rgb(*col); c.set_dash([10,20],i*10); c.new_path(); c.arc(hx,hy,44,math.pi*1.12,math.pi*1.88); c.stroke()
    c.set_dash([]); c.restore()
    droop=18 if emo in('worried','sad') else 0; px_,py_=hx+40,hy-62; sx_,sy_=px_+18+3*math.sin(t*1.2)+droop,py_-34+droop*1.3
    c.set_source_rgb(*AMB); c.set_line_width(4); c.move_to(px_,py_); c.line_to(sx_,sy_); c.stroke()
    for j in range(3): c.move_to(px_-6+j*5,py_+6); c.line_to(px_-2+j*5,py_+20); c.stroke()
    spin=0.0; bright=1.4 if emo=='shock' and int(t*8)%2 else (0.6 if sad else 1)
    glow(c,sx_,sy_,30,AMB,0.6); star5(c,sx_,sy_,13,spin); c.set_source_rgb(*AMB); c.fill()
    # face
    c.set_source_rgb(*SKIN); circ(c,hx,hy,40); c.fill_preserve(); c.set_source_rgb(*FG); c.set_line_width(3.5); c.stroke()
    g=cairo.RadialGradient(hx-14,hy-14,2,hx-14,hy-14,30); g.add_color_stop_rgba(0,*SKIN_HI,0.8); g.add_color_stop_rgba(1,*SKIN_HI,0); c.set_source(g); circ(c,hx,hy,39); c.fill()
    for s in(-1,1): c.set_source_rgb(*SKIN); circ(c,hx+s*40,hy+4,7); c.fill(); c.set_source_rgb(*AMB); circ(c,hx+s*41,hy+13,3.5); c.fill()  # ears + earrings
    if emo in('happy','proud','excited','smirk'):
        for ex in(-24,24): c.set_source_rgba(0.85,0.35,0.35,0.35); circ(c,hx+ex,hy+13,7); c.fill()
    look=4 if pose=='point' else 0; blink=(t%3.9)<0.12
    for s in(-1,1):
        ex,ey=hx+s*14+look,hy+1
        if emo in('happy','proud'):
            c.set_source_rgb(*LINE); c.set_line_width(4); c.new_path(); c.arc(ex,ey+3,7,math.pi*1.1,math.pi*1.9); c.stroke(); continue
        if blink: c.set_source_rgb(*LINE); c.set_line_width(3.5); c.move_to(ex-7,ey); c.line_to(ex+7,ey); c.stroke(); continue
        ry={'shock':12,'smirk':6,'worried':10,'sad':8}.get(emo,10); rx=8 if emo!='shock' else 9.5
        c.save(); c.translate(ex,ey); c.scale(rx,ry); circ(c,0,0,1); c.restore(); c.set_source_rgb(1,1,1); c.fill_preserve(); c.set_source_rgb(*LINE); c.set_line_width(2); c.stroke()
        pr_=4.8 if emo!='shock' else 3.6; c.set_source_rgb(0.08,0.05,0.04); circ(c,ex+look*0.6,ey+(2 if sad else 1),pr_); c.fill(); c.set_source_rgb(1,1,1); circ(c,ex+look*0.6+1.8,ey-1.4,1.7); c.fill()
        if emo in('smirk','sad'): c.set_source_rgb(*SKIN); c.rectangle(ex-10,ey-ry-2,20,ry*(0.8 if emo=='smirk' else 0.7)); c.fill()
        c.set_source_rgb(*LINE); c.set_line_width(2.2)
        for j in (-1,0): c.move_to(ex+s*rx*0.7,ey-ry*0.7); c.line_to(ex+s*rx*0.7+s*5,ey-ry*0.7-4+3*j); c.stroke()
    if sad: c.set_source_rgba(0.55,0.8,1,0.9); dy=((t*0.8)%1)*14; c.new_path(); tx_,ty_=hx+18+look,hy+10+dy; c.move_to(tx_,ty_-6); c.curve_to(tx_+4,ty_,tx_+4,ty_+4,tx_,ty_+4); c.curve_to(tx_-4,ty_+4,tx_-4,ty_,tx_,ty_-6); c.fill()
    for s in(-1,1):
        br={'worried':(-0.45,-6),'sad':(-0.55,-5),'shock':(-0.1,-12),'curious':(-0.35*s,-5),'thinking':(0.35*s,-3),'excited':(-0.2,-9),'smirk':(-0.5*(s>0),-6-4*(s>0))}.get(emo,(0,-3))
        a=br[0]*s; bxx,byy=hx+s*14+look,hy-14+br[1]; c.set_source_rgb(*HAIRC); c.set_line_width(4)
        c.move_to(bxx-8*math.cos(a),byy+8*math.sin(a)); c.line_to(bxx+8*math.cos(a),byy-8*math.sin(a)); c.stroke()
    o=ENV[min(fi,len(ENV)-1)] if speaking(t) else 0
    smile={'happy':1,'proud':1,'excited':0.9,'worried':-0.7,'sad':-1,'shock':0,'thinking':-0.2,'smirk':0.6}.get(emo,0.5)
    mx,my=hx+look*0.5+(5 if emo=='smirk' else 0),hy+22; wdt=13 if emo!='shock' else 9; op=2+13*o+(9 if emo=='shock' else 0); tilt=4 if emo=='smirk' else 0
    c.new_path(); c.move_to(mx-wdt,my-smile*4+tilt); c.curve_to(mx-wdt*0.5,my+smile*5,mx+wdt*0.5,my+smile*5,mx+wdt,my-smile*4-tilt)
    c.curve_to(mx+wdt*0.6,my+op,mx-wdt*0.6,my+op,mx-wdt,my-smile*4+tilt); c.close_path(); c.set_source_rgb(0.35,0.06,0.10); c.fill_preserve(); c.set_source_rgb(*LINE); c.set_line_width(2.5); c.stroke()
    if smile>0.5 and o>0.3: c.set_source_rgb(1,1,1); c.rectangle(mx-wdt*0.55,my+smile*1.5,wdt*1.1,3); c.fill()
    # body
    nx,ny=hx*0.6+bx*0.4,y+42
    limb(c,[(nx,ny-6),(nx,ny+6)],SKIN,9)
    c.new_path(); c.move_to(nx-17,ny+4); c.line_to(nx+17,ny+4); c.line_to(bx+25,by); c.line_to(bx-25,by); c.close_path()
    c.set_source_rgb(*JACKET); c.fill_preserve(); c.set_source_rgb(*FG); c.set_line_width(3); c.stroke()
    for i,col in enumerate(KENTE):  # kente hem
        c.set_source_rgb(*col); yy=by-14+i*3.5; c.rectangle(bx-25+i*0.6,yy,50-i*1.2,3.5); c.fill()
    for j in range(5): c.set_source_rgb(*KENTE[j%3]); c.rectangle(bx-22+j*10,by-14,4,14); c.fill()
    sp=26 if pose!='jump' else 16
    for s in(-1,1):
        ph_=WALK_PH+(0 if s>0 else math.pi); fx,fy=bx+s*sp+WALK_AMP*math.sin(ph_),by+88-max(0,WALK_AMP*0.45*math.cos(ph_)); limb(c,[(bx+s*10,by),(bx+s*sp*0.75,by+45),(fx,fy)])
        c.new_path(); c.move_to(fx-9 if s>0 else fx-18,fy+6); c.line_to(fx-9 if s>0 else fx-14,fy-9); c.line_to(fx+9 if s<0 else fx+14,fy-9); c.line_to(fx+18 if s>0 else fx+9,fy+6); c.close_path()
        c.set_source_rgb(*BOOT); c.fill_preserve(); c.set_source_rgb(*FG); c.set_line_width(2); c.stroke(); c.set_source_rgb(1,1,1); c.rectangle(fx-12,fy+3,24,3); c.fill()
    shx,shy=nx,ny+16
    for side,(a1,a2) in ((-1,(P[0],P[1])),(1,(P[2],P[3]))):
        r1,r2=math.radians(a1),math.radians(a2); sx0=shx+side*14; ex,ey=sx0+46*math.cos(r1),shy+46*math.sin(r1)
        if pose=='think' and side==1: ex,ey,hx2,hy2=sx0+28,shy+22,hx+18,hy+40
        else: hx2,hy2=ex+42*math.cos(r2),ey+42*math.sin(r2)
        c.set_source_rgb(*FG); c.set_line_width(12.5); c.move_to(sx0,shy); c.line_to(ex,ey); c.stroke()
        c.set_source_rgb(*JACKET); c.set_line_width(9); c.move_to(sx0,shy); c.line_to(ex,ey); c.stroke()
        limb(c,[(ex,ey),(hx2,hy2)]); c.set_source_rgb(*FG); circ(c,hx2,hy2,7.5); c.fill(); c.set_source_rgb(*SKIN); circ(c,hx2,hy2,5.5); c.fill()
    # kente scarf
    c.new_path(); c.move_to(nx-20,ny+2); c.curve_to(nx-8,ny+12,nx+8,ny+12,nx+20,ny+2); c.set_source_rgb(*KENTE[0]); c.set_line_width(9); c.stroke()
    for j in range(2):
        f=math.sin(t*2+j*1.3)*3; pts=(nx-8,ny+8,nx-24,ny+16+f,nx-40-j*6,ny+8-f,nx-52-j*8,ny+16+f*1.4)
        c.new_path(); c.move_to(*pts[:2]); c.curve_to(*pts[2:]); c.set_source_rgb(*KENTE[j+1]); c.set_line_width(7-j*2); c.stroke()
    pr=ease((t-cur['start']+0.2)/0.3) if cur else ease((t-0.4)/0.3)
    tx0,ty0=hx-78,hy-46
    if emo=='shock': s=back(pr); text(c,'!',tx0,ty0,56,AMB,True,align='c',alpha=min(1,max(0,s)),scale=max(0.01,s))
    if emo in('curious','thinking'): text(c,'?',tx0,ty0,48,BLU,True,align='c',alpha=pr,scale=max(0.01,back(pr)))
    if emo=='worried': c.set_source_rgba(0.5,0.75,1,pr); c.new_path(); dx,dy=hx+46,hy-14+6*((t*1.5)%1); c.move_to(dx,dy-12); c.curve_to(dx+8,dy,dx+8,dy+8,dx,dy+8); c.curve_to(dx-8,dy+8,dx-8,dy,dx,dy-12); c.fill()
    if emo in('happy','proud','excited'):
        for j in range(3):
            a=t*2+j*2.1; sx,sy=hx+78*math.cos(a),hy-30+40*math.sin(a)*0.5; star5(c,sx,sy,6+2*math.sin(t*6+j),t); c.set_source_rgba(*AMB,0.8*pr*max(0,1-(t-cur['start'])/1.5)); c.fill()
    
