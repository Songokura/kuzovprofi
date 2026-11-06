(function(){
"use strict";
/* Контакты - одно место на весь сайт. Поменять здесь и в атрибутах href index.html (tel:/wa.me), JSON-LD telephone. */
var PHONE = "+77000000000";
var PHONE_TEXT = "+7 700 000 00 00";
var WA = "77000000000";

var RED = matchMedia("(prefers-reduced-motion: reduce)").matches;
var HAS_IO = typeof IntersectionObserver === "function";
var root = document.documentElement;
var ASSET_V = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";

/* Тексты WhatsApp по кнопкам (русский). Казахский - в assets/lang/kk.js (__wa). */
var WA_T = {
  hero:     "Здравствуйте! Хочу рассчитать стоимость ремонта. Прикладываю фото повреждения.",
  steps:    "Здравствуйте! Отправляю фото повреждения для расчёта. Автомобиль: [марка, модель, год].",
  kuzovnoy: "Здравствуйте! Нужен расчёт по кузовному ремонту. Прикладываю фото.",
  pokraska: "Здравствуйте! Нужен расчёт по покраске. Прикладываю фото детали.",
  pdr:      "Здравствуйте! Нужен расчёт по удалению вмятины без покраски. Прикладываю фото.",
  polimer:  "Здравствуйте! Интересует полировка и полимерное покрытие кузова. Прикладываю фото автомобиля.",
  optika:   "Здравствуйте! Нужен расчёт по фарам. Прикладываю фото оптики.",
  shumka:   "Здравствуйте! Интересует шумоизоляция. Автомобиль: [марка, модель, год]. Какой объём работ посоветуете?",
  price:    "Здравствуйте! Хочу уточнить стоимость услуги: [услуга]. Прикладываю фото."
};
var FORM_T = {hello:"Здравствуйте! Меня зовут", phone:"телефон", noname:"Здравствуйте! Мой телефон", svc:"Услуга"};
var RU_MQ = "Кузовной ремонт|Покраска|Удаление вмятин без покраски|Полимерное покрытие|Оптика|Шумоизоляция|Реставрация салона|Детейлинг и полировка";
var I18N = {};
var RU = {};

function curLang(){ return root.getAttribute("lang") || "ru"; }
function waText(kind){
  var T = WA_T;
  if (curLang() === "kk" && window.SITE_KK && window.SITE_KK.__wa) T = window.SITE_KK.__wa;
  return T[kind] || T.hero || WA_T.hero;
}
function waUrl(kind, a){
  var t = waText(kind);
  if (a && a.dataset.svc) { var sp = a.querySelector("[data-i]"); if (sp) t = t.replace(/\[[^\]]+\]/, sp.textContent.trim()); }
  return "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);
}

/* Контакты из констант - в разметку */
function syncContacts(){
  document.querySelectorAll("a[data-tel]").forEach(function(a){ a.href = "tel:" + PHONE; });
  document.querySelectorAll("[data-phone]").forEach(function(el){ el.textContent = PHONE_TEXT; });
  document.querySelectorAll("a[data-wa]").forEach(function(a){ a.href = waUrl(a.dataset.wa, a); });
}
/* Текст WhatsApp подставляется в момент клика (язык), фаза захвата - совместимость с LeadBot */
window.addEventListener("click", function(e){
  var a = e.target.closest ? e.target.closest("a[data-wa]") : null;
  if (!a) return;
  a.href = waUrl(a.dataset.wa, a);
}, true);

/* Языки */
function snapshot(){
  document.querySelectorAll("[data-i]").forEach(function(el){ RU[el.dataset.i] = el.innerHTML; });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){ RU[el.dataset.iPh] = el.getAttribute("placeholder"); });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){ RU[el.dataset.iAria] = el.getAttribute("aria-label"); });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){ RU[el.dataset.iAlt] = el.getAttribute("alt"); });
  document.querySelectorAll("[data-i-t]").forEach(function(el){ RU[el.dataset.iT] = el.textContent; });
  document.querySelectorAll("[data-i-c]").forEach(function(el){ RU[el.dataset.iC] = el.getAttribute("content"); });
  RU["mq.list"] = RU_MQ;
}
function applyLang(lang){
  var d = lang === "ru" ? RU : (I18N[lang] || RU);
  function g(k){ return d[k] != null ? d[k] : RU[k]; }
  document.querySelectorAll("[data-i]").forEach(function(el){ var v = g(el.dataset.i); if (v != null) { if (lang === "ru") el.innerHTML = v; else el.textContent = v; } });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){ var v = g(el.dataset.iPh); if (v != null) el.setAttribute("placeholder", v); });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){ var v = g(el.dataset.iAria); if (v != null) el.setAttribute("aria-label", v); });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){ var v = g(el.dataset.iAlt); if (v != null) el.setAttribute("alt", v); });
  document.querySelectorAll("[data-i-t]").forEach(function(el){ var v = g(el.dataset.iT); if (v != null) el.textContent = v; });
  document.querySelectorAll("[data-i-c]").forEach(function(el){ var v = g(el.dataset.iC); if (v != null) el.setAttribute("content", v); });
  root.setAttribute("lang", lang);
  document.querySelectorAll(".lang button").forEach(function(b){
    var on = b.dataset.lang === lang;
    b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  try { localStorage.setItem("kp-lang", lang); } catch(e){}
  buildMarquee(g("mq.list"));
  syncContacts();
  if (typeof svcSync === "function") svcSync();
  fitAll();
}
function loadLang(lang, done){
  if (I18N[lang] || lang !== "kk") return done();
  var s = document.createElement("script");
  s.src = "assets/lang/kk.js" + (ASSET_V ? "?v=" + ASSET_V : "");
  s.onload = function(){ if (window.SITE_KK) I18N.kk = window.SITE_KK; done(); };
  s.onerror = function(){ done(); };
  document.head.appendChild(s);
}
function setLang(lang){
  if (["ru","kk"].indexOf(lang) < 0) lang = "ru";
  loadLang(lang, function(){ applyLang((I18N[lang] || lang === "ru") ? lang : "ru"); });
}
document.querySelectorAll(".lang button").forEach(function(b){ b.addEventListener("click", function(){ setLang(b.dataset.lang); }); });
function initLang(){
  var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1], saved = null;
  try { saved = localStorage.getItem("kp-lang"); } catch(e){}
  var L = forced || saved || "ru";
  if (L !== "ru") setLang(L); else { buildMarquee(RU_MQ); syncContacts(); }
}

