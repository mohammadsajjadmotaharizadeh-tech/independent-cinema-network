import { evaluateEligibility } from "./eligibility-engine.js";
import { getFestivalRecords, addFestivalRecord, checkSubmissionBlock } from "./festival-registry.js";
import { canScreenWithoutBurning, getPremiereRiskStatus, PremiereType } from "./premiere-map.js";
import { detectCategoryMismatch, batchDetectMismatches } from "./category-detection.js";
import { recordForensic, getConfidenceSummary } from "./distribution-forensics.js";
import { getFilm } from "./data-layer.js";

/**
 * Agent Decision Layer - deterministic local decision logic for festival strategy
 * Never depends on AI API for core decisions
 */

/**
 * Priority order for festival targets
 */
const TARGET_PRIORITY = {
  A_PLUS: "A+",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
};

/**
 * Strategy recommendation result
 */
function StrategyResult(recommendations, restrictions, notes) {
  this.recommendations = recommendations || [];
  this.restrictions = restrictions || [];
  this.notes = notes || "";
}

/**
 * Main strategy determination function
 * Returns festival strategy recommendations based on film state
 */
function determineFestivalStrategy(filmKey, options = {}) {
  const film = getFilm(filmKey);
  if (!film) {
    return new StrategyResult([], [], "Film not found in data layer.");
  }

  const restrictions = [];
  const recommendations = [];
  const notes = [];

  // 1. Check category mismatches first
  const mismatchResult = detectCategoryMismatch(film, film.genre || "unknown");
  if (mismatchResult.mismatch) {
    restrictions.push({
      type: "CATEGORY_ERROR",
      message: mismatchResult.details,
      severity: "high",
    });
    notes.push(`Category mismatch detected - festival strategy deferred until category verified.`);
  }

  // 2. Get festival history records
  const records = getFestivalRecords(filmKey);

  // 3. Check for duplicate blocks
  for (const rec of records) {
    const blockCheck = checkSubmissionBlock(filmKey, rec.festivalName, rec.edition);
    if (blockCheck.type === "BLOCKED") {
      restrictions.push({
        type: "DUPLICATE_BLOCK",
        message: blockCheck.message,
        severity: "high",
        festival: rec.festivalName,
        edition: rec.edition,
      });
      notes.push(`Duplicate block: ${blockCheck.message}`);
    }
  }

  // 4. Premiere map analysis
  const premiereRisk = getPremiereRiskStatus(filmKey, records.length > 0 ? records[0].festivalName : "");

  if (premiereRisk.risk === "high") {
    restrictions.push({
      type: "PREMIERE_RISK",
      message: premiereRisk.note,
      severity: "high",
    });
    notes.push(`Premiere risk: ${premiereRisk.note}`);
  }

  // 5. Eligibility evaluation for each potential festival
  // (In a real implementation, this would iterate over potential festivals)
  // For now, evaluate based on existing records

  // 6. Waiver/free path classification
  const waiverEligible = records.some(
    r => r.feePath && r.feePath.toLowerCase().includes("waiver")
  );

  // 7. Build recommendations based on film state
  
  // If film has A/A+ targets and no restrictions, recommend A/A+ festivals
  const hasStrongHistory = records.length >= 2 && 
    records.some(r => (r.result || "").toLowerCase().includes("selected"));
  
  if (hasStrongHistory && restrictions.length === 0) {
    recommendations.push({
      type: "PRIMARY_TARGET",
      priority: "A+",
      message: "Film has strong festival history; target A/A+ competitions with Premiere Guard active.",
      rationale: "Previous selections indicate festival acceptance; Premiere Guard prevents premature screening.",
    });
  }

  // If waiver paths are available and similar strategy value, prefer waiver/free
  if (waiverEligible && restrictions.length <= 1) {
    recommendations.push({
      type: "WAIVER_FIRST",
      priority: "A",
      message: "Waiver/free route recommended when strategy value is similar to paid routes.",
      rationale: "Cost-effective path; preserves budget for higher-priority festivals.",
    });
  }

  // If HOLD status from eligibility, recommend inquiry
  if (restrictions.some(r => r.type === "CATEGORY_ERROR" || r.type === "DUPLICATE_BLOCK")) {
    recommendations.push({
      type: "NEEDS_INQUIRY",
      priority: "medium",
      message: "Eligibility inquiry required before festival selection.",
      rationale: "Category or duplicate issues must be resolved before submission.",
    });
  }

  // If premiere risk is flagged, add guard recommendation
  if (premiereRisk.risk === "high") {
    recommendations.push({
      type: "PREMIERE_GUARD",
      priority: "high",
      message: "Premiere Guard active: no important screening without eligibility assessment.",
      rationale: "Protect film's premiere status for higher-tier festivals.",
    });
  }

  // If needs inquiry
  if (restrictions.length > 0) {
    recommendations.push({
      type: "HOLD_AND_REVIEW",
      priority: "high",
      message: "Festival strategy on hold until restrictions resolved.",
      rationale: "Address all restrictions before proceeding with submissions.",
    });
  }

  // If no recommendations yet, default
  if (recommendations.length === 0) {
    recommendations.push({
      type: "STANDARD_STRATEGY",
      priority: "B",
      message: "Apply standard festival strategy: mix of A/A+ targets with waiver/free routes.",
      rationale: "Balanced approach for films with moderate festival history.",
    });
  }

  return new StrategyResult(recommendations, restrictions, notes.join(" | "));
}

