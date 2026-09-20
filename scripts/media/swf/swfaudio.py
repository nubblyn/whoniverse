# Pull the streamed MP3 out of a SWF: every SoundStreamBlock is one frame of
# audio, MP3-framed, preceded by a 4-byte header (sample count, seek samples).
# Concatenating the payloads gives a raw MP3 whose length is frames/fps.
import struct,sys
def extract(path,out):
    b=open(path,'rb').read()
    assert b[:3]==b'FWS', 'compressed SWF, not handled'
    nb=b[8]>>3; i=8+((5+nb*4)+7)//8
    fps=b[i]/256.0+b[i+1]; frames=struct.unpack('<H',b[i+2:i+4])[0]; i+=4
    blocks=0; fmt=None
    with open(out,'wb') as o:
        while i<len(b)-1:
            th=struct.unpack('<H',b[i:i+2])[0]; i+=2; code=th>>6; ln=th&0x3f
            if ln==0x3f: ln=struct.unpack('<I',b[i:i+4])[0]; i+=4
            body=b[i:i+ln]; i+=ln
            if code in (18,45): fmt=(body[1]>>4)&0xf
            elif code==19:
                if fmt==2: o.write(body[4:])   # MP3: skip SampleCount + SeekSamples
                else: o.write(body)
                blocks+=1
            if code==0: break
    return fps,frames,blocks
if __name__=='__main__':
    fps,frames,blocks=extract(sys.argv[1],sys.argv[2])
    print('  fps %g  frames %d  audio blocks %d  -> timeline %.2fs'%(fps,frames,blocks,frames/fps))