/* Бегущая лента направлений */
function buildMarquee(list){
  var box = document.getElementById("mq1"); if (!box) return;
  var items = (list || RU_MQ).split("|"), html = "";
  items.forEach(function(t){ html += "<b>" + t + "</b>"; });
  box.innerHTML = html + html;
  requestAnimationFrame(function(){
    var w = box.scrollWidth / 2;
    box.style.setProperty("--tkw", w + "px");
    box.style.setProperty("--tkd", Math.max(22, w / 55) + "s");
  });
}

/* Шапка и меню */
var hdr = document.getElementById("hdr"), burger = document.getElementById("burger");
function hdrState(){ hdr.classList.toggle("solid", scrollY > 40); }
function closeMenu(){ document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); }
burger.addEventListener("click", function(){
  var open = document.body.classList.toggle("menu-open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});
document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });

/* Якоря */
function goTo(id, push){
  var el = document.getElementById(id); if (!el) return;
  closeMenu();
  var top = el.getBoundingClientRect().top + scrollY;
  var hh = parseFloat(getComputedStyle(root).getPropertyValue("--hh")) || 72;
  if (el.classList.contains("pw") && el.id !== "top" && getComputedStyle(el.firstElementChild).position === "sticky") top += 2;
  else if (id !== "top") top -= hh;
  scrollTo({top: Math.max(0, top), behavior: RED ? "auto" : "smooth"});
  if (push !== false) { try { history.pushState(null, "", "#" + id); } catch(e){} }
}
document.addEventListener("click", function(e){
  var a = e.target.closest ? e.target.closest("[data-go]") : null; if (!a) return;
  e.preventDefault(); goTo(a.dataset.go);
});

/* Подгон заголовков */
function fitOne(el){
  el.style.fontSize = "";
  if (getComputedStyle(el).whiteSpace !== "nowrap") return;
  var box = el.parentElement, max = box.clientWidth, guard = 0;
  var fs = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollWidth > max + 1 && guard < 14) { fs *= .95; el.style.fontSize = fs + "px"; guard++; }
}
function fitAll(){ document.querySelectorAll(".fit").forEach(fitOne); }
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
var lastW = innerWidth;
addEventListener("resize", function(){ if (innerWidth === lastW) return; lastW = innerWidth; fitAll(); stripsState(); });


