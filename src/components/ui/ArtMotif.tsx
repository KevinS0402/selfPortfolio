export type World = "engineering" | "impact" | "about";
export type Motif = World | "studio" | "toolkit" | "classroom" | "camera" | "weather" | "claims" | "research" | "evaluation" | "browser" | "city" | "campus";

function waveform(shift: number) {
  return Array.from({ length: 81 }, (_, i) => {
    const x = 18 + i * 3.55;
    const envelope = Math.exp(-Math.pow((i - 40) / 24, 2));
    const y = 70 + Math.sin(i / 7 + shift / 8) * 42 * envelope + shift;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export function ArtMotif({ world, className = "" }: { world: Motif; className?: string }) {
  return <svg className={`art-motif art-${world} ${className}`} viewBox="0 0 320 140" fill="none" aria-hidden="true">
    {world === "claims" ? <>
      <path d="M32 27h73l18 18v72H32ZM105 27v18h18M46 56h54M46 69h40M46 82h47M46 95h26" />
      <path className="trace-live" d="M128 72h54M175 65l7 7-7 7" /><circle cx="212" cy="72" r="27" strokeDasharray="4 5" /><path d="M202 72l7 7 14-16M244 72h38M275 65l7 7-7 7" /><path d="M285 50h19v44h-19" />
    </> : world === "research" ? <>
      <rect x="31" y="20" width="258" height="102" rx="5" /><path d="M31 37h258M51 50v53h211M108 50v53M165 50v53M222 50v53" opacity=".45" />
      <path className="plot-draw" d="M51 94l23-6 22 2 25-29 25 14 25-10 25-12 25 7 25-19" /><path className="trace-live" d="M51 80l23 6 22-14 25 8 25-25 25 15 25 7 25-28 25 7" opacity=".5" /><circle className="community-person" cx="196" cy="53" r="4" />
    </> : world === "evaluation" ? <>
      <rect x="45" y="19" width="95" height="106" rx="3" /><path d="M61 38h62M61 57h43M61 76h55M61 95h37" />
      <path className="trace-live" d="M149 71h32M175 65l6 6-6 6" />
      {[0,1,2].map(i=><g className="evaluation-check" key={i} style={{animationDelay:`${i*.4}s`}}><rect x="198" y={24+i*33} width="18" height="18" rx="2" /><path d={`M202 ${33+i*33}l4 4 7-9M229 ${33+i*33}h43`} /></g>)}
    </> : world === "browser" ? <>
      <rect x="29" y="18" width="212" height="112" rx="5" /><path d="M29 37h212M43 28h3M53 28h3M63 28h3" /><rect x="43" y="50" width="60" height="61" /><path className="book-line" d="M117 53h100M117 68h79M117 83h89M117 98h64" /><rect x="236" y="54" width="55" height="77" rx="6" /><path d="M244 68h39M244 81h30M244 94h33M258 120h11" />
    </> : world === "city" ? <>
      <path d="M23 124h274M34 124V78h28v46M69 124V50h38v74M120 124V35h43v89M130 35V24h23v11M141 24V8M174 124V62h32v62M218 124V43h41v81M267 124V88h21v36" />
      {[84,98,112].map(y=><path className="city-windows" key={y} style={{animationDelay:`-${y/30}s`}} d={`M43 ${y}h10M77 ${y}h21M129 ${y}h25M183 ${y}h15M226 ${y}h24`} />)}
      <path className="trace-live" d="M24 135h274" />
    </> : world === "campus" ? <>
      <path d="M55 123h210M78 123V65h164v58M67 65l93-42 93 42ZM145 31V16h30v15M155 16V7h10v9" />
      {[91,128,165,202].map(x=><g key={x}><path d={`M${x} 73v42M${x+12} 73v42M${x-4} 73h20M${x-4} 115h20`} /></g>)}
      <path className="book-line" d="M96 57h129M45 132h229" />
    </> : world === "studio" ? <>
      <path d="M43 112L69 39H252L278 112Z" /><path d="M52 103H270M76 50H245" />
      {Array.from({length:7},(_,i)=><g key={i}><path d={`M${83+i*23} 62v32`} /><rect x={79+i*23} y={71+(i%3)*5} width="8" height="4" className="art-solid" /><circle cx={83+i*23} cy="53" r="3" /><path className="meter-bar" style={{animationDelay:`-${i*.27}s`}} d={`M${83+i*23} 34v-${10+(i%4)*5}`} /></g>)}
      <rect x="22" y="19" width="22" height="40" rx="11" /><path d="M15 44v7a18 18 0 0036 0v-7M33 69v32M23 102h20" /><circle cx="280" cy="31" r="20" /><circle cx="280" cy="31" r="7" /><path d="M298 18L288 30" />
    </> : world === "toolkit" ? <>
      <path d="M160 37c-35-20-77-20-110-5v80c36-15 78-15 110 5 35-20 76-20 110-5V32c-34-15-75-15-110 5ZM160 37v80M42 38v80c39-15 79-13 118 8 39-21 79-23 118-8V38" />
      {[0,1,2,3].map(i=><path key={i} className="book-line" style={{animationDelay:`${i*.14}s`}} d={`M70 ${48+i*14}q35-9 67 3M181 ${51+i*14}q35-12 66-3`} />)}
      <path d="M305 26v38c-20-9-26 18-10 20 10 1 18-5 18-15V18Z" />
    </> : world === "classroom" ? <>
      <rect x="80" y="12" width="160" height="58" rx="2" /><path d="M96 28h48M96 40h75M96 52h32M191 25v30M178 39h27" />
      {[55,125,195,265].map((cx,i)=><g key={cx}><circle className="community-person" style={{animationDelay:`-${i*.6}s`}} cx={cx} cy="89" r="9" /><path d={`M${cx-18} 123v-6q0-16 18-16t18 16v6M${cx-24} 130h48`} /></g>)}
      <path className="trace-live" d="M55 89C55 69 66 62 80 62M265 89c0-20-11-27-25-27" />
    </> : world === "camera" ? <>
      <rect x="45" y="38" width="93" height="60" rx="8" /><path d="M61 38l9-14h39l9 14M63 110h55M90 98v12" /><circle cx="91" cy="68" r="20" /><circle cx="91" cy="68" r="9" /><path className="trace-live" d="M145 68h41M180 62l6 6-6 6" /><path d="M202 44V28h18M265 28h18v16M283 97v17h-18M220 114h-18V97" /><path d="M226 93V66q0-8 7-8v19-34q0-8 7-8v39-42q0-8 7-8v46-33q0-8 7-8v42l8-11q7-5 10 2l-18 33h-14Z" />
    </> : world === "weather" ? <>
      <path d="M44 33l64-14 72 15 94-14v96l-94 15-72-15-64 15Z M108 19v97M180 34v97" /><circle cx="161" cy="71" r="35" strokeDasharray="3 5" /><path className="radar-turn" d="M161 71l30-18" /><path d="M150 70c-14-16 0-35 11-35s25 19 11 35l-11 13Z" /><circle cx="161" cy="51" r="5" /><path d="M265 41h26v29h-26ZM278 48v9M278 63v1" />
    </> : world === "engineering" ? <>
      <rect x="143" y="52" width="38" height="38" rx="2" className="art-solid" />
      <rect x="136" y="45" width="52" height="52" rx="4" />
      {Array.from({ length: 5 }, (_, i) => <g key={i}><path className="trace-live" style={{animationDelay:`-${i*.4}s`}} d={`M${136} ${49 + i * 11}H${112 - i * 9}L${91 - i * 9} ${20 + i * 24}H${32 + i * 7}`} /><circle cx={32 + i * 7} cy={20 + i * 24} r="2" className="art-solid" /><path className="trace-live" style={{animationDelay:`-${i*.4}s`}} d={`M188 ${49 + i * 11}H${211 + i * 9}L${231 + i * 9} ${20 + i * 24}H${286 - i * 7}`} /><circle cx={286 - i * 7} cy={20 + i * 24} r="2" className="art-solid" /></g>)}
    </> : world === "impact" ? <>
      <g className="orbit-turn"><circle cx="160" cy="70" r="58" strokeDasharray="2 4" /><ellipse cx="160" cy="70" rx="100" ry="42" transform="rotate(-24 160 70)" /><ellipse cx="160" cy="70" rx="100" ry="42" transform="rotate(24 160 70)" /><path d="M77 26L160 70 246 114M77 114L160 70 246 26" />{[[77,26],[246,114],[77,114],[246,26]].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" className="art-solid" />)}</g><circle cx="160" cy="70" r="8" className="art-solid" />
    </> : <>
      {[0,4,8,12].map(shift => <path key={shift} d={waveform(shift)} opacity={1 - shift / 20} />)}
      {Array.from({ length: 33 }, (_, i) => { const height = 5 + Math.abs(Math.sin(i / 4)) * 55 * Math.exp(-Math.pow((i - 16) / 10, 2)); return <path className="wave-bar" style={{animationDelay:`-${(i*.21).toFixed(2)}s`}} key={i} d={`M${25 + i * 8.5} ${(70 - height).toFixed(1)}v${(height * 2).toFixed(1)}`} opacity=".7" />; })}
    </>}
  </svg>;
}
