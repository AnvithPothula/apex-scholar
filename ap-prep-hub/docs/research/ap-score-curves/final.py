import json
from statistics import NormalDist, mean
N=NormalDist()
d=json.load(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'dists.json'))); names={k.split(' - Compare')[0]:k for k in d}
sheets=json.load(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'sheets.json')))
def ge(dist):
    t=sum(dist); s=[x/t for x in dist]; return [s[0],s[0]+s[1],s[0]+s[1]+s[2],s[0]+s[1]+s[2]+s[3]]
def lin(xs,ys):
    mx,my=mean(xs),mean(ys); b=sum((x-mx)*(y-my) for x,y in zip(xs,ys))/sum((x-mx)**2 for x in xs); return my-b*mx,b
def interp(zs,cs,z):
    a,b=lin(zs,cs)
    pts=sorted(zip(zs,cs))
    if z<pts[0][0]: return pts[0][1]+b*(z-pts[0][0])
    if z>pts[-1][0]: return pts[-1][1]+b*(z-pts[-1][0])
    for (z0,c0),(z1,c1) in zip(pts,pts[1:]):
        if z0<=z<=z1: return c0+(c1-c0)*(z-z0)/(z1-z0)
# pooled
P=[]
for s,l in sheets.items():
    for yr,mx,cuts in l:
        dist=d[names[s]].get(yr)
        if not dist or abs(sum(dist)-100)>2: continue
        for p,c in zip(ge(dist),cuts): P.append((N.inv_cdf(1-p),c/mx*100))
A,B=lin([p[0] for p in P],[p[1] for p in P])
print('pooled a=%.2f b=%.2f'%(A,B))
REDESIGNED={'AP Statistics','AP English Language','AP Psychology','AP Physics 1 - Algebra Based','AP Biology'}
def fix(dist):  # repair typos like 241
    return [x if x<100 else x/10 for x in dist]
out={}
for s in names:
    dd=d[names[s]]
    if '2026' not in dd: continue
    new=ge(fix(dd['2026'])); zn=[N.inv_cdf(1-p) for p in new]
    pooled=[A+B*z for z in zn]
    if s in sheets:
        ests=[]
        for yr,mx,cuts in sheets[s]:
            dist=dd.get(yr)
            if not dist or abs(sum(dist)-100)>2: continue
            zo=[N.inv_cdf(1-p) for p in ge(dist)]
            lo,hi=min(zo),max(zo)
            row=[]
            for z in zn:
                v=interp(zo,[c/mx*100 for c in cuts],z)
                # Far outside the chart's observed range, a straight extrapolation
                # overshoots; shrink toward the cross-subject model.
                if z<lo-0.25 or z>hi+0.25: v=(v+A+B*z)/2
                row.append(v)
            ests.append(row)
        mapped=[mean(e[i] for e in ests) for i in range(4)]
        if s in REDESIGNED:
            val=[(m+p)/2 for m,p in zip(mapped,pooled)]; basis='blend'
        else: val=mapped; basis='chart'
    else:
        val=pooled; basis='pooled'
    # enforce order & gaps
    for i in range(1,4): val[i]=min(val[i], val[i-1]-4)
    val=[max(5,v) for v in val]
    out[s]={'cutPct':[round(v,1) for v in val],'basis':basis,'geq2026':[round(x*100) for x in new]}
    print(f"{s:40s} {basis:6s} P>=k {out[s]['geq2026']} -> cut% {out[s]['cutPct']}")
json.dump(out,open(__import__('os').path.join(__import__('os').path.dirname(__file__),'cuts_final.json'),'w'),indent=1)
