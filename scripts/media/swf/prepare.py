# Build the work dir pipeline.py renders from, out of a folder of SWFs laid out
# as <EP>/<part>.swf (the Shada set: EP1/0_prelude.swf, EP1/1.swf ...).
#
#   python scripts/media/swf/prepare.py "<swf root>" <work dir>
#
# For each part: a copy with its DoAction, SoundStreamHead and SoundStreamBlock
# tags removed (clean/), the streamed MP3 lifted out whole (audio/), and a row
# in plan.json saying how many frames it has, which frame its sound starts on,
# and where to cut. Parts carrying the BBC's 2003 origin script get cut at
# frame 40, where that script's own dev branch jumps to; the rest at 0.
import sys,os,glob,json,struct
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from swftools import header,tags,scan_scripts,strip
root,work=sys.argv[1],sys.argv[2]
for d in ('clean','audio'): os.makedirs(os.path.join(work,d),exist_ok=True)
plan={}
for p in sorted(glob.glob(os.path.join(root,'EP*','*.swf'))):
    b=open(p,'rb').read(); ep=os.path.basename(os.path.dirname(p)); part=os.path.basename(p)[:-4]; key='%s_%s'%(ep,part)
    scripted=any(c=='main' and n>10 for c,f,n,st,u in scan_scripts(b))
    fr=0; first=None; fmt=None
    with open(os.path.join(work,'audio',key+'.mp3'),'wb') as o:
        for h,code,s,e in tags(b,header(b),len(b)):
            if code in (18,45): fmt=(b[s+1]>>4)&0xf
            elif code==19:
                if first is None: first=fr
                o.write(b[s+4:e] if fmt==2 else b[s:e])
            elif code==1: fr+=1
    open(os.path.join(work,'clean',key+'.swf'),'wb').write(strip(b,{12,18,45,19}))
    cut=40 if scripted else 0
    plan[key]=dict(ep=ep,part=part,frames=fr,first_audio=first,cut=cut,audio_delay=(first-cut)/12.0,scripted=scripted)
    print('  %-16s frames %5d  audio from %4s  cut %2d  %s'%(key,fr,first,cut,'scripted' if scripted else ''))
json.dump(plan,open(os.path.join(work,'plan.json'),'w'),indent=1)
print('%d parts -> %s'%(len(plan),work))
