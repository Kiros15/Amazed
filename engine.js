/* AMAZED V0.2 — deterministic physics shared by the browser and validation. */
(function(root){
'use strict';
const W=420,H=600,R=10,STEP=1/120;
const border=[[0,0,420,15],[0,0,15,600],[405,0,15,600],[0,585,420,15]];
// Each gate leaves a generous opening. Goals sit beyond the final gate.
const designs=[
 ['Primer impulso',[190,380],['R','L'],[],[],[],65],
 ['De lado a lado',[145,290,435],['L','R','L'],[[225,220]],[],[],85],
 ['Con cuidado',[130,260,390],['R','L','R'],[[180,195],[245,325]],[],[],95],
 ['Sobre hielo',[145,290,435],['R','L','R'],[[165,365]],[[120,180,180,65,'ice']],[],100],
 ['Toma aire',[115,225,335,445],['L','R','L','R'],[[230,170],[190,390]],[[120,260,180,45,'sand']],[],115],
 ['El péndulo',[145,290,435],['R','L','R'],[[180,365]],[],[[210,220,48,12,'x',45,4]],110],
 ['Doble textura',[115,225,335,445],['R','L','R','L'],[[210,170],[220,390]],[[130,260,140,45,'ice'],[110,485,150,45,'sand']],[[210,280,40,12,'x',30,3.5]],130],
 ['Paso medido',[105,205,305,405,505],['L','R','L','R','L'],[[220,155],[200,355]],[[120,235,150,40,'sand']],[[210,455,44,12,'x',40,3]],145],
 ['Sangre fría',[105,205,305,405,505],['R','L','R','L','R'],[[200,155],[220,355],[155,572]],[[120,235,180,40,'ice']],[[220,455,40,12,'x',45,2.8]],155],
 ['AMAZED',[105,205,305,405,505],['L','R','L','R','L'],[[205,155],[210,355],[245,572]],[[120,235,160,40,'ice'],[130,435,140,40,'sand']],[[220,255,38,12,'x',40,3],[200,455,38,12,'x',45,2.7]],170]
];
const levels=designs.map((d,i)=>{
 const [name,ys,sides,holes,zones,movers,par]=d, gap=i<3?100:86;
 const walls=border.map(r=>r.slice());
 ys.forEach((y,j)=>walls.push(sides[j]==='R'?[15,y,390-gap,14]:[15+gap,y,390-gap,14]));
 const end=sides.at(-1)==='R'?65:355;
 const route=[[55,55]];
 ys.forEach((y,j)=>{const gx=sides[j]==='R'?405-gap/2:15+gap/2;route.push([gx,y-32],[gx,y+42]);});
 route.push([end,550]);
 const checkpoints=i>=4?[route[4].slice()]:[];
 return {name,walls,holes:holes.map(p=>[...p,17]),zones,movers,par,start:[55,55],goal:[end,550,22],checkpoints,route};
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rects(L,t){return L.walls.concat(L.movers.map(m=>{const r=m.slice(0,4);r[m[4]==='x'?0:1]+=Math.sin(t*2*Math.PI/m[6])*m[5];return r;}));}
function overlaps(x,y,r,p){return Math.hypot(x-clamp(x,p[0],p[0]+p[2]),y-clamp(y,p[1],p[1]+p[3]))<r;}
function create(index){const L=levels[index];return {index,x:L.start[0],y:L.start[1],vx:0,vy:0,ax:0,ay:0,time:0,falls:0,checkpoint:-1,respawn:0,won:false};}
function stars(s){const p=levels[s.index].par;return s.falls===0&&s.time<=p?3:s.falls<=2&&s.time<=p*1.6?2:1;}
function resolve(s,p){let nx=clamp(s.x,p[0],p[0]+p[2]),ny=clamp(s.y,p[1],p[1]+p[3]),dx=s.x-nx,dy=s.y-ny,dist=Math.hypot(dx,dy);if(dist>=R)return;
 if(dist===0){const options=[[s.x-p[0],-1,0],[p[0]+p[2]-s.x,1,0],[s.y-p[1],0,-1],[p[1]+p[3]-s.y,0,1]].sort((a,b)=>a[0]-b[0]);const o=options[0];dx=o[1];dy=o[2];dist=1;s.x+=dx*(o[0]+R);s.y+=dy*(o[0]+R);}else{s.x+=dx/dist*(R-dist);s.y+=dy/dist*(R-dist);}
 const ux=dx/dist,uy=dy/dist,v=s.vx*ux+s.vy*uy;if(v<0){s.vx-=1.12*v*ux;s.vy-=1.12*v*uy;}}
function step(s,input,dt=STEP){if(s.won)return;const L=levels[s.index];s.time+=dt;
 if(s.respawn>0){s.respawn-=dt;return;}
 let [a,b]=input,n=Math.max(1,Math.hypot(a,b));a/=n;b/=n;const blend=1-Math.exp(-12*dt);s.ax+=(a-s.ax)*blend;s.ay+=(b-s.ay)*blend;
 let drag=2.5;for(const z of L.zones)if(s.x>z[0]&&s.x<z[0]+z[2]&&s.y>z[1]&&s.y<z[1]+z[3])drag=z[4]==='ice'?.7:5.8;
 s.vx=(s.vx+s.ax*430*dt)*Math.exp(-drag*dt);s.vy=(s.vy+s.ay*430*dt)*Math.exp(-drag*dt);
 const speed=Math.hypot(s.vx,s.vy);if(speed>205){s.vx*=205/speed;s.vy*=205/speed;}
 s.x+=s.vx*dt;s.y+=s.vy*dt;for(let k=0;k<3;k++)for(const p of rects(L,s.time))resolve(s,p);
 for(const h of L.holes)if(Math.hypot(s.x-h[0],s.y-h[1])<h[2]-3){s.falls++;const p=s.checkpoint<0?L.start:L.checkpoints[s.checkpoint];s.x=p[0];s.y=p[1];s.vx=s.vy=s.ax=s.ay=0;s.respawn=.65;return;}
 L.checkpoints.forEach((p,i)=>{if(Math.hypot(s.x-p[0],s.y-p[1])<23)s.checkpoint=Math.max(s.checkpoint,i);});
 if(Math.hypot(s.x-L.goal[0],s.y-L.goal[1])<L.goal[2]-R/2){s.won=true;s.vx=s.vy=0;}
}
const api={W,H,R,STEP,levels,rects,overlaps,create,step,stars};if(typeof module!=='undefined')module.exports=api;else root.Amazed=api;
})(typeof window==='undefined'?globalThis:window);
