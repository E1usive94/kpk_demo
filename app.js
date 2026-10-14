'use strict';
let courses=[],role='leader';const $=id=>document.getElementById(id);
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

const examples=['Хочу повысить компьютерную грамотность своих сотрудников','Педагоги тратят слишком много времени на отчёты и документы','Как научиться использовать искусственный интеллект на уроках?','Нужно улучшить результаты ОГЭ и ЕГЭ в нашей школе'];
let exampleIndex=0,charIndex=0,erasing=false,typingTimer;
function typeLoop(){const input=$('query');if(document.activeElement===input||input.value||document.hidden){typingTimer=setTimeout(typeLoop,450);return}const s=examples[exampleIndex];$('typeText').textContent=s.slice(0,charIndex);let delay=48;if(!erasing){if(charIndex<s.length)charIndex++;else{erasing=true;delay=1600}}else{if(charIndex>0){charIndex--;delay=24}else{erasing=false;exampleIndex=(exampleIndex+1)%examples.length;delay=400}}typingTimer=setTimeout(typeLoop,delay)}
function syncHint(){const active=document.activeElement===$('query')||$('query').value.length>0;$('typeHint').style.display=active?'none':'block'}
function make(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function addMessage(kind){const m=make('div','message '+kind);if(kind==='bot')m.append(make('span','bot-icon','✳'));const bubble=make('div','bubble');m.append(bubble);$('conversation').append(m);return bubble}
function addText(parent,text,cls){parent.append(make('p',cls||'',text))}
function showCourses(query){const topics=extract(query);const ranked=courses.map(c=>score(c,topics,query)).sort((a,b)=>b.score-a.score);const selected=ranked.filter(r=>r.score>4).slice(0,3);const b=addMessage('bot');if(!selected.length){addText(b,'Пока не удалось уверенно подобрать программу. Попробуйте уточнить предмет, аудиторию или задачу.');scrollChat();return}addText(b,topics.length?'Похоже, вас интересуют: '+topics.slice(0,3).map(t=>t.name.toLowerCase()).join(', ')+'.':'Я нашёл несколько близких по содержанию программ.');addText(b,'Вот что можно рассмотреть:');const list=make('div','course-list');selected.forEach((item,i)=>{const c=item.course;const card=make('article','course');card.append(make('div','tag',`ВАРИАНТ ${i+1} · ДЕМОНСТРАЦИОННЫЙ КУРС`));card.append(make('h3','',c.title));card.append(make('p','',c.description));card.append(make('div','facts',`${c.duration_hours} ак. ч. · ${c.level} · условная цена ${Number(c.price_rub).toLocaleString('ru-RU')} ₽`));card.append(make('div','reason',item.matches.length?'Почему подходит: темы '+item.matches.slice(0,2).map(x=>x.name.toLowerCase()).join(' и ')+'.':'Это одна из наиболее близких программ по содержанию.'));const actions=make('div','course-actions');const link=make('a','course-link','Подробнее о программе и запись →');link.href='program.html?id='+encodeURIComponent(c.id);actions.append(link);card.append(actions);list.append(card)});b.append(list);addText(b,'Это тестовые программы, а не действующие курсы ЦПМ. Поиск работает локально, без нейросети.','note');scrollChat()}
function scrollChat(){$('conversation').scrollTop=$('conversation').scrollHeight}
function submit(){const input=$('query'),q=input.value.trim();if(q.length<4){input.focus();return}const b=addMessage('user');addText(b,q);input.value='';syncHint();scrollChat();showCourses(q)}
$('chatForm').addEventListener('submit',e=>{e.preventDefault();submit()});$('query').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit()}});$('query').addEventListener('input',syncHint);$('query').addEventListener('focus',syncHint);$('query').addEventListener('blur',syncHint);
document.querySelectorAll('.role').forEach(btn=>btn.addEventListener('click',()=>{role=btn.dataset.role;document.querySelectorAll('.role').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-pressed',String(x===btn))})}));
document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>{$('query').value=btn.dataset.example;syncHint();submit()}));
$('clearBtn').addEventListener('click',()=>{$('conversation').replaceChildren();const b=addMessage('bot');addText(b,'Начнём заново! Расскажите, какое обучение вы ищете.');$('query').value='';syncHint();$('query').focus()});
fetch('courses.json').then(r=>{if(!r.ok)throw Error('Каталог недоступен');return r.json()}).then(data=>{courses=data;$('sendBtn').disabled=false}).catch(()=>{const b=addMessage('bot');addText(b,'Не удалось загрузить каталог. Откройте сайт через GitHub Pages или локальный HTTP-сервер.');});
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)typeLoop();else $('typeText').textContent=examples[0];
