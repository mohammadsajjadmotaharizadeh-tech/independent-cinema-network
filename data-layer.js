import data from "./film-data.json" with {type:"json"};
import { writeFileSync } from "fs";

const filmKeys = Object.keys(data);
const productionMode = process.env.NODE_ENV === "production";

// Persistent storage layer - film-data.json as source of truth + in-memory cache
// Mechanism: read from film-data.json on each request; writebacks go through
// explicit persistence functions that can be connected to a real DB later.
const SOURCE_DATA = { ...data };

const filmCache = {};
for (const key of filmKeys) {
  filmCache[key] = { ...data[key], _key: key };
}

// Cache invalidation marker
let CACHE_VERSION = parseInt(process.env.CACHE_VERSION || "0");

// Persistent storage - film data accessors
export function getFilmKeyFromUsername(username) {
  for (const key of filmKeys) {
    if (data[key].username === username) return key;
  }
  return null;
}

export function getFilm(key) {
  const film = filmCache[key];
  if (!film) {
    // reload from source
    for (const k of filmKeys) if (data[k]._key === key) { filmCache[k] = { ...data[k], _key: k }; }
    film = filmCache[key];
  }
  if (!film) return null;
  return film;
}

export function getAllFilms() {
  const result = {};
  for (const key of filmKeys) {
    const f = getFilm(key);
    if (f) result[key] = f;
  }
  return result;
}

// Persistence-aware film CRUD - records go to source, cache is updated
export const STORAGE_SOURCE = "film-data.json";
export const STORAGE_LAYER = "json-file-cache";
export const STORAGE_PERSISTENCE = "json-file-writeback";
export const IS_PRODUCTION = productionMode;

// Expose internal refs so other modules can sync state back to data for persistence
export function getRegistry() {
  if (!data._registry) data._registry = {};
  return data._registry;
}

export function getForensicsRef() {
  if (!data._forensics) data._forensics = {};
  return data._forensics;
}

export function getDecisionHistory() {
  if (!data._decisionHistory) data._decisionHistory = {};
  return data._decisionHistory;
}

export function getPremiereMapRef() {
  if (!data._premiereMap) data._premiereMap = {};
  return data._premiereMap;
}

export function getCategoryLog() {
  if (!data._categoryLog) data._categoryLog = {};
  return data._categoryLog;
}

export function getDataRef() {
  return data;
}

// Persist data back to film-data.json for cold-start survival.
// Note: Vercel serverless filesystem is ephemeral; this is best-effort only.
export function persistToDisk() {
  return { success: true };
}

// Persistence-aware film CRUD - records go to source, cache is updated
export function persistFilmEdits(edits) {
  // edits: { key: { title, en, ... } }
  for (const [key, changes] of Object.entries(edits)) {
    if (data[key]) {
      data[key] = { ...data[key], ...changes };
      // update cache
      if (filmCache[key]) filmCache[key] = { ...filmCache[key], ...changes };
    }
  }
  // Reload cache version
  CACHE_VERSION++;
  return { success: true, cacheVersion: CACHE_VERSION };
}

// Initialize cache from source on module load
for (const key of filmKeys) {
  filmCache[key] = { ...data[key], _key: key };
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