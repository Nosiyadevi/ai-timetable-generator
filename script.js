
// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
const S = {
  subjects:[],teachers:[],rooms:[],
  days:['Mon','Tue','Wed','Thu','Fri'],
  timetable:null,slots:[],days_used:[],
  editCell:{day:null,slot:null}
};
let subId=0,tchId=0,rmId=0;
const COLORS=['#7c6dfa','#34d399','#fbbf24','#f87171','#60a5fa','#f472b6','#a78bfa','#fb923c','#2dd4bf'];
const ALL_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// ═══════════════════════════════════════════════════════
// LOCAL STORAGE — persist everything
// ═══════════════════════════════════════════════════════
function saveState(){
  try{
    localStorage.setItem('tt_subjects',JSON.stringify(S.subjects));
    localStorage.setItem('tt_teachers',JSON.stringify(S.teachers));
    localStorage.setItem('tt_rooms',JSON.stringify(S.rooms));
    localStorage.setItem('tt_days',JSON.stringify(S.days));
    localStorage.setItem('tt_start',document.getElementById('startTime').value);
    localStorage.setItem('tt_end',document.getElementById('endTime').value);
    localStorage.setItem('tt_duration',document.getElementById('slotDuration').value);
    localStorage.setItem('tt_maxpt',document.getElementById('maxPerTeacher').value);
  }catch(e){}
}
function loadState(){
  try{
    const sub=localStorage.getItem('tt_subjects');
    const tch=localStorage.getItem('tt_teachers');
    const rm=localStorage.getItem('tt_rooms');
    const dy=localStorage.getItem('tt_days');
    if(sub) return{subjects:JSON.parse(sub),teachers:JSON.parse(tch||'[]'),rooms:JSON.parse(rm||'[]'),days:JSON.parse(dy||'["Mon","Tue","Wed","Thu","Fri"]'),start:localStorage.getItem('tt_start')||'08:00',end:localStorage.getItem('tt_end')||'17:00',dur:localStorage.getItem('tt_duration')||'60',maxpt:localStorage.getItem('tt_maxpt')||'4'};
  }catch(e){}
  return null;
}

// ═══════════════════════════════════════════════════════
// API KEY
// ═══════════════════════════════════════════════════════
 
// ═══════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════
function switchTab(name){
  document.querySelectorAll('.tab').forEach((t,i)=>{
    const names=['setup','timetable','teachers'];
    t.classList.toggle('active',names[i]===name);
  });
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+name).classList.add('active');
}

// ═══════════════════════════════════════════════════════
// DAYS
// ═══════════════════════════════════════════════════════
function initDays(){
  const g=document.getElementById('daysGrid');
  g.innerHTML='';
  ALL_DAYS.forEach(d=>{
    const c=document.createElement('div');
    c.className='day-chip'+(S.days.includes(d)?' selected':'');
    c.textContent=d;
    c.onclick=()=>{
      c.classList.toggle('selected');
      S.days=[...document.querySelectorAll('.day-chip.selected')].map(x=>x.textContent);
      saveState();
    };
    g.appendChild(c);
  });
}

// ═══════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════
function addSubject(name='',credits=3,color='',id=0){
  const eid=id||++subId;
  if(!id) S.subjects.push({id:eid,name,credits,color:color||(COLORS[(eid-1)%COLORS.length])});
  const obj=S.subjects.find(x=>x.id===eid);
  const row=document.createElement('div');
  row.className='row-item subjects-row';row.id='sub-'+eid;
  row.innerHTML=`
    <input type="text" placeholder="Subject name" value="${obj.name}"
      oninput="updSub(${eid},'name',this.value)"/>
    <input type="number" value="${obj.credits}" min="1" max="7"
      oninput="updSub(${eid},'credits',+this.value)"/>
    <input type="color" value="${obj.color}"
      oninput="updSub(${eid},'color',this.value)" title="Subject color"/>
    <button class="remove-btn" onclick="remSub(${eid})">×</button>`;
  document.getElementById('subjectsContainer').appendChild(row);
}
function updSub(id,k,v){const o=S.subjects.find(x=>x.id===id);if(o){o[k]=v;saveState()}}
function remSub(id){S.subjects=S.subjects.filter(x=>x.id!==id);document.getElementById('sub-'+id)?.remove();saveState()}

