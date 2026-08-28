const state = {
  session: {
    authenticated: false,
    filmmaker: null,
    accessCode: 'SR-DIRECTOR-001'
  },
  filmmaker: {
    name: 'محمد سجاد مطهری‌زاده',
    role: 'کارگردان',
    filmId: 'FILM-SR-001',
    displayName: 'کارگردان «ناگهان برمی‌خیزد»'
  },
  film: {
    id: 'FILM-SR-001',
    title: 'ناگهان برمی‌خیزد',
    english: 'Sudden Rise',
    year: '۲۰۲۵',
    runtime: '۱۶:۵۰',
    country: 'ایران',
    language: 'فارسی',
    subtitles: 'انگلیسی',
    format: '۴:۳',
    genre: 'رئالیسم جادویی / درام',
    director: 'محمد سجاد مطهری‌زاده',
    status: 'در حال پخش',
    tier: 'پخش بین‌المللی',
    logline: 'پرونده فعال فیلم برای مدیریت جشنواره‌ها، نتایج، حافظه تصمیم و جلوگیری از خطاهای حیثیتی در فرآیند پخش.'
  },
  stats: { submissions: 67, selected: 2, notSelected: 28, waiting: 37 },
  slides: [
    {
      eyebrow: 'چرا این پلتفرم؟',
      title: 'نه فقط فهرست جشنواره؛ یک مدیر پخش زنده برای هر فیلم',
      text: 'سیستم سابقه فیلم را می‌شناسد، موعدها را چک می‌کند، نتیجه‌ها را رصد می‌کند و قبل از هر اقدام، خطر تکرار و اشتباه را می‌بندد.'
    },
    {
      eyebrow: 'قانون اصلی',
      title: 'اگر مطمئن نیستیم، اقدام نمی‌کنیم',
      text: 'هر جشنواره باید از فیلتر تاریخچه، شرایط، ضدتکرار، حافظه تصمیم و ریسک عبور کند. هیچ حدسِ خطرناکی جای داده قطعی را نمی‌گیرد.'
    },
    {
      eyebrow: 'برای فیلمساز ایرانی',
      title: 'رابط کاملاً فارسی با تقویم شمسی و پرونده واقعی فیلم',
      text: 'کارگردان به‌جای دیدن آشفتگی ایمیل‌ها و اکسل‌ها، یک صفحه واضح دارد که می‌گوید امروز چه تغییر کرد و قدم بعدی چیست.'
    }
  ],
  highlights: [
    { icon: '🛡️', title: 'نگهبان حیثیت حرفه‌ای', text: 'تماس و ارسال تکراری را قبل از وقوع مسدود می‌کند.' },
    { icon: '📅', title: 'تقویم شمسی نتایج', text: 'موعد اعلام نتیجه را خودش پیگیری می‌کند.' },
    { icon: '🧠', title: 'حافظه تصمیم', text: 'دلیل هر توقف، رد یا ارسال را فراموش نمی‌کند.' },
    { icon: '🎯', title: 'فیلتر واقعی جشنواره', text: 'سال، مدت، کشور، بخش، نمایش نخست و ریسک را بررسی می‌کند.' },
    { icon: '⚠️', title: 'هشدار خطر', text: 'ریسک‌های نمایش نخست، حقوق پخش و تعهدهای حساس را پیش از اقدام نشان می‌دهد.' },
    { icon: '🌙', title: 'کار حتی در غیاب شما', text: 'پایش‌های مجاز روزانه را بدون نیاز به یادآوری دستی جلو می‌برد.' }
  ],
  modules: [
    ['داشبورد کارگردان', 'خلاصه اجرایی، اتفاقات امروز و دسترسی سریع به پرونده'],
    ['پرونده فیلم', 'اطلاعات مرجع، پوستر، مواد فیلم و وضعیت پخش'],
    ['جشنواره‌ها', 'رجیستری ارسال‌ها، انتخاب‌ها، ردها و پرونده‌های قفل‌شده'],
    ['تقویم نتایج', 'اعلام نتیجه‌های مورد انتظار به تاریخ شمسی'],
    ['حافظه تصمیم', 'دلیل توقف، رد، عدم اقدام یا قفل هر جشنواره'],
    ['نگهبان حیثیت', 'قانون‌های ضدتکرار و اصل توقف در ابهام']
  ],
  today: [
    { type: 'warn', title: 'Jordan International Film Festival', text: 'موعد اعلام نتیجه امروز است. فهرست رسمی کامل و نتیجه قطعی هنوز تأیید نشده؛ وضعیت «نیازمند بررسی» باقی می‌ماند.', date: '۱۴۰۵/۰۶/۰۶' },
    { type: 'info', title: 'Shortverse / Short of the Week', text: 'ادعای «۳۰ کامنت = ارسال رایگان» تا زمان وجود سند رسمی معتبر، تأییدنشده نگه داشته می‌شود.', date: '۱۴۰۵/۰۶/۰۶' },
    { type: 'ok', title: 'رجیستری ضدتکرار', text: '۶۷ ارسال قبلی بازیابی شده و هر فرصت جدید قبل از نمایش باید با این رجیستری تطبیق داده شود.', date: 'فعال' },
    { type: 'danger', title: 'قانون قفل اطلاعات فیلم', text: 'سال تولید، مدت و مشخصات ثابت فیلم از رکورد مرجع خوانده می‌شوند تا خطای مکاتبات قبلی تکرار نشود.', date: 'فعال' }
  ],
  festivals: [
    ['Jordan International Film Festival', 'JFF15879', 'نتیجه اعلام نشده', '۱۴۰۵/۰۶/۰۶', 'نیازمند بررسی'],
    ['Jangsu Mountain Village Film Festival (JMVFF)', 'JMVFF6138', 'نتیجه اعلام نشده', '۱۴۰۵/۰۶/۰۸', '۲ روز مانده'],
    ['Gandhara Independent Film Festival', 'GIFF2457', 'نتیجه اعلام نشده', '۱۴۰۵/۰۶/۰۹', '۳ روز مانده'],
    ['Kuçova International Independent Film Festival', '3754', 'نتیجه اعلام نشده', '۱۴۰۵/۰۶/۱۵', '۹ روز مانده'],
    ['Uppsala Short Film Festival', 'FFW264812', 'نتیجه اعلام نشده', '۱۴۰۵/۰۶/۳۰', '۲۴ روز مانده'],
    ['Tampere Film Festival', 'TFF26-3212', 'انتخاب‌نشده', '—', 'مسدود'],
    ['Vienna Shorts', '—', 'عدم اقدام استراتژیک', '—', 'مسدود']
  ],
  decisions: [
    ['Tampere Film Festival', 'مسدود', 'قبلاً ارسال شده و نتیجه انتخاب‌نشده ثبت شده', 'فقط در صورت تغییر مستند شرایط دوره‌ای متفاوت'],
    ['Vienna Shorts', 'مسدود', 'بخش مناسب برای فیلم وجود نداشت', 'فقط در صورت تغییر رسمی قوانین و ایجاد بخش مناسب'],
    ['Square Eyes', 'بسته', 'فیلم به علت سال تولید ۲۰۲۵ قدیمی تلقی شد', 'فقط اگر خود سازمان مجدداً تماس بگیرد یا سیاست رسمی تغییر کند'],
    ['shnit', 'نیازمند بررسی', 'وضعیت نهایی تحویل قطعی نیست', 'پس از اثبات وضعیت نهایی تحویل']
  ],
  materials: [
    ['پوستر فیلم', 'نسخه نمایشی داخل پرونده قرار گرفته است و در نسخه نهایی می‌تواند با پوستر رسمی جایگزین شود.'],
    ['مشخصات مرجع', 'عنوان، سال، مدت، زبان و نسبت تصویر از رکورد قفل‌شده خوانده می‌شوند.'],
    ['پکیج پخش', 'پرونده جشنواره‌ها، تقویم نتایج، وضعیت انتخاب، حافظه تصمیم و کارهای بعدی.'],
    ['حفاظت از اعتبار', 'سیستم اجازه نمی‌دهد یک جشنواره دوباره از صفر و بدون توجه به سابقه بررسی شود.']
  ]
};

