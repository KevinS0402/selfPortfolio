type Symbol = "microphone" | "glasses" | "writing" | "laptop" | "notes" | "languages" | "social" | "headphones";
const symbols: { name: Symbol; x: number; y: number }[] = [
  {name:"microphone",x:250,y:64}, {name:"glasses",x:382,y:118},
  {name:"writing",x:436,y:250}, {name:"laptop",x:382,y:382},
  {name:"notes",x:250,y:436}, {name:"languages",x:118,y:382},
  {name:"social",x:64,y:250}, {name:"headphones",x:118,y:118},
];
// Keep the complete artwork centered and inside its circle as it rotates.
const symbolBounds: Record<Symbol, readonly [number, number, number, number]> = {
  microphone: [-15, -22, 15, 30],
  glasses: [-30, -18, 30, 11],
  writing: [-21, -24, 39, 23],
  laptop: [-31, -19, 31, 22],
  notes: [-24, -22, 22, 23],
  languages: [-26, -20, 27, 32],
  social: [-22, -24, 40, 24],
  headphones: [-25, -27, 25, 25],
};
function CenteredSymbol({ name }: { name: Symbol }) {
  const [left, top, right, bottom] = symbolBounds[name];
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const scale = Math.min(1, 32 / Math.hypot((right - left) / 2, (bottom - top) / 2));
  return <g transform={`scale(${scale}) translate(${-centerX} ${-centerY})`} data-symbol={name}><SymbolArt name={name}/></g>;
}
function SymbolArt({ name }: { name: Symbol }) {
  switch(name) {
    case "microphone": return <><rect x="-9" y="-22" width="18" height="31" rx="9"/><path d="M-15-2v5a15 15 0 0030 0v-5M0 18v12M-10 30h20M-5-14H5M-5-8H5"/></>;
    case "glasses": return <><path d="M-25-10h19l3 5H3l3-5h19l-4 21H9L3-5M-3-5l-6 16h-12l-4-21M-25-10l-5-8M25-10l5-8"/><path d="M-22-7h13M9-7h13"/></>;
    case "writing": return <><path d="M-21-24h30v47h-30ZM-14-13H3M-14-3H3M-14 7H0M12 15l4-10 17-26 6 4-17 26-10 6ZM31-17l6 4"/></>;
    case "laptop": return <><rect x="-23" y="-19" width="46" height="31" rx="3"/><path d="M-23 12l-8 10h62l-8-10M-7 18H7M-9-10l-6 6 6 6M9-10l6 6-6 6M3-12L-3 4"/></>;
    case "notes": return <><path d="M-8 15v-31l30-6v32M-8-7l30-6"/><ellipse cx="-16" cy="17" rx="8" ry="6"/><ellipse cx="14" cy="12" rx="8" ry="6"/></>;
    case "languages": return <><path d="M-26-20H6V4H-14l-9 8V4h-3ZM-2 0h29v24h-3v8l-10-8H-2Z"/><text x="-20" y="-4" fill="currentColor" stroke="none" fontSize="12" fontFamily="Arial,sans-serif">EN</text><text x="2" y="17" fill="currentColor" stroke="none" fontSize="10">中文</text></>;
    case "social": return <><rect x="-22" y="-24" width="44" height="48" rx="8"/><circle cx="0" cy="-6" r="8"/><path d="M-13 13q0-10 13-10t13 10M-10 19H10"/><path d="M28-19h12v13h-5l-4 4v-4h-3Z"/></>;
    case "headphones": return <><path d="M-22 10V-5a22 22 0 0144 0v15M-16-5a16 16 0 0132 0"/><rect x="-25" y="4" width="10" height="21" rx="4"/><rect x="15" y="4" width="10" height="21" rx="4"/></>;
  }
}
export function CreativeOrbit() {
  return <figure className="creative-orbit" aria-label="Music, writing, technology, bilingual storytelling, and creative direction around KSONG’s sound">
    <svg viewBox="0 0 500 500" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="250" cy="250" r="186" strokeDasharray="2 9" opacity=".4"/>
      <circle className="creative-orbit-ring" cx="250" cy="250" r="130" strokeDasharray="120 1000" opacity=".55"/>
      <path d="M133 250H367" opacity=".35"/>
      {Array.from({length:33},(_,i)=>{const h=8+Math.abs(Math.sin(i*.55))*44*Math.exp(-Math.pow((i-16)/12,2));return <path key={i} className="wave-bar" style={{animationDelay:`-${(i*.18).toFixed(2)}s`}} d={`M${138+i*7} ${(250-h).toFixed(1)}v${(h*2).toFixed(1)}`}/>;})}
      <g className="creative-orbit-system">{symbols.map(symbol=><g key={symbol.name} transform={`translate(${symbol.x} ${symbol.y})`}><circle r="38" fill="var(--background)" stroke="var(--rule)"/><g className="orbit-symbol"><CenteredSymbol name={symbol.name}/></g></g>)}</g>
    </svg>
  </figure>;
}