// ═══════════════════════════════════════════════════════
// TEACHERS
// ═══════════════════════════════════════════════════════
function addTeacher(name='',subjects='',id=0){
  const eid=id||++tchId;
  if(!id) S.teachers.push({id:eid,name,subjects});
  const obj=S.teachers.find(x=>x.id===eid);
  const row=document.createElement('div');
  row.className='row-item teachers-row';row.id='tch-'+eid;
  row.innerHTML=`
    <input type="text" placeholder="Teacher name" value="${obj.name}"
      oninput="updTch(${eid},'name',this.value)"/>
    <input type="text" placeholder="Mathematics, Physics…" value="${obj.subjects}"
      oninput="updTch(${eid},'subjects',this.value)"/>
    <button class="remove-btn" onclick="remTch(${eid})">×</button>`;
  document.getElementById('teachersContainer').appendChild(row);
}
function updTch(id,k,v){const o=S.teachers.find(x=>x.id===id);if(o){o[k]=v;saveState()}}
function remTch(id){S.teachers=S.teachers.filter(x=>x.id!==id);document.getElementById('tch-'+id)?.remove();saveState()}

// ═══════════════════════════════════════════════════════
// ROOMS
// ═══════════════════════════════════════════════════════
function addRoom(name='',capacity=40,id=0){
  const eid=id||++rmId;
  if(!id) S.rooms.push({id:eid,name,capacity});
  const obj=S.rooms.find(x=>x.id===eid);
  const row=document.createElement('div');
  row.className='row-item rooms-row';row.id='rm-'+eid;
  row.innerHTML=`
    <input type="text" placeholder="Room 101 / Lab A" value="${obj.name}"
      oninput="updRm(${eid},'name',this.value)"/>
    <input type="number" value="${obj.capacity}" min="1"
      oninput="updRm(${eid},'capacity',+this.value)"/>
    <button class="remove-btn" onclick="remRm(${eid})">×</button>`;
  document.getElementById('roomsContainer').appendChild(row);
}
function updRm(id,k,v){const o=S.rooms.find(x=>x.id===id);if(o){o[k]=v;saveState()}}
function remRm(id){S.rooms=S.rooms.filter(x=>x.id!==id);document.getElementById('rm-'+id)?.remove();saveState()}

