import { 
  recordForensic, 
  updateConfidence, 
  getFilmForensics, 
  getConfidenceSummary, 
  shouldBlockSubmission, 
  getBlockadeReason,
  FORENSIC_CONFIDENCE 
} from "./distribution-forensics.js";

/**
 * Initialise registry from film-data.json, preserving backward compatibility.
 */
const data = require("./data-layer").getAllFilms();
const registry = data._registry || {};
const decisionHistory = data._decisionHistory || {};
const forensics = data._forensics || {};
const premiereMap = data._premiereMap || {};
const categoryLog = data._categoryLog || {};

/**
 * Normalise festival name for duplicate detection.
 * - Lowercase, trim, remove extra whitespace, normalise common prefixes.
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
function addFestivalRecord(filmKey, record, entry) {
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
      // Also update forensic confidence for duplicate
      const forensicResult = Object.values(initForensics()).find(f => f.festivalName === record.festivalName && f.edition === record.edition);
      if (forensicResult) {
        updateConfidence(record.festivalName, record.edition, record.section, record.submissionMethod, record.result, record.screening, FORENSIC_CONFIDENCE.RED_FLAG);
      }
      return {
        type: "EXACT_DUPLICATE",
        existing,
        message: "This festival submission is an exact duplicate of a previously recorded entry.",
      };
    }
  }

  // Probable duplicate detection by normalised name + edition
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

      // Record forensic with CLAIMED_NEEDS_EVIDENCE confidence
      recordForensic(filmKey, {
        festivalName: record.festivalName,
        edition: record.edition,
        section: record.section,
        submissionMethod: record.submissionMethod,
        result: record.result,
        screening: record.screening,
        confidenceLevel: FORENSIC_CONFIDENCE.CLAIMED_NEEDS_EVIDENCE,
        sourceDocuments: entry ? entry.sourceDocuments : [],
      });

      return {
        type: "PROBABLE_DUPLICATE",
        existing,
        message: "Possible duplicate detected. History hold applied. Review required before proceeding.",
      };
    }
  }

  // Add the new record
  const newRecord = {
    festivalName: record.festivalName,
    edition: record.edition || record.year || "unknown",
    section: record.section || "unknown",
    submissionMethod: record.submissionMethod || "unknown",
    result: record.result || "unknown",
    screening: record.screening || "unknown",
    premiereImpact: record.premiereImpact || "unknown",
    sourceProof: record.sourceProof || "none",
    notes: record.notes || "",
    _duplicateHold: false,
    _created: new Date().toISOString(),
    _lastUpdated: new Date().toISOString(),
  };

  registry[filmKey][editionKey] = newRecord;

  // Record forensic entry - determine confidence from sourceProof
  const confidence = record.sourceProof && record.sourceProof.toString().trim() !== ""
    ? FORENSIC_CONFIDENCE.VERIFIED
    : FORENSIC_CONFIDENCE.UNKNOWN;

  recordForensic(filmKey, {
    festivalName: record.festivalName,
    edition: record.edition,
    section: record.section,
    submissionMethod: record.submissionMethod,
    result: record.result,
    screening: record.screening,
    sourceDocuments: entry ? entry.sourceDocuments || [] : [],
    confidenceLevel: confidence,
  });

  return {
    type: "ADDED",
    record: newRecord,
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

  // Also update forensic confidence
  const forensicResult = Object.values(initForensics()).find(f => f.festivalName === record.festivalName && f.edition === edition);
  if (forensicResult) {
    updateConfidence(record.festivalName, record.edition, record.section, record.submissionMethod, record.result, record.screening, FORENSIC_CONFIDENCE.HOLD);
  }

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

  // Also check forensic confidence state
  const forensicConf = forensicConfidenceForRecord(filmKey, festivalName, edition);
  if (shouldBlockSubmission(forensicConf)) {
    return {
      type: "BLOCKED",
      message: getBlockadeReason(forensicConf) || "Submission blocked by forensic confidence state.",
    };
  }

  return {
    type: "BLOCKED",
    message: "Submission blocked by prior history. Contact administrator for override.",
  };
}

/**
 * Get forensic confidence for a record
 */
function forensicConfidenceForRecord(filmKey, festivalName, edition) {
  const records = getFilmForensics(filmKey);
  const matching = records.filter(r => r.festivalName === festivalName && r.edition === edition);
  return matching.length > 0 ? matching[0].confidence : FORENSIC_CONFIDENCE.UNKNOWN;
}

/**
 * Get confidence summary for a film's festival history
 */
function getConfidenceSummaryForFilm(filmKey) {
  return getConfidenceSummary(filmKey);
}

/**
 * Validate record minimum criteria
 */
function validateRecord(festivalName, edition, section, submissionMethod, result, screened) {
  const issues = [];

  if (!festivalName || festivalName.trim() === "") issues.push("empty_festival_name");
  if (!edition || edition.trim() === "") issues.push("empty_edition");
  if (!section || section.trim() === "") issues.push("empty_section");

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Get blockade determination for a film + festival combo
 */
function getBlockadeDecision(filmKey, festivalName, edition) {
  const record = getFestivalRecord(filmKey, festivalName, edition);
  const forensicConf = forensicConfidenceForRecord(filmKey, festivalName, edition);

  if (!record) return { type: "ALLOWED", message: "No prior record found; submission allowed." };

  const blockade = shouldBlockSubmission(forensicConf);
  if (blockade) {
    return {
      type: "BLOCKED",
      message: getBlockadeReason(forensicConf) || "Submission blocked by forensic confidence state.",
    };
  }

  if (record.result && record.result.toLowerCase() === "not selected") {
    return {
      type: "BLOCKED",
      message: `Submission blocked: film was previously "${record.result}" at this festival.`,
    };
  }

  if (record._blockedWithoutOverride) {
    return {
      type: "BLOCKED",
      message: "Submission blocked by prior hold. Use explicit override to proceed.",
    };
  }

  return { type: "ALLOWED", message: "Submission allowed." };
}

export {
  addFestivalRecord,
  getFestivalRecords,
  getFestivalRecord,
  holdRecord,
  checkSubmissionBlock,
  normalizeFestivalName,
  forensicConfidenceForRecord,
  getConfidenceSummaryForFilm,
  validateRecord,
  getBlockadeDecision,
  FORENSIC_CONFIDENCE,
};