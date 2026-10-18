export function ExhibitSymbol({index,variant="circuit"}:{index:number;variant?:"circuit"|"community"|"sound"|"practice"}) {
  const paths = variant === "practice" ? [
    <g key="music"><path d="M40 79V32l46-10v47M40 46l46-10"/><ellipse cx="29" cy="82" rx="11" ry="8"/><ellipse cx="75" cy="72" rx="11" ry="8"/><path d="M19 35v20m-7-14v8m91-4v26m7-19v12" opacity=".5"/></g>,
    <g key="access"><circle cx="60" cy="60" r="47" opacity=".4"/><circle cx="60" cy="33" r="7"/><path d="M32 50l28 7 28-7M60 57v20m0-3L43 98m17-24 17 24"/><path d="M10 47v26m100-26v26" opacity=".4"/></g>,
    <g key="ai"><path d="M29 31 61 21l32 32-12 38-42 6-21-31zM29 31l10 66 54-44-75 13 43-45 20 70" opacity=".6"/>{[[29,31],[61,21],[93,53],[81,91],[39,97],[18,66]].map(([x,y])=><circle key={x} cx={x} cy={y} r="4" fill="var(--background)"/>)}</g>,
    <g key="web"><rect x="12" y="22" width="96" height="75" rx="6"/><path d="M12 40h96M22 31h2m8 0h2m8 0h2M43 56l-12 12 12 12m34-24 12 12-12 12M66 51l-12 34"/></g>,
  ] : variant === "community" ? [
    <g key="learn"><rect x="18" y="25" width="84" height="57" rx="5"/><path d="M9 88h102M48 42l-12 11 12 11m24-22 12 11-12 11M64 38l-8 31"/></g>,
    <g key="teach"><rect x="31" y="21" width="58" height="78" rx="3"/><path d="M42 40h35M42 50h22M42 80h35M42 90h25M68 59v16m0-16 9-2"/><circle cx="63" cy="77" r="5"/></g>,
    <g key="create"><path d="M25 25v70m24-70v70m23-70v70m23-70v70"/><rect x="18" y="43" width="14" height="10" rx="2"/><rect x="42" y="69" width="14" height="10" rx="2"/><rect x="65" y="31" width="14" height="10" rx="2"/><rect x="88" y="58" width="14" height="10" rx="2"/></g>,
  ] : [
    <g key="input"><path d="M36 18h34l17 18v65H36zM70 18v20h17M47 78V58m9 28V49m9 26V56m9 29V47"/><path d="M20 43v49h8" opacity=".45"/></g>,
    <g key="extract">{Array.from({length:16},(_,i)=><circle key={i} cx={30+i%4*20} cy={30+Math.floor(i/4)*20} r={(i%3)+1.7}/>)}<path d="M19 12H9v98h10m82-98h10v98h-10"/></g>,
    <g key="analyze">{Array.from({length:13},(_,i)=><path key={i} d={`M${12+i*8} ${(60-(Math.sin(i*2)+1.3)*14).toFixed(2)}v${((Math.sin(i*2)+1.3)*28).toFixed(2)}`} />)}<path d="M7 60h106" opacity=".4"/></g>,
    <g key="result"><path d="M22 20v80h80M31 75l18-21 16 8 30-31M85 31h10v10"/><circle cx="49" cy="54" r="3"/><circle cx="65" cy="62" r="3"/></g>,
  ];
  return <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[index%paths.length]}</svg>;
}