// ═══════════════════════════════════════════════════════
// TIME SLOTS
// ═══════════════════════════════════════════════════════
function makeSlots(){

  const s = document.getElementById('startTime').value || '08:00';
  const e = document.getElementById('endTime').value || '17:00';
  const d = +document.getElementById('slotDuration').value || 60;

  const slots = [];

  let [h,m] = s.split(':').map(Number);
  const [eh,em] = e.split(':').map(Number);

  while(h * 60 + m + d <= eh * 60 + em){

    const a =
      `${String(h).padStart(2,'0')}:` +
      `${String(m).padStart(2,'0')}`;

    // MOVE TIME FORWARD
    m += d;
    h += Math.floor(m / 60);
    m %= 60;

    const b =
      `${String(h).padStart(2,'0')}:` +
      `${String(m).padStart(2,'0')}`;

    // REPLACE 12–13 WITH LUNCH
    if(a === '12:00' && b === '13:00'){

      slots.push('LUNCH BREAK');

    } else {

      slots.push(`${a}–${b}`);
    }
  }

  return slots;
}
function calculateScore(tt, day, slot, sub, tch) {

  let score = 100;

  const allSlots = Object.keys(tt[day]);
  const index = allSlots.indexOf(slot);

  // Penalize consecutive same subject
  if (index > 0) {

    const prev = tt[day][allSlots[index - 1]];

    if (prev && prev.subject.id === sub.id) {
      score -= 40;
    }
  }

  // Penalize overloaded teacher days
  const teacherLoad = allSlots.filter(sl =>
    tt[day][sl]?.teacher?.id === tch.id
  ).length;

  score -= teacherLoad * 10;

  // Penalize sparse schedules
  const filled = allSlots.filter(sl => tt[day][sl]).length;

  if (filled < 2) score -= 10;

  return score;
}
// ═══════════════════════════════════════════════════════
// CONSTRAINT SOLVER
// ═══════════════════════════════════════════════════════
function solve(){
  const days=S.days;
  const slots=makeSlots();
  const maxPD=+document.getElementById('maxPerTeacher').value||4;
  const subs=S.subjects.filter(s=>s.name.trim());
  const tchs=S.teachers.filter(t=>t.name.trim());
  const rms=S.rooms.filter(r=>r.name.trim());
  if(!subs.length)return{error:'Add at least one subject'};
  if(!tchs.length)return{error:'Add at least one teacher'};
  if(!rms.length)return{error:'Add at least one room'};
  if(!days.length)return{error:'Select at least one working day'};
  if(!slots.length)return{error:'Check your start/end times'};

  const tchSubMap={};
  tchs.forEach(t=>{tchSubMap[t.id]=t.subjects.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)});

  const tt={};
  days.forEach(d=>{tt[d]={};slots.forEach(sl=>{tt[d][sl]=null})});
  const tchLoad={};tchs.forEach(t=>{tchLoad[t.id]={}});
  const rmBook={};rms.forEach(r=>{rmBook[r.id]=new Set()});
  const conflicts=[];

  // Sort subjects by most sessions needed (greedy: hardest to place first)
  const sorted=[...subs].sort((a,b)=>(b.credits||3)-(a.credits||3));

  sorted.forEach(sub=>{
    const sessions=Math.min(sub.credits||3,days.length*slots.length);
    let placed=0;
    const eligible=tchs.filter(t=>tchSubMap[t.id].length===0||tchSubMap[t.id].some(s=>s.includes(sub.name.toLowerCase())||sub.name.toLowerCase().includes(s)));
    const cands=eligible.length?eligible:tchs;

    // Spread across days first
    const dayOrder = [...days].sort((a, b) => {

  const countA = slots.filter(sl => tt[a][sl]).length;
  const countB = slots.filter(sl => tt[b][sl]).length;

  return countA - countB;
});
    for (const day of dayOrder) {

  if (placed >= sessions) break;

  // Skip duplicate subject same day
  const alreadyToday = slots.some(sl =>
    tt[day][sl]?.subject?.id === sub.id
  );

  if (alreadyToday) continue;

  // Sort slots by usage balance
  const orderedSlots = [...slots]
    .filter(sl => sl !== 'LUNCH BREAK')
    .sort((a, b) => {

      const loadA = days.reduce(
        (n, d) => n + (tt[d][a] ? 1 : 0),
        0
      );

      const loadB = days.reduce(
        (n, d) => n + (tt[d][b] ? 1 : 0),
        0
      );

      return loadA - loadB;
    });

  let bestOption = null;
  let bestScore = -Infinity;

  for (const slot of orderedSlots) {

    // Skip occupied slots
    if (tt[day][slot] !== null) continue;

    const slotIndex = orderedSlots.indexOf(slot);

    // Teacher cooldown
    if (slotIndex > 0) {

      const prevSlot = orderedSlots[slotIndex - 1];

      if (
        tt[day][prevSlot] &&
        tt[day][prevSlot].teacher.id ===
        (tt[day][prevSlot]?.teacher?.id)
      ) {
        continue;
      }
    }

    // Subject spacing
    const recentSlots = orderedSlots.slice(
      Math.max(0, slotIndex - 2),
      slotIndex
    );

    const repeatedRecently = recentSlots.some(sl =>
      tt[day][sl]?.subject?.id === sub.id
    );

    if (repeatedRecently) continue;

    // Least loaded teacher
    const tch = cands
      .filter(t =>
        (tchLoad[t.id][day] || 0) < maxPD
      )
      .sort((a, b) => {

        const totalA = days.reduce(
          (n, d) => n + (tchLoad[a.id][d] || 0),
          0
        );

        const totalB = days.reduce(
          (n, d) => n + (tchLoad[b.id][d] || 0),
          0
        );

        return totalA - totalB;

      })[0];

    if (!tch) continue;

    // Find room
    const rm = rms.find(r =>
      !rmBook[r.id].has(`${day}|${slot}`)
    );

    if (!rm) continue;
    // Score placement
    const score = calculateScore(
      tt,
      day,
      slot,
      sub,
      tch
    );

    // Keep best option
    if (score > bestScore) {

      bestScore = score;

      bestOption = {
        slot,
        tch,
        rm
      };
    }
  }

  // Place best option
  if (bestOption) {

    tt[day][bestOption.slot] = {
      subject: sub,
      teacher: bestOption.tch,
      room: bestOption.rm
    };

    tchLoad[bestOption.tch.id][day] =
      (tchLoad[bestOption.tch.id][day] || 0) + 1;

    rmBook[bestOption.rm.id]
      .add(`${day}|${bestOption.slot}`);

    placed++;
  }
}
    if(placed<sessions)conflicts.push(`Could only schedule ${placed} of ${sessions} sessions for ${sub.name}`);
  });

  // Detect double-booking (sanity check)
  const tchSlotBook={};
  days.forEach(d=>slots.forEach(sl=>{
    const cell=tt[d][sl];
    if(!cell)return;
    const key=`${cell.teacher.id}|${d}|${sl}`;
    if(tchSlotBook[key])conflicts.push(`Double-booking: ${cell.teacher.name} on ${d} at ${sl}`);
    else tchSlotBook[key]=true;
  }));

  return{timetable:tt,slots,days,conflicts};
}
function shuffled(a){return[...a].sort(()=>Math.random()-.5)}

