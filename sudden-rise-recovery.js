/**
 * Sudden Rise Recovery Architecture
 * 
 * Builds the management workflow required to reconstruct:
 * - FilmFreeway history
 * - direct distributor submissions
 * - category errors
 * - premiere exposure
 * - current selections
 * - current outreach
 * - duplicate/HOLD/red-flag history
 * 
 * Supports a Strategy Reset after history reconstruction.
 */

import { getFilm } from "./data-layer.js";
import { getFestivalRecords, addFestivalRecord, checkSubmissionBlock, FORENSIC_CONFIDENCE } from "./festival-registry.js";
import { evaluateEligibility } from "./eligibility-engine.js";
import { getPremiereRiskStatus, PremiereType, canScreenWithoutBurning } from "./premiere-map.js";
import { detectCategoryMismatch } from "./category-detection.js";
import { recordForensic, getConfidenceSummary } from "./distribution-forensics.js";

const FILM_KEY = "sudden";

/**
 * Current known festival data for Sudden Rise (from film-data.json)
 * These are the verified entries that form the basis of recovery
 */
const KNOWN_FESTIVAL_ENTRIES = [
  {
    festivalName: "Yalda Short Film Festival",
    edition: "2025",
    section: "Short Film",
    submissionMethod: "FilmFreeway",
    result: "Selected",
    screening: "physical",
    premiereImpact: "world",
    sourceProof: "certificate",
    notes: "Certain selection - first confirmed festival acceptance"
  },
  {
    festivalName: "World Film Festival Kolkata",
    edition: "2025",
    section: "Short Film",
    submissionMethod: "FilmFreeway",
    result: "Selected",
    screening: "physical",
    premiereImpact: "international",
    sourceProof: "invitation",
    notes: "Premiere Audit required before screening"
  },
  {
    festivalName: "IFFJK 2026",
    edition: "2026",
    section: "Non-Competition",
    submissionMethod: "FilmFreeway",
    result: "Selected — Non-Competition",
    screening: "pending",
    premiereImpact: "international",
    sourceProof: "conditional",
    notes: "Screening approval conditional"
  },
  {
    festivalName: "Brussels Short Film Festival",
    edition: "2025",
    section: "Short Film",
    submissionMethod: "FilmFreeway",
    result: "Submitted / Pending",
    screening: "unknown",
    premiereImpact: "unknown",
    sourceProof: "waiver",
    notes: "Full fee waiver available"
  },
  {
    festivalName: "Flickers' RIIFF 2027",
    edition: "2027",
    section: "Short Film",
    submissionMethod: "FilmFreeway",
    result: "Submitted / Pending",
    screening: "unknown",
    premiereImpact: "unknown",
    sourceProof: "waiver",
    notes: "Full waiver"
  },
  {
    festivalName: "Uppsala Short Film Festival",
    edition: "Previous",
    section: "Short Film",
    submissionMethod: "Direct",
    result: "Selected",
    screening: "physical",
    premiereImpact: "regional",
    sourceProof: "certificate",
    notes: "Previous certain registration - now blocked due to prior submission"
  },
  {
    festivalName: "Tampere Film Festival",
    edition: "2025",
    section: "Short Film",
    submissionMethod: "FilmFreeway",
    result: "Not Selected",
    screening: "unknown",
    premiereImpact: "unknown",
    sourceProof: "none",
    notes: "BLOCK - previous Not Selected prevents resubmission"
  },
  {
    festivalName: "Go Short",
    edition: "2026",
    section: "Short Film",
    submissionMethod: "Unsolicited",
    result: "Not Eligible",
    screening: "unknown",
    premiereImpact: "unknown",
    sourceProof: "none",
    notes: "BLOCK - film ineligible due to year/runtime"
  },
  {
    festivalName: "Tirana International Film Festival",
    edition: "2025",
    section: "Short Film",
    submissionMethod: "FilmFreeway",
    result: "Closed",
    screening: "unknown",
    premiereImpact: "unknown",
    sourceProof: "none",
    notes: "BLOCK - festival program closed"
  }
];

/**
 * Reconstruct FilmFreeway history for Sudden Rise
 * Creates the initial registry entries from known data
 */
function reconstructFilmFreewayHistory() {
  const results = [];
  
  for (const entry of KNOWN_FESTIVAL_ENTRIES) {
    // Check if entry already exists
    const existing = getFestivalRecord(FILM_KEY, entry.festivalName, entry.edition);
    if (existing) {
      results.push({
        festival: entry.festivalName,
        status: "already_registered",
        existingResult: existing.result,
        message: "Entry already exists in registry"
      });
      continue;
    }
    
    // Add the entry
    const addResult = addFestivalRecord(FILM_KEY, entry, { sourceDocuments: [] });
    results.push({
      festival: entry.festivalName,
      status: addResult.type,
      message: addResult.message
    });
  }
  
  return results;
}

/**
 * Strategy Reset - reset and rebuild strategy after history reconstruction
 * Returns recommended strategy based on current state
 */
