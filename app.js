'use strict';
// ВАЖНО: локальный демонстрационный тематический поиск, не API языковой модели.
let courses = []; let role = 'leader';
const $ = id => document.getElementById(id);
const concepts = [
 {name:'Цифровая грамотность',words:['компьютер','цифров','грамотност','офисн','файл','почт','браузер','интернет','технолог','устройств','программ']},
 {name:'Электронные таблицы',words:['таблиц','excel','эксел','формул','данны','отчет','отчёт','аналитик','диаграмм']},
 {name:'ИИ и нейросети',words:['искусственн','интеллект','нейросет','chatgpt','gpt','промпт','генератив','ии ',' ии','бот']},
 {name:'Автоматизация',words:['автоматизац','рутин','эконом','времен','нагрузк','документооборот','оптимизац','эффективност']},
 {name:'Управление и команда',words:['руковод','директор','управлен','команд','сотрудник','коллектив','лидер','мотивац','организац','конфликт']},
 {name:'Методика преподавания',words:['методик','урок','преподаван','обучен','педагогик','заняти','дидактик','образовательн']},
 {name:'Работа с учениками',words:['ученик','ребен','ребён','дет','индивидуальн','инклюз','поддержк','поведен','родител']},
 {name:'Экзамены',words:['егэ','огэ','экзамен','аттестаци','балл','результат','тестирован','гвэ']},
 {name:'Олимпиады',words:['олимпиад','одаренн','талант','соревнован','задач повышенн']},
 {name:'Математика',words:['математик','алгебр','геометри','уравнен']},
 {name:'Коммуникация',words:['коммуникац','общен','публичн','выступлен','переговор','родител','обратн связ']}
];
const normalize = s => String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const tokenHits = (text, words) => {const t=' '+normalize(text)+' ';return words.reduce((n,w)=>n+(t.includes(normalize(w))?1:0),0)};
function extract(query){const q=normalize(query);return concepts.map(c=>({...c,hits:tokenHits(q,c.words)})).filter(c=>c.hits>0).sort((a,b)=>b.hits-a.hits)}
function score(course, topics, query){
 const title=course.title||'',tags=course.tags||'',detail=[course.description,course.learning_outcome,course.category].join(' ');
 let score=0; const matches=[];
 for(const c of topics){const inTitle=tokenHits(title,c.words),inTags=tokenHits(tags,c.words),inDetail=tokenHits(detail,c.words);const part=Math.min(22,inTitle*11+inTags*5+inDetail*2.5);if(part){score+=part;matches.push({name:c.name,part})}}
 const tokens=normalize(query).split(' ').filter(w=>w.length>=5&&!['хочу','чтобы','нужно','можно','своих','наших','очень','помочь','сотрудников','педагогов','учителей'].includes(w));
 for(const token of tokens){if(normalize(title).includes(token))score+=3;if(normalize(tags).includes(token))score+=1}
 const audience=normalize(course.audience);if(role==='teacher'){if(/педагог|учител|воспитател|методист/.test(audience))score+=8;if(/руководител|директор/.test(audience)&&!/педагог|учител/.test(audience))score-=12}else{if(/педагог|учител|руководител|директор|сотрудник/.test(audience))score+=3}
 matches.sort((a,b)=>b.part-a.part);return {course,score,matches};
}
function el(tag,cls,txt){const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node}
function renderCard(item,index){const c=item.course;const card=el('article','course');card.append(el('div','number',`ПРОГРАММА / ${String(index+1).padStart(2,'0')}`));card.append(el('span','match',item.score>20?'Подходит по запросу':'Смежное направление'));card.append(el('h3','',c.title));card.append(el('p','',c.description));const meta=el('div','meta');meta.append(el('span','',`${c.duration_hours} ак. ч. · ${c.level}`),el('span','',`Аудитория: ${c.audience}`),el('span','',`Условная цена: ${Number(c.price_rub).toLocaleString('ru-RU')} ₽`));card.append(meta);const why=el('div','why',item.matches.length?`Почему рекомендуем: совпадение по темам «${item.matches.slice(0,2).map(m=>m.name).join('», «')}».`:'Почему рекомендуем: ближайшая по содержанию программа из тестового каталога.');card.append(why);return card}
function search(){const query=$('query').value.trim();if(query.length<4){$('query').focus();$('query').setCustomValidity('Опишите задачу хотя бы несколькими словами');$('query').reportValidity();return}$('query').setCustomValidity('');const topics=extract(query);const ranked=courses.map(c=>score(c,topics,query)).sort((a,b)=>b.score-a.score);const top=ranked.filter(r=>r.score>4).slice(0,3);const chosen=top.length?top:ranked.slice(0,3);$('results').classList.remove('hidden');$('resultsTitle').textContent=topics.length?'Подобрали программы под вашу задачу':'Ближайшие программы из каталога';$('resultsSubtitle').textContent=`Результат демонстрационного поиска по ${courses.length} вымышленным курсам. ${topics.length?'':'Тема определена неуверенно — попробуйте уточнить запрос.'}`;const intent=$('intent');intent.replaceChildren();intent.append(el('strong','',topics.length?'Мы определили направления запроса:':'Для более точного подбора уточните, чему именно хотите научиться.'));topics.slice(0,5).forEach(t=>intent.append(el('span','chip',t.name)));const cards=$('cards');cards.replaceChildren();chosen.forEach((r,i)=>cards.append(renderCard(r,i)));$('results').scrollIntoView({behavior:'smooth',block:'start'});}
document.querySelectorAll('.role').forEach(btn=>btn.addEventListener('click',()=>{role=btn.dataset.role;document.querySelectorAll('.role').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn))})}));document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{$('query').value=b.dataset.example;search()}));$('searchBtn').addEventListener('click',search);$('query').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();search()}});$('resetBtn').addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});$('query').focus()});$('refineBtn').addEventListener('click',()=>{$('query').scrollIntoView({behavior:'smooth',block:'center'});$('query').focus()});
fetch('courses.json').then(r=>{if(!r.ok)throw Error('Не удалось загрузить каталог');return r.json()}).then(data=>{courses=data;$('searchBtn').disabled=false}).catch(err=>{$('results').classList.remove('hidden');$('resultsTitle').textContent='Не удалось загрузить курсы';$('resultsSubtitle').textContent='Откройте сайт через GitHub Pages или локальный HTTP-сервер. '+err.message;$('searchBtn').disabled=true});$('searchBtn').disabled=true;
