# Shada (2003) at 2160p, from the BBC's own Flash files.
#
#   python scripts/media/swf/pipeline.py --work <dir> --exporter <exporter.exe> [nvenc|x265] [EP1 ...]
#
# <dir> holds plan.json, clean/<part>.swf and audio/<part>.mp3, made by prepare.py.
#
# Per part: render every frame with Ruffle's headless exporter from a copy of
# the SWF with its scripts and sound stream removed (the scripts are a 2003
# origin check that parks the movie on an error frame when played from disk;
# the sound is re-attached from the SWF itself), drop the loader frames on the
# 16 parts that had the script, encode at 12 fps, and mux the MP3 stream at the
# exact frame it started on. Then join each episode's parts. The prelude stays
# its own file. Frames are deleted after each part encodes.
import sys,os,json,subprocess,shutil,time,glob
import argparse
ap=argparse.ArgumentParser(); ap.add_argument('--work',required=True); ap.add_argument('--exporter',required=True)
ap.add_argument('enc',nargs='?',default='nvenc'); ap.add_argument('only',nargs='*'); A=ap.parse_args()
SP=os.path.abspath(A.work); EXP=os.path.abspath(A.exporter); enc=A.enc; only=set(A.only)
plan=json.load(open(os.path.join(SP,'plan.json')))
OUT=os.path.join(SP,'out'); os.makedirs(OUT,exist_ok=True)
FR=os.path.join(SP,'frames')
def venc():
    if enc=='nvenc': return ['-c:v','hevc_nvenc','-preset','p7','-tune','hq','-rc','constqp','-qp','18','-pix_fmt','p010le','-profile:v','main10','-tag:v','hvc1']
    return ['-c:v','libx265','-preset','medium','-crf','16','-pix_fmt','yuv420p10le','-x265-params','log-level=error','-tag:v','hvc1']
def run(cmd): 
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode: raise SystemExit('FAILED: %s\n%s'%(' '.join(cmd),r.stderr[-800:]))
def order(k):  # prelude first, then numeric
    p=plan[k]['part']; return (0,0) if p.startswith('0') else (1,int(p))
log=open(os.path.join(SP,'pipeline.log'),'a')
def say(s): print(s,flush=True); log.write(time.strftime('%H:%M:%S ')+s+'\n'); log.flush()
for key in sorted(plan,key=lambda k:(plan[k]['ep'],order(k))):
    v=plan[key]
    if only and v['ep'] not in only: continue
    part_mp4=os.path.join(OUT,key+'.mp4')
    if os.path.exists(part_mp4) and os.path.getsize(part_mp4)>1e6: say('%s: already encoded'%key); continue
    if os.path.isdir(FR): shutil.rmtree(FR)
    os.makedirs(FR)
    t=time.time()
    run([EXP,os.path.join(SP,'clean',key+'.swf'),FR,'-f','all','--width','3840','--height','2160','-s'])
    n=len(glob.glob(os.path.join(FR,'*.png')))
    if n!=v['frames']: raise SystemExit('%s: rendered %d frames, expected %d'%(key,n,v['frames']))
    tr=time.time()-t; t=time.time()
    delay=int(round(v['audio_delay']*1000))
    run(['ffmpeg','-v','error','-framerate','12','-start_number',str(v['cut']),'-i',os.path.join(FR,'%04d.png'),
         '-i',os.path.join(SP,'audio',key+'.mp3'),
         '-filter_complex','[1:a]adelay=%d|%d,aresample=48000[a]'%(delay,delay),
         '-map','0:v','-map','[a]']+venc()+['-r','12','-c:a','aac','-b:a','160k','-movflags','+faststart','-y',part_mp4])
    te=time.time()-t
    say('%s: %d frames, cut %d, audio +%.3fs | render %.0fs (%.1f fps) encode %.0fs | %.1f MB'%(key,n,v['cut'],v['audio_delay'],tr,n/tr,te,os.path.getsize(part_mp4)/1e6))
    shutil.rmtree(FR)
# join per episode (stream copy; identical encode params)
for ep in sorted({v['ep'] for v in plan.values()}):
    if only and ep not in only: continue
    parts=[k for k in sorted(plan,key=lambda k:(plan[k]['ep'],order(k))) if plan[k]['ep']==ep and not plan[k]['part'].startswith('0')]
    if not all(os.path.exists(os.path.join(OUT,k+'.mp4')) for k in parts): continue
    lst=os.path.join(OUT,ep+'_concat.txt')
    open(lst,'w').write(''.join("file '%s'\n"%os.path.join(OUT,k+'.mp4').replace(os.sep,'/') for k in parts))
    final=os.path.join(OUT,ep+'.mp4')
    run(['ffmpeg','-v','error','-f','concat','-safe','0','-i',lst,'-c','copy','-movflags','+faststart','-y',final])
    d=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',final],capture_output=True,text=True).stdout.strip()
    say('%s: joined %d parts -> %s s, %.1f MB'%(ep,len(parts),d,os.path.getsize(final)/1e6))
say('done')