const pages = {
  home: { title: 'خانه', subtitle: 'داشبورد سینمایی، فارسی و هوشمند برای مدیریت پخش فیلم مستقل', render: renderHome },
  ourFilms: { title: 'فیلم‌های ما', subtitle: 'آثار در دست پخش و پرونده‌های فعال', render: renderOurFilms },
  login: { title: 'ورود فیلمساز', subtitle: 'ورود به پرونده اختصاصی فیلم و مشاهده بخش‌های مختلف آن', render: renderLogin },
  dashboard: { title: 'داشبورد کارگردان', subtitle: 'نمای مدیریتی پرونده «ناگهان برمی‌خیزد»', render: renderDashboard, protected: true },
  film: { title: 'پرونده فیلم', subtitle: 'اطلاعات مرجع، مواد فیلم و پوستر نمایشی', render: renderFilm, protected: true },
  festivals: { title: 'جشنواره‌ها', subtitle: 'رجیستری ارسال‌ها، نتایج و وضعیت‌های مسدود', render: renderFestivals, protected: true },
  calendar: { title: 'تقویم نتایج', subtitle: 'موعدهای شمسی اعلام نتایج', render: renderCalendar, protected: true },
  decisions: { title: 'حافظه تصمیم', subtitle: 'تصمیم‌هایی که ایجنت حق فراموش‌کردنشان را ندارد', render: renderDecisions, protected: true },
  guard: { title: 'نگهبان حیثیت', subtitle: 'قفل‌های ضد ارسال و تماس تکراری', render: renderGuard, protected: true },
  settings: { title: 'تنظیمات ایجنت', subtitle: 'قوانین اجرایی نسخه آزمایشی', render: renderSettings, protected: true }
};