function strategyReset() {
  const records = getFestivalRecords(FILM_KEY);
  const eligibility = evaluateEligibility(FILM_KEY, {
    festivalName: "Yalda Short Film Festival",
    edition: "2025",
    section: "Short Film",
    result: "Selected",
    screening: "physical"
  });
  
  const categoryMismatch = detectCategoryMismatch(getFilm(FILM_KEY), "Short Film");
  const premiereRisk = getPremiereRiskStatus(FILM_KEY, "Yalda Short Film Festival", "2025");
  const blockade = checkSubmissionBlock(FILM_KEY, "Tampere Film Festival", "2025");
  
  const strategy = {
    overallStatus: "rebuilding",
    recommendations: [],
    restrictions: [],
    notes: ""
  };
  
  // Add restrictions based on current state
  if (categoryMismatch.mismatch) {
    strategy.restrictions.push({
      type: "CATEGORY_MISMATCH",
      message: `Category mismatch: ${categoryMismatch.details}`,
      severity: "high"
    });
  }
  
  if (premiereRisk.risk === "high") {
    strategy.restrictions.push({
      type: "PREMIERE_RISK",
      message: `Premiere risk: ${premiereRisk.note}`,
      severity: "high"
    });
  }
  
  if (blockade.type === "BLOCKED") {
    strategy.restrictions.push({
      type: "SUBMISSION_BLOCK",
      message: blockade.message,
      severity: "high"
    });
  }
  
  // Add recommendations based on eligibility
  if (eligibility.status === "ELIGIBLE" && strategy.restrictions.length === 0) {
    strategy.recommendations.push({
      type: "STRATEGY_RESET_READY",
      message: "Strategy reset complete - film is eligible for A/A+ targets with Premiere Guard active",
      priority: "high"
    });
  } else if (eligibility.status === "HOLD") {
    strategy.recommendations.push({
      type: "ELIGIBILITY_INQUIRY",
      message: `Eligibility inquiry required: ${eligibility.reasons.join(". ")}`,
      priority: "high"
    });
  } else {
    strategy.recommendations.push({
      type: "TARGET_A_PLUS_WAIVER",
      message: "Target A/A+ festivals with waiver/free routes when strategy value is similar",
      priority: "medium",
      note: "Premiere Guard active - no important screening without eligibility assessment"
    });
  }
  
  // Set overall notes
  strategy.notes = `Strategy reset after history reconstruction for ${FILM_KEY}. ` +
    `${records.length} festival records loaded. ` +
    `${eligibility.status} eligibility status. ` +
    `${strategy.restrictions.length} restrictions apply. ` +
    `${strategy.recommendations.length} recommendations generated.`;
  
  return strategy;
}

/**
 * Get current selections for Sudden Rise
 */
function getCurrentSelections() {
  const records = getFestivalRecords(FILM_KEY);
  const selections = records
    .filter(r => (r.result || "").toString().toLowerCase().includes("selected"))
    .sort((a, b) => {
      const order = ["Selected", "Selected — Non-Competition", "Submitted / Pending", "Not Selected", "Closed"];
      return order.indexOf(a.result) - order.indexOf(b.result);
    });
  
  return selections;
}

/**
 * Get current outreach (submitted but not yet decided)
 */
function getCurrentOutreach() {
  const records = getFestivalRecords(FILM_KEY);
  const outreach = records
    .filter(r => (r.result || "").toString().toLowerCase().includes("submitted") || (r.result || "").toString().toLowerCase().includes("pending"))
    .sort((a, b) => new Date(b._lastUpdated) - new Date(a._lastUpdated));
  
  return outreach;
}

/**
 * Get duplicate/HOLD/red-flag history
 */
function getRiskHistory() {
  const records = getFestivalRecords(FILM_KEY);
  const riskRecords = records.filter(r => {
    const conf = getConfidenceSummary(FILM_KEY).dominantConfidence;
    const hasHold = r._holdState;
    const hasRedFlag = getConfidenceSummary(FILM_KEY).overallStatus === "red_flag";
    return hasHold || hasRedFlag;
  });
  
  return {
    holdRecords: records.filter(r => r._holdState),
    redFlagRecords: records.filter(r => getConfidenceSummary(FILM_KEY).overallStatus === "red_flag"),
    riskLevel: getConfidenceSummary(FILM_KEY).overallStatus,
    totalRecords: records.length
  };
}

/**
 * Get category errors detected for Sudden Rise
 */
function getCategoryErrors() {
  const film = getFilm(FILM_KEY);
  const mismatch = detectCategoryMismatch(film, "Short Film");
  return {
    hasMismatch: mismatch.mismatch,
    details: mismatch.details,
    filmGenre: mismatch.filmGenre,
    festivalSection: mismatch.festivalSection
  };
}

/**
 * Get premiere exposure risk for Sudden Rise
 */
function getPremiereExposureRisk() {
  const risk = getPremiereRiskStatus(FILM_KEY, "Yalda Short Film Festival", "2025");
  const canScreen = canScreenWithoutBurning(FILM_KEY, {
    festivalName: "Yalda Short Film Festival",
    edition: "2025",
    screeningType: "physical"
  });
  
  return {
    premiereType: risk.risk,
    riskLevel: risk.risk,
    riskNote: risk.note,
    safeToScreen: canScreen.safeToScreen,
    recommendations: canScreen.reasons
  };
}

/**
 * Full recovery report for Sudden Rise
 */
function getRecoveryReport() {
  return {
    filmKey: FILM_KEY,
    filmTitle: getFilm(FILM_KEY)?.title,
    knownEntries: KNOWN_FESTIVAL_ENTRIES.length,
    currentSelections: getCurrentSelections().length,
    currentOutreach: getCurrentOutreach().length,
    riskHistory: getRiskHistory(),
    categoryErrors: getCategoryErrors(),
    premiereExposure: getPremiereExposureRisk(),
    strategyReset: strategyReset(),
    forensicSummary: getConfidenceSummary(FILM_KEY),
    recommendations: []
  };
}

export {
  reconstructFilmFreewayHistory,
  strategyReset,
  getCurrentSelections,
  getCurrentOutreach,
  getRiskHistory,
  getCategoryErrors,
  getPremiereExposureRisk,
  getRecoveryReport
};