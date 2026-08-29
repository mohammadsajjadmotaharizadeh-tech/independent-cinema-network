import data from "./film-data.json" with {type:"json"};

const filmKeys = Object.keys(data);

export function getFilmKeyFromUsername(username) {
  for (const key of filmKeys) {
    if (data[key].username === username) return key;
  }
  return null;
}

export function getFilm(key) {
  const film = data[key];
  if (!film) return null;
  return { ...film, _key: key };
}

export function getAllFilms() {
  const result = {};
  for (const key of filmKeys) {
    result[key] = getFilm(key);
  }
  return result;
}

export function createFilm(key, initialData) {
  if (data[key]) return { error: "film_key_exists", existing: getFilm(key) };
  data[key] = { ...initialData, _key: key };
  return { success: true, film: getFilm(key) };
}

export function updateFilm(key, partial) {
  if (!data[key]) return { error: "film_not_found" };
  data[key] = { ...data[key], ...partial };
  return { success: true, film: getFilm(key) };
}

export function deleteFilm(key) {
  if (!data[key]) return { error: "film_not_found" };
  const removed = data[key];
  delete data[key];
  return { success: true, film: removed };
}

// Initialize default festival registry if not present
function initFestivalRegistry() {
  if (!data._registry) data._registry = {};
  return data._registry;
}

// Initialize decision history if not present
function initDecisionHistory() {
  if (!data._decisionHistory) data._decisionHistory = {};
  return data._decisionHistory;
}

// Initialize distribution forensics if not present
function initForensics() {
  if (!data._forensics) data._forensics = {};
  return data._forensics;
}

// Initialize premiere map if not present
function initPremiereMap() {
  if (!data._premiereMap) data._premiereMap = {};
  return data._premiereMap;
}

// Initialize category error log if not present
function initCategoryLog() {
  if (!data._categoryLog) data._categoryLog = {};
  return data._categoryLog;
}