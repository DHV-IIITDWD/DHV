export const R=(x:number,d=2)=>{const m=10**d;return Math.round(x*m)/m};
export const mean=(a:number[])=>a.reduce((s,x)=>s+x,0)/a.length;
export const sd=(a:number[])=>{if(a.length<2)return NaN;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))};
export const qt=(a:number[],p:number)=>{const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,l=Math.floor(i);return s[l]+(s[Math.ceil(i)]-s[l])*(i-l)};
export const median=(a:number[])=>qt(a,.5);
export function corr(a:number[],b:number[]){const n=a.length;if(n<3)return NaN;const ma=mean(a),mb=mean(b);
  let sab=0,sa=0,sb=0;for(let i=0;i<n;i++){sab+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sb+=(b[i]-mb)**2;}return sab/Math.sqrt(sa*sb);}
export function linreg(x:number[],y:number[]){const n=x.length,mx=mean(x),my=mean(y);
  const sxx=x.reduce((s,v)=>s+(v-mx)**2,0),b=sxx?x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0)/sxx:0;return {a:my-b*mx,b,n}}
/** Tukey box statistics: whiskers end at the most extreme point inside 1.5×IQR fences. */
export function boxStats(v:number[]){const s=[...v].sort((a,b)=>a-b),q1=qt(s,.25),md=qt(s,.5),q3=qt(s,.75),i=q3-q1,lo=q1-1.5*i,hi=q3+1.5*i;
  const inside=s.filter(x=>x>=lo&&x<=hi);return {min:inside[0]??s[0],q1,med:md,q3,max:inside.at(-1)??s.at(-1)!,out:s.filter(x=>x<lo||x>hi)}}
/** Gaussian KDE (Silverman bandwidth), evaluated only inside [min,max] of the data so it never invents range. */
export function kde(v:number[],pts=60){const n=v.length,s=sd(v),iqr=qt(v,.75)-qt(v,.25),spread=Math.min(s,iqr/1.34)||s||1,h=0.9*spread*n**-0.2||1;
  const lo=Math.min(...v),hi=Math.max(...v),at=(y:number)=>v.reduce((t,x)=>t+Math.exp(-0.5*((y-x)/h)**2),0)/(n*h*Math.sqrt(2*Math.PI));
  const ys=Array.from({length:pts},(_,i)=>lo+(hi-lo)*i/(pts-1));return {ys,ds:ys.map(at),at,h}}
/** Deterministic pseudo-jitter in [-0.5,0.5) from a label, so charts are reproducible (no Math.random). */
export function jit(label:string){let h=2166136261;for(let i=0;i<label.length;i++){h^=label.charCodeAt(i);h=Math.imul(h,16777619)}return ((h>>>0)%10000)/10000-0.5}
export const fin=(a:number[])=>a.filter(Number.isFinite);
export const strength=(r:number)=>Math.abs(r)>.7?'strong':Math.abs(r)>.4?'moderate':'weak';
