const {students:ALL,weights:W}=DATA,$=id=>document.getElementById(id);
const COL={High:'#e5484d',Medium:'#f5a524',Low:'#2fb36d'},LAB={academic:'Academic',attendance:'Attendance',lms:'LMS',engagement:'Engagement',placement:'Placement',skills:'Skills',feedback:'Feedback'};
const ACTION={academic:'Arrange remedial classes / peer mentoring for weak subjects.',attendance:'Counsellor call + parent notification on attendance shortfall.',lms:'Nudge to complete pending LMS assignments; set weekly targets.',engagement:'Encourage clubs, hackathons and certifications.',placement:'Enrol in aptitude/coding bootcamp and mock-interview slots.',skills:'Assign skill-lab modules and soft-skill workshops.',feedback:'Faculty check-in to understand dissatisfaction.'};
const F={dept:'All',year:'All',risk:'All',segment:'All',q:''};let sortK='score',sortD=1;
const uniq=k=>['All',...[...new Set(ALL.map(s=>s[k]))].sort()];
function fill(id,k,label){const e=$(id);e.innerHTML=uniq(k).map(v=>`<option value="${v}">${v==='All'?label:v}</option>`).join('');e.onchange=()=>{F[k]=e.value;render()}}
fill('fDept','dept','All departments');fill('fYear','year','All years');fill('fRisk','risk','All risk levels');fill('fSeg','segment','All segments');
$('fSearch').oninput=e=>{F.q=e.target.value.toLowerCase();render()};
$('reset').onclick=()=>{Object.assign(F,{dept:'All',year:'All',risk:'All',segment:'All',q:''});['fDept','fYear','fRisk','fSeg'].forEach(i=>$(i).value='All');$('fSearch').value='';render()};
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const rows=()=>ALL.filter(s=>(F.dept==='All'||s.dept===F.dept)&&(F.year==='All'||s.year==+F.year)&&(F.risk==='All'||s.risk===F.risk)&&(F.segment==='All'||s.segment===F.segment)&&(!F.q||(s.name+s.id).toLowerCase().includes(F.q)));
const badge=r=>`<span class="badge ${r}">${r}</span>`;
function render(){const R=rows();
 const cnt=k=>R.filter(s=>s[k]==='High').length;
 $('kpis').innerHTML=[['Students',R.length],['Avg Success Score',avg(R.map(s=>s.score)).toFixed(1)],['High overall risk',cnt('risk')],['Academic high-risk',cnt('academic_risk')],['Placement high-risk',cnt('placement_risk')],['Avg attendance',avg(R.map(s=>s.attendance)).toFixed(0)+'%']].map(([a,b])=>`<div class="kpi"><b>${b}</b><span>${a}</span></div>`).join('');
 const bins=Array(10).fill(0);R.forEach(s=>bins[Math.min(9,Math.floor(s.score/10))]++);const mx=Math.max(1,...bins);
 $('cHist').innerHTML=`<svg viewBox="0 0 400 190">${bins.map((b,i)=>`<rect x="${20+i*37}" y="${160-b/mx*135}" width="32" height="${b/mx*135}" rx="4" fill="${i<5?'#e5484d':i<6?'#f5a524':'#4f46e5'}"/><text x="${36+i*37}" y="175" text-anchor="middle">${i*10}</text><text x="${36+i*37}" y="${155-b/mx*135}" text-anchor="middle">${b}</text>`).join('')}</svg>`;
 const ds=[...new Set(ALL.map(s=>s.dept))].sort();
 $('cDept').innerHTML=`<svg viewBox="0 0 400 190">${ds.map((d,i)=>{const g=R.filter(s=>s.dept===d),t=Math.max(1,g.length);let x=70;return `<text x="62" y="${27+i*28}" text-anchor="end">${d}</text>`+['High','Medium','Low'].map(l=>{const w=g.filter(s=>s.risk===l).length/t*300;const r=`<rect x="${x}" y="${14+i*28}" width="${w}" height="18" fill="${COL[l]}"/>`;x+=w;return r}).join('')}).join('')}</svg>`;
 const sg=[...new Set(ALL.map(s=>s.segment))].sort(),sm=Math.max(1,...sg.map(g=>R.filter(s=>s.segment===g).length));
 $('cSeg').innerHTML=`<svg viewBox="0 0 400 190">${sg.map((g,i)=>{const n=R.filter(s=>s.segment===g).length;return `<g style="cursor:pointer" onclick="pick('segment','${g}','fSeg')"><text x="0" y="${20+i*34}">${g}</text><rect x="0" y="${25+i*34}" width="${n/sm*340}" height="11" rx="4" fill="#7c3aed"/><text x="${n/sm*340+6}" y="${35+i*34}">${n}</text></g>`}).join('')}</svg>`;
 $('cScat').innerHTML=`<svg viewBox="0 0 400 200"><line x1="40" y1="170" x2="390" y2="170" stroke="#999"/><line x1="40" y1="10" x2="40" y2="170" stroke="#999"/><text x="215" y="192" text-anchor="middle">Attendance % (35-100)</text><text x="4" y="95">CGPA</text>${R.map(s=>`<circle cx="${40+(s.attendance-35)/65*350}" cy="${170-(s.cgpa-4)/6*160}" r="3.5" fill="${COL[s.risk]}" opacity=".7"><title>${s.name}: ${s.score}</title></circle>`).join('')}</svg>`;
 $('cInd').innerHTML=`<svg viewBox="0 0 800 130">${Object.keys(W).map((k,i)=>{const v=avg(R.map(s=>s.comp[k]));return `<rect x="${20+i*112}" y="${100-v}" width="70" height="${v}" rx="4" fill="${v<65?'#f5a524':'#4f46e5'}"/><text x="${55+i*112}" y="118" text-anchor="middle">${LAB[k]} (${W[k]}%)</text><text x="${55+i*112}" y="${95-v}" text-anchor="middle">${v.toFixed(0)}</text>`}).join('')}</svg>`;
 table(R)}