// ═══════════════════════════════════════════════════════
// GEMINI API
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// GEMINI API
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// GEMINI API — WORKING VERSION
// ═══════════════════════════════════════════════════════

async function askGemini(tt, slots, days) {

  // =========================
  // YOUR GEMINI API KEY
  // =========================
  const API_KEY = "YOUR_GEMINI_API_KEY";

  // =========================
  // ACTIVE GEMINI MODEL
  // =========================
  const MODEL = "gemini-2.5-flash";

  // =========================
  // BUILD TIMETABLE SUMMARY
  // =========================
  let summary = "Weekly Timetable:\n";

  days.forEach(day => {

    summary += `\n${day}:\n`;

    slots.forEach(slot => {

      const cell = tt[day][slot];

      if (cell) {

        summary +=
          `${slot} → ` +
          `${cell.subject.name} | ` +
          `${cell.teacher.name} | ` +
          `${cell.room.name}\n`;

      } else {

        summary += `${slot} → Free\n`;

      }

    });

  });

  // =========================
  // AI PROMPT
  // =========================
  const prompt = `
${summary}

Analyze this school timetable fairly.

Rules:
- Empty periods are acceptable.
- Do not heavily penalize moderate free slots.
- Focus on timetable balance and organization.
- The score MUST always be written exactly like:
  7/10
  8/10
  5/10

Provide:

1. Overall score
2. Strengths
3. Weaknesses
4. Suggestions

Keep response concise.
`;

  try {

    // =========================
    // API REQUEST
    // =========================
   let response;

for(let attempt = 1; attempt <= 3; attempt++){

  response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],

        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 700
        }

      })
    }
  );

  // SUCCESS
  if(response.ok){
    break;
  }

  // WAIT BEFORE RETRYING
  await new Promise(r =>
    setTimeout(r, attempt * 1500)
  );
}

    // =========================
    // RESPONSE JSON
    // =========================
    const data = await response.json();

    // =========================
    // ERROR HANDLING
    // =========================
    if (!response.ok) {

      console.error("Gemini API Error:", data);

      if(data?.error?.message?.includes('high demand')){

  throw new Error(
    'Gemini servers are busy. Please wait a few seconds and try again.'
  );
}

throw new Error(
  data?.error?.message ||
  `HTTP Error ${response.status}`
);
    }

    // =========================
    // RETURN AI RESPONSE
    // =========================
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI response generated."
    );

  } catch (error) {

    console.error(error);

    return `AI unavailable: ${error.message}`;
  }
}
// ═══════════════════════════════════════════════════════
// RENDER TABLE
// ═══════════════════════════════════════════════════════
function renderTable(tt,slots,days){

  const head = document.getElementById('ttHead');
  const body = document.getElementById('ttBody');

  // TABLE HEADER
  head.innerHTML = `
    <tr>
      <th>Time</th>
      ${days.map(d => `<th>${d}</th>`).join('')}
    </tr>
  `;

  // TABLE BODY
  body.innerHTML = slots.map(slot => {

    // LUNCH BREAK ROW
    if(slot === 'LUNCH BREAK'){

      return `
        <tr>
          <td colspan="${days.length + 1}"
            style="
              text-align:center;
              background:#222;
              color:#fbbf24;
              font-weight:600;
              padding:14px;
              font-size:14px;
              letter-spacing:.5px;
            ">
            🍽 Lunch Break
          </td>
        </tr>
      `;
    }

    // NORMAL SLOT ROW
    return `
      <tr>

        <td style="
          font-family:var(--mono);
          font-size:11px;
          color:var(--hint);
          white-space:nowrap;
          min-width:90px
        ">
          ${slot}
        </td>

        ${days.map(day => {

          const cell = tt[day][slot];

          // EMPTY CELL
          if(!cell){

            return `
              <td class="cell-empty">
                —
              </td>
            `;
          }

          const col = cell.subject.color || '#7c6dfa';

          // FILLED CELL
          return `
            <td>

              <div class="cell-editable"
                onclick="openCellEdit('${day}','${slot}',event)">

                <div class="cell-subject"
                  style="color:${col}">
                  ${cell.subject.name}
                </div>

                <div class="cell-teacher">
                  ${cell.teacher.name}
                </div>

                <div class="cell-room">
                  ${cell.room.name}
                </div>

              </div>

            </td>
          `;

        }).join('')}

      </tr>
    `;

  }).join('');
}
// ═══════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════
function renderStats(tt,slots,days){
  const total=days.reduce((a,d)=>a+slots.filter(sl=>tt[d][sl]).length,0);
  const totalSlots=days.length*slots.length;
  const utilPct=totalSlots?Math.round(total/totalSlots*100):0;
  const busiest=days.map(d=>({d,n:slots.filter(sl=>tt[d][sl]).length})).sort((a,b)=>b.n-a.n)[0];
  const tchCount=new Set(days.flatMap(d=>slots.map(sl=>tt[d][sl]?.teacher?.id).filter(Boolean))).size;
  document.getElementById('statsRow').innerHTML=`
    <div class="stat-card"><div class="stat-label">Classes scheduled</div><div class="stat-value" style="color:var(--accent2)">${total}</div></div>
    <div class="stat-card"><div class="stat-label">Slot utilization</div><div class="stat-value" style="color:var(--green)">${utilPct}%</div></div>
    <div class="stat-card"><div class="stat-label">Busiest day</div><div class="stat-value" style="font-size:16px;padding-top:4px;color:var(--amber)">${busiest?.d||'—'} (${busiest?.n||0})</div></div>
    <div class="stat-card"><div class="stat-label">Active teachers</div><div class="stat-value" style="color:var(--text)">${tchCount}</div></div>`;
}

