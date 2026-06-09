"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import Sidebar from "@/components/Sidebar";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rc = (v:number) => v>=82?"var(--elite)":v>=73?"var(--good)":v>=62?"var(--avg)":"var(--poor)";
const ATTRS = ["pace","shooting","passing","dribbling","defending","physic"];
const ALBL:Record<string,string> = {pace:"PAC",shooting:"SHO",passing:"PAS",dribbling:"DRI",defending:"DEF",physic:"PHY"};
const ADESC:Record<string,string> = {
  pace:"How fast the player runs — important for getting in behind defences and tracking back",
  shooting:"How clinical they are in front of goal — finishing, long shots, shot power",
  passing:"Quality of distribution — short passes, through balls, vision, crossing",
  dribbling:"Ability to beat players and hold the ball — close control and agility",
  defending:"Defensive skills — tackling, interceptions, positioning, marking",
  physic:"Physical presence — strength in duels, stamina, aerial ability, aggression",
};

// ─── Playstyle Tags (derived from attributes) ─────────────────────────────────
function getPlaystyleTags(p:any):{label:string;color:string}[] {
  if(!p) return [];
  const {pace:pa=0,shooting:sh=0,passing:ps=0,dribbling:dr=0,defending:df=0,physic:ph=0,overall:ov=0,potential:pot=0,age=25}=p;
  const tags:{label:string;color:string}[]=[];
  if(sh>=80&&pa>=78) tags.push({label:"Poacher",color:"#f87171"});
  if(sh>=82&&ph>=78&&pa<80) tags.push({label:"Target Man",color:"#f87171"});
  if(pa>=88&&dr>=80) tags.push({label:"Speed Demon",color:"#fbbf24"});
  if(dr>=85&&pa>=80) tags.push({label:"Inverted Winger",color:"#a78bfa"});
  if(ps>=84&&dr>=82&&sh>=75) tags.push({label:"Creative Force",color:"#38bdf8"});
  if(ps>=82&&dr>=80&&sh>=75) tags.push({label:"Playmaker",color:"#38bdf8"});
  if(df>=75&&ph>=78&&ps>=72) tags.push({label:"Ball-Winner",color:"#4ade80"});
  if(ps>=80&&df>=70&&ph>=76) tags.push({label:"Box-to-Box",color:"#4ade80"});
  if(df>=82&&ph>=78) tags.push({label:"Rock Solid",color:"#4ade80"});
  if(ph>=84) tags.push({label:"Physical Beast",color:"#fbbf24"});
  if(ov>=88) tags.push({label:"World Class",color:"#fbbf24"});
  else if(ov>=82) tags.push({label:"Top Quality",color:"#a78bfa"});
  if(Number(pot)-Number(ov)>=8&&Number(age)<=23) tags.push({label:"High Potential",color:"#fbbf24"});
  return tags.slice(0,3);
}

