import math, cairo
from gfx import ease, back, text, rrect, circ, arrow, glow, FG, MUTED, AMB, RED, GRN, BLU, PUR
PX,PY,PW,PH=330,62,920,505; PCX,PCY=PX+PW/2,PY+PH/2
META=dict(stage_label='STAGE 0 · PROJECT 1',title='The Uncertainty Sandbox',subtitle='Episode 1 of your journey',when='Watch this before you start',
          next='Step 0 · Create the project folder',next_sub='then Step 1: write the checks first',key=0)
CHAPTERS={'hook':'Intro','1':'1 · Fuzzy numbers','2':'2 · Units','3':'3 · Mixing','recap':'Recap'}
RIBBONS={'1':'IDEA 1 · Fuzzy numbers','2':'IDEA 2 · Changing units','3':'IDEA 3 · Mixing blobs','recap':'RECAP'}
L=lambda **k: k
LINES=[
L(id='ctx',d=3.4,ch='hook',scene='context',emo='happy',pose='wave'),
L(id='h1',who='N',t="Quick question. How tall are you?",scene='ruler',emo='curious',pose='point'),
L(id='h2',who='N',t="Whatever you said, it wasn't exact. Your ruler is a little bit fuzzy, and so is every measurement in science.",emo='smirk'),
L(id='h3',who='N',t="Hi, I'm Nova! This is your very first project, so let me show you what you're about to build.",scene='sandbox',emo='happy',pose='wave'),
L(id='h4',who='N',t="A sandbox where every measurement is a glowing blob. A tight glow means you're sure. A wide glow means you're not.",emo='excited',pose='point'),
L(id='h5',who='N',t="You'll drag blobs into new units, and push two blobs together to combine them.",emo='happy'),
L(id='h6',who='N',t="But first, three ideas: fuzzy numbers, changing units, and mixing blobs."),
L(id='a1',who='N',t="Idea one. A measurement is really two numbers.",ch='1',scene='measure',emo='curious'),
L(id='a2',who='N',t="The value: twelve point four. And the uncertainty: plus or minus zero point two.",emo='neutral'),
L(id='a3',who='N',t="The bigger the uncertainty, the wider the blob's glow.",scene='glow',emo='happy'),
L(id='a4',who='N',t="One writing rule. Round the uncertainty to one significant figure. Then round the value to the same decimal place.",scene='round',emo='thinking',pose='point',ev='insight'),
L(id='b1',who='N',t="Idea two. Change the unit, and the uncertainty changes too.",ch='2',scene='convert',emo='curious'),
L(id='b2',who='N',t="Twelve point four metres per second is forty-four point six kilometres per hour. The plus or minus gets the same times three point six, so it becomes zero point seven.",emo='neutral'),
L(id='b3',who='N',t="Now, the trap. Celsius to Fahrenheit is times one point eight, plus thirty-two.",scene='temp',emo='smirk'),
L(id='b4',who='N',t="The value gets the plus thirty-two. The uncertainty does not! An offset moves the number, but it doesn't make it fuzzier.",emo='shock',pose='shock'),
L(id='b5',who='N',t="So twenty, plus or minus zero point five Celsius, becomes sixty-eight, plus or minus zero point nine Fahrenheit.",emo='happy',pose='point',ev='insight'),
L(id='c1',who='N',t="Idea three. Mixing blobs.",ch='3',scene='mix',emo='excited',pose='point'),
L(id='c2',who='N',t="Twelve point four, plus or minus zero point two. Plus three point one, plus or minus zero point one.",emo='neutral'),
L(id='c3',who='N',t="The value is fifteen point five. But what's the new plus or minus? Point three, or point two? Guess now!",emo='curious',pose='shrug'),
L(id='cnt',d=3.4,emo='thinking',pose='think',ev='count'),
L(id='c5',who='N',t="It's point two!",scene='triangle',emo='excited',pose='armsup',ev='reveal'),
L(id='c6',who='N',t="Random errors don't simply add up. Sometimes one is too high while the other is too low, so they partly cancel.",emo='happy',pose='point'),
L(id='c7',who='N',t="The rule: square them, add them, take the square root. Just like the long side of a right triangle.",emo='neutral',ev='insight'),
L(id='r0',who='N',t="Quick recap!",ch='recap',scene='recap',emo='happy'),
L(id='r1',who='N',t="One: every measurement is a value, plus or minus an uncertainty.",emo='neutral'),
L(id='r2',who='N',t="Two: units scale the uncertainty, but offsets never touch it."),
L(id='r3',who='N',t="Three: random errors combine like a triangle, not a straight sum.",emo='proud'),
L(id='n1',who='N',t="Now open the build guide and start with step zero. You'll write the checks first, then the code, then make it glow.",scene='next',emo='excited',pose='point'),
L(id='n2',who='N',t="You've got this. Let's go!",emo='excited',pose='jump'),
]
RECAP=[('A measurement = value ± uncertainty','r1'),('Units scale the ±, offsets never touch it','r2'),('Random errors combine like a triangle','r3')]
# ---------- helpers
def blob(c,x,y,ring,col,label=None,alpha=1,size=24):
    if alpha<=0.01: return
    g=cairo.RadialGradient(x,y,size*0.6,x,y,ring); g.add_color_stop_rgba(0,*col,0.55*alpha); g.add_color_stop_rgba(0.6,*col,0.22*alpha); g.add_color_stop_rgba(1,*col,0); c.set_source(g); circ(c,x,y,ring); c.fill()
    c.set_source_rgba(*col,alpha); circ(c,x,y,size); c.fill(); c.set_source_rgba(1,1,1,0.35*alpha); circ(c,x-size*0.3,y-size*0.3,size*0.3); c.fill()
    if label: text(c,label,x,y+size+max(34,ring*0.55),24,FG,True,align='c',alpha=alpha)