let currentPage = 'home';
let sliderInterval = null;
let currentSlide = 0;

function updateSessionPanel() {
  const container = document.getElementById('session-panel');
  if (state.session.authenticated) {
    container.innerHTML = `
      <div class="user-chip">
        <div>
          <small>وارد شده به‌عنوان</small>
          <b>${state.filmmaker.name}</b>
        </div>
        <button class="ghost-btn" id="logout-btn">خروج</button>
      </div>`;
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
      state.session.authenticated = false;
      state.session.filmmaker = null;
      navigate('home');
    });
  } else {
    container.innerHTML = `
      <div class="film-pill">
        <span>${state.film.id}</span>
        <b>${state.film.title}</b>
      </div>`;
  }
}

function badge(v) {
  const danger = /مسدود|انتخاب‌نشده|بسته|قفل/.test(v);
  const warn = /بررسی|مانده|اعلام نشده|استراتژیک/.test(v);
  const ok = /انتخاب‌شده|فعال|در حال پخش/.test(v);
  const cls = danger ? 'danger' : warn ? 'warn' : ok ? 'ok' : 'neutral';
  return `<span class="badge ${cls}">${v}</span>`;
}
function metric(label, value, sub = '') {
  return `<article class="card metric"><small>${label}</small><b>${value}</b><small>${sub}</small></article>`;
}

