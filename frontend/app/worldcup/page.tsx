"use client";
import { useEffect, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import Sidebar from "@/components/Sidebar";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const ATTRS = ["pace","shooting","passing","dribbling","defending","physic"];
const ATTR_LABELS:Record<string,string> = {pace:"PAC",shooting:"SHO",passing:"PAS",dribbling:"DRI",defending:"DEF",physic:"PHY"};
const rc = (v:number) => v>=82?"var(--elite)":v>=73?"var(--good)":v>=62?"var(--avg)":"var(--poor)";

// ─── Win Probability Modal ────────────────────────────────────────────────────
function WinModal({result,onClose}:{result:any;onClose:()=>void}) {
  const wp=result.win_probability, bd=wp.breakdown;
  const nA=result.teamA.nation, nB=result.teamB.nation;
  const att=bd.attack_diff??0, mid=bd.midfield_diff??0, def=bd.defense_diff??0;
  const pac=bd.pace_diff??0, phy=bd.physical_diff??0;
  const diff=Math.abs(wp.win_a-wp.win_b);
  const confidence=diff<=5?"Very even — hard to call":diff<=15?"Slight lean, could go either way":diff<=25?"Moderate advantage":"Clear favourite on paper";
  const aWins=(v:number)=>v>0, stronger=(v:number,n:number)=>Math.abs(v)>=n;

  const zones=[
    {val:att, label:"Attacking quality", icon:"⚡",
     text:(v:number)=>v>0?`${nA}'s forwards carry a higher goal threat than ${nB}'s.`:`${nB}'s attackers are rated higher and pose more danger up front.`},
    {val:mid, label:"Midfield control",  icon:"🎯",
     text:(v:number)=>v>0?`${nA} should dominate possession and dictate tempo through the middle.`:`${nB} are likely to control the ball and set the pace of the game.`},
    {val:def, label:"Defensive solidity",icon:"🛡️",
     text:(v:number)=>v>0?`${nA}'s back line is more organised and harder to break down.`:`${nB} look more solid defensively and are harder to break down.`},
    {val:pac, label:"Pace & transitions", icon:"💨",
     text:(v:number)=>v>0?`${nA} are quicker overall — dangerous in counter-attacks and behind the defence.`:`${nB} have more pace across the squad — a threat on the break.`},
    {val:phy, label:"Physical strength",  icon:"💪",
     text:(v:number)=>v>0?`${nA} win more aerial duels and physical contests — important at set-pieces.`:`${nB} are the more physical side and will win more challenges.`},
  ].filter(z=>Math.abs(z.val)>1.5);

  const aAdv=zones.filter(z=>z.val>0).length, bAdv=zones.filter(z=>z.val<0).length;
  const outlook=aAdv>bAdv+1?`Overall, ${nA} look the stronger squad on paper across multiple departments.`
    :bAdv>aAdv+1?`Overall, ${nB} look the stronger squad on paper across multiple departments.`
    :`Both squads have strengths in different areas. This is a closely matched contest on paper.`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:580}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:16,fontWeight:600}}>Match Analysis</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{nA} vs {nB}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--text2)",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>

        {/* Probability strip */}
        <div style={{background:"var(--card2)",borderRadius:10,padding:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
            <div><div style={{fontSize:32,fontWeight:700,color:"var(--cyan)",lineHeight:1}}>{wp.win_a}%</div><div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>{nA}</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:600,color:"var(--text3)"}}>{wp.draw}%</div><div style={{fontSize:11,color:"var(--text3)"}}>Draw</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:32,fontWeight:700,color:"var(--red)",lineHeight:1}}>{wp.win_b}%</div><div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>{nB}</div></div>
          </div>
          <div className="prob-track" style={{marginBottom:10}}>
            <div style={{width:`${wp.win_a}%`,background:"var(--cyan)",transition:"width 1s"}}/>
            <div style={{width:`${wp.draw}%`,background:"var(--border2)"}}/>
            <div style={{width:`${wp.win_b}%`,background:"var(--red)",transition:"width 1s"}}/>
          </div>
          <div style={{fontSize:11,color:"var(--text3)"}}>Prediction confidence: <span style={{color:"var(--text2)",fontWeight:500}}>{confidence}</span></div>
        </div>

        {/* Zone analysis — plain English */}
        <div style={{marginBottom:16}}>
          <div className="section-label" style={{marginBottom:10}}>Why this prediction?</div>
          {zones.map((z,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:12,background:"var(--card2)",borderRadius:8,borderLeft:`3px solid ${z.val>0?"var(--cyan)":"var(--red)"}`,marginBottom:8}}>
              <span style={{fontSize:18,flexShrink:0}}>{z.icon}</span>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:z.val>0?"var(--cyan)":"var(--red)",marginBottom:3}}>{z.label} — {z.val>0?nA:nB} ahead</div>
                <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6}}>{z.text(z.val)}</div>
              </div>
            </div>
          ))}
          {zones.length===0&&<div style={{padding:12,background:"var(--card2)",borderRadius:8,fontSize:12,color:"var(--text2)"}}>The two squads are virtually identical across all departments — no clear advantage either way.</div>}
        </div>

        {/* Tactical outlook */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[{n:nA,pros:zones.filter(z=>z.val>0).map(z=>z.label),col:"var(--cyan)"},{n:nB,pros:zones.filter(z=>z.val<0).map(z=>z.label),col:"var(--red)"}].map(t=>(
            <div key={t.n} style={{background:"var(--card2)",borderRadius:8,padding:12,borderTop:`2px solid ${t.col}`}}>
              <div style={{fontSize:11,fontWeight:700,color:t.col,letterSpacing:1,marginBottom:8}}>{t.n}</div>
              {t.pros.length===0?<div style={{fontSize:11,color:"var(--text3)"}}>No clear advantages</div>
                :t.pros.map((s,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:4}}><span style={{color:t.col,fontSize:10,marginTop:2}}>▸</span><span style={{fontSize:11,color:"var(--text2)"}}>{s}</span></div>)}
            </div>
          ))}
        </div>

        {/* Upset factor */}
        <div style={{background:"var(--card2)",borderRadius:8,padding:14,marginBottom:14,borderLeft:"3px solid var(--gold)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--gold)",letterSpacing:1,marginBottom:6}}>OVERALL OUTLOOK</div>
          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7}}>{outlook}</div>
        </div>

        {/* Honest disclaimer */}
        <div style={{background:"var(--border)",borderRadius:8,padding:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",letterSpacing:1,marginBottom:6}}>⚠️ IMPORTANT</div>
          <div style={{fontSize:11,color:"var(--text3)",lineHeight:1.7,marginBottom:8}}>This is based on FIFA 22 player ratings only. Real matches are also decided by:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 12px"}}>
            {["Current form","Injuries","Team tactics","Manager decisions","Motivation","Weather","Home support","Referee decisions"].map(f=>(
              <div key={f} style={{display:"flex",gap:5}}><span style={{color:"var(--text3)",fontSize:10}}>–</span><span style={{fontSize:11,color:"var(--text3)"}}>{f}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Duel Modal ────────────────────────────────────────────────────────────────
function DuelModal({duel,teamA,teamB,onClose}:{duel:any;teamA:string;teamB:string;onClose:()=>void}) {
  const attWins=duel.advantage_pct>=50;
  const gap=Math.abs(duel.advantage_pct-50);
  const verdict=gap<=2?"Too close to call":gap<=8?`Slight edge: ${duel.winner}`:gap<=16?`${duel.winner} has the advantage`:`${duel.winner} clearly comes out on top`;

  // Role-specific battle dimensions written for fans
  type Dim={label:string;icon:string;aKey:string;bKey:string;who:string};
  const DIMS:Record<string,Dim[]>={
    ST:[
      {label:"Finishing ability",icon:"⚽",aKey:"shooting",bKey:"defending",who:"Who is more clinical in front of goal vs how well the defender reads danger?"},
      {label:"Foot race",icon:"💨",aKey:"pace",bKey:"pace",who:"Can the striker get in behind, or does the defender track back fast enough?"},
      {label:"Physical contest",icon:"💪",aKey:"physic",bKey:"physic",who:"Who wins the shoulder-to-shoulder battle for the ball?"},
      {label:"Ball control",icon:"🎯",aKey:"dribbling",bKey:"defending",who:"Can the striker hold off challenges and turn, or does the defender win the ball?"},
    ],
    CB:[
      {label:"Defending vs finishing",icon:"🛡️",aKey:"defending",bKey:"shooting",who:"How solid is the defender's positioning and tackling against the striker's finishing?"},
      {label:"Aerial battle",icon:"✈️",aKey:"physic",bKey:"physic",who:"Who wins the header at corners and crosses?"},
      {label:"Pace duel",icon:"💨",aKey:"pace",bKey:"pace",who:"Does the striker have the legs to get in behind, or can the defender recover?"},
      {label:"Hold-up play vs interceptions",icon:"🎯",aKey:"passing",bKey:"defending",who:"Can the defender read passes and cut out the supply?"},
    ],
    LW:[
      {label:"Pace on the wing",icon:"💨",aKey:"pace",bKey:"pace",who:"Can the winger get past the full-back with speed?"},
      {label:"1v1 dribbling",icon:"🎯",aKey:"dribbling",bKey:"defending",who:"Can the winger beat the defender with skill?"},
      {label:"Cross quality",icon:"⚽",aKey:"passing",bKey:"defending",who:"How dangerous is the delivery from wide areas?"},
      {label:"Physical battle on the flank",icon:"💪",aKey:"physic",bKey:"physic",who:"Who wins the shoulder charge on the touchline?"},
    ],
    RW:[
      {label:"Pace on the wing",icon:"💨",aKey:"pace",bKey:"pace",who:"Can the winger get past the full-back with speed?"},
      {label:"1v1 dribbling",icon:"🎯",aKey:"dribbling",bKey:"defending",who:"Can the winger beat the defender with skill?"},
      {label:"Cross quality",icon:"⚽",aKey:"passing",bKey:"defending",who:"How dangerous is the delivery from wide areas?"},
      {label:"Physical battle on the flank",icon:"💪",aKey:"physic",bKey:"physic",who:"Who wins the shoulder challenge?"},
    ],
    CAM:[
      {label:"Creative passing",icon:"🎯",aKey:"passing",bKey:"defending",who:"Can the playmaker find gaps, or does the midfielder cut out the pass?"},
      {label:"Dribbling through lines",icon:"⚡",aKey:"dribbling",bKey:"defending",who:"Can the 10 carry the ball forward into dangerous areas?"},
      {label:"Movement and pace",icon:"💨",aKey:"pace",bKey:"pace",who:"Does the playmaker drift away from markers into space?"},
      {label:"Shooting threat",icon:"⚽",aKey:"shooting",bKey:"defending",who:"Can they score from outside the box?"},
    ],
    CM:[
      {label:"Passing range",icon:"🎯",aKey:"passing",bKey:"passing",who:"Who controls the rhythm of the game through distribution?"},
      {label:"Pressing intensity",icon:"💪",aKey:"physic",bKey:"physic",who:"Who works harder and wins more loose balls?"},
      {label:"Dribbling under pressure",icon:"⚡",aKey:"dribbling",bKey:"dribbling",who:"Who keeps the ball better when closed down?"},
      {label:"Defensive contribution",icon:"🛡️",aKey:"defending",bKey:"defending",who:"Who does more to break up opposition attacks?"},
    ],
    CDM:[
      {label:"Breaking up play",icon:"🛡️",aKey:"defending",bKey:"passing",who:"Can the holder stop the opposition building through midfield?"},
      {label:"Physical duels",icon:"💪",aKey:"physic",bKey:"physic",who:"Who wins more tackles and aerial battles in the centre?"},
      {label:"Reading the game",icon:"🎯",aKey:"defending",bKey:"dribbling",who:"Who anticipates danger better and intercepts more often?"},
      {label:"Recovery pace",icon:"💨",aKey:"pace",bKey:"pace",who:"Can they track runners or recover when caught out of position?"},
    ],
    LB:[
      {label:"Defending vs dribbling",icon:"🛡️",aKey:"defending",bKey:"dribbling",who:"Can the full-back contain the winger, or does the winger get past?"},
      {label:"Pace battle",icon:"💨",aKey:"pace",bKey:"pace",who:"Who wins the foot race down the flank?"},
      {label:"Physical challenge",icon:"💪",aKey:"physic",bKey:"physic",who:"Who holds their ground in contact?"},
      {label:"Overlapping quality",icon:"⚽",aKey:"passing",bKey:"defending",who:"Can the full-back get forward and provide an attacking option?"},
    ],
    RB:[
      {label:"Defending vs dribbling",icon:"🛡️",aKey:"defending",bKey:"dribbling",who:"Can the full-back contain the winger, or does the winger get past?"},
      {label:"Pace battle",icon:"💨",aKey:"pace",bKey:"pace",who:"Who wins the foot race down the flank?"},
      {label:"Physical challenge",icon:"💪",aKey:"physic",bKey:"physic",who:"Who holds their ground in contact?"},
      {label:"Overlapping quality",icon:"⚽",aKey:"passing",bKey:"defending",who:"Can the full-back get forward?"},
    ],
  };
  const dims=DIMS[duel.attacker_role]||DIMS["CM"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div><div style={{fontSize:16,fontWeight:600}}>Player Matchup</div><div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{teamA} vs {teamB}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--text2)",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>

        {/* Players */}
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:20}}>
          <div style={{background:"var(--card2)",borderRadius:10,padding:14,border:"1px solid var(--cyan)33",textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:600,color:"var(--cyan)",marginBottom:3}}>{duel.attacker}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>{teamA}</div>
            <div style={{fontSize:10,fontWeight:600,padding:"3px 8px",background:"var(--cyan-dim)",color:"var(--cyan)",borderRadius:20,display:"inline-block",marginTop:6}}>{duel.attacker_role}</div>
          </div>
          <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textAlign:"center"}}>VS</div>
          <div style={{background:"var(--card2)",borderRadius:10,padding:14,border:"1px solid var(--red)33",textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:600,color:"var(--red)",marginBottom:3}}>{duel.defender}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>{teamB}</div>
            <div style={{fontSize:10,fontWeight:600,padding:"3px 8px",background:"var(--red-dim)",color:"var(--red)",borderRadius:20,display:"inline-block",marginTop:6}}>{duel.defender_role}</div>
          </div>
        </div>

        {/* Battle breakdown — fan language */}
        <div className="section-label" style={{marginBottom:10}}>Battle Breakdown</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {dims.map((dim,i)=>{
            const aVal=Number(duel[dim.aKey]||0), bVal=Number(duel[dim.bKey]||0);
            const hasVals=aVal>0||bVal>0;
            const diff=aVal-bVal;
            const aWins=diff>4, bWins=diff<-4;
            const edgeCol=aWins?"var(--cyan)":bWins?"var(--red)":"var(--text3)";
            const edgeName=aWins?duel.attacker:bWins?duel.defender:"Even";
            return (
              <div key={i} style={{background:"var(--card2)",borderRadius:8,padding:12,borderLeft:`3px solid ${edgeCol}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:14}}>{dim.icon}</span>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{dim.label}</span>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:edgeCol,padding:"2px 8px",background:`${edgeCol}18`,border:`1px solid ${edgeCol}33`,borderRadius:20}}>
                    {edgeName==="Even"?"Even":`Edge: ${edgeName}`}
                  </span>
                </div>
                {hasVals&&(
                  <div style={{marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:11,color:"var(--cyan)",width:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{duel.attacker}</span>
                      <div style={{flex:1,height:5,background:"var(--border)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(aVal,100)}%`,background:"var(--cyan)",borderRadius:3}}/></div>
                      <span style={{fontSize:12,fontWeight:700,color:aWins?"var(--cyan)":"var(--text2)",width:28,textAlign:"right",flexShrink:0}}>{aVal||"—"}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:11,color:"var(--red)",width:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{duel.defender}</span>
                      <div style={{flex:1,height:5,background:"var(--border)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(bVal,100)}%`,background:"var(--red)",borderRadius:3}}/></div>
                      <span style={{fontSize:12,fontWeight:700,color:bWins?"var(--red)":"var(--text2)",width:28,textAlign:"right",flexShrink:0}}>{bVal||"—"}</span>
                    </div>
                  </div>
                )}
                <div style={{fontSize:11,color:"var(--text3)",lineHeight:1.5}}>{dim.who}</div>
              </div>
            );
          })}
        </div>

        {/* Verdict */}
        <div style={{background:attWins?"var(--cyan-dim)":gap<=2?"var(--border)":"var(--red-dim)",border:`1px solid ${attWins?"var(--cyan)":gap<=2?"var(--border2)":"var(--red)"}44`,borderRadius:10,padding:16,textAlign:"center"}}>
          <div style={{fontSize:11,color:"var(--text3)",letterSpacing:1.5,marginBottom:6}}>VERDICT</div>
          <div style={{fontSize:16,fontWeight:700,color:gap<=2?"var(--text2)":attWins?"var(--cyan)":"var(--red)"}}>{verdict}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}>
            <span style={{fontSize:11,color:"var(--cyan)",width:80,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{duel.attacker}</span>
            <div style={{flex:1,height:8,borderRadius:4,background:"var(--border)",overflow:"hidden",display:"flex"}}>
              <div style={{width:`${duel.advantage_pct}%`,background:"var(--cyan)",transition:"width 1s"}}/>
              <div style={{flex:1,background:"var(--red)"}}/>
            </div>
            <span style={{fontSize:11,color:"var(--red)",width:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{duel.defender}</span>
          </div>
          <div style={{fontSize:10,color:"var(--text3)",marginTop:6}}>Wider bar = stronger in this matchup</div>
        </div>
      </div>
    </div>
  );
}

// ─── Career Curve (pure SVG, no recharts) ────────────────────────────────────
function CareerCurve({player,accent}:{player:any;accent:string}) {
  const ovr=Number(player?.overall)||75, pot=Number(player?.potential)||ovr+4, age=Number(player?.age)||24;
  const peakAge=pot>=90?29:pot>=85?28:pot>=80?27:26;
  const pts:number[][]=[];
  for(let a=Math.max(17,age-4);a<=37;a++){
    let r:number;
    if(a<=peakAge){const prog=(a-Math.max(17,age-4))/Math.max(1,peakAge-Math.max(17,age-4));r=(ovr-6)+(pot-(ovr-6))*Math.pow(prog,0.65);}
    else{r=pot-(a-peakAge)*(pot>=88?0.55:0.85);}
    pts.push([a,Math.round(Math.min(99,Math.max(44,r)))]);
  }
  if(pts.length<2)return null;
  const W=440,H=130,PL=32,PR=16,PT=12,PB=28;
  const cW=W-PL-PR,cH=H-PT-PB;
  const ages=pts.map(p=>p[0]),ratings=pts.map(p=>p[1]);
  const minR=Math.min(...ratings)-2,maxR=Math.max(...ratings)+2;
  const minA=ages[0],maxA=ages[ages.length-1];
  const tx=(a:number)=>PL+((a-minA)/(maxA-minA))*cW;
  const ty=(r:number)=>PT+(1-(r-minR)/(maxR-minR))*cH;
  const line=pts.map((p,i)=>`${i===0?"M":"L"}${tx(p[0])},${ty(p[1])}`).join(" ");
  const area=`${line} L${tx(maxA)},${ty(minR)} L${tx(minA)},${ty(minR)} Z`;
  const curPt=pts.find(p=>p[0]===age);
  const peakPt=pts.find(p=>p[0]===peakAge);
  const yTicks=[Math.ceil(minR/5)*5,Math.round(((minR+maxR)/2)/5)*5,Math.floor(maxR/5)*5];
  const xTicks=pts.filter((_,i)=>i%4===0).map(p=>p[0]);

  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:10}}>
        {[{l:"Current",v:ovr,c:"var(--cyan)"},{l:"Potential",v:pot,c:"var(--gold)"},{l:"Peak age",v:peakAge,c:"var(--green)"},{l:"Peak rating",v:peakPt?.[1]??ovr,c:accent}].map(s=>(
          <div key={s.l} style={{background:"var(--card2)",borderRadius:6,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"var(--text3)",letterSpacing:1,marginBottom:3,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{minWidth:260,display:"block"}}>
          <path d={area} fill={`${accent}22`}/>
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
          {curPt&&<><circle cx={tx(curPt[0])} cy={ty(curPt[1])} r="4" fill="var(--green)"/><text x={tx(curPt[0])} y={ty(curPt[1])-9} textAnchor="middle" fontSize="8" fill="var(--green)">Now</text></>}
          {peakPt&&age!==peakAge&&<><circle cx={tx(peakPt[0])} cy={ty(peakPt[1])} r="4" fill="var(--gold)"/><text x={tx(peakPt[0])} y={ty(peakPt[1])-9} textAnchor="middle" fontSize="8" fill="var(--gold)">Peak</text></>}
        </svg>
      </div>
      <div style={{fontSize:11,color:"var(--text3)",marginTop:6,lineHeight:1.6}}>
        {age<peakAge?`${player.short_name} is still developing — peak expected at age ${peakAge} with a projected rating of ${peakPt?.[1]}.`:age===peakAge?`${player.short_name} is at peak age right now — this is the best version of this player.`:`${player.short_name} has passed their statistical peak. Experience can still compensate for declining attributes.`}
        {pot>ovr&&age<peakAge&&` There's a ${pot-ovr}-point gap between current (${ovr}) and ceiling (${pot}).`}
      </div>
    </div>
  );
}

// ─── Scenario Explorer ────────────────────────────────────────────────────────
function ScenarioExplorer({wp,bd,nA,nB}:{wp:any;bd:any;nA:string;nB:string}) {
  const [mods,setMods]=useState<string[]>([]);
  const [expanded,setExpanded]=useState<string|null>(null);
  type Mod={id:string;label:string;icon:string;desc:string;fn:(b:any)=>any};
  const MODS:Mod[]=[
    {id:"homeA",label:`Home advantage — ${nA}`,icon:"🏟️",desc:`Playing at home gives ${nA} a boost. Crowd support, familiar pitch, and less travel fatigue. Their midfield and defence benefit most.`,fn:b=>({...b,midfield_diff:(b.midfield_diff||0)+4,defense_diff:(b.defense_diff||0)+3})},
    {id:"homeB",label:`Home advantage — ${nB}`,icon:"🏟️",desc:`${nB} playing at home. Crowd noise and pitch familiarity shift momentum their way.`,fn:b=>({...b,midfield_diff:(b.midfield_diff||0)-4,defense_diff:(b.defense_diff||0)-3})},
    {id:"rain",label:"Heavy rain",icon:"🌧️",desc:"Wet pitch slows the game. Pace matters less. Scrappy, physical football becomes more likely. Technical advantages narrow.",fn:b=>({...b,pace_diff:(b.pace_diff||0)*0.4,attack_diff:(b.attack_diff||0)*0.8})},
    {id:"tiredA",label:`${nA} squad fatigue`,icon:"😓",desc:`${nA} are playing their third game in 7 days. Legs are heavy. Pace and physicality drop.`,fn:b=>({...b,pace_diff:(b.pace_diff||0)-5,physical_diff:(b.physical_diff||0)-4})},
    {id:"tiredB",label:`${nB} squad fatigue`,icon:"😓",desc:`${nB} are carrying fatigue. Their pressing drops and transitions slow down.`,fn:b=>({...b,pace_diff:(b.pace_diff||0)+5,physical_diff:(b.physical_diff||0)+4})},
    {id:"pressA",label:`${nA} high press`,icon:"⚡",desc:`${nA} pressing aggressively. Great for winning the ball in dangerous areas, but burns energy fast.`,fn:b=>({...b,midfield_diff:(b.midfield_diff||0)+5,physical_diff:(b.physical_diff||0)-3})},
    {id:"blockB",label:`${nB} defensive block`,icon:"🛡️",desc:`${nB} sitting deep with two banks of four. Very hard to score against, but they sacrifice their own attack.`,fn:b=>({...b,defense_diff:(b.defense_diff||0)-6,attack_diff:(b.attack_diff||0)+3})},
  ];
  function sig(x:number){return 1/(1+Math.exp(-x));}
  function calc(b:any){
    const c=(b.attack_diff||0)*0.30+(b.midfield_diff||0)*0.25+(b.defense_diff||0)*0.25+(b.pace_diff||0)*0.10+(b.physical_diff||0)*0.10;
    let wA=Math.round(sig(c/10)*1000)/10,wB=Math.round(sig(-c/10)*1000)/10;
    const tot=wA+wB; wA=Math.round(wA/tot*80*10)/10; wB=Math.round(wB/tot*80*10)/10;
    return{wA,wB,draw:Math.round((100-wA-wB)*10)/10};
  }
  const modBd=mods.reduce((b,id)=>{const m=MODS.find(x=>x.id===id);return m?m.fn(b):b;},{...bd});
  const{wA,wB,draw}=mods.length?calc(modBd):{wA:wp.win_a,wB:wp.win_b,draw:wp.draw};
  const diff=Math.abs(wA-wB);
  const conf=diff<=5?"Very even":diff<=15?"Slight lean":diff<=25?"Moderate edge":"Clear advantage";
  const toggle=(id:string)=>{
    const excl:Record<string,string[]>={homeA:["homeB"],homeB:["homeA"],tiredA:["tiredB"],tiredB:["tiredA"]};
    const ex=excl[id]||[];
    setMods(p=>p.includes(id)?p.filter(x=>x!==id):[...p.filter(x=>!ex.includes(x)),id]);
  };

  return (
    <div>
      <div style={{background:"var(--card2)",borderRadius:8,padding:14,marginBottom:16,borderLeft:"3px solid var(--gold)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--gold)",letterSpacing:1,marginBottom:6}}>WHAT IS THIS?</div>
        <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.7}}>This shows how real-world factors change the strength comparison between these squads. Toggle any scenario below and watch the prediction update. No fake goals or events — just an honest look at how context shifts the advantage.</div>
      </div>

      {/* Live prediction */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:"var(--text3)",letterSpacing:1.5,marginBottom:8}}>{mods.length?`ADJUSTED (${mods.length} scenario${mods.length>1?"s":""} active)`:"BASE PREDICTION"}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
          <div><div style={{fontSize:36,fontWeight:700,color:"var(--cyan)",lineHeight:1,transition:"all 0.4s"}}>{wA}%</div><div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>{nA}</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:600,color:"var(--text3)",transition:"all 0.4s"}}>{draw}%</div><div style={{fontSize:11,color:"var(--text3)"}}>Draw</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:36,fontWeight:700,color:"var(--red)",lineHeight:1,transition:"all 0.4s"}}>{wB}%</div><div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>{nB}</div></div>
        </div>
        <div style={{height:10,borderRadius:5,overflow:"hidden",display:"flex",marginBottom:8}}>
          <div style={{width:`${wA}%`,background:"var(--cyan)",transition:"width 0.5s"}}/>
          <div style={{width:`${draw}%`,background:"var(--border2)",transition:"width 0.5s"}}/>
          <div style={{width:`${wB}%`,background:"var(--red)",transition:"width 0.5s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:"var(--text3)"}}>Confidence: <span style={{color:"var(--text2)",fontWeight:500}}>{conf}</span></span>
          {mods.length>0&&<button onClick={()=>setMods([])} style={{fontSize:11,color:"var(--red)",background:"none",border:"none",cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Reset all</button>}
        </div>
      </div>

      {/* Modifier tiles */}
      <div style={{fontSize:11,color:"var(--text3)",letterSpacing:1.5,marginBottom:10}}>SCENARIOS — tap to activate</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {MODS.map(m=>{
          const on=mods.includes(m.id), exp=expanded===m.id;
          return (
            <div key={m.id} style={{background:on?"var(--cyan-dim)":"var(--card2)",border:`1px solid ${on?"var(--cyan)":"var(--border)"}`,borderRadius:8,overflow:"hidden",transition:"border-color 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer"}} onClick={()=>toggle(m.id)}>
                <span style={{fontSize:16,flexShrink:0}}>{m.icon}</span>
                <span style={{fontSize:13,fontWeight:500,flex:1,color:on?"var(--cyan)":"var(--text)"}}>{m.label}</span>
                {on&&<span style={{fontSize:10,fontWeight:700,color:"var(--cyan)",letterSpacing:1}}>ON</span>}
                <button onClick={e=>{e.stopPropagation();setExpanded(exp?null:m.id);}} style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:16,padding:"0 4px"}}>
                  {exp?"−":"+"}
                </button>
              </div>
              {exp&&<div style={{padding:"0 12px 12px 38px",fontSize:12,color:"var(--text2)",lineHeight:1.7,borderTop:"1px solid var(--border)",paddingTop:10}}>{m.desc}</div>}
            </div>
          );
        })}
      </div>
      <div style={{marginTop:14,padding:12,background:"var(--border)",borderRadius:8,fontSize:11,color:"var(--text3)",lineHeight:1.7}}>Based on FIFA 22 squad ratings.</div>
    </div>
  );
}