def pop(E,T,lid,off=0,d=0.45): t0=E.ls(lid)+off; return back((T-t0)/d) if T>t0 else 0
def fade(E,T,lid,off=0,d=0.4): return ease((T-E.ls(lid)-off)/d)
def pill(c,x,y,s_,col,a=1,w=None,size=24):
    from gfx import font
    font(c,size,True); tw=w or c.text_extents(s_).x_advance+40
    c.set_source_rgba(*col,0.16*a); rrect(c,x-tw/2,y-28,tw,52,26); c.fill(); c.set_source_rgba(*col,0.85*a); c.set_line_width(2); rrect(c,x-tw/2,y-28,tw,52,26); c.stroke(); text(c,s_,x,y+8,size,col,True,align='c',alpha=a)
# ---------- scenes
def ruler(c,T,E):
    x0,x1,y=PX+110,PX+PW-110,PCY+60; v0,v1=165,175; X=lambda v: x0+(v-v0)/(v1-v0)*(x1-x0)
    c.set_source_rgb(0.85,0.72,0.45); rrect(c,x0-20,y,x1-x0+40,70,8); c.fill()
    for v in range(v0,v1+1):
        for k in range(10):
            xx=X(v+k/10)
            if xx>x1: break
            h=34 if k==0 else (20 if k==5 else 11); c.set_source_rgb(0.25,0.18,0.1); c.rectangle(xx-1,y,2 if k==0 else 1.2,h); c.fill()
        text(c,str(v),X(v),y+58,16,(0.25,0.18,0.1),True,align='c')
    text(c,'your height (cm)',PCX,PY+110,22,MUTED,True,align='c')
    a=fade(E,T,'h1',0.6); c.set_source_rgba(*AMB,a); c.rectangle(X(170)-2,y-120,4,120); c.fill()
    s=fade(E,T,'h2',2.0,1.0)
    if s>0:
        g=cairo.LinearGradient(X(169),0,X(171),0); g.add_color_stop_rgba(0,*AMB,0); g.add_color_stop_rgba(0.5,*AMB,0.45*s); g.add_color_stop_rgba(1,*AMB,0); c.set_source(g); c.rectangle(X(169),y-120,X(171)-X(169),120); c.fill()
    lab='170 cm' if s<0.5 else '170 ± 1 cm'; text(c,lab,X(170),y-140,46,FG if s<0.5 else AMB,True,align='c',alpha=a)
