const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const quizzes = new Map();

const QUESTION_BANK = [
  'Qual é a cor favorita do criador do quiz?',
  'Qual é a comida favorita do criador do quiz?',
  'Qual é a bebida favorita do criador do quiz?',
  'Qual é o doce favorito do criador do quiz?',
  'Qual é o sabor de pizza favorito do criador do quiz?',
  'Qual é o sabor de sorvete favorito do criador do quiz?',
  'Qual é a fruta favorita do criador do quiz?',
  'Qual é o animal favorito do criador do quiz?',
  'Qual é o filme favorito do criador do quiz?',
  'Qual é a série favorita do criador do quiz?',
  'Qual é o desenho favorito do criador do quiz?',
  'Qual é o jogo favorito do criador do quiz?',
  'Qual é o esporte favorito do criador do quiz?',
  'Qual é o time de futebol favorito do criador do quiz?',
  'Qual é o jogador de futebol favorito do criador do quiz?',
  'Qual é o cantor favorito do criador do quiz?',
  'Qual é a cantora favorita do criador do quiz?',
  'Qual é a banda favorita do criador do quiz?',
  'Que tipo de música o criador do quiz mais escuta?',
  'Qual é a música favorita do criador do quiz?',
  'Qual é o personagem favorito do criador do quiz?',
  'Qual é o super-herói favorito do criador do quiz?',
  'Qual é o vilão favorito do criador do quiz?',
  'Qual é o personagem de jogo favorito do criador do quiz?',
  'Qual é o aplicativo que o criador do quiz mais usa?',
  'Qual é a rede social que o criador do quiz mais usa?',
  'Qual é o lugar favorito do criador do quiz?',
  'Qual cidade o criador do quiz mais gostaria de conhecer?',
  'Qual país o criador do quiz mais gostaria de conhecer?',
  'Qual é a viagem dos sonhos do criador do quiz?',
  'Qual é a matéria escolar favorita do criador do quiz?',
  'Qual matéria escolar o criador do quiz menos gosta?',
  'Qual é o hobby favorito do criador do quiz?',
  'O que o criador do quiz mais gosta de fazer no tempo livre?',
  'Qual é a coisa que o criador do quiz mais odeia?',
  'Qual é a coisa que mais irrita o criador do quiz?',
  'O que mais faz o criador do quiz rir?',
  'O que deixa o criador do quiz feliz?',
  'O que deixa o criador do quiz com raiva?',
  'O que deixa o criador do quiz com medo?',
  'Qual é o maior sonho do criador do quiz?',
  'Qual é o maior objetivo do criador do quiz?',
  'Qual é o maior medo do criador do quiz?',
  'Qual é a profissão que o criador do quiz gostaria de ter?',
  'Qual é o trabalho dos sonhos do criador do quiz?',
  'Como o criador do quiz se descreveria em uma palavra?',
  'Qual é a principal qualidade do criador do quiz?',
  'Qual é o principal defeito do criador do quiz?',
  'O criador do quiz prefere praia ou piscina?',
  'O criador do quiz prefere dia ou noite?',
  'O criador do quiz prefere frio ou calor?',
  'O criador do quiz prefere doce ou salgado?',
  'O criador do quiz prefere cachorro ou gato?',
  'O criador do quiz prefere filme ou série?',
  'O criador do quiz prefere jogar ou assistir?',
  'O criador do quiz prefere ficar em casa ou sair?',
  'O criador do quiz prefere cidade ou interior?',
  'O criador do quiz prefere verão ou inverno?',
  'Qual é o horário favorito do dia do criador do quiz?',
  'Qual é a época do ano favorita do criador do quiz?',
  'Qual é o feriado favorito do criador do quiz?',
  'Qual é o aniversário ideal para o criador do quiz?',
  'Qual presente deixaria o criador do quiz muito feliz?',
  'Qual objeto o criador do quiz não viveria sem?',
  'Qual é o maior vício de entretenimento do criador do quiz?',
  'Qual assunto o criador do quiz mais gosta de conversar?',
  'Qual assunto o criador do quiz evita conversar?',
  'Qual é a maior mania do criador do quiz?',
  'Qual é a frase que mais combina com o criador do quiz?',
  'Que superpoder o criador do quiz escolheria?',
  'Se pudesse escolher uma habilidade instantânea, qual o criador escolheria?',
  'Se ganhasse R$ 1 milhão, o que o criador do quiz faria primeiro?',
  'Se pudesse morar em qualquer lugar, onde o criador do quiz moraria?',
  'Se pudesse conhecer uma pessoa famosa, quem o criador do quiz escolheria?',
  'Se pudesse escolher qualquer animal de estimação, qual o criador escolheria?',
  'Se pudesse ter um carro de qualquer tipo, qual o criador escolheria?',
  'Se pudesse voltar a qualquer época, qual o criador do quiz escolheria?',
  'Se pudesse aprender qualquer idioma, qual o criador do quiz escolheria?',
  'Se pudesse dominar qualquer esporte, qual o criador do quiz escolheria?',
  'Qual seria o primeiro lugar que o criador do quiz visitaria com dinheiro ilimitado?',
  'Qual seria a casa dos sonhos do criador do quiz?',
  'Qual seria o negócio dos sonhos do criador do quiz?',
  'Qual seria o emprego perfeito para o criador do quiz?',
  'Qual personagem o criador do quiz gostaria de ser por um dia?',
  'Qual universo de filme, série ou jogo o criador do quiz gostaria de visitar?',
  'Qual é a compra que o criador do quiz mais gostaria de fazer?',
  'Qual é o lanche perfeito para o criador do quiz?',
  'Qual é o café da manhã perfeito para o criador do quiz?',
  'Qual é a refeição que o criador do quiz escolheria para comer para sempre?',
  'Qual é o lugar onde o criador do quiz mais gostaria de passar um fim de semana?',
  'Qual é a característica que o criador do quiz mais valoriza em um amigo?',
  'Qual é a característica que o criador do quiz mais admira em uma pessoa?',
  'O que o criador do quiz faria em um dia totalmente livre?',
  'Qual é a lembrança que o criador do quiz mais gosta de recordar?',
  'Qual é o tipo de festa que o criador do quiz mais gosta?',
  'Qual é o tipo de presente que mais combina com o criador do quiz?',
  'Qual desafio o criador do quiz teria coragem de encarar?',
  'Qual é a coisa mais aleatória que o criador do quiz gostaria de experimentar?',
  'Qual seria o apelido perfeito para o criador do quiz?',
  'Qual é a maior prioridade do criador do quiz atualmente?',
  'Qual é a principal coisa que o criador do quiz quer conquistar no futuro?',
  'Qual é a coisa que o criador do quiz gostaria de mudar em sua rotina?',
  'Qual é uma coisa que o criador do quiz nunca faria?',
  'Qual é uma coisa que o criador do quiz sempre faria por um amigo?',
  'Qual é o maior orgulho do criador do quiz?',
  'Qual é uma coisa que poucas pessoas sabem sobre o criador do quiz?',
  'Qual é o tipo de surpresa que o criador do quiz mais gostaria de receber?'
];