// ─── Formation Pitch ──────────────────────────────────────────────────────────
const FPOS:{role:string;x:number;y:number}[]=[
  {role:"GK",x:50,y:90},{role:"CB",x:37,y:76},{role:"CB",x:63,y:76},
  {role:"LB",x:16,y:72},{role:"RB",x:84,y:72},{role:"CDM",x:38,y:58},
  {role:"CDM",x:62,y:58},{role:"LW",x:16,y:36},{role:"CAM",x:50,y:40},
  {role:"RW",x:84,y:36},{role:"ST",x:50,y:18},
];
function Pitch({lineup,accent}:{lineup:any[];accent:string}) {
  const byRole:Record<string,any>={};
  lineup.forEach(p=>{ if(!byRole[p.role])byRole[p.role]=p; });
  return (
    <div style={{position:"relative",width:"100%",aspectRatio:"0.65",background:"linear-gradient(180deg,#0a2a14,#0d3318 50%,#0a2a14)",borderRadius:10,overflow:"hidden",border:"1px solid #1a4a24"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 200 308">
        <rect x="10" y="10" width="180" height="288" fill="none" stroke="#1e5c28" strokeWidth="1.2"/>
        <line x1="10" y1="154" x2="190" y2="154" stroke="#1e5c28" strokeWidth="0.8"/>
        <circle cx="100" cy="154" r="26" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
        <rect x="50" y="10" width="100" height="52" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
        <rect x="75" y="10" width="50" height="20" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
        <rect x="50" y="246" width="100" height="52" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
        <rect x="75" y="278" width="50" height="20" fill="none" stroke="#1e5c28" strokeWidth="0.8"/>
      </svg>
      {FPOS.map((pos,i)=>{
        const p=byRole[pos.role]; if(!p)return null;
        const ovr=Number(p.overall)||0;
        const bg=ovr>=82?"#4ade80":ovr>=73?"#38bdf8":ovr>=62?"#fbbf24":"#f87171";
        return (
          <div key={i} style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:2,zIndex:10}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:bg,border:"2px solid rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#000",boxShadow:`0 2px 6px ${bg}66`,flexShrink:0}}>{ovr}</div>
            <div style={{background:"rgba(0,0,0,0.75)",borderRadius:3,padding:"1px 4px",fontSize:8,fontWeight:600,color:"#fff",whiteSpace:"nowrap",maxWidth:50,overflow:"hidden",textOverflow:"ellipsis"}}>
              {p.short_name?.split(" ").pop()||pos.role}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main World Cup Page ──────────────────────────────────────────────────────
export default function WorldCupPage() {
  const [nations,setNations]=useState<string[]>([]);
  const [tA,setTA]=useState(""), [tB,setTB]=useState("");
  const [result,setResult]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [tab,setTab]=useState<"scenarios"|"formation"|"lineup"|"duels"|"weaknesses">("scenarios");
  const [winModal,setWinModal]=useState(false);
  const [activeDuel,setActiveDuel]=useState<any>(null);

  useEffect(()=>{
    fetch(`${BASE}/nations`).then(r=>r.json()).then(d=>setNations(d.nations||[])).catch(()=>setError("Cannot connect to backend."));
  },[]);

  const analyze=async()=>{
    if(!tA||!tB)return; setLoading(true); setError(""); setResult(null); setTab("scenarios");
    try{const d=await fetch(`${BASE}/match`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({teamA:tA,teamB:tB})}).then(r=>r.json());setResult(d);}
    catch{setError("Failed to analyze match.");}
    finally{setLoading(false);}
  };

  const sel={width:"100%",background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 12px",color:"var(--text)",fontSize:13,fontFamily:"DM Sans,sans-serif",outline:"none",cursor:"pointer"};
  const radarData=result?ATTRS.map(a=>({attr:ATTR_LABELS[a],[result.teamA.nation]:result.teamA.vector[a]??0,[result.teamB.nation]:result.teamB.vector[a]??0})):[];

  return (
    <div className="app-shell">
      <Sidebar/>
      <div className="main">
        {winModal&&result&&<WinModal result={result} onClose={()=>setWinModal(false)}/>}
        {activeDuel&&result&&<DuelModal duel={activeDuel} teamA={result.teamA.nation} teamB={result.teamB.nation} onClose={()=>setActiveDuel(null)}/>}
        <div className="topbar">
          <span className="topbar-title">World Cup Intelligence</span>
          {loading&&<span style={{fontSize:12,color:"var(--text2)"}}>Analyzing…</span>}
          <span style={{fontSize:11,color:"var(--gold)",background:"var(--gold-dim)",padding:"3px 10px",borderRadius:20,fontWeight:500}}>FIFA 22</span>
        </div>
        <div className="page">
          {error&&<div style={{background:"var(--red-dim)",border:"1px solid #7a2020",borderRadius:8,padding:"12px 16px",marginBottom:16,color:"var(--red)",fontSize:13}}>{error}</div>}

          {/* Team selector */}
          <div className="card" style={{padding:20,marginBottom:20}}>
            <div className="section-label" style={{marginBottom:16}}>Select National Teams</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 48px 1fr",gap:12,alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:1.5,color:"var(--cyan)",marginBottom:6}}>TEAM A</div>
                <select value={tA} onChange={e=>setTA(e.target.value)} style={sel as any}>
                  <option value="">Select nation…</option>{nations.map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{fontSize:12,fontWeight:600,color:"var(--text3)",textAlign:"center",paddingTop:20}}>VS</div>
              <div>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:1.5,color:"var(--red)",marginBottom:6}}>TEAM B</div>
                <select value={tB} onChange={e=>setTB(e.target.value)} style={sel as any}>
                  <option value="">Select nation…</option>{nations.map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <button onClick={analyze} disabled={!tA||!tB||loading} style={{width:"100%",padding:11,background:tA&&tB?"var(--cyan-dim)":"transparent",border:`1px solid ${tA&&tB?"var(--cyan)":"var(--border)"}`,borderRadius:8,color:tA&&tB?"var(--cyan)":"var(--text3)",fontSize:13,fontWeight:600,cursor:tA&&tB?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>
              {loading?"Analyzing…":"Analyze Matchup"}
            </button>
          </div>

          {result&&(
            <>
              {/* Win Probability */}
              <div className="card" style={{padding:20,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div className="section-label" style={{margin:0}}>Squad Strength Prediction</div>
                  <button onClick={()=>setWinModal(true)} style={{padding:"4px 10px",background:"transparent",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text3)",fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Why this prediction? →</button>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
                  <div><div style={{fontSize:32,fontWeight:700,color:"var(--cyan)",lineHeight:1}}>{result.win_probability.win_a}%</div><div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>{result.teamA.nation}</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:600,color:"var(--text3)"}}>{result.win_probability.draw}%</div><div style={{fontSize:11,color:"var(--text3)"}}>Draw</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:32,fontWeight:700,color:"var(--red)",lineHeight:1}}>{result.win_probability.win_b}%</div><div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>{result.teamB.nation}</div></div>
                </div>
                <div className="prob-track" style={{marginBottom:10}}>
                  <div style={{width:`${result.win_probability.win_a}%`,background:"var(--cyan)",transition:"width 1s"}}/>
                  <div style={{width:`${result.win_probability.draw}%`,background:"var(--border2)"}}/>
                  <div style={{width:`${result.win_probability.win_b}%`,background:"var(--red)",transition:"width 1s"}}/>
                </div>
                <div style={{textAlign:"center",fontSize:12,fontWeight:600,color:"var(--gold)",padding:8,background:"var(--gold-dim)",borderRadius:6}}>{result.win_probability.verdict}</div>
              </div>

              {/* Team Radar */}
              <div className="card" style={{padding:20,marginBottom:16}}>
                <div className="section-label" style={{marginBottom:4}}>Team Comparison Radar</div>
                <div style={{fontSize:12,color:"var(--text3)",marginBottom:8}}>Average attributes across the full XI</div>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{top:10,right:36,bottom:10,left:36}}>
                    <PolarGrid stroke="var(--border2)"/>
                    <PolarAngleAxis dataKey="attr" tick={{fill:"var(--text3)",fontSize:11,fontFamily:"DM Sans"}}/>
                    <Radar name={result.teamA.nation} dataKey={result.teamA.nation} stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.12} strokeWidth={2}/>
                    <Radar name={result.teamB.nation} dataKey={result.teamB.nation} stroke="var(--red)" fill="var(--red)" fillOpacity={0.12} strokeWidth={2}/>
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:2,background:"var(--cyan)"}}/><span style={{fontSize:12,color:"var(--text2)"}}>{result.teamA.nation}</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:2,background:"var(--red)"}}/><span style={{fontSize:12,color:"var(--text2)"}}>{result.teamB.nation}</span></div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tab-bar" style={{marginBottom:16}}>
                {([["scenarios","🔬 Scenarios"],["formation","🗺️ Formation"],["lineup","📋 Lineup"],["duels","⚔️ Duels"],["weaknesses","🎯 Weaknesses"]] as [string,string][]).map(([k,l])=>(
                  <button key={k} className={`tab${tab===k?" active":""}`} onClick={()=>setTab(k as any)}>{l}</button>
                ))}
              </div>

              {/* Scenarios tab */}
              {tab==="scenarios"&&(
                <div className="card" style={{padding:20}}>
                  <div className="section-label" style={{marginBottom:4}}>Scenario Explorer</div>
                  <ScenarioExplorer wp={result.win_probability} bd={result.win_probability.breakdown} nA={result.teamA.nation} nB={result.teamB.nation}/>
                </div>
              )}

              {/* Formation tab */}
              {tab==="formation"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {[result.teamA,result.teamB].map((team:any,i:number)=>{
                    const accent=i===0?"var(--cyan)":"var(--red)";
                    const avgOvr=Math.round(team.lineup.reduce((s:number,p:any)=>s+(Number(p.overall)||0),0)/team.lineup.length);
                    return (
                      <div key={i} className="card" style={{padding:20,borderTop:`2px solid ${accent}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <div><div style={{fontSize:14,fontWeight:600,color:accent}}>{team.nation}</div><div style={{fontSize:11,color:"var(--text3)"}}>4-2-3-1</div></div>
                          <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:700,color:accent}}>{avgOvr}</div><div style={{fontSize:10,color:"var(--text3)",letterSpacing:1}}>AVG OVR</div></div>
                        </div>
                        <Pitch lineup={team.lineup} accent={accent}/>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lineup tab */}
              {tab==="lineup"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {[result.teamA,result.teamB].map((team:any,i:number)=>{
                    const accent=i===0?"var(--cyan)":"var(--red)";
                    return (
                      <div key={i} className="card" style={{padding:20,borderTop:`2px solid ${accent}`}}>
                        <div style={{fontSize:14,fontWeight:600,color:accent,marginBottom:16}}>{team.nation} — Starting XI</div>
                        {team.lineup.map((p:any,idx:number)=>(
                          <div key={idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                            <div style={{display:"flex",gap:10,alignItems:"center"}}>
                              <span style={{fontSize:10,fontWeight:600,color:accent,width:32,letterSpacing:0.5}}>{p.role}</span>
                              <div><div style={{fontSize:13,fontWeight:500}}>{p.short_name}</div><div style={{fontSize:10,color:"var(--text3)"}}>{p.club_name}</div></div>
                            </div>
                            <span style={{fontSize:14,fontWeight:700,color:rc(Number(p.overall))}}>{p.overall}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Duels tab */}
              {tab==="duels"&&(
                <div>
                  <div style={{fontSize:12,color:"var(--text3)",marginBottom:12,lineHeight:1.6}}>Click any matchup card for a detailed breakdown of how each player compares in this specific duel.</div>
                  {result.key_duels.map((duel:any,i:number)=>{
                    const attWins=duel.advantage_pct>=50;
                    return (
                      <div key={i} onClick={()=>setActiveDuel(duel)} className="card" style={{padding:"14px 16px",marginBottom:8,cursor:"pointer",transition:"border-color 0.15s"}}
                        onMouseEnter={e=>(e.currentTarget.style.borderColor="var(--border2)")}
                        onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}
                      >
                        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,alignItems:"center",marginBottom:10}}>
                          <div><div style={{fontSize:13,fontWeight:600,color:"var(--cyan)"}}>{duel.attacker}</div><div style={{fontSize:10,color:"var(--text3)"}}>{result.teamA.nation} · {duel.attacker_role}</div></div>
                          <span style={{fontSize:11,fontWeight:600,color:"var(--text3)",background:"var(--surface)",padding:"3px 8px",borderRadius:4}}>VS</span>
                          <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:600,color:"var(--red)"}}>{duel.defender}</div><div style={{fontSize:10,color:"var(--text3)"}}>{result.teamB.nation} · {duel.defender_role}</div></div>
                        </div>
                        <div style={{height:5,background:"var(--red-dim)",borderRadius:3,overflow:"hidden",marginBottom:8}}>
                          <div style={{height:"100%",width:`${duel.advantage_pct}%`,background:"var(--cyan)",borderRadius:3}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:11,color:"var(--text3)",fontStyle:"italic"}}>{duel.insight}</span>
                          <span style={{fontSize:10,fontWeight:600,color:attWins?"var(--cyan)":"var(--red)",padding:"2px 7px",background:attWins?"var(--cyan-dim)":"var(--red-dim)",borderRadius:4,flexShrink:0,marginLeft:8}}>{duel.winner} edges →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Weaknesses tab */}
              {tab==="weaknesses"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {[result.teamA,result.teamB].map((team:any,i:number)=>(
                    <div key={i} className="card" style={{padding:20}}>
                      <div className="section-label" style={{color:i===0?"var(--cyan)":"var(--red)"}}>{team.nation} Weaknesses</div>
                      <div style={{fontSize:12,color:"var(--text3)",marginBottom:14,lineHeight:1.6}}>Players where a key skill for their position is below the expected standard</div>
                      {team.weaknesses.length===0
                        ?<div style={{color:"var(--green)",fontSize:13,padding:12,background:"var(--green-dim)",borderRadius:8}}>✓ No major weaknesses detected</div>
                        :team.weaknesses.map((w:any,idx:number)=>(
                          <div key={idx} style={{padding:12,background:"var(--card2)",borderRadius:8,marginBottom:8,borderLeft:`3px solid ${w.severity==="High"?"var(--red)":"var(--gold)"}`}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:13,fontWeight:500}}>{w.player}</span>
                              <span style={{fontSize:10,fontWeight:700,color:w.severity==="High"?"var(--red)":"var(--gold)",padding:"2px 7px",background:w.severity==="High"?"var(--red-dim)":"var(--gold-dim)",borderRadius:4}}>{w.severity}</span>
                            </div>
                            <div style={{fontSize:11,color:"var(--text3)"}}>{w.role} — <span style={{textTransform:"capitalize",color:"var(--text2)"}}>{w.weakness}</span>: <span style={{fontWeight:700,color:w.severity==="High"?"var(--red)":"var(--gold)"}}>{w.value}</span></div>
                          </div>
                        ))
                      }
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!result&&!loading&&(
            <div style={{textAlign:"center",padding:"80px 24px",color:"var(--text3)"}}>
              <div style={{fontSize:56,marginBottom:16,opacity:0.2}}>🏆</div>
              <div style={{fontSize:15,fontWeight:500,color:"var(--text2)",marginBottom:8}}>Select two nations to analyze</div>
              <div style={{fontSize:13,maxWidth:380,margin:"0 auto",lineHeight:1.7}}>Get formation view, squad comparison, key player matchups, tactical weaknesses, and scenario explorer</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}