const languagePicker=document.querySelector('.language-picker');
const languageToggle=document.getElementById('language-toggle');
const languageMenu=document.getElementById('language-menu');
const languageOptions=[...document.querySelectorAll('.language-option')];

function setLanguageMenu(open){
  languageMenu.hidden=!open;
  languageToggle.setAttribute('aria-expanded',String(open));
  if(open){
    const selected=languageOptions.find(option=>option.getAttribute('aria-checked')==='true');
    if(selected)selected.focus();
  }
}

languageToggle.addEventListener('click',()=>setLanguageMenu(languageMenu.hidden));
languageToggle.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault();
    setLanguageMenu(true);
  }
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

const phoneMenuTrigger=document.getElementById('phone-menu-trigger');
const phoneSheetBackdrop=document.getElementById('phone-sheet-backdrop');
const phoneActionSheet=document.getElementById('phone-action-sheet');
const phoneActionCancel=document.getElementById('phone-action-cancel');
const phoneViewport=window.matchMedia('(max-width: 650px)');
const phoneMenuItems=[...phoneActionSheet.querySelectorAll('a,button')];

function setPhoneMenu(open){
  open=Boolean(open&&phoneViewport.matches);
  phoneSheetBackdrop.hidden=!open;
  phoneMenuTrigger.setAttribute('aria-expanded',String(open));
  document.body.classList.toggle('phone-menu-open',open);
  if(open){
    phoneMenuItems[0].focus();
  }else if(phoneActionSheet.contains(document.activeElement)){
    phoneMenuTrigger.focus();
  }
}

phoneMenuTrigger.addEventListener('click',()=>setPhoneMenu(true));
phoneActionCancel.addEventListener('click',()=>setPhoneMenu(false));
phoneSheetBackdrop.addEventListener('click',event=>{
  if(event.target===phoneSheetBackdrop)setPhoneMenu(false);
});
phoneActionSheet.querySelectorAll('a').forEach(link=>{
  link.addEventListener('click',()=>setPhoneMenu(false));
});
phoneActionSheet.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    event.preventDefault();
    setPhoneMenu(false);
    return;
  }
  if(event.key!=='Tab')return;
  const first=phoneMenuItems[0];
  const last=phoneMenuItems[phoneMenuItems.length-1];
  if(event.shiftKey&&document.activeElement===first){
    event.preventDefault();
    last.focus();
  }else if(!event.shiftKey&&document.activeElement===last){
    event.preventDefault();
    first.focus();
  }
});

function closePhoneMenuOnDesktop(){
  if(!phoneViewport.matches)setPhoneMenu(false);
}

if(phoneViewport.addEventListener){
  phoneViewport.addEventListener('change',closePhoneMenuOnDesktop);
}else{
  phoneViewport.addListener(closePhoneMenuOnDesktop);
}

document.querySelectorAll('.email-copy-button').forEach(button=>{
  button.addEventListener('click',async()=>{
    const email=button.dataset.email;
    let copied=false;
    try{
      await navigator.clipboard.writeText(email);
      copied=true;
    }catch{
      const field=document.createElement('textarea');
      field.value=email;
      field.setAttribute('readonly','');
      field.style.position='fixed';
      field.style.opacity='0';
      document.body.appendChild(field);
      field.select();
      copied=document.execCommand('copy');
      field.remove();
    }
    if(copied){
      const status=button.nextElementSibling;
      status.textContent=button.dataset.copiedMessage;
      window.setTimeout(()=>{status.textContent='';},2000);
    }
  });
});
document.getElementById('year').textContent=new Date().getFullYear();