BL=[(0.52,0.28,'12.4 ± 0.2 m/s',PUR,0.016),(0.2,0.42,'1.0 ± 0.1 km',GRN,0.10),(0.42,0.72,'500 ± 5 m',GRN,0.01),(0.78,0.75,'20 ± 0.5 C',(0.98,0.57,0.24),0.025),(0.9,0.28,'3.1 ± 0.1 m/s',PUR,0.032)]
def ring_of(rel): return 32+min(110,900*rel)
def sandbox(c,T,E):
    tx,ty,tw,th=PX+40,PY+110,PW-80,PH-150
    c.set_source_rgba(0.3,0.5,0.8,0.06); rrect(c,tx,ty,tw,th,20); c.fill(); c.set_source_rgba(0.5,0.7,1,0.25); c.set_line_width(2); rrect(c,tx,ty,tw,th,20); c.stroke()
    text(c,'THE SANDBOX',tx+20,ty+30,15,(0.6,0.75,1),True,True)
    m=ease((T-E.ls('h5')-0.8)/1.6); pos=[]
    for i,(fx,fy,lab,col,rel) in enumerate(BL):
        x,y=tx+fx*tw,ty+fy*th
        if i==0: x,y=x+(tx+0.72*tw-x)*m,y
        pos.append((x,y)); blob(c,x,y,ring_of(rel),col,lab,alpha=fade(E,T,'h3',0.3+0.15*i),size=18)
    a=pop(E,T,'h4',3.6)
    if a: x,y=pos[2]; arrow(c,x+120,y-60,x+30,y-14,GRN,3,min(1,a),10); text(c,'sure',x+128,y-62,24,GRN,True,alpha=min(1,a))
    b=pop(E,T,'h4',5.6)
    if b: x,y=pos[1]; arrow(c,x+150,y-70,x+70,y-30,AMB,3,min(1,b),10); text(c,'not sure',x+158,y-72,24,AMB,True,alpha=min(1,b))
    q=fade(E,T,'h6',0.0)
    if q>0:
        c.set_source_rgba(0.03,0.04,0.08,0.85*q); rrect(c,PX,PY+PH-120,PW,120,0); c.fill()
        for i,(lab,col) in enumerate((('1  Fuzzy numbers',RED),('2  Changing units',AMB),('3  Mixing blobs',GRN))):
            p=pop(E,T,'h6',1.2+0.6*i)
            if p: c.save(); c.translate(PCX+(i-1)*280,PY+PH-60); c.scale(p,p); pill(c,0,0,lab,col,w=250); c.restore()
def measure(c,T,E):
    a=pop(E,T,'a1',1.0); y=PCY+10
    if not a: return
    from gfx import font
    c.save(); c.translate(PCX,y); c.scale(a,a)
    font(c,96,True); w1=c.text_extents('12.4').x_advance; w2=c.text_extents(' ± 0.2').x_advance; w3=c.text_extents(' m/s').x_advance; x=-(w1+w2+w3)/2
    text(c,'12.4',x,0,96,FG,True); text(c,' ± 0.2',x+w1,0,96,AMB,True); text(c,' m/s',x+w1+w2,0,96,MUTED,True); c.restore()
    p=fade(E,T,'a2',0.3); q=fade(E,T,'a2',2.6)
    font(c,96,True); w1=c.text_extents('12.4').x_advance; w2=c.text_extents(' ± 0.2').x_advance; w3=c.text_extents(' m/s').x_advance; x=PCX-(w1+w2+w3)/2
    if p: c.set_source_rgba(*FG,p); c.rectangle(x,y+24,w1,4); c.fill(); text(c,'value',x+w1/2,y+70,28,FG,True,align='c',alpha=p)
    if q: c.set_source_rgba(*AMB,q); c.rectangle(x+w1+20,y+24,w2-20,4); c.fill(); text(c,'uncertainty',x+w1+w2/2+10,y+70,28,AMB,True,align='c',alpha=q)