// ═══════════════════════════════════════════════════════
// TEACHER VIEW
// ═══════════════════════════════════════════════════════
function renderTeacherView(tt,slots,days){
  const tchs=S.teachers.filter(t=>t.name.trim());
  const filter=document.getElementById('teacherFilter');
  const container=document.getElementById('teacherTables');
  filter.innerHTML='';container.innerHTML='';

  tchs.forEach((tch,i)=>{
    const chip=document.createElement('div');
    chip.className='filter-chip'+(i===0?' active':'');
    chip.textContent=tch.name;
    chip.onclick=()=>{
      document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      document.querySelectorAll('.teacher-table-block').forEach(b=>b.style.display='none');
      document.getElementById('ttbl-'+tch.id).style.display='block';
    };
    filter.appendChild(chip);

    const block=document.createElement('div');
    block.className='teacher-table-block';
    block.id='ttbl-'+tch.id;
    block.style.display=i===0?'block':'none';

    const classes=[];
    days.forEach(d=>slots.forEach(sl=>{const c=tt[d][sl];if(c&&c.teacher.id===tch.id)classes.push({day:d,slot:sl,subject:c.subject,room:c.room})}));
    const total=classes.length;

    block.innerHTML=`
      <div style="margin-bottom:12px;display:flex;align-items:center;gap:12px">
        <div style="font-size:16px;font-weight:600">${tch.name}</div>
        <div style="font-size:12px;color:var(--muted);background:var(--surface2);padding:3px 10px;border-radius:20px">${total} class${total!==1?'es':''}/week</div>
      </div>
      <div class="timetable-scroll">
        <table>
          <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Room</th></tr></thead>
          <tbody>${classes.map(c=>`<tr>
            <td style="font-weight:500">${c.day}</td>
            <td style="font-family:var(--mono);font-size:11px;color:var(--hint)">${c.slot}</td>
            <td><span style="color:${c.subject.color||'var(--accent2)'}">${c.subject.name}</span></td>
            <td><span class="cell-room">${c.room.name}</span></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
    container.appendChild(block);
  });
}

