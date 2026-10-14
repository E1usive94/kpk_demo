"use strict";
const root=document.getElementById('program');
const add=(parent,tag,text,cls)=>{const node=document.createElement(tag);if(cls)node.className=cls;node.textContent=text;parent.append(node);return node};
const id=new URLSearchParams(location.search).get('id');
fetch('courses.json').then(r=>{if(!r.ok)throw Error('Не удалось загрузить каталог');return r.json()}).then(items=>{
 const c=items.find(item=>item.id===id);root.replaceChildren();if(!c){add(root,'h1','Программа не найдена');add(root,'p','Проверьте ссылку и попробуйте снова.');return;}
 document.title=c.title+' — ЦПМ для учителей';add(root,'div','ДЕМОНСТРАЦИОННАЯ ПРОГРАММА · '+c.category,'eyebrow');add(root,'h1',c.title);add(root,'p',c.description,'lead');
 const meta=add(root,'div','','program-meta');[c.duration_hours+' академических часов','Уровень: '+c.level,'Для кого: '+c.audience,'Условная стоимость: '+Number(c.price_rub).toLocaleString('ru-RU')+' ₽'].forEach(t=>add(meta,'span',t));
 add(root,'h2','Что вы получите');add(root,'p',c.learning_outcome);add(root,'h2','Темы программы');add(root,'p',c.tags.split(',').map(x=>x.trim()).join(' · '));
 const cta=add(root,'section','','cta-area');add(cta,'h2','Запись на программу');add(cta,'p','Это демонстрация пользовательского пути. Программа вымышлена, настоящая запись и оплата недоступны.');const btn=add(cta,'button','Записаться на курс →','primary-action');btn.type='button';const alert=add(cta,'div','Демонстрация записи: в рабочей версии здесь откроется официальная страница регистрации на выбранную программу.','demo-alert');alert.hidden=true;btn.addEventListener('click',()=>{alert.hidden=false;btn.textContent='Запись показана ✓'});
}).catch(()=>{root.replaceChildren();add(root,'h1','Каталог недоступен');add(root,'p','Откройте сайт через GitHub Pages или локальный HTTP-сервер.');});