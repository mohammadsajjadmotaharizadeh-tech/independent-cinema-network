const state = {
  film: {
    id:'FILM-SR-001', title:'ناگهان برمی‌خیزد', english:'Sudden Rise', year:'۲۰۲۵', runtime:'۱۶:۵۰', country:'ایران', language:'فارسی', subtitles:'انگلیسی', format:'۴:۳', genre:'رئالیسم جادویی / درام', director:'محمد سجاد مطهری‌زاده'
  },
  stats:{submissions:67, selected:2, notSelected:28, waiting:37},
  today:[
    {type:'warn',title:'Jordan International Film Festival',text:'موعد اعلام نتیجه امروز است. فهرست رسمی کامل و نتیجه قطعی هنوز تأیید نشده؛ وضعیت «نیازمند بررسی» باقی می‌ماند.',date:'۱۴۰۵/۰۶/۰۶'},
    {type:'info',title:'Shortverse / Short of the Week',text:'ادعای «۳۰ کامنت = ارسال رایگان» تا زمان وجود سند رسمی معتبر، تأییدنشده نگه داشته می‌شود.',date:'۱۴۰۵/۰۶/۰۶'},
    {type:'ok',title:'رجیستری ضدتکرار',text:'۶۷ ارسال قبلی بازیابی شده و هر فرصت جدید قبل از نمایش باید با این رجیستری تطبیق داده شود.',date:'فعال'},
    {type:'danger',title:'قانون قفل اطلاعات فیلم',text:'سال تولید، مدت و مشخصات ثابت فیلم از رکورد مرجع خوانده می‌شوند تا خطای مکاتبات قبلی تکرار نشود.',date:'فعال'}
  ],
  festivals:[
    ['Jordan International Film Festival','JFF15879','نتیجه اعلام نشده','۱۴۰۵/۰۶/۰۶','نیازمند بررسی'],
    ['Jangsu Mountain Village Film Festival (JMVFF)','JMVFF6138','نتیجه اعلام نشده','۱۴۰۵/۰۶/۰۸','۲ روز مانده'],
    ['Gandhara Independent Film Festival','GIFF2457','نتیجه اعلام نشده','۱۴۰۵/۰۶/۰۹','۳ روز مانده'],
    ['Kuçova International Independent Film Festival','3754','نتیجه اعلام نشده','۱۴۰۵/۰۶/۱۵','۹ روز مانده'],
    ['Uppsala Short Film Festival','FFW264812','نتیجه اعلام نشده','۱۴۰۵/۰۶/۳۰','۲۴ روز مانده'],
    ['Tampere Film Festival','TFF26-3212','انتخاب‌نشده','—','مسدود'],
    ['Vienna Shorts','—','عدم اقدام استراتژیک','—','مسدود']
  ],
  decisions:[
    ['Tampere Film Festival','مسدود','قبلاً ارسال شده و نتیجه انتخاب‌نشده ثبت شده','فقط در صورت تغییر مستند شرایط دوره‌ای متفاوت'],
    ['Vienna Shorts','مسدود','بخش مناسب برای فیلم وجود نداشت','فقط در صورت تغییر رسمی قوانین و ایجاد بخش مناسب'],
    ['Square Eyes','بسته','فیلم به علت سال تولید ۲۰۲۵ قدیمی تلقی شد','فقط اگر خود سازمان مجدداً تماس بگیرد یا سیاست رسمی تغییر کند'],
    ['shnit','نیازمند بررسی','وضعیت نهایی تحویل قطعی نیست','پس از اثبات وضعیت نهایی تحویل']
  ]
};