/* UI: полоса прочтения, текущий раздел в меню, навигатор по услугам, кнопка «Наверх» */
var progEl = document.getElementById("prog");
var rail = document.getElementById("rail");
var totop = document.getElementById("totop");
var SVC = ["kuzovnoy","pokraska","pdr","polimer","optika","shumka"];
var SPY = ["raschet"].concat(SVC, ["pochemu-my","uslugi","kontakty"]).map(function(id){ return document.getElementById(id); }).filter(Boolean);
var navA = [].slice.call(document.querySelectorAll(".nav a[data-go]"));
var railA = rail ? [].slice.call(rail.querySelectorAll("a")) : [];
var curId = null;
function uiState(){
  var H = innerHeight || root.clientHeight;
  var max = root.scrollHeight - H;
  if (progEl) progEl.style.transform = "scaleX(" + (max > 0 ? Math.min(1, scrollY / max) : 0).toFixed(4) + ")";
  var id = null, line = H * 0.4;
  for (var i = 0; i < SPY.length; i++) { if (SPY[i].getBoundingClientRect().top <= line) id = SPY[i].id; }
  if (id !== curId) {
    curId = id;
    var navId = SVC.indexOf(id) >= 0 ? "kuzovnoy" : id;
    navA.forEach(function(a){ var on = a.dataset.go === navId; a.classList.toggle("is-cur", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    railA.forEach(function(a){ var on = a.dataset.go === id; a.classList.toggle("is-cur", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    if (rail) rail.classList.toggle("show", SVC.indexOf(id) >= 0);
  }
  if (totop) totop.classList.toggle("show", scrollY > H * 1.5);
}
if (totop) totop.addEventListener("click", function(){
  scrollTo({top: 0, behavior: RED ? "auto" : "smooth"});
  try { history.pushState(null, "", location.pathname + location.search); } catch(e){}
});

/* Плиты: прогресс в --enter/--exit/--stay, размеры читаются одним пакетом, вне экрана не считаем */
function clamp(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
var heroPw = document.getElementById("top");
var pws = [].slice.call(document.querySelectorAll(".pw"));
var bar = document.getElementById("bar");
var kont = document.getElementById("kontakty");
var last = new Map();
function setVar(pw, k, v){
  var m = last.get(pw); if (!m) { m = {}; last.set(pw, m); }
  if (m[k] !== v) { m[k] = v; pw.style.setProperty(k, v); }
}
function update(){
  var H = innerHeight || root.clientHeight;
  var rects = pws.map(function(pw){ return pw.getBoundingClientRect(); });
  var onKont = bar && kont && kont.getBoundingClientRect().top < H * 0.6;
  pws.forEach(function(pw, i){
    var r = rects[i];
    if (r.bottom < -H || r.top > 2 * H) return;
    var enter = clamp(1 - r.top / H);
    var exit  = clamp(1 - r.bottom / H);
    var stay  = r.height > H + 1 ? clamp(-r.top / (r.height - H)) : (pw === heroPw ? clamp(-r.top / H) : enter);
    setVar(pw, "--enter", enter.toFixed(3));
    setVar(pw, "--exit",  exit.toFixed(3));
    setVar(pw, "--stay",  stay.toFixed(3));
    pw.classList.toggle("gone", exit >= 1);
  });
  hdrState(); uiState();
  if (bar) bar.classList.toggle("show", scrollY > H * 0.55 && !onKont);
}
if (RED) {
  root.classList.add("no-plate");
  addEventListener("resize", uiState); uiState();
  addEventListener("scroll", function(){ hdrState(); uiState(); if (bar) bar.classList.toggle("show", scrollY > innerHeight * 0.55 && !(kont && kont.getBoundingClientRect().top < innerHeight * .6)); }, {passive:true});
  hdrState();
} else {
  var tick = false;
  addEventListener("scroll", function(){
    if (tick) return; tick = true;
    requestAnimationFrame(function(){ tick = false; update(); });
  }, {passive:true});
  addEventListener("resize", update);
  addEventListener("load", update);
  /* Открытие главного экрана (CSS-анимации по html.intro) - только при заходе на верх страницы без якоря */
  if (!location.hash && scrollY <= 80) root.classList.add("intro");
  update();
}
addEventListener("hashchange", function(){
  var id = location.hash.slice(1); if (!id || !document.getElementById(id)) return;
  goTo(id, false);
  setTimeout(function(){ goTo(id, false); }, 420);
});

/* Появление при прокрутке: html.anim включает скрытое состояние в CSS, IO один раз ставит .in.
   Без IO или при reduced-motion класс не ставится - всё видно сразу. */
if (HAS_IO && !RED) {
  root.classList.add("anim");
  var RV = ".rv,.rv-k,.ph,.deco";
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {threshold:.3, rootMargin:"0px 0px -18% 0px"});
  document.querySelectorAll(RV).forEach(function(el){ io.observe(el); });
  setTimeout(function(){ document.querySelectorAll(RV).forEach(function(el){
    if (!el.classList.contains("in") && el.getBoundingClientRect().top < innerHeight) el.classList.add("in");
  }); }, 1500);
}

/* Ленты со стрелками (задел под галерею работ) */
var strips = [];
document.querySelectorAll(".strip-wrap").forEach(function(w){
  var s = w.querySelector(".strip"), prev = w.querySelector(".prev"), next = w.querySelector(".next");
  if (!s || !prev || !next) return;
  function stepW(){
    var f = s.firstElementChild; if (!f) return s.clientWidth;
    var gap = parseFloat(getComputedStyle(s).columnGap); if (isNaN(gap)) gap = 16;
    return f.getBoundingClientRect().width + gap;
  }
  function state(){
    var max = s.scrollWidth - s.clientWidth, none = max <= 1;
    prev.hidden = none; next.hidden = none;
    prev.disabled = s.scrollLeft <= 1; next.disabled = s.scrollLeft >= max - 1;
  }
  prev.addEventListener("click", function(){ s.scrollBy({left: -stepW(), behavior: RED ? "auto" : "smooth"}); });
  next.addEventListener("click", function(){ s.scrollBy({left: stepW(), behavior: RED ? "auto" : "smooth"}); });
  s.addEventListener("scroll", state, {passive:true});
  s.addEventListener("keydown", function(e){
    if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); prev.click(); }
  });
  strips.push(state); state();
});
function stripsState(){ strips.forEach(function(f){ f(); }); }
addEventListener("load", stripsState);

/* Форма -> WhatsApp */
var form = document.getElementById("form");
/* Форма: выбор услуги кнопками (значение в скрытом поле - его видит LeadBot), маска телефона */
var chips = form ? [].slice.call(form.querySelectorAll(".chips button")) : [];
function svcList(){
  return chips.filter(function(b){ return b.getAttribute("aria-pressed") === "true"; }).map(function(b){ return b.textContent.trim(); }).join(", ");
}
function svcSync(){ if (form && form.service) form.service.value = svcList(); }
chips.forEach(function(b){ b.addEventListener("click", function(){
  b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); svcSync();
}); });
function maskPhone(v){
  var d = v.replace(/\D/g, "");
  if (!d) return "";
  if (d[0] === "8") d = "7" + d.slice(1);
  if (d[0] !== "7") d = "7" + d;
  d = d.slice(0, 11);
  var o = "+7";
  if (d.length > 1) o += " " + d.slice(1, 4);
  if (d.length > 4) o += " " + d.slice(4, 7);
  if (d.length > 7) o += " " + d.slice(7, 9);
  if (d.length > 9) o += " " + d.slice(9, 11);
  return o;
}
if (form && form.phone) {
  form.phone.addEventListener("input", function(e){
    if (e.inputType && e.inputType.indexOf("delete") === 0) return;
    var el = form.phone, atEnd = el.selectionStart === el.value.length;
    var m = maskPhone(el.value); if (m !== el.value && atEnd) el.value = m;
    if (el.value.replace(/\D/g, "").length >= 11) { el.removeAttribute("aria-invalid"); document.getElementById("fmerr").hidden = true; }
  });
  form.phone.addEventListener("blur", function(){ var m = maskPhone(form.phone.value); if (m) form.phone.value = m; });
}

if (form) form.addEventListener("submit", function(e){
  e.preventDefault();
  var ok = document.getElementById("fmok"), err = document.getElementById("fmerr");
  if (form.company && form.company.value) return;
  var phone = form.phone.value.trim();
  if (phone.replace(/\D/g, "").length < 11) { err.hidden = false; ok.hidden = true; form.phone.setAttribute("aria-invalid", "true"); form.phone.focus(); return; }
  err.hidden = true; form.phone.removeAttribute("aria-invalid");
  var F = FORM_T;
  if (curLang() === "kk" && window.SITE_KK && window.SITE_KK.__form) F = window.SITE_KK.__form;
  var name = form.name.value.trim(), msg = form.msg.value.trim();
  var svc = svcList();
  var t = (name ? F.hello + " " + name + ", " + F.phone + " " + phone + "." : F.noname + " " + phone + ".") + (svc ? "\n" + (F.svc || FORM_T.svc) + ": " + svc + "." : "") + (msg ? "\n" + msg : "");
  ok.hidden = false;
  window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(t), "_blank", "noopener");
});

snapshot();
initLang();
hdrState();
fitAll();
if (location.hash) {
  var hid = location.hash.slice(1);
  if (document.getElementById(hid)) {
    setTimeout(function(){ goTo(hid, false); }, 60);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (location.hash.slice(1) === hid) goTo(hid, false); });
  }
}
})();