const RATINGS = [
  { id: 'brilhante', icon: '‼️', label: 'Brilhante', points: 10 },
  { id: 'otima', icon: '❗', label: 'Ótima Jogada', points: 9 },
  { id: 'melhor', icon: '⭐', label: 'Melhor Jogada', points: 8 },
  { id: 'excelente', icon: '👍', label: 'Excelente', points: 7 },
  { id: 'boa', icon: '✔️', label: 'Boa', points: 6 },
  { id: 'livro', icon: '📖', label: 'Livro', points: 5 },
  { id: 'imprecisao', icon: '⁉️', label: 'Imprecisão', points: 3 },
  { id: 'erro', icon: '❓', label: 'Erro', points: 1 },
  { id: 'erro_grave', icon: '❌', label: 'Erro Grave', points: -2 },
  { id: 'gafe', icon: '‼️', label: 'Gafe', points: -5 }
];

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 2_000_000) reject(new Error('Dados enviados são muito grandes.'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('JSON inválido.')); }
    });
    req.on('error', reject);
  });
}
function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = '';
    const b = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) code += chars[b[i] % chars.length];
  } while (quizzes.has(code));
  return code;
}
function makePin() {
  let pin;
  do { pin = String(crypto.randomInt(100000, 1000000)); }
  while ([...quizzes.values()].some(q => q.pin === pin));
  return pin;
}
function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function publicQuestions(quiz) { return quiz.questions; }
function summary(quiz, p) {
  const score = p.evaluations.reduce((sum, e) => sum + (e ? e.points : 0), 0);
  return {
    id: p.id,
    name: p.name,
    answered: p.answers.filter(Boolean).length,
    evaluated: p.evaluations.filter(Boolean).length,
    score
  };
}
function getQuiz(code) { return quizzes.get(String(code || '').toUpperCase()); }

