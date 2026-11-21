"use strict";

// ---------- Хранилище ----------
const STORAGE_KEY = "eventTracker.events";
const THEME_KEY = "eventTracker.theme";
const LANG_KEY = "eventTracker.lang";

const CATEGORY_ICONS = {
  personal: "🌿",
  work: "💼",
  birthday: "🎂",
  other: "📌",
};

// ---------- Локализация ----------
const I18N = {
  ru: {
    docTitle: "Трекер событий",
    appTitle: "📅 Трекер событий",
    placeholder: "Название события",
    add: "Добавить",
    empty: "Событий пока нет — добавьте первое сверху",
    clearPast: "Очистить прошедшие",
    stats: (total, upcoming, past) =>
      `Всего: ${total} · предстоящих: ${upcoming} · прошедших: ${past}`,
    filters: { all: "Все", upcoming: "Предстоящие", today: "Сегодня", past: "Прошедшие" },
    sortAsc: "По дате ↑",
    sortDesc: "По дате ↓",
    categories: {
      personal: "🌿 Личное",
      work: "💼 Работа",
      birthday: "🎂 День рождения",
      other: "📌 Другое",
    },
    countdown: {
      today: "сегодня",
      tomorrow: "завтра",
      yesterday: "вчера",
      in: "через",
      ago: "было {n} {unit} назад",
      units: {
        day: ["день", "дня", "дней"],
        week: ["неделю", "недели", "недель"],
        month: ["месяц", "месяца", "месяцев"],
        year: ["год", "года", "лет"],
      },
    },
    aria: {
      theme: "Переключить тему",
      lang: "Сменить язык",
      form: "Форма добавления события",
      filtersNav: "Фильтры событий",
      title: "Название события",
      category: "Категория",
      date: "Дата события",
      sort: "Сортировка по дате",
      delete: "Удалить событие",
    },
  },
  en: {
    docTitle: "Event Tracker",
    appTitle: "📅 Event Tracker",
    placeholder: "Event name",
    add: "Add",
    empty: "No events yet — add your first one above",
    clearPast: "Clear past",
    stats: (total, upcoming, past) =>
      `Total: ${total} · upcoming: ${upcoming} · past: ${past}`,
    filters: { all: "All", upcoming: "Upcoming", today: "Today", past: "Past" },
    sortAsc: "By date ↑",
    sortDesc: "By date ↓",
    categories: {
      personal: "🌿 Personal",
      work: "💼 Work",
      birthday: "🎂 Birthday",
      other: "📌 Other",
    },
    countdown: {
      today: "today",
      tomorrow: "tomorrow",
      yesterday: "yesterday",
      in: "in",
      ago: "{n} {unit} ago",
      units: {
        day: ["day", "days"],
        week: ["week", "weeks"],
        month: ["month", "months"],
        year: ["year", "years"],
      },
    },
    aria: {
      theme: "Toggle theme",
      lang: "Switch language",
      form: "Add event form",
      filtersNav: "Event filters",
      title: "Event name",
      category: "Category",
      date: "Event date",
      sort: "Sort by date",
      delete: "Delete event",
    },
  },
};

let events = load();
let currentFilter = "all";
let sortAscending = true;
let lang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "ru";

function t() {
  return I18N[lang];
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// ---------- Тема ----------
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    document.documentElement.dataset.theme = saved;
  }
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const next = (current === "dark" || (!current && prefersDark)) ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  document.getElementById("themeToggle").setAttribute("aria-label", t().aria.theme);
});

// ---------- Язык ----------
function pluralRu(n, forms) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

function pluralize(n, unit) {
  const forms = t().countdown.units[unit];
  return lang === "ru" ? pluralRu(n, forms) : (n === 1 ? forms[0] : forms[1]);
}

function formatCountdown(target) {
  const diff = daysBetween(new Date(), target);
  const c = t().countdown;
  if (diff === 0) return c.today;
  if (diff === 1) return c.tomorrow;
  if (diff === -1) return c.yesterday;
  if (diff > 1) {
    if (diff < 7) return `${c.in} ${diff} ${pluralize(diff, "day")}`;
    if (diff < 30) {
      const weeks = Math.round(diff / 7);
      return `${c.in} ${weeks} ${pluralize(weeks, "week")}`;
    }
    const months = Math.round(diff / 30);
    if (months < 12) return `${c.in} ${months} ${pluralize(months, "month")}`;
    const years = Math.round(months / 12);
    return `${c.in} ${years} ${pluralize(years, "year")}`;
  }
  const past = -diff;
  return c.ago.replace("{n}", past).replace("{unit}", pluralize(past, "day"));
}

