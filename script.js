const languagePicker=document.querySelector('.language-picker');
const languageToggle=document.getElementById('language-toggle');
const languageMenu=document.getElementById('language-menu');
const languageOptions=[...document.querySelectorAll('.language-option')];
const translatableElements=[...document.querySelectorAll('[data-ro]')];
const englishText=new Map(translatableElements.map(element=>[element,element.textContent.trim()]));
const englishLanguageLabel=languageToggle.getAttribute('aria-label');
const englishLanguageTitle=languageToggle.title;

function setLanguageMenu(open){
  languageMenu.hidden=!open;
  languageToggle.setAttribute('aria-expanded',String(open));
  if(open){
    const selected=languageOptions.find(option=>option.dataset.lang===document.documentElement.lang);
    if(selected)selected.focus();
  }
}

function language(lang){
  const isEnglish=lang!=='ro';
  lang=isEnglish?'en':'ro';
  document.documentElement.lang=lang;
  translatableElements.forEach(element=>{element.textContent=isEnglish?englishText.get(element):element.dataset.ro});
  document.getElementById('current-language-code').textContent=lang.toUpperCase();
  languageToggle.setAttribute('aria-label',isEnglish?englishLanguageLabel:languageToggle.dataset.ariaLabelRo);
  languageToggle.title=isEnglish?englishLanguageTitle:languageToggle.dataset.titleRo;
  languageOptions.forEach(option=>option.setAttribute('aria-checked',String(option.dataset.lang===lang)));
}

languageToggle.addEventListener('click',()=>setLanguageMenu(languageMenu.hidden));
languageToggle.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault();
    setLanguageMenu(true);
  }
});

languageMenu.addEventListener('click',event=>{
  const option=event.target.closest('.language-option');
  if(!option)return;
  language(option.dataset.lang);
  setLanguageMenu(false);
  languageToggle.focus();
});

languageMenu.addEventListener('keydown',event=>{
  const current=languageOptions.indexOf(document.activeElement);
  if(event.key==='Escape'){
    event.preventDefault();
    setLanguageMenu(false);
    languageToggle.focus();
    return;
  }
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?languageOptions.length-1:event.key==='ArrowDown'?(current+1)%languageOptions.length:(current-1+languageOptions.length)%languageOptions.length;
  languageOptions[next].focus();
});

document.addEventListener('click',event=>{
  if(!languagePicker.contains(event.target))setLanguageMenu(false);
});

const scrollDuration=100;
const pageHeader=document.querySelector('.top');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

function scrollToTarget(target){
  const start=window.scrollY;
  const headerOffset=pageHeader?.offsetHeight??0;
  const maximum=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
  const destination=Math.max(0,Math.min(target.getBoundingClientRect().top+start-headerOffset,maximum));
  const distance=destination-start;
  if(reducedMotion.matches||Math.abs(distance)<2){
    window.scrollTo(0,destination);
    return;
  }
  const started=performance.now();
  function step(now){
    const progress=Math.min((now-started)/scrollDuration,1);
    const eased=1-Math.pow(1-progress,3);
    window.scrollTo(0,start+distance*eased);
    if(progress<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',event=>{
    const target=document.getElementById(link.hash.slice(1));
    if(!target)return;
    event.preventDefault();
    scrollToTarget(target);
    history.pushState(null,'',link.hash);
  });
});
document.getElementById('year').textContent=new Date().getFullYear();
language('en');