def glowsc(c,T,E):
    u=(T-E.ls('a3'))/max(0.1,E.byid['a3']['dur']); unc=0.1 if u<0.25 else (0.2 if u<0.6 else 0.4)
    for i,(uu,x) in enumerate(((0.1,PX+200),(0.2,PCX),(0.4,PX+PW-200))):
        a=fade(E,T,'a3',0.2+0.9*i)
        blob(c,x,PCY-10,30+300*uu,PUR,f'± {uu}',alpha=a)
    text(c,'more uncertainty  →  wider glow',PCX,PY+PH-40,24,MUTED,True,align='c',alpha=fade(E,T,'a3',2.6))
def roundsc(c,T,E):
    rows=[(0.8,'12.437 ± 0.2381','the raw numbers',FG),(3.4,'± 0.2381  →  ± 0.2','1 significant figure',AMB),(6.6,'12.437  →  12.4','same decimal place',BLU)]
    for i,(off,s_,note,col) in enumerate(rows):
        a=fade(E,T,'a4',off)
        if a: text(c,s_,PX+90,PY+150+i*100,44,col,True,alpha=a); text(c,note,PX+PW-90,PY+150+i*100,22,MUTED,True,align='r',alpha=a)
    p=pop(E,T,'a4',7.2)
    if p: c.save(); c.translate(PCX,PY+PH-60); c.scale(p,p); pill(c,0,0,'12.4 ± 0.2',GRN,w=300,size=34); c.restore()
def convert(c,T,E):
    a=fade(E,T,'b1',0.4); blob(c,PX+220,PCY-20,ring_of(0.016)+20,PUR,'12.4 ± 0.2 m/s',alpha=a)
    p=fade(E,T,'b2',2.6,0.8)
    if p: arrow(c,PX+330,PCY-20,PX+330+(PW-660)*p,PCY-20,AMB,5,1,16); text(c,'× 3.6',PCX,PCY-45,34,AMB,True,align='c',alpha=p)
    q=fade(E,T,'b2',4.2); blob(c,PX+PW-220,PCY-20,ring_of(0.016)+20,PUR,'44.6 ± 0.7 km/h',alpha=q)
    r=fade(E,T,'b2',7.0)
    if r: text(c,'value × 3.6    and    uncertainty × 3.6',PCX,PY+PH-40,26,FG,True,align='c',alpha=r)
def temp(c,T,E):
    a=fade(E,T,'b3',0.3); col=(0.98,0.57,0.24); by=PCY+70
    blob(c,PX+190,by,30+3000*0.025,col,'20 ± 0.5 °C',alpha=a)
    p=fade(E,T,'b3',2.4)
    if p: text(c,'value:',PCX-40,PY+110,26,MUTED,True,align='r',alpha=p); text(c,'× 1.8  + 32',PCX-20,PY+110,34,FG,True,alpha=p)
    q=fade(E,T,'b4',2.2)
    if q:
        text(c,'uncertainty:',PCX-40,PY+175,26,MUTED,True,align='r',alpha=q); text(c,'× 1.8',PCX-20,PY+175,34,AMB,True,alpha=q); w=text(c,'  + 32',PCX+75,PY+175,34,(0.5,0.5,0.55),True,alpha=q)
        c.set_source_rgba(*RED,q); c.set_line_width(4); c.move_to(PCX+85,PY+164); c.line_to(PCX+80+w,PY+164); c.stroke()
    r=fade(E,T,'b5',1.0)
    if r: arrow(c,PX+330,by,PX+PW-330,by,AMB,4,r,14)
    blob(c,PX+PW-190,by,30+3000*0.013,col,'68.0 ± 0.9 °F',alpha=r)
    s=fade(E,T,'b5',4.5)
    if s: text(c,'same fuzziness, bigger number → the glow shrinks',PCX,PY+PH-22,22,MUTED,True,align='c',alpha=s)