function renderHome() {
  return `
    <section class="hero-panel">
      <div class="hero-copy">
        <div class="eyebrow">پلتفرم فارسی مدیریت پخش فیلم مستقل</div>
        <h2>پرونده فیلمت را از آشفتگی ایمیل‌ها و اکسل‌ها بیرون بیاور</h2>
        <p>این اپلیکیشن برای این ساخته می‌شود که کارگردان بداند فیلمش کجا ایستاده، چه چیزی امروز مهم است، کجا باید صبر کند و کجا حق یک اشتباه هم ندارد.</p>
        <div class="hero-actions">
          <button class="primary-btn" id="go-login">ورود فیلمساز</button>
          <button class="secondary-btn" id="go-our-films">فیلم‌های ما</button>
        </div>
      </div>
      <div class="cinema-slider" id="cinema-slider">
        ${state.slides.map((s, i) => `
          <article class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">
            <small>${s.eyebrow}</small>
            <h3>${s.title}</h3>
            <p>${s.text}</p>
          </article>`).join('')}
        <div class="slider-dots">
          ${state.slides.map((_, i) => `<button class="dot-btn ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`).join('')}
        </div>
      </div>
    </section>

    <div class="section-title"><h2>چرا ما متفاوتیم؟</h2><small>نه یک سایت معرفی جشنواره؛ یک مدیر پرونده برای هر فیلم</small></div>
    <div class="grid grid-3">
      ${state.highlights.map(item => `
        <article class="card feature-card">
          <div class="feature-icon">${item.icon}</div>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>`).join('')}
    </div>

    <div class="section-title"><h2>بخش‌های اصلی اپلیکیشن</h2><small>فیلمساز بعد از ورود دقیقاً می‌فهمد چه چیزهایی را در اختیار دارد</small></div>
    <div class="grid grid-2">
      ${state.modules.map(item => `
        <article class="card module-card">
          <h3>${item[0]}</h3>
          <p>${item[1]}</p>
        </article>`).join('')}
    </div>

    <section class="law-banner card">
      <div>
        <small>قانون محوری ایجنت</small>
        <h3>اگر داده کلیدی نامشخص باشد، اقدام بیرونی متوقف می‌شود</h3>
        <p>این یعنی سیستم به‌جای حدس زدن، پرونده را در حالت «نیازمند بررسی» نگه می‌دارد تا اعتبار حرفه‌ای فیلمساز آسیب نبیند.</p>
      </div>
      <div class="law-steps">
        <span>تاریخچه</span>
        <span>شرایط</span>
        <span>ضدتکرار</span>
        <span>ریسک</span>
        <span>اقدام</span>
      </div>
    </section>`;
}

function renderOurFilms() {
  return `
    <section class="our-film-layout">
      <article class="poster-showcase">
        <div class="poster-art">
          <div class="poster-overlay"></div>
          <div class="poster-text">
            <small>${state.film.english}</small>
            <h2>${state.film.title}</h2>
            <p>${state.film.genre}</p>
          </div>
        </div>
      </article>
      <article class="card film-overview">
        <div class="section-title compact"><h2>فیلم‌های در دست پخش</h2><small>پرونده‌های فعال</small></div>
        <div class="film-card-large">
          <div class="film-card-head">
            <div>
              <h3>${state.film.title}</h3>
              <p class="muted">${state.film.english}</p>
            </div>
            ${badge(state.film.status)}
          </div>
          <p class="film-logline">${state.film.logline}</p>
          <div class="film-meta-grid">
            <div><span>سال</span><b>${state.film.year}</b></div>
            <div><span>مدت</span><b>${state.film.runtime}</b></div>
            <div><span>کشور</span><b>${state.film.country}</b></div>
            <div><span>کارگردان</span><b>${state.film.director}</b></div>
            <div><span>زبان</span><b>${state.film.language}</b></div>
            <div><span>زیرنویس</span><b>${state.film.subtitles}</b></div>
          </div>
          <div class="cta-row">
            <button class="primary-btn" id="open-director-dossier">ورود به پرونده کارگردان</button>
            <button class="secondary-btn" id="back-home-btn">بازگشت به خانه</button>
          </div>
        </div>
      </article>
    </section>

    <div class="section-title"><h2>چرا این پروژه برای ارائه به مخاطب جذاب است؟</h2><small>نمایش حرفه‌ای، شفاف و سینمایی از یک پرونده واقعی</small></div>
    <div class="grid grid-3">
      <article class="card feature-card"><div class="feature-icon">🎬</div><h3>تمرکز روی اثر واقعی</h3><p>بازدیدکننده فوراً با یک فیلم واقعی و پرونده زنده روبه‌رو می‌شود، نه با یک نمونه بی‌جان.</p></article>
      <article class="card feature-card"><div class="feature-icon">📂</div><h3>مشاهده بخش‌های مختلف پرونده</h3><p>جشنواره‌ها، تقویم، حافظه تصمیم و وضعیت امروز در ساختاری منظم قابل دیدن هستند.</p></article>
      <article class="card feature-card"><div class="feature-icon">✨</div><h3>ارائه شیک و مدرن</h3><p>زبان تصویری تیره، سینمایی و مینیمال باعث می‌شود محصول حرفه‌ای و متمایز دیده شود.</p></article>
    </div>`;
}

function renderLogin() {
  if (state.session.authenticated) {
    return `
      <section class="login-layout">
        <article class="card login-card success-card">
          <small>وضعیت ورود</small>
          <h2>شما وارد پرونده فیلمساز شده‌اید</h2>
          <p>هم‌اکنون به‌عنوان ${state.filmmaker.name} به پرونده «${state.film.title}» دسترسی دارید و می‌توانید بخش‌های مختلف فیلم را ببینید.</p>
          <div class="cta-row">
            <button class="primary-btn" id="go-dashboard-btn">ورود به داشبورد کارگردان</button>
            <button class="secondary-btn" id="go-film-btn">مشاهده پرونده فیلم</button>
          </div>
        </article>
      </section>`;
  }
  return `
    <section class="login-layout">
      <article class="card login-card">
        <small>ورود اختصاصی فیلمساز</small>
        <h2>ورود به پرونده «ناگهان برمی‌خیزد»</h2>
        <p>در نسخه نمایشی، کارگردان می‌تواند با انتخاب پرونده خود وارد شود و داشبورد، جشنواره‌ها، تقویم نتایج، حافظه تصمیم و نگهبان حیثیت را ببیند.</p>
        <label class="input-label">نام فیلمساز</label>
        <input id="filmmaker-name" class="app-input" value="${state.filmmaker.name}" />
        <label class="input-label">کد دسترسی نمایشی</label>
        <input id="access-code" class="app-input ltr-input" value="${state.session.accessCode}" />
        <div class="cta-row">
          <button class="primary-btn" id="login-btn">ورود به پرونده کارگردان</button>
          <button class="secondary-btn" id="login-demo-btn">ورود سریع نمایشی</button>
        </div>
      </article>
      <article class="card login-side-note">
        <h3>بعد از ورود چه می‌بینید؟</h3>
        <ul class="pretty-list">
          <li>خلاصه اجرایی روز و اتفاقات مهم پرونده</li>
          <li>اطلاعات مرجع و پوستر نمایشی فیلم</li>
          <li>رجیستری جشنواره‌ها و نتایج</li>
          <li>تقویم شمسی اعلام نتایج</li>
          <li>دلایل قفل یا توقف هر تصمیم</li>
          <li>قوانین ضد ارسال و تماس تکراری</li>
        </ul>
      </article>
    </section>`;
}

function renderDashboard() {
  return `
    <div class="dashboard-hero card">
      <div>
        <small>حساب فیلمساز</small>
        <h2>${state.filmmaker.name}</h2>
        <p>${state.filmmaker.role} — دسترسی به پرونده کامل «${state.film.title}»</p>
      </div>
      <div class="director-chip">${state.filmmaker.filmId}</div>
    </div>

    <div class="grid grid-4">${metric('ارسال‌های ثبت‌شده', state.stats.submissions, 'رجیستری بازیابی‌شده')}${metric('انتخاب‌شده', state.stats.selected, 'ثبت قطعی')}${metric('انتخاب‌نشده', state.stats.notSelected, 'پرونده بسته')}${metric('در انتظار نتیجه', state.stats.waiting, 'نیازمند پایش')}</div>

    <div class="section-title"><h2>بخش‌های پرونده شما</h2><small>ورود سریع به قسمت‌های مختلف فیلم</small></div>
    <div class="grid grid-3 quick-grid">
      <button class="quick-card" data-jump="film"><span>🎞️</span><b>پرونده فیلم</b><small>مشخصات، پوستر و مواد فیلم</small></button>
      <button class="quick-card" data-jump="festivals"><span>🏆</span><b>جشنواره‌ها</b><small>ارسال‌ها، نتایج و وضعیت‌ها</small></button>
      <button class="quick-card" data-jump="calendar"><span>🗓️</span><b>تقویم نتایج</b><small>اعلام نتیجه‌های شمسی</small></button>
      <button class="quick-card" data-jump="decisions"><span>🧠</span><b>حافظه تصمیم</b><small>دلیل توقف یا قفل پرونده‌ها</small></button>
      <button class="quick-card" data-jump="guard"><span>🛡️</span><b>نگهبان حیثیت</b><small>قانون‌های ضدتکرار</small></button>
      <button class="quick-card" data-jump="settings"><span>⚙️</span><b>تنظیمات ایجنت</b><small>قواعد اجرایی نسخه آزمایشی</small></button>
    </div>

    <div class="section-title"><h2>امروز چه تغییر کرد؟</h2><small>فقط تغییرات واقعی و قابل اقدام</small></div>
    <article class="card">${state.today.map(e => `<div class="event"><span class="event-dot ${e.type}"></span><div><h3>${e.title}</h3><p>${e.text}</p></div><time>${e.date}</time></div>`).join('')}</article>`;
}

function renderFilm() {
  const f = state.film;
  return `
    <section class="dossier-layout">
      <article class="poster-column">
        <div class="poster-art tall">
          <div class="poster-overlay"></div>
          <div class="poster-text">
            <small>${f.english}</small>
            <h2>${f.title}</h2>
            <p>${f.genre}</p>
          </div>
        </div>
      </article>
      <article class="card dossier-main">
        <div class="section-title compact"><h2>اطلاعات مرجع فیلم</h2><small>رکورد قفل‌شده</small></div>
        <div class="kv">
          <div class="k">شناسه فیلم</div><div class="ltr">${f.id}</div>
          <div class="k">عنوان</div><div>${f.title}</div>
          <div class="k">عنوان بین‌المللی</div><div class="ltr">${f.english}</div>
          <div class="k">سال تولید</div><div>${f.year}</div>
          <div class="k">مدت</div><div>${f.runtime}</div>
          <div class="k">کشور</div><div>${f.country}</div>
          <div class="k">زبان</div><div>${f.language}</div>
          <div class="k">زیرنویس</div><div>${f.subtitles}</div>
          <div class="k">نسبت تصویر</div><div>${f.format}</div>
          <div class="k">ژانر</div><div>${f.genre}</div>
          <div class="k">کارگردان</div><div>${f.director}</div>
          <div class="k">وضعیت</div><div>${badge(f.status)}</div>
        </div>
      </article>
    </section>

    <div class="section-title"><h2>مواد و مزیت‌های پرونده</h2><small>چیزهایی که باید کارگردان داخل پرونده ببیند</small></div>
    <div class="grid grid-2">
      ${state.materials.map(m => `<article class="card material-card"><h3>${m[0]}</h3><p>${m[1]}</p></article>`).join('')}
    </div>`;
}

function festivalRows(rows) {
  return rows.map(r => `<tr><td>${r[0]}</td><td class="ltr">${r[1]}</td><td>${badge(r[2])}</td><td>${r[3]}</td><td>${badge(r[4])}</td></tr>`).join('');
}

function renderFestivals() {
  return `
    <div class="filterbar"><input id="festival-search" placeholder="جست‌وجوی جشنواره یا کد پیگیری"><select id="festival-filter"><option value="all">همه وضعیت‌ها</option><option>نتیجه اعلام نشده</option><option>انتخاب‌نشده</option><option>عدم اقدام استراتژیک</option></select></div>
    <div class="table-wrap"><table><thead><tr><th>نام جشنواره</th><th>کد پیگیری</th><th>وضعیت داوری</th><th>موعد نتیجه</th><th>وضعیت ایجنت</th></tr></thead><tbody id="festival-body">${festivalRows(state.festivals)}</tbody></table></div>`;
}

function renderCalendar() {
  const waiting = state.festivals.filter(x => /اعلام نشده/.test(x[2])).sort((a, b) => a[3].localeCompare(b[3], 'fa'));
  return `<div class="table-wrap"><table><thead><tr><th>نام جشنواره</th><th>تاریخ مورد انتظار اعلام نتیجه</th><th>وضعیت انتظار</th><th>کد پیگیری</th></tr></thead><tbody>${waiting.map(r => `<tr><td>${r[0]}</td><td>${r[3]}</td><td>${badge(r[4])}</td><td class="ltr">${r[1]}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderDecisions() {
  return `<div class="table-wrap"><table><thead><tr><th>موجودیت</th><th>تصمیم</th><th>دلیل</th><th>شرط بازگشایی</th></tr></thead><tbody>${state.decisions.map(r => `<tr><td>${r[0]}</td><td>${badge(r[1])}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderGuard() {
  return `
    <div class="grid grid-2">
      <article class="card"><h3>قفل ارسال تکراری</h3><div class="rule danger-line"><strong>قبل از هر ثبت‌نام</strong><p>فیلم + جشنواره + دوره + بخش + پخش‌کننده بررسی می‌شود. سابقه اثبات‌شده یعنی ارسال مجدد مسدود.</p></div><div class="rule danger-line"><strong>قبل از هر ایمیل</strong><p>نام سازمان، دامنه، گیرنده، هدف ایمیل و زنجیره قبلی بررسی می‌شود. ایمیل دوم به همان سازمان راه فرار نیست.</p></div></article>
      <article class="card"><h3>قفل داده</h3><div class="rule warn-line"><strong>نامشخص = توقف</strong><p>نبود مدرک به‌معنی نبود سابقه نیست. داده مبهم به وضعیت «نیازمند بررسی» می‌رود.</p></div><div class="rule ok-line"><strong>منبع حقیقت</strong><p>رجیستری ساختاریافته بالاتر از حافظه مکالمه قرار می‌گیرد.</p></div></article>
    </div>`;
}

function renderSettings() {
  return `
    <article class="card">
      <div class="toggle-row"><div><b>پایش روزانه</b><div class="muted">بررسی نتیجه‌ها و تغییرات بدون دستور روزانه</div></div><span class="toggle on"></span></div>
      <div class="toggle-row"><div><b>قانون ضدتکرار</b><div class="muted">مسدودسازی ارسال و ارتباط تکراری</div></div><span class="toggle on"></span></div>
      <div class="toggle-row"><div><b>اصل توقف در ابهام</b><div class="muted">هر داده نامشخص باعث توقف اقدام بیرونی می‌شود</div></div><span class="toggle on"></span></div>
      <div class="toggle-row"><div><b>زبان رابط</b><div class="muted">فارسی؛ فقط نام رسمی جشنواره‌ها و کدها به زبان اصلی</div></div><span class="badge ok">فارسی</span></div>
      <div class="toggle-row"><div><b>اقدام مالی و حقوقی</b><div class="muted">همیشه نیازمند تأیید صریح کارگردان</div></div><span class="badge danger">قفل</span></div>
    </article>`;
}

function renderAccessGate(pageKey) {
  return `
    <section class="gate-layout">
      <article class="card gate-card">
        <small>دسترسی محدود</small>
        <h2>برای دیدن بخش «${pages[pageKey].title}» اول وارد حساب فیلمساز شوید</h2>
        <p>این قسمت مخصوص کارگردان است تا بخش‌های مختلف پرونده فیلم خود را ببیند. در نسخه نمایشی می‌توانید با یک کلیک وارد پرونده «${state.film.title}» شوید.</p>
        <div class="cta-row">
          <button class="primary-btn" id="gate-login-btn">ورود فیلمساز</button>
          <button class="secondary-btn" id="gate-back-home-btn">بازگشت به خانه</button>
        </div>
      </article>
    </section>`;
}

function afterRender(page) {
  updateSessionPanel();
  bindGlobalActions();
  if (page === 'home') initSlider(); else stopSlider();
  if (page === 'festivals') wireFestivalFilters();
  if (page === 'login') wireLoginActions();
  if (page === 'dashboard') wireDashboardShortcuts();
}

function bindGlobalActions() {
  const goLogin = document.getElementById('go-login');
  const goOurFilms = document.getElementById('go-our-films');
  const openDirector = document.getElementById('open-director-dossier');
  const backHome = document.getElementById('back-home-btn');
  const gateLogin = document.getElementById('gate-login-btn');
  const gateBackHome = document.getElementById('gate-back-home-btn');
  const goDashboardBtn = document.getElementById('go-dashboard-btn');
  const goFilmBtn = document.getElementById('go-film-btn');

  if (goLogin) goLogin.addEventListener('click', () => navigate('login'));
  if (goOurFilms) goOurFilms.addEventListener('click', () => navigate('ourFilms'));
  if (openDirector) openDirector.addEventListener('click', () => navigate(state.session.authenticated ? 'dashboard' : 'login'));
  if (backHome) backHome.addEventListener('click', () => navigate('home'));
  if (gateLogin) gateLogin.addEventListener('click', () => navigate('login'));
  if (gateBackHome) gateBackHome.addEventListener('click', () => navigate('home'));
  if (goDashboardBtn) goDashboardBtn.addEventListener('click', () => navigate('dashboard'));
  if (goFilmBtn) goFilmBtn.addEventListener('click', () => navigate('film'));
}

function wireLoginActions() {
  const loginBtn = document.getElementById('login-btn');
  const demoBtn = document.getElementById('login-demo-btn');
  function doLogin() {
    state.session.authenticated = true;
    state.session.filmmaker = state.filmmaker.name;
    navigate('dashboard');
  }
  if (loginBtn) loginBtn.addEventListener('click', doLogin);
  if (demoBtn) demoBtn.addEventListener('click', doLogin);
}

function wireDashboardShortcuts() {
  document.querySelectorAll('.quick-card').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.jump));
  });
}

function wireFestivalFilters() {
  const q = document.querySelector('#festival-search');
  const f = document.querySelector('#festival-filter');
  function apply() {
    const text = q.value.trim().toLowerCase();
    const status = f.value;
    const rows = state.festivals.filter(r => (!text || r.join(' ').toLowerCase().includes(text)) && (status === 'all' || r[2] === status));
    document.querySelector('#festival-body').innerHTML = festivalRows(rows);
  }
  q.addEventListener('input', apply);
  f.addEventListener('change', apply);
}

function initSlider() {
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.dot-btn')];
  if (!slides.length) return;
  function show(index) {
    currentSlide = index;
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.slide))));
  stopSlider();
  sliderInterval = setInterval(() => show((currentSlide + 1) % slides.length), 4200);
}

function stopSlider() {
  if (sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }
}

function navigate(page) {
  if (!pages[page]) return;
  currentPage = page;
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelector('#page-title').textContent = pages[page].title;
  document.querySelector('#page-subtitle').textContent = pages[page].subtitle;
  const isProtected = !!pages[page].protected;
  document.querySelector('#content').innerHTML = (isProtected && !state.session.authenticated) ? renderAccessGate(page) : pages[page].render();
  afterRender(page);
}

document.querySelectorAll('#nav button').forEach(b => {
  b.addEventListener('click', () => navigate(b.dataset.page));
});

navigate('home');
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
