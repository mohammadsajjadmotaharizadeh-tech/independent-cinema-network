/**
 * Distribution Forensics - unified history registry with evidence/confidence states
 * 
 * For each film maintain a unified history registry using these minimum fields:
 * - exact festival name
 * - edition/year
 * - section/category
 * - submission method
 * - result/status
 * - screening occurred: yes/no/unknown
 * 
 * Evidence/confidence states:
 * - VERIFIED: has proof/documentation
 * - CLAIMED_NEEDS_EVIDENCE: director statement, no docs
 * - UNKNOWN: no information
 * - HOLD: uncertain, review required
 * - RED_FLAG: known issue, block submissions
 * 
 * Never treat an unverified distributor claim as a confirmed submission.
 */

const FORENSIC_CONFIDENCE = {
  VERIFIED: "verified",
  CLAIMED_NEEDS_EVIDENCE: "claimed_needs_evidence",
  UNKNOWN: "unknown",
  HOLD: "hold",
  RED_FLAG: "red_flag",
};

let forensics = {};
try { forensics = require("./data-layer").getForensicsRef(); } catch(e) { forensics = {}; }

/**
 * Create a new forensics key from the 6 fields.
 */
function forensicsKey(festivalName, edition, section, submissionMethod, result, screened) {
  return `${festivalName}|${edition}|${section}|${submissionMethod}|${result}|${screened}`;
}

/**
 * Record a forensic entry for a festival submission (six-field recovery mode)
 * Extended with evidence: sourceUrl, evidenceDoc, discoveredAt
 */