const pages={
  today:{title:'امروز چه تغییر کرد؟',subtitle:'خلاصه اجرایی پرونده «ناگهان برمی‌خیزد»',render:renderToday},
  film:{title:'پروفایل فیلم',subtitle:'اطلاعات مرجع و قفل‌شده فیلم',render:renderFilm},
  festivals:{title:'جشنواره‌ها',subtitle:'رجیستری ارسال‌ها، نتایج و وضعیت‌های مسدود',render:renderFestivals},
  calendar:{title:'تقویم نتایج',subtitle:'موعدهای شمسی اعلام نتایج',render:renderCalendar},
  decisions:{title:'حافظه تصمیم',subtitle:'تصمیم‌هایی که ایجنت حق فراموش‌کردنشان را ندارد',render:renderDecisions},
  guard:{title:'نگهبان حیثیت',subtitle:'قفل‌های ضد ارسال و تماس تکراری',render:renderGuard},
  settings:{title:'تنظیمات ایجنت',subtitle:'قوانین اجرایی نسخه آزمایشی',render:renderSettings}
};

function badge(v){
  const danger=/مسدود|انتخاب‌نشده|بسته/.test(v), warn=/بررسی|مانده|اعلام نشده/.test(v), ok=/انتخاب‌شده|فعال/.test(v);
  return `<span class="badge ${danger?'danger':warn?'warn':ok?'ok':'neutral'}">${v}</span>`;
}
function metric(label,value,sub=''){return `<article class="card metric"><small>${label}</small><b>${value}</b><small>${sub}</small></article>`}
function renderToday(){
  return `<div class="grid grid-4">${metric('ارسال‌های ثبت‌شده',state.stats.submissions,'رجیستری بازیابی‌شده')}${metric('انتخاب‌شده',state.stats.selected,'ثبت قطعی')}${metric('انتخاب‌نشده',state.stats.notSelected,'پرونده بسته')}${metric('در انتظار نتیجه',state.stats.waiting,'نیازمند پایش')}</div>
  <div class="section-title"><h2>رویدادهای امروز</h2><small>فقط تغییرات واقعی و قابل اقدام</small></div>
  <article class="card">${state.today.map(e=>`<div class="event"><span class="event-dot" style="background:var(--${e.type==='danger'?'danger':e.type==='warn'?'warn':e.type==='ok'?'ok':'info'})"></span><div><h3>${e.title}</h3><p>${e.text}</p></div><time>${e.date}</time></div>`).join('')}</article>
  <div class="section-title"><h2>اصل اجرایی</h2></div><div class="notice">اگر داده کلیدی ناقص یا متناقض باشد، ایجنت حق حدس‌زدن یا اقدام بیرونی ندارد. نتیجه «نیازمند بررسی» می‌ماند تا سند معتبر پیدا شود.</div>`;
}
function renderFilm(){const f=state.film;return `<article class="card"><div class="kv">
<div class="k">شناسه فیلم</div><div class="ltr">${f.id}</div><div class="k">عنوان</div><div>${f.title}</div><div class="k">عنوان بین‌المللی</div><div class="ltr">${f.english}</div><div class="k">سال تولید</div><div>${f.year}</div><div class="k">مدت</div><div>${f.runtime}</div><div class="k">کشور</div><div>${f.country}</div><div class="k">زبان</div><div>${f.language}</div><div class="k">زیرنویس</div><div>${f.subtitles}</div><div class="k">نسبت تصویر</div><div>${f.format}</div><div class="k">جایگاه ژانری</div><div>${f.genre}</div><div class="k">کارگردان</div><div>${f.director}</div></div></article><div class="footer-note">این اطلاعات برای جلوگیری از خطای مکاتبات قفل می‌شوند و متن‌های خروجی باید از همین رکورد ساخته شوند.</div>`}
function renderFestivals(){return `<div class="filterbar"><input id="festival-search" placeholder="جست‌وجوی جشنواره یا کد پیگیری"><select id="festival-filter"><option value="all">همه وضعیت‌ها</option><option>نتیجه اعلام نشده</option><option>انتخاب‌نشده</option><option>عدم اقدام استراتژیک</option></select></div><div class="table-wrap"><table><thead><tr><th>نام جشنواره</th><th>کد پیگیری</th><th>وضعیت داوری</th><th>موعد نتیجه</th><th>وضعیت ایجنت</th></tr></thead><tbody id="festival-body">${festivalRows(state.festivals)}</tbody></table></div>`}
function festivalRows(rows){return rows.map(r=>`<tr><td>${r[0]}</td><td class="ltr">${r[1]}</td><td>${badge(r[2])}</td><td>${r[3]}</td><td>${badge(r[4])}</td></tr>`).join('')}
function renderCalendar(){const waiting=state.festivals.filter(x=>/اعلام نشده/.test(x[2])).sort((a,b)=>a[3].localeCompare(b[3],'fa'));return `<div class="table-wrap"><table><thead><tr><th>نام جشنواره</th><th>تاریخ مورد انتظار اعلام نتیجه</th><th>وضعیت انتظار</th><th>کد پیگیری</th></tr></thead><tbody>${waiting.map(r=>`<tr><td>${r[0]}</td><td>${r[3]}</td><td>${badge(r[4])}</td><td class="ltr">${r[1]}</td></tr>`).join('')}</tbody></table></div>`}
function renderDecisions(){return `<div class="table-wrap"><table><thead><tr><th>موجودیت</th><th>تصمیم</th><th>دلیل</th><th>شرط بازگشایی</th></tr></thead><tbody>${state.decisions.map(r=>`<tr><td>${r[0]}</td><td>${badge(r[1])}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>`}
function renderGuard(){return `<div class="grid grid-2">
<article class="card"><h3>قفل ارسال تکراری</h3><div class="rule danger-line"><strong>قبل از هر ثبت‌نام</strong><p>فیلم + جشنواره + دوره + بخش + پخش‌کننده بررسی می‌شود. سابقه اثبات‌شده یعنی ارسال مجدد مسدود.</p></div><div class="rule danger-line"><strong>قبل از هر ایمیل</strong><p>نام سازمان، دامنه، گیرنده، هدف ایمیل و زنجیره قبلی بررسی می‌شود. ایمیل دوم به همان سازمان راه فرار نیست.</p></div></article>
<article class="card"><h3>قفل داده</h3><div class="rule warn-line"><strong>نامشخص = توقف</strong><p>نبود مدرک به‌معنی نبود سابقه نیست. داده مبهم به وضعیت «نیازمند بررسی» می‌رود.</p></div><div class="rule ok-line"><strong>منبع حقیقت</strong><p>رجیستری ساختاریافته بالاتر از حافظه مکالمه قرار می‌گیرد.</p></div></article></div>`}
function renderSettings(){return `<article class="card"><div class="toggle-row"><div><b>پایش روزانه</b><div class="muted">بررسی نتیجه‌ها و تغییرات بدون دستور روزانه</div></div><span class="toggle on"></span></div><div class="toggle-row"><div><b>قانون ضدتکرار</b><div class="muted">مسدودسازی ارسال و ارتباط تکراری</div></div><span class="toggle on"></span></div><div class="toggle-row"><div><b>اصل توقف در ابهام</b><div class="muted">هر داده نامشخص باعث توقف اقدام بیرونی می‌شود</div></div><span class="toggle on"></span></div><div class="toggle-row"><div><b>زبان رابط</b><div class="muted">فارسی؛ فقط نام رسمی جشنواره‌ها و کدها به زبان اصلی</div></div><span class="badge ok">فارسی</span></div><div class="toggle-row"><div><b>اقدام مالی و حقوقی</b><div class="muted">همیشه نیازمند تأیید صریح کارگردان</div></div><span class="badge danger">قفل</span></div></article>`}

function navigate(page){document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));document.querySelector('#page-title').textContent=pages[page].title;document.querySelector('#page-subtitle').textContent=pages[page].subtitle;document.querySelector('#content').innerHTML=pages[page].render();if(page==='festivals') wireFestivalFilters()}
function wireFestivalFilters(){const q=document.querySelector('#festival-search'),f=document.querySelector('#festival-filter');function apply(){const text=q.value.trim().toLowerCase(),status=f.value;const rows=state.festivals.filter(r=>(!text||r.join(' ').toLowerCase().includes(text))&&(status==='all'||r[2]===status));document.querySelector('#festival-body').innerHTML=festivalRows(rows)}q.addEventListener('input',apply);f.addEventListener('change',apply)}
document.querySelectorAll('#nav button').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
navigate('today');
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
