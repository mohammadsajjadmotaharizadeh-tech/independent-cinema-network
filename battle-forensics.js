/**
 * Battle of the Shadows Distribution Forensics
 * 
 * Creates the same forensic workflow independently for this film.
 * Seeded only with these currently verified selections:
 * - 79th Salerno Film Festival — Italy
 * - 10th Poppy Jasper International Film Festival — USA
 * 
 * Do NOT invent additional history.
 */

import { getFilm } from "./data-layer.js";
import { addFestivalRecord, checkSubmissionBlock, FORENSIC_CONFIDENCE } from "./festival-registry.js";
import { evaluateEligibility } from "./eligibility-engine.js";
import { recordForensic, getConfidenceSummary } from "./distribution-forensics.js";

const FILM_KEY = "battle";

/**
 * Current known verified festival data for Battle of the Shadows
 * Only these entries are seeded - do not invent additional history
 */
const KNOWN_VERIFIED_ENTRIES = [
  {
    festivalName: "79th Salerno Film Festival",
    edition: "2024", // Salerno 79th
    section: "Competition",
    submissionMethod: "Direct",
    result: "Selected",
    screening: "physical",
    premiereImpact: "international",
    sourceProof: "certificate",
    notes: "Verified competition selection - Italy"
  },
  {
    festivalName: "10th Poppy Jasper International Film Festival",
    edition: "2024", // Poppy Jasper 10th
    section: "Competition",
    submissionMethod: "Direct",
    result: "Selected",
    screening: "physical",
    premiereImpact: "international",
    sourceProof: "certificate",
    notes: "Verified competition selection - USA"
  }
];

/**
 * Initialise Battle of the Shadows forensic history
 * Seeded only with verified entries - do not add additional history
 */
function initialiseBattleHistory() {
  const results = [];
  
  for (const entry of KNOWN_VERIFIED_ENTRIES) {
    // Check if entry already exists
    const existing = getFestivalRecord(FILM_KEY, entry.festivalName, entry.edition);
    if (existing) {
      results.push({
        festival: entry.festivalName,
        status: "already_registered",
        message: "Entry already exists in registry - do not invent additional history"
      });
      continue;
    }
    
    // Add the verified entry only
    const addResult = addFestivalRecord(FILM_KEY, entry, { sourceDocuments: ["certificate.pdf"] });
    results.push({
      festival: entry.festivalName,
      status: addResult.type,
      message: addResult.message
    });
  }
  
  return results;
}

/**
 * Get verified selections for Battle of the Shadows
 */
function getVerifiedSelections() {
  const records = getFestivalRecords(FILM_KEY);
  return records.filter(r => 
    (r.result || "").toString().toLowerCase().includes("selected")
  );
}

/**
 * Get current outreach for Battle of the Shadows
 */
function getCurrentOutreach() {
  const records = getFestivalRecords(FILM_KEY);
  return records.filter(r => 
    !r.result || !(r.result || "").toString().toLowerCase().includes("selected")
  );
}

/**
 * Check if battle history has red flag or hold state
 */
function hasRiskState() {
  const summary = getConfidenceSummary(FILM_KEY);
  return summary.overallStatus === "red_flag" || summary.overallStatus === "hold";
}

/**
 * Get blockade decision for battle film + festival
 */
function getBattleBlockadeDecision(festivalName, edition) {
  return checkSubmissionBlock(FILM_KEY, festivalName, edition);
}

/**
 * Full forensic report for Battle of the Shadows
 */
function getBattleForensicReport() {
  return {
    filmKey: FILM_KEY,
    filmTitle: getFilm(FILM_KEY)?.title,
    seededEntries: KNOWN_VERIFIED_ENTRIES.length,
    verifiedSelections: getVerifiedSelections().length,
    currentOutreach: getCurrentOutreach().length,
    hasRiskState: hasRiskState(),
    blockadeDecision: getBattleBlockadeDecision("79th Salerno Film Festival", "2024"),
    forensicSummary: getConfidenceSummary(FILM_KEY),
    notes: "Only verified entries seeded - no additional history invented per Phase 4 rules"
  };
}

export {
  initialiseBattleHistory,
  getVerifiedSelections,
  getCurrentOutreach,
  hasRiskState,
  getBattleBlockadeDecision,
  getBattleForensicReport
};