function recordForensic(filmKey, entry) {
  const key = forensicsKey(
    entry.festivalName,
    entry.edition || entry.year,
    entry.section || "unknown",
    entry.submissionMethod || "unknown",
    entry.result || "unknown",
    entry.screened !== undefined ? entry.screened : "unknown"
  );

  // Determine initial confidence based on source proof
  let confidence = FORENSIC_CONFIDENCE.UNKNOWN;
  if (entry.sourceProof && entry.sourceProof.toString().trim() !== "") {
    confidence = FORENSIC_CONFIDENCE.VERIFIED;
  } else if (entry.confidenceLevel) {
    confidence = entry.confidenceLevel;
  }

  const existing = forensics[key];
  if (!existing) {
    forensics[key] = {
      filmKey,
      festivalName: entry.festivalName,
      edition: entry.edition || entry.year,
      section: entry.section || "unknown",
      submissionMethod: entry.submissionMethod || "unknown",
      result: entry.result || "unknown",
      screened: entry.screened !== undefined ? entry.screened : "unknown",
      confidence: confidence,
      sourceDocuments: entry.sourceDocuments || [],
      notes: entry.notes || "",
      sourceUrl: entry.sourceUrl || null,
      evidenceDoc: entry.evidenceDoc || null,
      discoveredAt: entry.discoveredAt || new Date().toISOString(),
      verifiedBy: entry.verifiedBy || null,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  } else {
    forensics[key].confidence = confidence;
    forensics[key].lastUpdated = new Date().toISOString();
    if (entry.sourceUrl) forensics[key].sourceUrl = entry.sourceUrl;
    if (entry.evidenceDoc) forensics[key].evidenceDoc = entry.evidenceDoc;
    if (entry.discoveredAt) forensics[key].discoveredAt = entry.discoveredAt;
    if (entry.verifiedBy) forensics[key].verifiedBy = entry.verifiedBy;
    if (entry.sourceDocuments) forensics[key].sourceDocuments = entry.sourceDocuments;
    if (entry.notes) forensics[key].notes = entry.notes;
  }
  return { success: true, key, entry: forensics[key] };
}

/**
 * Update confidence level for a forensic record
 */
function updateConfidence(festivalName, edition, section, submissionMethod, result, screened, confidenceLevel) {
  const key = forensicsKey(festivalName, edition, section, submissionMethod, result, screened);
  if (!forensics[key]) return { error: "record_not_found" };

  // Validate confidence level
  const validLevels = [
    FORENSIC_CONFIDENCE.VERIFIED,
    FORENSIC_CONFIDENCE.CLAIMED_NEEDS_EVIDENCE,
    FORENSIC_CONFIDENCE.UNKNOWN,
    FORENSIC_CONFIDENCE.HOLD,
    FORENSIC_CONFIDENCE.RED_FLAG,
  ];
  if (!validLevels.includes(confidenceLevel)) {
    return { error: "invalid_confidence_level", validLevels };
  }

  forensics[key].confidence = confidenceLevel;
  forensics[key].lastUpdated = new Date().toISOString();
  return { success: true, record: forensics[key] };
}

/**
 * Get evidence for a specific forensic record
 */
function getEvidence(filmKey, festivalName, edition) {
  const records = getFilmForensics(filmKey);
  const matching = records.filter(r => r.festivalName === festivalName && r.edition === edition);
  return matching.map(r => ({
    sourceUrl: r.sourceUrl,
    evidenceDoc: r.evidenceDoc,
    discoveredAt: r.discoveredAt,
    verifiedBy: r.verifiedBy,
    confidence: r.confidence,
    sourceDocuments: r.sourceDocuments,
  }));
}

/**
 * Get all forensic records for a film
 */
function getFilmForensics(filmKey) {
  return Object.values(forensics)
    .filter(f => f.filmKey === filmKey)
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
}

/**
 * Get all forensic records (across all films)
 */
function getAllForensics() {
  return Object.values(forensics);
}

/**
 * Six-field recovery mode - reconstruct history from fragmented data
 * Minimum required fields: festivalName, edition, section, submissionMethod, result, screened
 * Missing fields are filled with "unknown" and flagged
 */
function recoverHistory(filmKey, fragmentedData) {
  const requiredFields = [
    "festivalName",
    "edition",
    "section",
    "submissionMethod",
    "result",
    "screened",
  ];

  const missing = requiredFields.filter(f => !fragmentedData[f]);
  const filled = { ...fragmentedData };

  requiredFields.forEach(f => {
    if (!filled[f]) filled[f] = "unknown";
  });

  // Record the recovered entry
  recordForensic(filmKey, filled);

  return {
    success: true,
    recovered: filled,
    missingFields: missing,
    message: missing.length > 0
      ? `Recovered history with ${missing.length} field(s) filled as "unknown"`
      : "Complete history recovered from all six fields.",
  };
}

/**
 * Get confidence summary for a film's festival history
 */
function getConfidenceSummary(filmKey) {
  const records = getFilmForensics(filmKey);

  const counts = {
    verified: 0,
    claimedNeedsEvidence: 0,
    unknown: 0,
    hold: 0,
    redFlag: 0,
  };

  for (const r of records) {
    const c = r.confidence;
    if (c in counts) counts[c]++;
  }

  const dominantConfidence = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

  // Determine overall status
  let overallStatus = "unknown";
  if (counts.redFlag > 0) overallStatus = "red_flag";
  else if (counts.hold > 0) overallStatus = "hold";
  else if (counts.verified > 0 && counts.claimedNeedsEvidence === 0) overallStatus = "verified";
  else if (counts.verified > 0 && counts.claimedNeedsEvidence > 0) overallStatus = "mixed";
  else if (counts.claimedNeedsEvidence > 0 && counts.verified === 0) overallStatus = "claimed_needs_review";
  else overallStatus = "unknown";

  const summary = `${dominantConfidence} confidence across ${records.length} recorded festival entries`;

  return {
    totalRecords: records.length,
    confidenceDistribution: counts,
    dominantConfidence,
    overallStatus,
    summary,
  };
}

/**
 * Check if a forensic record has verified proof
 */
function hasVerifiedProof(festivalName, edition, section, submissionMethod, result, screened) {
  const key = forensicsKey(festivalName, edition, section, submissionMethod, result, screened);
  return forensics[key]?.confidence === FORENSIC_CONFIDENCE.VERIFIED;
}

/**
 * Check if a record should block submissions (HOLD or RED_FLAG)
 */
function shouldBlockSubmission(confidence) {
  return [FORENSIC_CONFIDENCE.HOLD, FORENSIC_CONFIDENCE.RED_FLAG].includes(confidence);
}

/**
 * Get blockade reason for a record
 */
function getBlockadeReason(record) {
  if (record.confidence === FORENSIC_CONFIDENCE.RED_FLAG) {
    return "RED_FLAG: known issue - do not submit without explicit override";
  }
  if (record.confidence === FORENSIC_CONFIDENCE.HOLD) {
    return "HOLD: uncertain history - review required before submission";
  }
  return null;
}

/**
 * Validate a forensic record meets minimum criteria
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

export {
  FORENSIC_CONFIDENCE,
  recordForensic,
  updateConfidence,
  getFilmForensics,
  getEvidence,
  getAllForensics,
  recoverHistory,
  getConfidenceSummary,
  hasVerifiedProof,
  shouldBlockSubmission,
  getBlockadeReason,
  validateRecord,
  forensicsKey,
};