/**
 * Determine if a festival submission should be made
 * Returns { shouldSubmit: boolean, reason, confidence }
 */
function shouldSubmitToFestival(filmKey, festivalName, edition, options = {}) {
  const film = getFilm(filmKey);
  if (!film) return { shouldSubmit: false, reason: "film_not_found", confidence: 0 };

  // 1. Check duplicate blocks
  const blockCheck = checkSubmissionBlock(filmKey, festivalName, edition);
  if (blockCheck.type === "BLOCKED") {
    return { shouldSubmit: false, reason: blockCheck.message, confidence: 1 };
  }

  // 2. Get or create festival record
  const rec = getFestivalRecord(filmKey, festivalName, edition);
  
  // 3. Evaluate eligibility
  const eligibility = evaluateEligibility(filmKey, {
    festivalName,
    edition,
    section: rec ? rec.section : undefined,
    result: rec ? rec.result : undefined,
    screening: rec ? rec.screening : undefined,
  }, options);

  // 4. Terminal blocking statuses
  if (eligibility.status === evaluateEligibility.INELIGIBLE) {
    return { shouldSubmit: false, reason: eligibility.reasons.join(", "), confidence: 1, status: eligibility.status };
  }

  if (eligibility.status === evaluateEligibility.CATEGORY_ERROR) {
    return { shouldSubmit: false, reason: eligibility.reasons.join(", "), confidence: 1, status: eligibility.status };
  }

  if (eligibility.status === evaluateEligibility.DEADLINE_CLOSED) {
    return { shouldSubmit: false, reason: eligibility.reasons.join(", "), confidence: 1, status: eligibility.status };
  }

  if (eligibility.status === evaluateEligibility.DUPLICATE) {
    return { shouldSubmit: false, reason: eligibility.reasons.join(", "), confidence: 1, status: eligibility.status };
  }

  if (eligibility.status === evaluateEligibility.PREMIERE_RISK) {
    return { shouldSubmit: false, reason: "Premiere risk: " + eligibility.reasons.join(", "), confidence: 0.9, status: eligibility.status };
  }

  if (eligibility.status === evaluateEligibility.HOLD) {
    return { shouldSubmit: false, reason: "HOLD: " + eligibility.reasons.join(", "), confidence: 0.7, status: eligibility.status };
  }

  // 5. If we get here, submission is potentially eligible
  // Check premiere guard
  if (!options?.bypassPremiereGuard) {
    const premiereCheck = canScreenWithoutBurning(filmKey, {
      festivalName,
      edition,
      screeningType: eligibility.riskLevel === "high" ? "unknown" : "regional",
    });
    
    if (!premiereCheck.safeToScreen) {
      return { shouldSubmit: false, reason: "Premiere guard: " + premiereCheck.reasons.join(". "), confidence: 0.8, status: "PREMIERE_RISK" };
    }
  }

  return { shouldSubmit: true, reason: "Eligibility check passed; proceeds with submission strategy.", confidence: eligibility.riskLevel === "low" ? 0.9 : 0.6, status: eligibility.status };
}