// ─── Career Curve (pure SVG — no recharts conflict) ───────────────────────────
function CareerCurve({player,accent}:{player:any;accent:string}) {
  const ov=Number(player?.overall)||75;
  const pot=Number(player?.potential)||ov+4;
  const age=Number(player?.age)||24;
  const peakAge=pot>=90?29:pot>=85?28:pot>=80?27:26;
  const pts:number[][]=[];
  const startAge=Math.max(17,age-4);
  for(let a=startAge;a<=37;a++){
    let r:number;
    if(a<=peakAge){
      const prog=(a-startAge)/Math.max(1,peakAge-startAge);
      r=(ov-6)+(pot-(ov-6))*Math.pow(prog,0.65);
    } else {
      r=pot-(a-peakAge)*(pot>=88?0.55:0.85);
    }
    pts.push([a,Math.round(Math.min(99,Math.max(44,r)))]);
  }
  if(pts.length<2) return null;
  const W=440,H=130,PL=32,PR=16,PT=12,PB=28;
  const cW=W-PL-PR,cH=H-PT-PB;
  const allR=pts.map(p=>p[1]);
  const minR=Math.min(...allR)-2, maxR=Math.max(...allR)+2;
  const minA=pts[0][0], maxA=pts[pts.length-1][0];
  const tx=(a:number)=>PL+((a-minA)/(maxA-minA))*cW;
  const ty=(r:number)=>PT+(1-(r-minR)/(maxR-minR))*cH;
  const line=pts.map((p,i)=>`${i===0?"M":"L"}${tx(p[0])},${ty(p[1])}`).join(" ");
  const area=`${line} L${tx(maxA)},${ty(minR)} L${tx(minA)},${ty(minR)} Z`;
  const curPt=pts.find(p=>p[0]===age);
  const peakPt=pts.find(p=>p[0]===peakAge);
  const yTicks=[Math.ceil(minR/5)*5,Math.round(((minR+maxR)/2)/5)*5,Math.floor(maxR/5)*5];
  const xTicks=pts.filter((_,i)=>i%4===0).map(p=>p[0]);
  return (
    <div>
      {/* Stat tiles */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:12}}>
        {[{l:"Current",v:ov,c:"var(--cyan)"},{l:"Potential",v:pot,c:"var(--gold)"},{l:"Peak age",v:peakAge,c:"var(--green)"},{l:"Peak rating",v:peakPt?.[1]??ov,c:accent}].map(s=>(
          <div key={s.l} style={{background:"var(--card2)",borderRadius:6,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"var(--text3)",letterSpacing:1,marginBottom:3,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
      {/* SVG chart */}
      <div style={{overflowX:"auto"}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{minWidth:260,display:"block"}}>
          <path d={area} fill={`${accent}20`}/>
          {yTicks.map(t=>(
            <g key={t}>
              <line x1={PL} y1={ty(t)} x2={W-PR} y2={ty(t)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3"/>
              <text x={PL-3} y={ty(t)} textAnchor="end" dominantBaseline="central" fill="var(--text3)" fontSize="8">{t}</text>
            </g>
          ))}
          {age!==peakAge&&peakPt&&<line x1={tx(peakAge)} y1={PT} x2={tx(peakAge)} y2={H-PB} stroke="var(--gold)" strokeWidth="1" strokeDasharray="3 3"/>}
          {curPt&&<line x1={tx(age)} y1={PT} x2={tx(age)} y2={H-PB} stroke="var(--green)" strokeWidth="1" strokeDasharray="3 3"/>}
          <path d={line} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round"/>
          {xTicks.map(a=>(
            <text key={a} x={tx(a)} y={H-PB+12} textAnchor="middle" fontSize="8" fill={a===age?"var(--green)":a===peakAge?"var(--gold)":"var(--text3)"}>{a}</text>
          ))}
          {curPt&&<>
            <circle cx={tx(curPt[0])} cy={ty(curPt[1])} r="4" fill="var(--green)"/>
            <text x={tx(curPt[0])} y={ty(curPt[1])-10} textAnchor="middle" fontSize="8" fill="var(--green)">Now</text>
          </>}
          {peakPt&&age!==peakAge&&<>
            <circle cx={tx(peakPt[0])} cy={ty(peakPt[1])} r="4" fill="var(--gold)"/>
            <text x={tx(peakPt[0])} y={ty(peakPt[1])-10} textAnchor="middle" fontSize="8" fill="var(--gold)">Peak</text>
          </>}
          <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="var(--border2)" strokeWidth="0.5"/>
        </svg>
      </div>
      {/* Analysis */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
        <div style={{background:"var(--card2)",borderRadius:8,padding:12,borderLeft:"3px solid var(--cyan)"}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--cyan)",letterSpacing:1,marginBottom:4}}>CAREER PHASE</div>
          <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6}}>
            {age<peakAge?`Still developing — peak expected at age ${peakAge} with a projected rating of ${peakPt?.[1]}.`:age===peakAge?`At peak age right now — this is the best version of this player.`:`Past their statistical peak. Experience can compensate for declining physical attributes.`}
          </div>
        </div>
        <div style={{background:"var(--card2)",borderRadius:8,padding:12,borderLeft:"3px solid var(--gold)"}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--gold)",letterSpacing:1,marginBottom:4}}>POTENTIAL GAP</div>
          <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6}}>
            {pot>ov?`${pot-ov} point gap between current (${ov}) and ceiling (${pot}). ${pot-ov>=8?"Significant room to grow.":"Small further improvement expected."}`:`Already at or near their potential ceiling of ${pot}.`}
          </div>
        </div>
      </div>
      <div style={{fontSize:11,color:"var(--text3)",marginTop:8,textAlign:"center"}}>Projected curve based on FIFA 22 age, overall and potential · Illustrative only</div>
    </div>
  );
}

// ─── Similar Player Modal ─────────────────────────────────────────────────────
function SimilarPlayerModal({player,compareWith,onClose,onCompare}:{player:any;compareWith:any;onClose:()=>void;onCompare:(p:any)=>void}) {
  const tags=getPlaystyleTags(player);
  const ov=Number(player?.overall)||0;
  const pot=Number(player?.potential)||0;
  const simPct = compareWith ? "—" : "—";

  // Plain-English reason why they're similar
  function buildExplanation(sim:any, ref:any):string {
    if(!sim||!ref) return "";
    const diffs:{attr:string;simV:number;refV:number}[]=[];
    ATTRS.forEach(a=>{
      const sv=Number(sim[a])||0, rv=Number(ref[a])||0;
      if(sv>0&&rv>0) diffs.push({attr:a,simV:sv,refV:rv});
    });
    const closest=diffs.filter(d=>Math.abs(d.simV-d.refV)<=8);
    const attrNames:Record<string,string>={pace:"pace",shooting:"finishing",passing:"passing ability",dribbling:"dribbling",defending:"defensive work",physic:"physical strength"};
    if(closest.length===0) return `${sim.short_name} has a broadly similar playing profile to ${ref.short_name} across multiple attributes.`;
    const shared=closest.slice(0,3).map(d=>attrNames[d.attr]).join(", ");
    const stronger=diffs.filter(d=>d.simV>d.refV+8).map(d=>attrNames[d.attr]);
    const weaker=diffs.filter(d=>d.refV>d.simV+8).map(d=>attrNames[d.attr]);
    let txt=`${sim.short_name} and ${ref.short_name} have very similar levels of ${shared}`;
    if(stronger.length) txt+=`. ${sim.short_name} is actually stronger in ${stronger.join(" and ")}`;
    if(weaker.length) txt+=`, but trails in ${weaker.join(" and ")}`;
    txt+=".";
    return txt;
  }

  const explanation=compareWith?buildExplanation(player,compareWith):"";

  // Scouting recommendation
  function scoutingNote(sim:any,ref:any):string {
    if(!sim||!ref) return "";
    const ovrDiff=Number(ref.overall)-(Number(sim.overall)||0);
    if(ovrDiff>=10) return `${sim.short_name} is a lower-rated but stylistically similar option — useful as a budget alternative, a development signing, or squad depth for a team that cannot afford ${ref.short_name}.`;
    if(ovrDiff>=5) return `A close alternative to ${ref.short_name}. Could step in without drastically changing the team's playing style.`;
    if(ovrDiff>=-4) return `Very comparable quality level. Could be a like-for-like replacement or an upgrade in specific departments.`;
    return `${sim.short_name} is actually rated higher than ${ref.short_name}. Comparing these two could reveal whether the higher-rated player is getting their value.`;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:16,fontWeight:600}}>{player.short_name}</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{player.club_name} · {player.nationality_name}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--text2)",fontSize:20,cursor:"pointer",lineHeight:1,marginLeft:12}}>✕</button>
        </div>

        {/* Photo + badges */}
        <div style={{display:"flex",gap:16,alignItems:"center",padding:16,background:"var(--card2)",borderRadius:10,marginBottom:16}}>
          {player.player_face_url&&(
            <img src={player.player_face_url} alt="" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",background:"var(--border)",border:"2px solid var(--border2)",flexShrink:0}}
              onError={(e:any)=>{e.target.style.display="none";}}/>
          )}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",background:"var(--cyan-dim)",color:"var(--cyan)",borderRadius:20}}>OVR {player.overall}</span>
              {pot>0&&<span style={{fontSize:11,fontWeight:600,padding:"2px 8px",background:"var(--gold-dim)",color:"var(--gold)",borderRadius:20}}>POT {pot}</span>}
              {player.age&&<span style={{fontSize:11,padding:"2px 8px",background:"var(--border)",color:"var(--text2)",borderRadius:20}}>Age {player.age}</span>}
            </div>
            {tags.length>0&&(
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {tags.map(t=><span key={t.label} style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:20,background:`${t.color}18`,border:`1px solid ${t.color}44`,color:t.color}}>{t.label}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Attribute bars */}
        <div style={{marginBottom:16}}>
          <div className="section-label" style={{marginBottom:10}}>Attributes</div>
          {ATTRS.map(a=>{
            const val=Number(player[a])||0;
            const refVal=compareWith?Number(compareWith[a])||0:null;
            const col=rc(val);
            const diff=refVal!==null?val-refVal:null;
            return (
              <div key={a} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
                  <span style={{color:"var(--text2)",fontWeight:500}}>{ALBL[a]} <span style={{fontSize:11,color:"var(--text3)",fontWeight:400}}>— {ADESC[a]}</span></span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {diff!==null&&Math.abs(diff)>1&&(
                      <span style={{fontSize:10,fontWeight:600,color:diff>0?"var(--green)":"var(--red)"}}>
                        {diff>0?`+${diff}`:diff}
                      </span>
                    )}
                    <span style={{fontWeight:700,color:col}}>{val>0?val:"—"}</span>
                  </div>
                </div>
                <div style={{height:5,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(val,100)}%`,background:col,borderRadius:3,transition:"width 0.8s ease"}}/>
                </div>
              </div>
            );
          })}
          {compareWith&&<div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>+/- compared to {compareWith.short_name}</div>}
        </div>

        {/* Why similar — plain English */}
        {compareWith&&(
          <div style={{background:"var(--card2)",borderRadius:8,padding:14,marginBottom:12,borderLeft:"3px solid var(--cyan)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--cyan)",letterSpacing:1,marginBottom:6}}>WHY ARE THEY SIMILAR?</div>
            <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7}}>{explanation}</div>
          </div>
        )}

        {/* Scouting note */}
        {compareWith&&(
          <div style={{background:"var(--card2)",borderRadius:8,padding:14,marginBottom:16,borderLeft:"3px solid var(--gold)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--gold)",letterSpacing:1,marginBottom:6}}>SCOUTING NOTE</div>
            <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7}}>{scoutingNote(player,compareWith)}</div>
          </div>
        )}

        {/* Compare button */}
        {compareWith&&(
          <button onClick={()=>{onCompare(player);onClose();}} style={{width:"100%",padding:11,background:"var(--cyan-dim)",border:"1px solid var(--cyan)",borderRadius:8,color:"var(--cyan)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
            Compare {player.short_name} vs {compareWith.short_name} →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Player Search ─────────────────────────────────────────────────────────────
function PlayerSearch({players,onSelect,accent,label}:{players:any[];onSelect:(p:any)=>void;accent:string;label:string}) {
  const [q,setQ]=useState(""), [mode,setMode]=useState<"name"|"club"|"nation">("name"), [open,setOpen]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const filtered=players.filter(p=>{const s=q.toLowerCase();return mode==="name"?p.short_name?.toLowerCase().includes(s):mode==="club"?p.club_name?.toLowerCase().includes(s):p.nationality_name?.toLowerCase().includes(s);}).slice(0,12);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div style={{fontSize:10,fontWeight:600,letterSpacing:1.5,color:accent,textTransform:"uppercase",marginBottom:8}}>{label}</div>
      <div style={{display:"flex",gap:4,marginBottom:8}}>
        {(["name","club","nation"] as const).map(m=>(
          <button key={m} onClick={()=>{setMode(m);setQ("");setOpen(true);}} style={{padding:"3px 10px",fontSize:11,fontWeight:500,background:mode===m?`${accent}22`:"var(--surface)",border:`1px solid ${mode===m?accent:"var(--border)"}`,color:mode===m?accent:"var(--text2)",borderRadius:20,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{m}</button>
        ))}
      </div>
      <input value={q} onChange={e=>{setQ(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)}
        placeholder={mode==="name"?"Search player...":mode==="club"?"Search by club...":"Search by country..."}
        style={{width:"100%",background:"var(--surface)",border:`1px solid ${open?accent:"var(--border)"}`,borderRadius:8,padding:"10px 14px",color:"var(--text)",fontSize:14,fontFamily:"DM Sans,sans-serif",outline:"none",transition:"border-color 0.15s"}}/>
      {open&&filtered.length>0&&(
        <div className="search-dropdown">
          {filtered.map(p=>(
            <div key={p.short_name} className="search-option" onClick={()=>{onSelect(p);setQ(p.short_name);setOpen(false);}}>
              <div>
                <span style={{fontSize:13,fontWeight:500}}>{p.short_name}</span>
                <span style={{fontSize:11,color:"var(--text2)",marginLeft:8}}>{p.club_name}</span>
                {mode==="nation"&&<span style={{fontSize:11,color:"var(--text3)",marginLeft:6}}>· {p.nationality_name}</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10,color:"var(--text3)",padding:"1px 6px",background:"var(--surface)",borderRadius:4}}>{p.nationality_name}</span>
                <span style={{fontSize:14,fontWeight:700,color:accent,minWidth:28,textAlign:"right"}}>{p.overall}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Player Card ───────────────────────────────────────────────────────────────
const PITCH_POS:Record<string,{x:number;y:number}>={GK:{x:50,y:90},CB:{x:50,y:76},LB:{x:18,y:72},RB:{x:82,y:72},CDM:{x:50,y:58},CM:{x:35,y:48},CAM:{x:65,y:40},LW:{x:12,y:30},RW:{x:88,y:30},ST:{x:50,y:16},LM:{x:15,y:45},RM:{x:85,y:45}};
function PlayerCard({player,accent}:{player:any;accent:string}) {
  const tags=getPlaystyleTags(player);
  const positions=(player.player_positions||"").split(",").map((s:string)=>s.trim());
  const pitchPos=positions.reduce((found:any,p:string)=>found||(PITCH_POS[p]?{role:p,...PITCH_POS[p]}:null),null);
  const CATS=[{label:"Attacking",attrs:["shooting","dribbling"],icon:"⚡"},{label:"Technical",attrs:["passing","dribbling"],icon:"🎯"},{label:"Defending",attrs:["defending","physic"],icon:"🛡️"},{label:"Physical",attrs:["physic","pace"],icon:"💪"}];
  return (
    <div className="card" style={{padding:20,height:"100%"}}>
      {/* Header */}
      <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:16}}>
        <div style={{position:"relative",flexShrink:0}}>
          {player.player_face_url&&<img src={player.player_face_url} alt="" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",background:"var(--card2)",border:`2px solid ${accent}44`}} onError={(e:any)=>{e.target.style.display="none";}}/>}
          <div style={{position:"absolute",bottom:-4,right:-4,background:accent,color:"#000",fontSize:11,fontWeight:700,padding:"2px 5px",borderRadius:6}}>{player.overall}</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{player.short_name}</div>
          <div style={{fontSize:12,color:"var(--text2)",marginBottom:2}}>{player.club_name}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:11,color:"var(--text3)"}}>{player.nationality_name}</span>
            {pitchPos&&<span style={{fontSize:10,fontWeight:600,padding:"1px 6px",background:`${accent}22`,color:accent,borderRadius:4}}>{pitchPos.role}</span>}
          </div>
          {/* Playstyle tags */}
          {tags.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
              {tags.map(t=><span key={t.label} style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:20,background:`${t.color}18`,border:`1px solid ${t.color}44`,color:t.color}}>{t.label}</span>)}
            </div>
          )}
        </div>
      </div>
      {/* Category bars */}
      <div style={{marginBottom:16}}>
        <div className="section-label">Attributes</div>
        {CATS.map(cat=>{
          const avg=Math.round(cat.attrs.reduce((s,a)=>(s+(Number(player[a])||0)),0)/cat.attrs.length);
          return (
            <div key={cat.label} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12}}>{cat.icon}</span><span style={{fontSize:12,fontWeight:500,color:"var(--text2)"}}>{cat.label}</span></div>
                <span style={{fontSize:12,fontWeight:700,color:rc(avg)}}>{avg}</span>
              </div>
              <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:`${avg}%`,background:rc(avg)}}/></div>
            </div>
          );
        })}
      </div>
      {/* Individual stats grid */}
      <div className="section-label">Stats</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px"}}>
        {ATTRS.map(a=>{
          const val=Number(player[a])||0;
          return (
            <div key={a} title={ADESC[a]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--border)",cursor:"help"}}>
              <span style={{fontSize:11,letterSpacing:0.5,color:"var(--text3)",fontWeight:500}}>{ALBL[a]}</span>
              <span style={{fontSize:13,fontWeight:700,color:rc(val)}}>{val||"—"}</span>
            </div>
          );
        })}
      </div>
      {/* Age & potential */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
        <div style={{background:"var(--card2)",borderRadius:8,padding:10,textAlign:"center"}}>
          <div style={{fontSize:10,color:"var(--text3)",letterSpacing:1,marginBottom:4}}>AGE</div>
          <div style={{fontSize:20,fontWeight:700}}>{player.age||"—"}</div>
        </div>
        <div style={{background:"var(--card2)",borderRadius:8,padding:10,textAlign:"center"}}>
          <div style={{fontSize:10,color:"var(--text3)",letterSpacing:1,marginBottom:4}}>POTENTIAL</div>
          <div style={{fontSize:20,fontWeight:700,color:"var(--gold)"}}>{player.potential||"—"}</div>
        </div>
      </div>
      {/* Position pitch */}
      {pitchPos&&(
        <div style={{marginTop:14}}>
          <div className="section-label">Position</div>
          <div style={{position:"relative",width:"100%",aspectRatio:"0.65",background:"#0a2a14",borderRadius:8,overflow:"hidden",border:"1px solid #1a4a24"}}>
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 200 308">
              <rect x="10" y="10" width="180" height="288" fill="none" stroke="#1e5c28" strokeWidth="1.2"/>
              <line x1="10" y1="154" x2="190" y2="154" stroke="#1e5c28" strokeWidth="0.8"/>
              <circle cx="100" cy="154" r="26" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
              <rect x="50" y="10" width="100" height="52" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
              <rect x="75" y="10" width="50" height="20" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
              <rect x="50" y="246" width="100" height="52" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
              <rect x="75" y="278" width="50" height="20" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
            </svg>
            <div style={{position:"absolute",left:`${pitchPos.x}%`,top:`${pitchPos.y}%`,transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:accent,boxShadow:`0 0 8px ${accent}`}}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [allPlayers,setAllPlayers]=useState<any[]>([]);
  const [p1,setP1]=useState<any>(null), [p2,setP2]=useState<any>(null);
  const [similar,setSimilar]=useState<any[]>([]);
  const [loading,setLoading]=useState(false), [error,setError]=useState("");
  const [tab,setTab]=useState<"radar"|"h2h"|"similar"|"career">("radar");
  const [infoOpen,setInfoOpen]=useState(false);
  const [simModal,setSimModal]=useState<any>(null);

  useEffect(()=>{
    fetch(`${BASE}/players`).then(r=>r.json()).then(d=>setAllPlayers(d.players||[]))
      .catch(()=>setError("Cannot connect to backend on port 8000."));
  },[]);

  const loadPlayer=useCallback(async(name:string)=>{
    return fetch(`${BASE}/player/${encodeURIComponent(name)}`).then(r=>r.json());
  },[]);

  const handleSelect=useCallback(async(which:"p1"|"p2",player:any)=>{
    setLoading(true); setError("");
    try{const full=await loadPlayer(player.short_name);if(which==="p1")setP1(full);else setP2(full);}
    catch{setError("Failed to load player.");}
    finally{setLoading(false);}
  },[loadPlayer]);

  useEffect(()=>{
    if(!p1||!p2)return;
    fetch(`${BASE}/similar/${encodeURIComponent(p1.short_name)}`).then(r=>r.json()).then(setSimilar).catch(()=>{});
  },[p1,p2]);

  const radarData=ATTRS.map(a=>({attr:ALBL[a],[p1?.short_name||"P1"]:p1?.[a]??0,[p2?.short_name||"P2"]:p2?.[a]??0}));
  const CATS_COMPARE=[{label:"Attacking",attrs:["shooting","dribbling"]},{label:"Technical",attrs:["passing","dribbling"]},{label:"Defending",attrs:["defending","physic"]},{label:"Physical",attrs:["physic","pace"]}];

  return (
    <div className="app-shell">
      <Sidebar/>
      <div className="main">
        {/* Similar player modal */}
        {simModal&&(
          <SimilarPlayerModal
            player={simModal}
            compareWith={p1}
            onClose={()=>setSimModal(null)}
            onCompare={(pl)=>handleSelect("p2",pl)}
          />
        )}
        {/* How it works modal */}
        {infoOpen&&(
          <div className="modal-overlay" onClick={()=>setInfoOpen(false)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <span style={{fontSize:16,fontWeight:600}}>How comparison works</span>
                <button onClick={()=>setInfoOpen(false)} style={{background:"none",border:"none",color:"var(--text2)",fontSize:18,cursor:"pointer"}}>✕</button>
              </div>
              {[
                {icon:"🔍",t:"Search Modes",d:"Switch between Name, Club, and Country filters using the chips above each search box."},
                {icon:"📊",t:"Radar Chart",d:"Spider shape maps 6 attributes. Where a shape bulges outward, that player leads in that area."},
                {icon:"⚔️",t:"Head-to-Head",d:"Each row shows one attribute. Cyan bar = Player 1, Red = Player 2. Wider bar wins."},
                {icon:"🏷️",t:"Playstyle Tags",d:"Auto-generated labels derived from the player's attribute combination — e.g. 'Inverted Winger', 'Target Man'."},
                {icon:"📈",t:"Career Curve",d:"Projects the player's rating from youth to retirement based on their current age, overall, and potential ceiling."},
                {icon:"🧬",t:"Similar Players",d:"Finds players with the same balance of attributes. Same playing style, different quality level. Click any name to see full profile and scouting note."},
                {icon:"🗺️",t:"Position on Pitch",d:"Shows where on the pitch this player operates based on their listed positions."},
              ].map(({icon,t,d})=>(
                <div key={t} style={{display:"flex",gap:12,marginBottom:16}}>
                  <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
                  <div><div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{t}</div><div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6}}>{d}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-title">Player Comparison</span>
          {loading&&<span style={{fontSize:12,color:"var(--text2)"}}>Loading…</span>}
          <span style={{fontSize:11,color:"var(--cyan)",background:"var(--cyan-dim)",padding:"3px 10px",borderRadius:20,fontWeight:500}}>{allPlayers.length.toLocaleString()} players</span>
          <button onClick={()=>setInfoOpen(true)} style={{padding:"5px 12px",background:"transparent",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text2)",fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>How it works</button>
        </div>

        <div className="page">
          {error&&<div style={{background:"var(--red-dim)",border:"1px solid #7a2020",borderRadius:8,padding:"12px 16px",marginBottom:20,color:"var(--red)",fontSize:13}}>{error}</div>}

          {/* Search row */}
          <div className="search-row" style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"start",marginBottom:24}}>
            <PlayerSearch players={allPlayers} onSelect={p=>handleSelect("p1",p)} accent="var(--cyan)" label="Player 1"/>
            <div className="vs-divider" style={{fontSize:13,fontWeight:600,color:"var(--text3)",paddingTop:40,textAlign:"center"}}>VS</div>
            <PlayerSearch players={allPlayers} onSelect={p=>handleSelect("p2",p)} accent="var(--red)" label="Player 2"/>
          </div>

          {/* Empty state */}
          {!p1&&!p2&&(
            <div style={{textAlign:"center",padding:"80px 24px",color:"var(--text3)"}}>
              <div style={{fontSize:56,marginBottom:16,opacity:0.2}}>⚽</div>
              <div style={{fontSize:15,fontWeight:500,color:"var(--text2)",marginBottom:8}}>Search two players to compare</div>
              <div style={{fontSize:13,maxWidth:380,margin:"0 auto",lineHeight:1.7}}>Search by name, club, or country using the filter chips. Click a result to load the player.</div>
              <button onClick={()=>setInfoOpen(true)} style={{marginTop:16,padding:"8px 20px",background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:8,color:"var(--text2)",fontFamily:"DM Sans,sans-serif",fontSize:12,cursor:"pointer"}}>How does this work? →</button>
            </div>
          )}

          {/* Single player loaded */}
          {(p1||p2)&&!(p1&&p2)&&(
            <div className="player-cards-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {p1?<PlayerCard player={p1} accent="var(--cyan)"/>:<div className="card" style={{padding:24,display:"flex",alignItems:"center",justifyContent:"center",minHeight:200}}><span style={{fontSize:13,color:"var(--text3)"}}>Search Player 1 →</span></div>}
              {p2?<PlayerCard player={p2} accent="var(--red)"/>:<div className="card" style={{padding:24,display:"flex",alignItems:"center",justifyContent:"center",minHeight:200}}><span style={{fontSize:13,color:"var(--text3)"}}>← Search Player 2</span></div>}
            </div>
          )}

          {/* Full comparison */}
          {p1&&p2&&(
            <div className="compare-grid" style={{display:"grid",gridTemplateColumns:"300px 1fr 300px",gap:16,alignItems:"start"}}>
              <PlayerCard player={p1} accent="var(--cyan)"/>

              {/* Center panel */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* VS header */}
                <div className="card" style={{padding:16,display:"flex",alignItems:"center",gap:16}}>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:17,fontWeight:700}}>{p1.short_name}</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>OVR {p1.overall}</div>
                  </div>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--text3)",padding:"5px 10px",background:"var(--surface)",borderRadius:6}}>VS</div>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:17,fontWeight:700}}>{p2.short_name}</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>OVR {p2.overall}</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="tab-bar">
                  <button className={`tab${tab==="radar"?" active":""}`} onClick={()=>setTab("radar")}>Radar</button>
                  <button className={`tab${tab==="h2h"?" active":""}`} onClick={()=>setTab("h2h")}>Head to Head</button>
                  <button className={`tab${tab==="similar"?" active":""}`} onClick={()=>setTab("similar")}>Similar Players</button>
                  <button className={`tab${tab==="career"?" active":""}`} onClick={()=>setTab("career")}>Career Curve</button>
                </div>

                {/* Radar tab */}
                {tab==="radar"&&(
                  <div className="card" style={{padding:20}}>
                    <div className="section-label" style={{marginBottom:4}}>Attribute Radar</div>
                    <div style={{fontSize:12,color:"var(--text3)",marginBottom:12}}>Larger shape = stronger player in that area. Hover stat bars for descriptions.</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData} margin={{top:10,right:40,bottom:10,left:40}}>
                        <PolarGrid stroke="var(--border2)"/>
                        <PolarAngleAxis dataKey="attr" tick={{fill:"var(--text3)",fontSize:11,fontFamily:"DM Sans"}}/>
                        <Radar name={p1.short_name} dataKey={p1.short_name} stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.1} strokeWidth={2}/>
                        <Radar name={p2.short_name} dataKey={p2.short_name} stroke="var(--red)" fill="var(--red)" fillOpacity={0.1} strokeWidth={2}/>
                      </RadarChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:2,background:"var(--cyan)"}}/><span style={{fontSize:12,color:"var(--text2)"}}>{p1.short_name}</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:2,background:"var(--red)"}}/><span style={{fontSize:12,color:"var(--text2)"}}>{p2.short_name}</span></div>
                    </div>
                    {/* Category cards */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:16}}>
                      {CATS_COMPARE.map(cat=>{
                        const a1=Math.round(cat.attrs.reduce((s,a)=>(s+(Number(p1[a])||0)),0)/cat.attrs.length);
                        const a2=Math.round(cat.attrs.reduce((s,a)=>(s+(Number(p2[a])||0)),0)/cat.attrs.length);
                        const wc=a1>=a2?"var(--cyan)":"var(--red)"; const wn=a1>=a2?p1.short_name:p2.short_name;
                        return (
                          <div key={cat.label} style={{background:"var(--card2)",borderRadius:8,padding:12}}>
                            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6}}>{cat.label}</div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <span style={{fontSize:16,fontWeight:700,color:a1>=a2?"var(--cyan)":"var(--text2)"}}>{a1}</span>
                              <span style={{fontSize:10,fontWeight:600,color:wc,padding:"1px 6px",background:`${wc}22`,borderRadius:4}}>{wn}</span>
                              <span style={{fontSize:16,fontWeight:700,color:a2>a1?"var(--red)":"var(--text2)"}}>{a2}</span>
                            </div>
                            <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden",display:"flex"}}>
                              <div style={{width:`${(a1/(a1+a2||1))*100}%`,background:"var(--cyan)",transition:"width 0.8s"}}/>
                              <div style={{flex:1,background:"var(--red)"}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* H2H tab */}
                {tab==="h2h"&&(
                  <div className="card" style={{padding:20}}>
                    <div className="section-label" style={{marginBottom:4}}>Attribute by Attribute</div>
                    <div style={{fontSize:12,color:"var(--text3)",marginBottom:14}}>Cyan bar = {p1.short_name} · Red bar = {p2.short_name} · Wider bar wins</div>
                    {ATTRS.map(attr=>{
                      const v1=Number(p1[attr])||0, v2=Number(p2[attr])||0;
                      const pct=(v1/(v1+v2||1))*100;
                      const w=v1>v2?"cyan":v1<v2?"red":"draw";
                      return (
                        <div key={attr} title={ADESC[attr]} style={{marginBottom:14,cursor:"help"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <span style={{fontSize:14,fontWeight:700,color:w==="cyan"?"var(--cyan)":"var(--text2)"}}>{v1}</span>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontSize:11,fontWeight:600,letterSpacing:1,color:"var(--text3)",textTransform:"uppercase"}}>{ALBL[attr]}</div>
                              <div style={{fontSize:10,color:"var(--text3)"}}>{ADESC[attr]}</div>
                            </div>
                            <span style={{fontSize:14,fontWeight:700,color:w==="red"?"var(--red)":"var(--text2)"}}>{v2}</span>
                          </div>
                          <div className="h2h-track"><div className="h2h-fill" style={{width:`${pct}%`}}/></div>
                        </div>
                      );
                    })}
                    {/* Verdict */}
                    <div style={{marginTop:16,background:"var(--card2)",borderRadius:10,padding:16}}>
                      <div className="section-label" style={{marginBottom:8}}>Overall verdict</div>
                      {(()=>{
                        const wins=ATTRS.filter(a=>(Number(p1[a])||0)>(Number(p2[a])||0)).length;
                        const wn=wins>ATTRS.length-wins?p1:p2; const wc=wins>ATTRS.length-wins?"var(--cyan)":"var(--red)";
                        return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:13,fontWeight:600,color:wc}}>{wn.short_name} wins</span>
                          <span style={{fontSize:13,color:"var(--text2)"}}>{Math.max(wins,ATTRS.length-wins)}–{Math.min(wins,ATTRS.length-wins)} on stats</span>
                        </div>;
                      })()}
                    </div>
                  </div>
                )}

                {/* Similar tab */}
                {tab==="similar"&&(
                  <div className="card" style={{padding:20}}>
                    <div className="section-label" style={{marginBottom:4}}>Players similar to {p1.short_name}</div>
                    <div style={{fontSize:12,color:"var(--text3)",marginBottom:16,lineHeight:1.6}}>
                      These players share the same playing style as {p1.short_name} — similar balance of pace, technique, and physicality. They may play in a different league or at a lower level, but they move and play in a recognisably similar way. <strong style={{color:"var(--text2)"}}>Click any player to see a full profile and scouting note.</strong>
                    </div>
                    {similar.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--text3)",fontSize:13}}>Loading similar players…</div>}
                    {similar.map((s:any,i:number)=>(
                      <div key={s.short_name} onClick={async()=>{
                        setLoading(true);
                        try{const full=await loadPlayer(s.short_name);setSimModal(full);}
                        catch{}finally{setLoading(false);}
                      }}
                        style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",background:"var(--card2)",borderRadius:8,marginBottom:8,border:"1px solid var(--border)",cursor:"pointer",transition:"border-color 0.15s,transform 0.1s"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--border2)";(e.currentTarget as HTMLElement).style.transform="translateY(-1px)";}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--border)";(e.currentTarget as HTMLElement).style.transform="translateY(0)";}}
                      >
                        <div style={{display:"flex",alignItems:"center",gap:14}}>
                          <span style={{fontSize:16,fontWeight:700,color:"var(--text3)",width:20}}>{i+1}</span>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{s.short_name}</div>
                            <div style={{fontSize:11,color:"var(--text3)"}}>{s.club_name}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:16,alignItems:"center"}}>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:9,color:"var(--text3)",letterSpacing:1}}>OVR</div>
                            <div style={{fontSize:16,fontWeight:700,color:rc(Number(s.overall))}}>{s.overall}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:9,color:"var(--text3)",letterSpacing:1}}>MATCH</div>
                            <div style={{fontSize:16,fontWeight:700}}>{(s.similarity*100).toFixed(0)}%</div>
                          </div>
                          <span style={{color:"var(--text3)",fontSize:14}}>→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Career tab */}
                {tab==="career"&&(
                  <div className="card" style={{padding:20}}>
                    <div className="section-label" style={{marginBottom:4}}>Career Progression</div>
                    <div style={{fontSize:12,color:"var(--text3)",marginBottom:16,lineHeight:1.6}}>
                      Projected rating curve from now to retirement, based on current age, overall rating, and potential ceiling. Green marker = now. Gold marker = projected peak.
                    </div>
                    <div style={{marginBottom:24}}>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--cyan)",marginBottom:12}}>{p1.short_name}</div>
                      <CareerCurve player={p1} accent="var(--cyan)"/>
                    </div>
                    <div style={{height:1,background:"var(--border)",marginBottom:24}}/>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--red)",marginBottom:12}}>{p2.short_name}</div>
                      <CareerCurve player={p2} accent="var(--red)"/>
                    </div>
                  </div>
                )}
              </div>

              <PlayerCard player={p2} accent="var(--red)"/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}