// ═══════════════════════════════════════════════════════
// CELL EDIT
// ═══════════════════════════════════════════════════════
let cellPopupOpen=false;
function openCellEdit(day,slot,event){
  event.stopPropagation();
  S.editCell={day,slot};
  const popup=document.getElementById('cellPopup');
  document.getElementById('popupLabel').textContent=`${day} · ${slot}`;

  const subSel=document.getElementById('popupSubject');
  const tchSel=document.getElementById('popupTeacher');
  const rmSel=document.getElementById('popupRoom');
  const cur=S.timetable.timetable[day][slot];

  subSel.innerHTML=`<option value="">— empty —</option>`+S.subjects.filter(s=>s.name).map(s=>`<option value="${s.id}"${cur&&cur.subject.id===s.id?' selected':''}>${s.name}</option>`).join('');
  tchSel.innerHTML=S.teachers.filter(t=>t.name).map(t=>`<option value="${t.id}"${cur&&cur.teacher.id===t.id?' selected':''}>${t.name}</option>`).join('');
  rmSel.innerHTML=S.rooms.filter(r=>r.name).map(r=>`<option value="${r.id}"${cur&&cur.room.id===r.id?' selected':''}>${r.name}</option>`).join('');

  // Position popup near click
  const rect={top:event.clientY,left:event.clientX};
  popup.style.display='block';
  const pw=popup.offsetWidth,ph=popup.offsetHeight;
  let left=rect.left+10,top=rect.top-10;
  if(left+pw>window.innerWidth-10)left=window.innerWidth-pw-10;
  if(top+ph>window.innerHeight-10)top=window.innerHeight-ph-10;
  popup.style.left=Math.max(10,left)+'px';
  popup.style.top=Math.max(10,top)+'px';
  cellPopupOpen=true;
}
function closeCellPopup(){document.getElementById('cellPopup').style.display='none';cellPopupOpen=false}
function clearCell(){
  const{day,slot}=S.editCell;
  S.timetable.timetable[day][slot]=null;
  renderTable(S.timetable.timetable,S.timetable.slots,S.timetable.days);
  renderStats(S.timetable.timetable,S.timetable.slots,S.timetable.days);
  closeCellPopup();showToast('Cell cleared');
}
function applyCell(){
  const{day,slot}=S.editCell;
  const sid=+document.getElementById('popupSubject').value;
  const tid=+document.getElementById('popupTeacher').value;
  const rid=+document.getElementById('popupRoom').value;
  if(!sid){clearCell();return}
  const sub=S.subjects.find(x=>x.id===sid);
  const tch=S.teachers.find(x=>x.id===tid);
  const rm=S.rooms.find(x=>x.id===rid);
  if(!sub||!tch||!rm)return;
  S.timetable.timetable[day][slot]={subject:sub,teacher:tch,room:rm};
  renderTable(S.timetable.timetable,S.timetable.slots,S.timetable.days);
  renderStats(S.timetable.timetable,S.timetable.slots,S.timetable.days);
  closeCellPopup();showToast('Cell updated!','success');
}
document.addEventListener('click',e=>{if(cellPopupOpen&&!document.getElementById('cellPopup').contains(e.target))closeCellPopup()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCellPopup()});