/**
 * Get next actions for a film's festival strategy
 */
function getNextActions(filmKey) {
  const film = getFilm(filmKey);
  if (!film) return [];

  const records = getFestivalRecords(filmKey);
  const actions = [];

  // Check for category errors
  const mismatch = detectCategoryMismatch(film, film.genre || "unknown");
  if (mismatch.mismatch) {
    actions.push({
      action: "RESOLVE_CATEGORY_MISMATCH",
      priority: "high",
      message: `Resolve category mismatch: film is "${mismatch.filmGenre}" but festival section is "${mismatch.festivalSection}"`,
      completed: false,
    });
  }

  // Check for duplicate blocks
  if (records.length > 0) {
    const lastRecord = records[records.length - 1];
    if (lastRecord.result && lastRecord.result.toLowerCase() === "not selected") {
      actions.push({
        action: "DO_NOT_RESUBMIT",
        priority: "high",
        message: `Previous result was "Not Selected" at ${lastRecord.festivalName} ${lastRecord.edition}. Do not resubmit without significant changes.`,
        completed: false,
      });
    }
  }

  // Premiere guard check
  if (records.length > 0) {
    const premiereRisk = getPremiereRiskStatus(filmKey, records[0].festivalName, records[0].edition);
    if (premiereRisk.risk === "high") {
      actions.push({
        action: "PREMIERE_GUARD_APPROVAL",
        priority: "high",
        message: premiereRisk.note,
        completed: false,
      });
    }
  }

  // Eligibility inquiry if ambiguous
  const ineligibilityReasons = [];
  if (mismatch.mismatch) ineligibilityReasons.push("category mismatch");
  if (records.length > 0 && records.some(r => (r.result || "").toLowerCase() === "not selected")) {
    ineligibilityReasons.push("prior not-selected");
  }
  
  if (ineligibilityReasons.length > 0 && ineligibilityReasons.length < 3) {
    actions.push({
      action: "ELIGIBILITY_INQUIRY",
      priority: "medium",
      message: `Submit eligibility inquiry for: ${ineligibilityReasons.join(", ")}`,
      completed: false,
    });
  }

  // Waiver/free path assessment
  const hasWaiverPath = records.some(r => r.feePath && r.feePath.toLowerCase().includes("waiver"));
  if (hasWaiverPath) {
    actions.push({
      action: "PREFER_WAIVER_FREE",
      priority: "medium",
      message: "Waiver/free path available; prefer these routes when strategy value is similar",
      completed: false,
    });
  }

  return actions;
}

/**
 * Distinguish original cut vs genuine new recut/director's cut
 */
function versionStatus(filmKey, priorVersionKey = null) {
  const film = getFilm(filmKey);
  if (!film) return { status: "unknown", note: "Film not found" };

  if (!priorVersionKey) {
    return {
      status: "original",
      note: "No prior version referenced; this is the original cut.",
      hasPriorVersion: false,
    };
  }

  const priorFilm = getFilm(priorVersionKey);
  if (!priorFilm) {
    return { status: "unknown", note: "Prior version key not found in data layer" };
  }

  // Compare key version indicators
  const versionChanges = [];

  // Runtime changes
  if (film.runtime !== priorFilm.runtime) {
    versionChanges.push(`runtime: ${priorFilm.runtime} → ${film.runtime}`);
  }

  // Genre changes
  if (film.genre !== priorFilm.genre) {
    versionChanges.push(`genre: ${priorFilm.genre} → ${film.genre}`);
  }

  // Year changes
  if (film.year !== priorFilm.year) {
    versionChanges.push(`year: ${priorFilm.year} → ${film.year}`);
  }

  const hasSignificantChanges = versionChanges.length >= 2;
  
  if (hasSignificantChanges) {
    return {
      status: "recut",
      note: `Significant version changes detected: ${versionChanges.join("; ")}. Mark as genuine new recut/director's cut.`,
      hasPriorVersion: true,
      versionChanges,
    };
  }

  return {
    status: "original",
    note: "Minor differences only; likely the same original cut.",
    hasPriorVersion: true,
    versionChanges,
  };
}

export {
  determineFestivalStrategy,
  shouldSubmitToFestival,
  getNextActions,
  versionStatus,
  TARGET_PRIORITY,
};