async function api(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, version: '5.0.0' });
  }
  if (req.method === 'GET' && pathname === '/api/ratings') {
    return sendJson(res, 200, RATINGS);
  }

  if (req.method === 'POST' && pathname === '/api/quizzes') {
    let data; try { data = await readBody(req); } catch (e) { return sendJson(res, 400, {error:e.message}); }
    const creatorName = String(data.creatorName || '').trim();
    if (!creatorName) return sendJson(res, 400, {error:'Digite o nome do criador do quiz.'});
    if (creatorName.length > 40) return sendJson(res, 400, {error:'O nome deve ter no máximo 40 caracteres.'});
    const code = makeCode();
    const pin = makePin();
    const questions = shuffle(QUESTION_BANK).slice(0,50).map((text,i)=>({id:i+1,text}));
    quizzes.set(code, {
      code, pin, creatorName, questions,
      participants: new Map(),
      createdAt: Date.now()
    });
    console.log(`[CREATE] ${code} criador=${creatorName}`);
    return sendJson(res, 200, { code, pin, creatorName, questions });
  }

  let m = pathname.match(/^\/api\/quizzes\/([^/]+)$/);
  if (m && req.method === 'GET') {
    const quiz = getQuiz(decodeURIComponent(m[1]));
    if (!quiz) return sendJson(res,404,{error:'Quiz não encontrado.'});
    return sendJson(res,200,{code:quiz.code,creatorName:quiz.creatorName,questionCount:50});
  }

  m = pathname.match(/^\/api\/quizzes\/([^/]+)\/join$/);
  if (m && req.method === 'POST') {
    const quiz = getQuiz(decodeURIComponent(m[1]));
    if (!quiz) return sendJson(res,404,{error:'Quiz não encontrado.'});
    let data; try { data = await readBody(req); } catch (e) { return sendJson(res,400,{error:e.message}); }
    const name = String(data.name || '').trim();
    if (!name) return sendJson(res,400,{error:'Digite seu nome.'});
    if (name.length > 40) return sendJson(res,400,{error:'Seu nome deve ter no máximo 40 caracteres.'});
    const id = crypto.randomUUID();
    quiz.participants.set(id,{id,name,answers:Array(50).fill(''),evaluations:Array(50).fill(null),submittedAt:null});
    return sendJson(res,200,{participantId:id,creatorName:quiz.creatorName,questions:publicQuestions(quiz)});
  }

  m = pathname.match(/^\/api\/quizzes\/([^/]+)\/participants\/([^/]+)\/answers$/);
  if (m && req.method === 'POST') {
    const quiz = getQuiz(decodeURIComponent(m[1]));
    const p = quiz?.participants.get(decodeURIComponent(m[2]));
    if (!quiz || !p) return sendJson(res,404,{error:'Participante ou quiz não encontrado.'});
    let data; try { data = await readBody(req); } catch (e) { return sendJson(res,400,{error:e.message}); }
    const answers = Array.isArray(data.answers) ? data.answers.map(v => String(v ?? '').trim()) : [];
    if (answers.length !== 50 || answers.some(v => !v)) return sendJson(res,400,{error:'Responda todas as 50 perguntas.'});
    p.answers = answers; p.submittedAt = Date.now();
    return sendJson(res,200,{ok:true,name:p.name});
  }

  m = pathname.match(/^\/api\/quizzes\/([^/]+)\/creator-login$/);
  if (m && req.method === 'POST') {
    const quiz = getQuiz(decodeURIComponent(m[1]));
    if (!quiz) return sendJson(res,404,{error:'Quiz não encontrado.'});
    let data; try { data = await readBody(req); } catch (e) { return sendJson(res,400,{error:e.message}); }
    if (String(data.pin || '') !== quiz.pin) return sendJson(res,403,{error:'PIN incorreto.'});
    return sendJson(res,200,{
      code:quiz.code,pin:quiz.pin,creatorName:quiz.creatorName,
      questions:publicQuestions(quiz),participants:[...quiz.participants.values()].map(p=>summary(quiz,p))
    });
  }

  m = pathname.match(/^\/api\/quizzes\/([^/]+)\/participants\/([^/]+)\/detail$/);
  if (m && req.method === 'GET') {
    const quiz = getQuiz(decodeURIComponent(m[1]));
    const p = quiz?.participants.get(decodeURIComponent(m[2]));
    if (!quiz || !p) return sendJson(res,404,{error:'Participante não encontrado.'});
    return sendJson(res,200,{
      name:p.name,submitted:!!p.submittedAt,
      questions:quiz.questions.map((q,i)=>({id:q.id,text:q.text,participantAnswer:p.answers[i]||'',evaluation:p.evaluations[i]}))
    });
  }

  m = pathname.match(/^\/api\/quizzes\/([^/]+)\/evaluate$/);
  if (m && req.method === 'POST') {
    const quiz = getQuiz(decodeURIComponent(m[1]));
    if (!quiz) return sendJson(res,404,{error:'Quiz não encontrado.'});
    let data; try { data = await readBody(req); } catch (e) { return sendJson(res,400,{error:e.message}); }
    if (String(data.pin || '') !== quiz.pin) return sendJson(res,403,{error:'PIN incorreto.'});
    const p = quiz.participants.get(String(data.participantId || ''));
    const qid = Number(data.questionId);
    const rating = RATINGS.find(r => r.id === String(data.ratingId || ''));
    if (!p) return sendJson(res,404,{error:'Participante não encontrado.'});
    const index = quiz.questions.findIndex(q=>q.id===qid);
    if (index < 0 || !rating) return sendJson(res,400,{error:'Pergunta ou avaliação inválida.'});
    p.evaluations[index] = {ratingId:rating.id,icon:rating.icon,label:rating.label,points:rating.points};
    return sendJson(res,200,{ok:true,participant:summary(quiz,p)});
  }

  m = pathname.match(/^\/api\/quizzes\/([^/]+)\/participants\/([^/]+)\/result$/);
  if (m && req.method === 'GET') {
    const quiz = getQuiz(decodeURIComponent(m[1]));
    const p = quiz?.participants.get(decodeURIComponent(m[2]));
    if (!quiz || !p) return sendJson(res,404,{error:'Resultado não encontrado.'});
    if (!p.submittedAt) return sendJson(res,400,{error:'Você ainda não enviou as respostas.'});
    const evaluations = p.evaluations.map((e,i)=>e?{question:quiz.questions[i].text,participantAnswer:p.answers[i],...e}:null);
    const score = evaluations.reduce((s,e)=>s+(e?.points||0),0);
    const ranking = [...quiz.participants.values()].filter(x=>x.submittedAt).map(x=>summary(quiz,x)).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name,'pt-BR'));
    return sendJson(res,200,{participantName:p.name,creatorName:quiz.creatorName,score,evaluated:evaluations.filter(Boolean).length,total:50,evaluations,ranking,position:ranking.findIndex(x=>x.id===p.id)+1});
  }

  return sendJson(res,404,{error:'Rota não encontrada.'});
}

function serveStatic(req,res,pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  if (pathname === '/') pathname = '/index.html';
  const clean = pathname.split('?')[0];
  const file = path.normalize(path.join(PUBLIC_DIR, clean));
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end('Forbidden'); return true; }
  try {
    const data = fs.readFileSync(file);
    const ext = path.extname(file).toLowerCase();
    const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8'};
    res.writeHead(200, {'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
    if (req.method === 'HEAD') res.end(); else res.end(data);
  } catch {
    if (pathname !== '/index.html') {
      try {
        const data = fs.readFileSync(path.join(PUBLIC_DIR,'index.html'));
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        return res.end(data);
      } catch {}
    }
    res.writeHead(404); res.end('Not found');
  }
  return true;
}

const server = http.createServer(async (req,res)=>{
  const pathname = url.parse(req.url).pathname || '/';
  try {
    if (pathname.startsWith('/api/')) return await api(req,res,pathname);
    return serveStatic(req,res,pathname);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) sendJson(res,500,{error:'Erro interno do servidor.',detail:e.message});
    else res.end();
  }
});

server.listen(PORT,'0.0.0.0',()=>console.log(`Quiz Amigos Criador v5 rodando na porta ${PORT}`));