def mix(c,T,E):
    m=ease((T-E.ls('c2')-1.0)/2.5); a=fade(E,T,'c1',0.3)
    blob(c,PX+200+120*m,PCY-30,ring_of(0.016)+25,PUR,'12.4 ± 0.2',alpha=a)
    blob(c,PX+PW-200-120*m,PCY-30,ring_of(0.032)+25,BLU,'3.1 ± 0.1',alpha=fade(E,T,'c1',0.8))
    p=fade(E,T,'c2',2.0)
    if p: text(c,'+',PCX,PCY-10,64,FG,True,align='c',alpha=p)
    q=pop(E,T,'c3',1.2)
    if q: c.save(); c.translate(PCX,PY+90); c.scale(q,q); text(c,'15.5 ± ?',0,10,44,FG,True,align='c'); c.restore()
    r=pop(E,T,'c3',3.0)
    if r:
        for i,(s_,col) in enumerate((('± 0.3',RED),('± 0.2',GRN))): c.save(); c.translate(PCX+(i*2-1)*120,PY+PH-55); c.scale(r,r); pill(c,0,0,s_,col,w=170,size=28); c.restore()
def triangle(c,T,E):
    a=pop(E,T,'c5',0.0); 
    if a: c.save(); c.translate(PX+190,PCY-30); c.scale(a,a); blob(c,0,0,ring_of(0.014)+30,GRN,'15.5 ± 0.2'); c.restore()
    p=fade(E,T,'c6',2.0); q=fade(E,T,'c7',0.3)
    ox,oy=PX+420,PCY+40
    if p and not q>0.99:
        al=p*(1-q); text(c,'one error too high, one too low',ox+190,PY+130,22,MUTED,True,align='c',alpha=al)
        arrow(c,ox,oy-60,ox+300,oy-60,PUR,6,al,14); text(c,'+0.2',ox+300,oy-80,22,PUR,True,align='c',alpha=al)
        arrow(c,ox+300,oy,ox+150,oy,BLU,6,al,14); text(c,'−0.1',ox+150,oy+30,22,BLU,True,align='c',alpha=al)
        arrow(c,ox,oy+70,ox+150,oy+70,AMB,6,al,14); text(c,'together: +0.1',ox+150,oy+105,22,AMB,True,align='c',alpha=al)
    if q:
        sx=300*q; sy=150*q; c.set_source_rgba(*PUR,q); c.set_line_width(6); c.move_to(ox,oy+60); c.line_to(ox+sx,oy+60); c.stroke()
        c.set_source_rgba(*BLU,q); c.move_to(ox+300,oy+60); c.line_to(ox+300,oy+60-sy); c.stroke()
        text(c,'0.2',ox+150,oy+95,26,PUR,True,align='c',alpha=q); text(c,'0.1',ox+330,oy-10,26,BLU,True,alpha=q)
        r=fade(E,T,'c7',2.6)
        if r:
            c.set_source_rgba(*AMB,r); c.set_line_width(6); c.move_to(ox,oy+60); c.line_to(ox+300,oy-90); c.stroke()
            text(c,'√(0.2² + 0.1²) = 0.22 → 0.2',ox+170,PY+120,30,AMB,True,align='c',alpha=r)
            text(c,'not 0.2 + 0.1 = 0.3',ox+170,PY+PH-30,22,RED,True,align='c',alpha=fade(E,T,'c7',4.0))
SCENES=dict(ruler=ruler,sandbox=sandbox,measure=measure,glow=glowsc,round=roundsc,convert=convert,temp=temp,mix=mix,triangle=triangle)
