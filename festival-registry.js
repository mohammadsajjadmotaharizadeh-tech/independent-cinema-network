import { initFestivalRegistry, initDecisionHistory, initForensics, initPremiereMap, initCategoryLog } from "./data-layer.js";

const registry = initFestivalRegistry();
const decisionHistory = initDecisionHistory();
const forensics = initForensics();
const premiereMap = initPremiereMap();
const categoryLog = initCategoryLog();

/**
 * Normalize festival name for duplicate detection
 * - Lowercase, trim, remove extra whitespace, normalize common prefixes
 */
function normalizeFestivalName(name) {
  if (!name) return "";
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^(the |a )/i, "")
    .replace(/[-_]/g, " ");
}

/**
 * Festival History Registry Entry
 */
function addFestivalRecord(filmKey, record) {
  const normalized = normalizeFestivalName(record.festivalName);
  if (!registry[filmKey]) registry[filmKey] = {};

  const editionKey = `${normalized}-${record.edition || record.year || "unknown"}`;
  
  // Exact duplicate detection
  if (registry[filmKey][editionKey]) {
    const existing = registry[filmKey][editionKey];
    if (
      existing.festivalName === record.festivalName &&
      existing.edition === record.edition &&
      existing.result === record.result
    ) {
      return {
        type: "EXACT_DUPLICATE",
        existing,
        message: "This festival submission is an exact duplicate of a previously recorded entry.",
      };
    }
  }

  // Probable duplicate detection by normalized name + edition
  for (const existingEdition of Object.keys(registry[filmKey])) {
    const existing = registry[filmKey][existingEdition];
    if (
      normalizeFestivalName(existing.festivalName) === normalized &&
      existing.edition === record.edition &&
      existing._duplicateHold !== true
    ) {
      // Mark as probable duplicate, hold state
      existing._duplicateHold = true;
      existing._holdReason = "probable_duplicate_" + normalized + "_" + record.edition;
      return {
        type: "PROBABLE_DUPLICATE",
        existing,
        message: "Possible duplicate detected. History hold applied. Review required before proceeding.",
      };
    }
  }

  // Add the new record
  registry[filmKey][editionKey] = {
    festivalName: record.festivalName,
    edition: record.edition || record.year || "unknown",
    section: record.section || "unknown",
    submissionMethod: record.submissionMethod || "unknown",
    result: record.result || "unknown",
    screening: record.screening || "unknown",
    screeningDate: record.screeningDate,
    premiereImpact: record.premiereImpact || "unknown",
    sourceProof: record.sourceProof || "none",
    notes: record.notes || "",
    _duplicateHold: false,
    _created: new Date().toISOString(),
    _lastUpdated: new Date().toISOString(),
  };

  // Clean _duplicateHold flag from any previous matches
  for (const ek of Object.keys(registry[filmKey])) {
    if (registry[filmKey][ek]._duplicateHold) {
      registry[filmKey][ek]._duplicateHold = false;
      registry[filmKey][ek]._holdReason = undefined;
    }
  }

  return {
    type: "ADDED",
    record: registry[filmKey][editionKey],
    message: "Festival history record added successfully.",
  };
}

/**
 * Get all festival records for a film
 */
function getFestivalRecords(filmKey) {
  return registry[filmKey] ? Object.values(registry[filmKey]) : [];
}

/**
 * Get a specific festival record
 */
function getFestivalRecord(filmKey, festivalName, edition) {
  const normalized = normalizeFestivalName(festivalName);
  if (!registry[filmKey]) return null;

  for (const editionKey of Object.keys(registry[filmKey])) {
    const record = registry[filmKey][editionKey];
    if (normalizeFestivalName(record.festivalName) === normalized && record.edition === edition) {
      return record;
    }
  }
  return null;
}

/**
 * Hold state for uncertain history
 */
function holdRecord(filmKey, festivalName, edition) {
  const record = getFestivalRecord(filmKey, festivalName, edition);
  if (!record) return { error: "record_not_found" };

  record._holdState = true;
  record._holdReason = "uncertain_history";
  record._lastUpdated = new Date().toISOString();

  return {
    success: true,
    record,
    message: "Record placed on hold for uncertain history review.",
  };
}

/**
 * Block a repeat submission unless explicitly overridden
 */
function checkSubmissionBlock(filmKey, festivalName, edition) {
  const record = getFestivalRecord(filmKey, festivalName, edition);
  if (!record) return { type: "ALLOWED", message: "No prior record found; submission allowed." };

  if (record._blockedWithoutOverride) {
    return {
      type: "BLOCKED",
      message: "Submission blocked by prior hold. Use explicit override to proceed.",
    };
  }

  if (record.result && record.result.toLowerCase() === "not selected") {
    return {
      type: "BLOCKED",
      message: `Submission blocked: film was previously "${record.result}" at this festival.`,
    };
  }

  // Allow if explicitly marked as overridable
  if (record._overrideAllowed) {
    record._overrideAllowed = false;
    return { type: "OVERRIDE_ALLOWED", message: "Prior record exists but override is permitted." };
  }

  return {
    type: "BLOCKED",
    message: "Submission blocked by prior history. Contact administrator for override.",
  };
}

export {
  addFestivalRecord,
  getFestivalRecords,
  getFestivalRecord,
  holdRecord,
  checkSubmissionBlock,
  normalizeFestivalName,
};