// ═══════════════════════════════════════════════════════
// MAIN GENERATE
// ═══════════════════════════════════════════════════════
async function generate(){
  const btn=document.getElementById('generateBtn');
  const ov=document.getElementById('loadingOverlay');
  btn.disabled=true;
  ov.classList.add('show');

  const steps=['ls1','ls2','ls3','ls4','ls5'];
  const setStep=(i,state)=>{
    steps.forEach((id,j)=>{
      const el=document.getElementById(id);
      el.className='loading-step'+(j<i?' done':j===i?' active':'');
    });
  };

  setStep(0,'active');await sleep(200);
  // Validate
  if(!S.subjects.filter(s=>s.name.trim()).length){done(btn,ov);showToast('Add at least one subject','error');return}
  if(!S.teachers.filter(t=>t.name.trim()).length){done(btn,ov);showToast('Add at least one teacher','error');return}
  if(!S.rooms.filter(r=>r.name.trim()).length){done(btn,ov);showToast('Add at least one room','error');return}

  setStep(1,'active');await sleep(250);
  const result=solve();
  if(result.error){done(btn,ov);showToast(result.error,'error');return}

  setStep(2,'active');await sleep(200);
  S.timetable=result;
  const{timetable:tt,slots,days,conflicts}=result;

  // Show conflict banner
  const banner=document.getElementById('conflictBanner');
  if(conflicts.length){banner.innerHTML='⚠ '+conflicts.join('<br>⚠ ');banner.classList.add('show')}
  else banner.classList.remove('show');

  setStep(3,'active');
  // Ask Gemini
document.getElementById('aiText').textContent = 'Analyzing...';

let aiResult = null;

try {

  aiResult = await askGemini(tt, slots, days);

} catch (e) {

  aiResult = `AI unavailable: ${e.message}`;
}

  setStep(4,'active');await sleep(150);
  renderStats(tt,slots,days);
  renderTable(tt,slots,days);
  if(aiResult)document.getElementById('aiText').innerHTML =
  aiResult
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Teacher view
  renderTeacherView(tt,slots,days);

  setStep(5,'done');await sleep(150);
  done(btn,ov);

  // Show timetable tab
  document.getElementById('timetableOutput').style.display='block';
  document.getElementById('noTimetableMsg').style.display='none';
  document.getElementById('teachersOutput').style.display='block';
  document.getElementById('noTeachersMsg').style.display='none';
  switchTab('timetable');
  showToast('Timetable ready!','success');
}
function done(btn,ov){btn.disabled=false;ov.classList.remove('show')}
async function regenerate(){await generate()}

// ═══════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════
function exportCSV(){
  if(!S.timetable)return;
  const{timetable:tt,slots,days}=S.timetable;
  const rows=[['Time',...days]];
  slots.forEach(sl=>{
    const row=[sl];
    days.forEach(d=>{const c=tt[d][sl];row.push(c?`${c.subject.name} / ${c.teacher.name} / ${c.room.name}`:'')});
    rows.push(row);
  });
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  dl('timetable.csv','text/csv',csv);
  showToast('CSV downloaded!','success');
}
function exportPDF(){
  if(!S.timetable){showToast('Generate a timetable first','error');return}
  switchTab('timetable');
  setTimeout(()=>window.print(),200);
}
function dl(name,type,content){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([content],{type}));
  a.download=name;a.click();
}

// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function showToast(msg,type=''){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show'+(type?' '+type:'');
  clearTimeout(t._t);t._t=setTimeout(()=>t.className='toast',3200);
}

// ═══════════════════════════════════════════════════════
// SEED DEFAULTS
// ═══════════════════════════════════════════════════════
function seedDefaults(){
  addSubject('Mathematics',4);
  addSubject('Physics',3);
  addSubject('Computer Science',3);
  addSubject('English',2);
  addSubject('Chemistry',3);
  addTeacher('Dr. Meena Rajan','Mathematics, Physics');
  addTeacher('Prof. Arjun Kumar','Computer Science');
  addTeacher('Ms. Divya Nair','English');
  addTeacher('Dr. Suresh Babu','Chemistry, Physics');
  addRoom('Room 101',45);
  addRoom('Lab A',30);
  addRoom('Seminar Hall',60);
}

// ═══════════════════════════════════════════════════════
// INIT — restore saved state or use defaults
// ═══════════════════════════════════════════════════════
(function init(){
  
  const saved=loadState();
  if(saved&&saved.subjects.length){
    // Restore subjects
    saved.subjects.forEach(s=>{subId=Math.max(subId,s.id);S.subjects.push(s);addSubject('','','',s.id)});
    // Restore teachers
    saved.teachers.forEach(t=>{tchId=Math.max(tchId,t.id);S.teachers.push(t);addTeacher('','',t.id)});
    // Restore rooms
    saved.rooms.forEach(r=>{rmId=Math.max(rmId,r.id);S.rooms.push(r);addRoom('','',r.id)});
    // Restore days
    S.days=saved.days;
    document.getElementById('startTime').value=saved.start;
    document.getElementById('endTime').value=saved.end;
    document.getElementById('slotDuration').value=saved.dur;
    document.getElementById('maxPerTeacher').value=saved.maxpt;
    showToast('Previous session restored','success');
  } else {
    seedDefaults();
  }
  initDays();
  // Auto-save on constraint changes
  ['startTime','endTime','slotDuration','maxPerTeacher'].forEach(id=>{
    document.getElementById(id).addEventListener('change',saveState);
  });
})();
