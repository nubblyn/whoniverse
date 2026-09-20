import struct
def header(b):
    nb=b[8]>>3; i=8+((5+nb*4)+7)//8
    return i+4   # first tag offset (after fps+framecount)
def tags(b,i,end):
    """yield (offset_of_tag_header, code, body_start, body_end) at one level"""
    while i<end-1:
        h=i; th=struct.unpack('<H',b[i:i+2])[0]; i+=2; code=th>>6; ln=th&0x3f
        if ln==0x3f: ln=struct.unpack('<I',b[i:i+4])[0]; i+=4
        yield h,code,i,i+ln; i+=ln
        if code==0: break
def scan_scripts(b):
    out=[]
    def walk(i,end,ctx):
        frame=0
        for h,code,s,e in tags(b,i,end):
            if code==39: walk(s+4,e,'sprite%d'%struct.unpack('<H',b[s:s+2])[0])
            elif code==12:
                body=b[s:e]; ops=[]; j=0
                while j<len(body):
                    op=body[j]; j+=1
                    if op>=0x80: ln=struct.unpack('<H',body[j:j+2])[0]; j+=2+ln
                    ops.append(op)
                out.append((ctx,frame,len(ops),0x07 in ops,0x83 in ops or 0x9a in ops))
            elif code==1: frame+=1
    walk(header(b),len(b),'main'); return out
def strip(b,drop):
    """rewrite the SWF without tags whose code is in `drop` (top level and inside sprites); fix lengths"""
    def rebuild(i,end):
        out=bytearray()
        for h,code,s,e in tags(b,i,end):
            if code in drop: continue
            if code==39:
                inner=rebuild(s+4,e); body=b[s:s+4]+inner
            else: body=b[s:e]
            ln=len(body)
            if ln<0x3f and code!=39: out+=struct.pack('<H',(code<<6)|ln)+body
            else: out+=struct.pack('<HI',(code<<6)|0x3f,ln)+body
        return bytes(out)
    first=header(b); newtags=rebuild(first,len(b))
    new=bytearray(b[:first])+newtags
    new[4:8]=struct.pack('<I',len(new)); return bytes(new)