function applyI18n() {
  const dict = t();

  document.documentElement.lang = lang;
  document.title = dict.docTitle;
  document.getElementById("appTitle").textContent = dict.appTitle;

  const titleInput = document.getElementById("titleInput");
  titleInput.placeholder = dict.placeholder;
  titleInput.setAttribute("aria-label", dict.aria.title);

  document.getElementById("addBtn").textContent = dict.add;
  document.getElementById("eventForm").setAttribute("aria-label", dict.aria.form);
  document.getElementById("categorySelect").setAttribute("aria-label", dict.aria.category);
  document.getElementById("dateInput").setAttribute("aria-label", dict.aria.date);
  document.getElementById("filters").setAttribute("aria-label", dict.aria.filtersNav);
  document.getElementById("sortBtn").setAttribute("aria-label", dict.aria.sort);
  document.getElementById("sortBtn").textContent = sortAscending ? dict.sortAsc : dict.sortDesc;
  document.getElementById("themeToggle").setAttribute("aria-label", dict.aria.theme);
  document.getElementById("langToggle").setAttribute("aria-label", dict.aria.lang);
  document.getElementById("langToggle").textContent = lang === "ru" ? "EN" : "RU";
  document.getElementById("emptyText").textContent = dict.empty;
  document.getElementById("clearPastBtn").textContent = dict.clearPast;

  // подписи фильтров
  document.querySelectorAll(".filters__btn[data-filter]").forEach((btn) => {
    btn.textContent = dict.filters[btn.dataset.filter];
  });

  // категории в select
  document.querySelectorAll("#categorySelect option").forEach((opt) => {
    opt.textContent = dict.categories[opt.value];
  });
}

document.getElementById("langToggle").addEventListener("click", () => {
  lang = lang === "ru" ? "en" : "ru";
  localStorage.setItem(LANG_KEY, lang);
  applyI18n();
  render();
});

// ---------- Даты ----------
const DAY = 24 * 60 * 60 * 1000;

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY);
}

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---------- Фильтры и сортировка ----------
function isPast(ev) {
  return daysBetween(new Date(), new Date(ev.date)) < 0;
}

function applyFilter(list) {
  switch (currentFilter) {
    case "upcoming": return list.filter((ev) => daysBetween(new Date(), new Date(ev.date)) > 0);
    case "today":    return list.filter((ev) => daysBetween(new Date(), new Date(ev.date)) === 0);
    case "past":     return list.filter(isPast);
    default:         return list;
  }
}

// ---------- Рендер ----------
function render() {
  const listEl = document.getElementById("eventsList");
  const emptyEl = document.getElementById("emptyState");

  const visible = applyFilter(events).sort((a, b) =>
    sortAscending
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  );

  listEl.innerHTML = "";
  emptyEl.hidden = visible.length > 0;

  for (const ev of visible) {
    const countdown = formatCountdown(new Date(ev.date));
    const past = isPast(ev);
    const isToday = daysBetween(new Date(), new Date(ev.date)) === 0;

    const li = document.createElement("li");
    li.className = "event" + (past ? " is-past" : "");
    li.innerHTML = `
      <span class="event__icon" aria-hidden="true">${CATEGORY_ICONS[ev.category]}</span>
      <div class="event__info" data-countdown="${countdown}">
        <p class="event__title"></p>
        <p class="event__date"></p>
      </div>
      <span class="event__badge ${isToday ? "event__badge--today" : past ? "event__badge--past" : ""}"></span>
      <button class="event__delete" type="button"></button>
    `;
    li.querySelector(".event__title").textContent = ev.title;
    li.querySelector(".event__date").textContent = formatDate(ev.date);
    li.querySelector(".event__badge").textContent = countdown;

    const delBtn = li.querySelector(".event__delete");
    delBtn.textContent = "✕";
    delBtn.setAttribute("aria-label", t().aria.delete);
    delBtn.addEventListener("click", () => {
      events = events.filter((e) => e.id !== ev.id);
      save();
      render();
    });

    listEl.appendChild(li);
  }

  const pastCount = events.filter(isPast).length;
  document.getElementById("stats").textContent =
    t().stats(events.length, events.length - pastCount, pastCount);
}

// ---------- Форма ----------
const dateInput = document.getElementById("dateInput");
dateInput.min = new Date().toISOString().split("T")[0];

document.getElementById("eventForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("titleInput").value.trim();
  const category = document.getElementById("categorySelect").value;
  const date = dateInput.value;
  if (!title || !date) return;

  events.push({ id: Date.now(), title, category, date });
  save();
  e.target.reset();
  dateInput.min = new Date().toISOString().split("T")[0];
  currentFilter = "all";
  document.querySelectorAll(".filters__btn").forEach((b) =>
    b.classList.toggle("filters__btn--active", b.dataset.filter === "all")
  );
  render();
});

// ---------- Фильтры и сортировка ----------
document.getElementById("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filters__btn");
  if (!btn || btn.id === "sortBtn") return;
  currentFilter = btn.dataset.filter;
  document.querySelectorAll(".filters__btn").forEach((b) =>
    b.classList.toggle("filters__btn--active", b === btn)
  );
  render();
});

document.getElementById("sortBtn").addEventListener("click", () => {
  sortAscending = !sortAscending;
  document.getElementById("sortBtn").textContent =
    sortAscending ? t().sortAsc : t().sortDesc;
  render();
});

// ---------- Очистка прошедших ----------
document.getElementById("clearPastBtn").addEventListener("click", () => {
  events = events.filter((ev) => !isPast(ev));
  save();
  render();
});

// ---------- Старт ----------
initTheme();
applyI18n();
render();
setInterval(render, 60 * 1000); // обновляем статусы раз в минуту