window.pick=(k,v,sel)=>{F[k]=v;$(sel).value=v;render()};
const COLS=[['id','ID'],['name','Name'],['dept','Dept'],['year','Yr'],['cgpa','CGPA'],['attendance','Att %'],['score','Score'],['academic_risk','Academic risk'],['placement_risk','Placement risk'],['risk','Overall'],['segment','Segment']];
function table(R){R=[...R].sort((a,b)=>(a[sortK]>b[sortK]?1:-1)*sortD);$('count').textContent=`(${R.length})`;
 document.querySelector('#tbl thead').innerHTML='<tr>'+COLS.map(([k,l])=>`<th data-k="${k}">${l}${k===sortK?(sortD>0?' ▲':' ▼'):''}</th>`).join('')+'</tr>';
 document.querySelectorAll('th').forEach(t=>t.onclick=()=>{const k=t.dataset.k;sortD=k===sortK?-sortD:1;sortK=k;table(rows())});
 document.querySelector('#tbl tbody').innerHTML=R.slice(0,200).map(s=>`<tr data-id="${s.id}">${COLS.map(([k])=>`<td>${/risk$/.test(k)?badge(s[k]):s[k]}</td>`).join('')}</tr>`).join('');
 document.querySelectorAll('tbody tr').forEach(r=>r.onclick=()=>panel(ALL.find(s=>s.id===r.dataset.id)))}
function panel(s){const m=Math.max(...s.drivers.map(d=>Math.abs(d.impact)),1),weak=s.drivers.filter(d=>d.impact<0).slice(0,3);
 $('panel').classList.remove('hidden');$('panel').innerHTML=`<button class="close" onclick="document.getElementById('panel').classList.add('hidden')">×</button><h2>${s.name}</h2><p>${s.id} · ${s.dept} · Year ${s.year}</p>
 <h1 style="margin:0">${s.score} <small>Success Score</small></h1><p>${badge(s.risk)} ${s.segment}</p>
 <h3>Why this score? <small>(points above/below cohort average)</small></h3>
 ${[...s.drivers].reverse().map(d=>{const w=Math.abs(d.impact)/m*100;return `<div class="bar"><span class="lab">${LAB[d.k]}</span><span class="track"><span style="width:50%;display:flex;justify-content:flex-end">${d.impact<0?`<i class="neg" style="width:${w}%"></i>`:''}</span><span style="width:50%">${d.impact>=0?`<i class="pos" style="width:${w}%"></i>`:''}</span></span><b>${d.impact>0?'+':''}${d.impact}</b></div>`}).join('')}
 <h3>Risk flags</h3><ul>${s.reasons.length?s.reasons.map(r=>`<li>${r}</li>`).join(''):'<li>No active flags</li>'}</ul>
 <h3>Suggested interventions</h3><ul>${weak.map(d=>`<li><b>${LAB[d.k]}:</b> ${ACTION[d.k]}</li>`).join('')}</ul>`}
render();
