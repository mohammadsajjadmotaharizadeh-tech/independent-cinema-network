/**
 * Distribution Forensics - forensic history workflow
 * Tracks verified submissions, claimed/unverified submissions,
 * missing proof, selection/rejection, screening/premiere, distributor,
 * source document, and confidence level.
 * 
 * Six-field recovery mode:
 * 1. exact festival name
 * 2. edition/year
 * 3. section
 * 4. submission method
 * 5. result
 * 6. screening yes/no
 */

const FORENSIC_CONFIDENCE = {
  VERIFIED: "verified",      // Has proof/documentation
  CLAIMED: "claimed",        // Director statement, no docs
  UNVERIFIED: "unverified",  // Rumor/hearsay
  UNKNOWN: "unknown",        // No information
};

function forensicsKey(festivalName, edition, section, submissionMethod, result, screened) {
  return `${festivalName}|${edition}|${section}|${submissionMethod}|${result}|${screened}`;
}

function initForensicsState() {
  const registry = require("./data-layer").initFestivalRegistry();
  if (!registry._forensics) registry._forensics = {};
  return registry._forensics;
}

const forensics = initForensicsState();

/**
 * Record a forensic entry for a festival submission
 * Six-field recovery mode
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

  if (!forensics[key]) {
    forensics[key] = {
      filmKey,
      festivalName: entry.festivalName,
      edition: entry.edition || entry.year,
      section: entry.section || "unknown",
      submissionMethod: entry.submissionMethod || "unknown",
      result: entry.result || "unknown",
      screened: entry.screened !== undefined ? entry.screened : "unknown",
      confidence: FORENSIC_CONFIDENCE.VERIFIED,
      sourceDocuments: entry.sourceDocuments || [],
      notes: entry.notes || "",
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  forensics[key].lastUpdated = new Date().toISOString();
  return { success: true, key, entry: forensics[key] };
}

/**
 * Update confidence level for a forensic record
 */
function updateConfidence(festivalName, edition, section, submissionMethod, result, screened, confidenceLevel) {
  const key = forensicsKey(festivalName, edition, section, submissionMethod, result, screened);
  if (!forensics[key]) return { error: "record_not_found" };

  forensics[key].confidence = confidenceLevel;
  forensics[key].lastUpdated = new Date().toISOString();
  return { success: true, record: forensics[key] };
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
 * Get all forensic records
 */
function getAllForensics() {
  return Object.values(forensics);
}

/**
 * Six-field recovery mode - reconstruct history from fragmented data
 * Minimum fields required: festivalName, edition, section, submissionMethod, result, screened
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
    claimed: 0,
    unverified: 0,
    unknown: 0,
  };

  for (const r of records) {
    const c = r.confidence;
    if (c in counts) counts[c]++;
  }

  const dominantConfidence = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

  return {
    totalRecords: records.length,
    confidenceDistribution: counts,
    dominantConfidence,
    summary: `${dominantConfidence} confidence across ${records.length} recorded festival entries`,
  };
}

/**
 * Check if a forensic record has verified proof
 */
function hasVerifiedProof(festivalName, edition, section, submissionMethod, result, screened) {
  const key = forensicsKey(festivalName, edition, section, submissionMethod, result, screened);
  return forensics[key]?.confidence === FORENSIC_CONFIDENCE.VERIFIED;
}

export {
  recordForensic,
  updateConfidence,
  getFilmForensics,
  getAllForensics,
  recoverHistory,
  getConfidenceSummary,
  hasVerifiedProof,
  FORENSIC_CONFIDENCE,
  forensicsKey,
};