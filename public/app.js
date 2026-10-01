const $ = id => document.getElementById(id);
const state = { quizCode:null, pin:null, creatorName:null, questions:[], participantId:null, ratings:[], currentParticipant:null };
const views = ['home','created','participantAnswers','participantResult','creatorPanel'];
function show(id){ views.forEach(v=>$(v).classList.toggle('hidden',v!==id)); if(id==='creatorPanel') $('evaluationCard').classList.add('hidden'); window.scrollTo({top:0,behavior:'smooth'}); }
function toast(msg){ $('toast').textContent=msg; $('toast').classList.remove('hidden'); clearTimeout(window.__t); window.__t=setTimeout(()=>$('toast').classList.add('hidden'),4500); }
async function api(endpoint, options={}){
  let res;
  try { res=await fetch(endpoint,{headers:{'Content-Type':'application/json'},...options}); }
  catch(e){ throw new Error('Não foi possível conectar ao servidor. Verifique se o site foi atualizado no Render.'); }
  const raw=await res.text(); let data={}; try{data=raw?JSON.parse(raw):{}}catch{}
  if(!res.ok) throw new Error(data.error || `Erro HTTP ${res.status}`);
  return data;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function renderQuestion(q, initial=''){
  return `<div class="question"><div class="qnum">PERGUNTA ${q.id}/50</div><div class="qtext">${esc(q.text)}</div><textarea data-id="${q.id}" placeholder="Digite sua resposta...">${esc(initial)}</textarea></div>`;
}
function updateProgress(){ const a=[...$('participantQuestions').querySelectorAll('textarea')].filter(t=>t.value.trim()).length; $('participantProgress').textContent=`${a}/50`; }
$('createBtn').onclick=async()=>{
  const creatorName=$('creatorName').value.trim(); if(!creatorName)return toast('Digite seu nome.');
  try{
    const d=await api('/api/quizzes',{method:'POST',body:JSON.stringify({creatorName})});
    state.quizCode=d.code; state.pin=d.pin; state.creatorName=d.creatorName; state.questions=d.questions;
    $('createdCode').textContent=d.code; $('createdPin').textContent=d.pin;
    $('creatorCode').value=d.code; $('creatorPin').value=d.pin;
    show('created');
  }catch(e){toast(e.message);}
};
$('openCreatorAfterCreateBtn').onclick=()=>openCreatorPanel();
$('homeAfterCreateBtn').onclick=()=>show('home');
$('joinBtn').onclick=async()=>{
  const code=$('joinCode').value.trim().toUpperCase(), name=$('participantName').value.trim();
  if(!code||!name)return toast('Digite o código e seu nome.');
  try{
    const d=await api(`/api/quizzes/${encodeURIComponent(code)}/join`,{method:'POST',body:JSON.stringify({name})});
    state.quizCode=code; state.participantId=d.participantId; state.creatorName=d.creatorName; state.questions=d.questions;
    $('participantTitle').textContent=`Quiz sobre ${d.creatorName}`;
    $('participantIntro').textContent=`Você tem 50 perguntas para tentar adivinhar o que ${d.creatorName} responderia.`;
    $('participantQuestions').innerHTML=d.questions.map(q=>renderQuestion(q)).join(''); $('participantProgress').textContent='0/50';
    show('participantAnswers');
    $('participantQuestions').oninput=updateProgress;
  }catch(e){toast(e.message);}
};
$('submitParticipantBtn').onclick=async()=>{
  const answers=[...$('participantQuestions').querySelectorAll('textarea')].map(t=>t.value.trim());
  if(answers.length!==50||answers.some(a=>!a))return toast('Responda todas as 50 perguntas.');
  try{await api(`/api/quizzes/${state.quizCode}/participants/${state.participantId}/answers`,{method:'POST',body:JSON.stringify({answers})}); await loadResult();}
  catch(e){toast(e.message);}
};
async function loadResult(){
  const d=await api(`/api/quizzes/${state.quizCode}/participants/${state.participantId}/result`);
  $('resultTitle').textContent=`${d.participantName} × ${d.creatorName}`; $('resultScore').textContent=d.score;
  $('resultStatus').textContent=`${d.evaluated}/50 respostas avaliadas. O resultado muda conforme o criador avaliar.`;
  let html='<h3>🏆 Ranking</h3><table class="rankTable"><thead><tr><th>#</th><th>Nome</th><th>Pontos</th><th>Avaliadas</th></tr></thead><tbody>';
  d.ranking.forEach((p,i)=>html+=`<tr><td>${i+1}</td><td>${esc(p.name)}</td><td>${p.score}</td><td>${p.evaluated}/50</td></tr>`);
  html+='</tbody></table>';
  if(d.evaluations.some(Boolean)){html+='<h3>📝 Avaliações</h3>'+d.evaluations.map((e,i)=>e?`<div class="question"><div class="qnum">PERGUNTA ${i+1}</div><div class="qtext">${esc(e.question)}</div><div>${e.icon} <b>${esc(e.label)}</b> — ${e.points>0?'+':''}${e.points}</div></div>`:'').join('');}
  $('resultDetails').innerHTML=html; show('participantResult');
}
$('resultHomeBtn').onclick=()=>show('home');
$('creatorLoginBtn').onclick=openCreatorPanel;
$('panelRefreshBtn').onclick=openCreatorPanel;
async function openCreatorPanel(){
  const code=$('creatorCode').value.trim().toUpperCase(), pin=$('creatorPin').value.trim(); if(!code||!pin)return toast('Digite o código e o PIN.');
  try{
    const d=await api(`/api/quizzes/${encodeURIComponent(code)}/creator-login`,{method:'POST',body:JSON.stringify({pin})});
    state.quizCode=code; state.pin=pin; state.creatorName=d.creatorName; state.questions=d.questions; state.ratings=await api('/api/ratings');
    $('panelTitle').textContent=`Quiz de ${d.creatorName}`; renderParticipants(d.participants); show('creatorPanel');
  }catch(e){toast(e.message);}
}
function renderParticipants(list){
  if(!list.length){$('participantList').innerHTML='<div class="empty">Ainda ninguém respondeu. Quando alguém enviar as 50 respostas, aparecerá aqui.</div>';return;}
  $('participantList').innerHTML=list.map(p=>`<div class="participantRow"><div><b>${esc(p.name)}</b><span>${p.answered}/50 respondidas · ${p.evaluated}/50 avaliadas · ${p.score} pontos</span></div><button class="small" onclick="selectParticipant('${p.id}')">Avaliar</button></div>`).join('');
}
window.selectParticipant=async id=>{
  try{const d=await api(`/api/quizzes/${state.quizCode}/participants/${encodeURIComponent(id)}/detail`); state.currentParticipant=id; $('evaluationTitle').textContent=`Avaliando: ${d.name}`; renderEvaluation(d.questions,d.name); $('evaluationCard').classList.remove('hidden'); $('evaluationCard').scrollIntoView({behavior:'smooth'});}
  catch(e){toast(e.message);}
};
function renderEvaluation(qs,name){
  $('evaluationQuestions').innerHTML=qs.map(q=>{
    const e=q.evaluation; const buttons=state.ratings.map(r=>`<button class="ratingBtn ${e?.ratingId===r.id?'active':''}" onclick="evaluate(${q.id},'${r.id}')"><span>${r.icon}</span>${esc(r.label)}<small>${r.points>0?'+':''}${r.points}</small></button>`).join('');
    return `<div class="evalItem"><div class="qnum">PERGUNTA ${q.id}/50</div><div class="qtext">${esc(q.text)}</div><div class="answer"><small>RESPOSTA DE ${esc(name).toUpperCase()}</small>${esc(q.participantAnswer)}</div><div class="ratingGrid">${buttons}</div></div>`;
  }).join('');
  $('evalScore').textContent=qs.reduce((s,q)=>s+(q.evaluation?.points||0),0);
}
window.evaluate=async(qid,rid)=>{
  try{await api(`/api/quizzes/${state.quizCode}/evaluate`,{method:'POST',body:JSON.stringify({pin:state.pin,participantId:state.currentParticipant,questionId:qid,ratingId:rid})}); await selectParticipant(state.currentParticipant); toast('Avaliação salva.');}
  catch(e){toast(e.message);}
};
