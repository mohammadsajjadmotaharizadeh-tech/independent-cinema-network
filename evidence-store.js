import { getFilmForensics, recordForensic, getEvidence } from "./distribution-forensics.js";
import { persistToDisk } from "./data-layer.js";

function validateEvidenceEntry(entry) {
  const required = ["filmKey", "festivalName", "edition"];
  for (const field of required) {
    if (!entry[field]) return { valid: false, error: `Missing required field: ${field}` };
  }
  return { valid: true };
}

export function addEvidence(filmKey, entry) {
  const validation = validateEvidenceEntry(entry);
  if (!validation.valid) return { success: false, error: validation.error };

  const result = recordForensic(filmKey, {
    festivalName: entry.festivalName,
    edition: entry.edition,
    section: entry.section || "unknown",
    submissionMethod: entry.submissionMethod || "unknown",
    result: entry.result || "unknown",
    screening: entry.screening || "unknown",
    sourceProof: entry.sourceProof || "none",
    sourceUrl: entry.sourceUrl || null,
    evidenceDoc: entry.evidenceDoc || null,
    discoveredAt: entry.discoveredAt || new Date().toISOString(),
    verifiedBy: entry.verifiedBy || "ai",
    confidenceLevel: entry.confidenceLevel,
    sourceDocuments: entry.sourceDocuments || [],
    notes: entry.notes || "",
  });

  persistToDisk();
  return result;
}

export function getFilmEvidence(filmKey) {
  return getFilmForensics(filmKey);
}

export function getFilmEvidenceByFestival(filmKey, festivalName, edition) {
  return getEvidence(filmKey, festivalName, edition);
}

export function updateEvidenceConfidence(filmKey, festivalName, edition, confidenceLevel) {
  const records = getFilmForensics(filmKey);
  const matching = records.filter(
    r => r.festivalName === festivalName && r.edition === edition
  );
  if (matching.length === 0) {
    return { success: false, error: "No matching forensic record found" };
  }
  const record = matching[0];
  const result = recordForensic(filmKey, {
    festivalName: record.festivalName,
    edition: record.edition,
    section: record.section,
    submissionMethod: record.submissionMethod,
    result: record.result,
    screening: record.screening,
    confidenceLevel,
    sourceUrl: record.sourceUrl,
    evidenceDoc: record.evidenceDoc,
    discoveredAt: record.discoveredAt,
    verifiedBy: record.verifiedBy,
    sourceDocuments: record.sourceDocuments,
    notes: record.notes,
  });
  persistToDisk();
  return result;
}

export function getLatestFindings(filmKey, limit = 20) {
  const records = getFilmForensics(filmKey);
  return records.slice(0, limit).map(r => ({
    festivalName: r.festivalName,
    edition: r.edition,
    section: r.section,
    result: r.result,
    confidence: r.confidence,
    sourceUrl: r.sourceUrl,
    discoveredAt: r.discoveredAt,
    verifiedBy: r.verifiedBy,
  }));
}
