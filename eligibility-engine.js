import { getFilm } from "./data-layer.js";

/**
 * Eligibility Engine - Rule-based evaluation
 * Returns structured status with reasons, missing data, risk level, recommended next action
 */

const ELIGIBLE = "ELIGIBLE";
const INELIGIBLE = "INELIGIBLE";
const HOLD = "HOLD";
const DUPLICATE = "DUPLICATE";
const PREMIERE_RISK = "PREMIERE_RISK";
const CATEGORY_ERROR = "CATEGORY_ERROR";
const DEADLINE_CLOSED = "DEADLINE_CLOSED";
const NEEDS_INQUIRY = "NEEDS_INQUIRY";

/**
 * Eligibility result structure
 */
function EligibilityResult(status, details) {
  this.status = status;
  this.reasons = details.reasons || [];
  this.missingData = details.missingData || [];
  this.riskLevel = details.riskLevel || "low";
  this.recommendedNextAction = details.recommendedNextAction || "review_required";
  this.categoryError = details.categoryError || false;
  this.premiereRisk = details.premiereRisk || false;
  this.duplicate = details.duplicate || false;
  this.hold = details.hold || false;
  this.blocked = details.blocked || false;
}

/**
 * Main eligibility evaluation function
 */
export function evaluateEligibility(filmKey, festivalRecord, options = {}) {
  const film = getFilm(filmKey);
  if (!film) {
    return new EligibilityResult(INELIGIBLE, {
      reasons: ["film_not_found"],
      missingData: ["film_data"],
      riskLevel: "critical",
      recommendedNextAction: "verify_film_data",
    });
  }

  const reasons = [];
  const missingData = [];
  let riskLevel = "low";
  let recommendedNextAction = "proceed";
  let categoryError = false;
  let premiereRisk = false;
  let duplicate = false;
  let hold = false;
  let blocked = false;

  // 1. Check for duplicate history
  const records = require("./festival-registry").getFestivalRecords(filmKey);
  for (const rec of records) {
    if (rec.festivalName.toLowerCase() === (festivalRecord.festivalName || "").toLowerCase() &&
        rec.edition === (festivalRecord.edition || festivalRecord.year || "unknown")) {
      if (rec.result && rec.result.toLowerCase() !== "not selected" && rec.result.toLowerCase() !== "blocked") {
        // Already selected - check if we should block
        duplicate = true;
        hold = true;
        reasons.push("Prior selection exists for this festival edition; HOLD until audit complete.");
        riskLevel = "medium";
        recommendedNextAction = "audit_prior_history";
      } else if (rec.result && rec.result.toLowerCase() === "not selected") {
        duplicate = true;
        blocked = true;
        reasons.push(`Prior submission was "Not Selected" at this festival edition. Blocking repeat submission.`);
        riskLevel = "high";
        recommendedNextAction = "do_not_resubmit";
      }
      break;
    }
  }

  // 2. Category error detection
  if (!categoryError) {
    const filmGenre = (film.genre || "").toLowerCase();
    const festivalSection = (festivalRecord.section || "").toLowerCase();

    const genreCategories = {
      fiction: ["drama", "narrative", "feature", "magic realism", "tragicomedy"],
      documentary: ["documentary", "doc", "observational", "essay"],
      animation: ["animation", "animated", "short animation", "cel animation"],
    };

    let filmCategory = "unknown";
    let festivalCategory = "unknown";

    if (filmGenre.includes("ژانر") || filmGenre.includes("drama") || filmGenre.includes("كomedian") || filmGenre.includes("siyah") || filmGenre.includes("adab")) {
      filmCategory = "fiction";
    } else if (filmGenre.includes("مستند") || filmGenre.includes("documentary") || filmGenre.includes("observational")) {
      filmCategory = "documentary";
    } else if (filmGenre.includes("\u0027anim\u0027") || filmGenre.includes("animation")) {
      filmCategory = "animation";
    }

    if (festivalSection.includes("docs") || festivalSection.includes("مستند") || festivalSection.includes("documentary")) {
      festivalCategory = "documentary";
    } else if (festivalSection.includes("anim") || festivalSection.includes("animation")) {
      festivalCategory = "animation";
    } else {
      festivalCategory = "fiction";
    }

    if (filmCategory !== "unknown" && festivalCategory !== "unknown" && filmCategory !== festivalCategory) {
      categoryError = true;
      reasons.push(`Category mismatch: film is "${filmCategory}" but festival section is "${festivalCategory}". Such records must NOT count as clean artistic rejection data.`);
      riskLevel = "high";
      recommendedNextAction = "verify_category_before_submission";
    }
  }

  // 3. Year cutoff check
  const filmYear = film.year || "unknown";
  const filmCompletionYear = parseInt(filmYear.replace("۲۰", "20").replace("۲۰۲", "202").replace(/\D/g, ""), 10) || 0;
  const currentYear = new Date().getFullYear();

  if (filmCompletionYear > currentYear + 1) {
    reasons.push(`Film completion year (${filmYear}) appears to be in the future. Verify year metadata.`);
    missingData.push("film_year");
    riskLevel = "medium";
  }

  // 4. Runtime limit check
  const runtime = film.runtime || "0:00";
  const runtimeMinutes = parseRuntime(runtime);
  if (runtimeMinutes > 40 && !options?.allowLongForm) {
    reasons.push(`Runtime ${runtime} exceeds typical short film festival limit of 40 minutes.`);
    riskLevel = "medium";
    recommendedNextAction = "check_festival_runtime_policy";
  }

  // 5. Premiere requirements check
  const screeningStatus = (festivalRecord && festivalRecord.screening) ? festivalRecord.screening.toLowerCase() : "";
  const premiereType = determinePremiereType(filmKey, screeningStatus);

  if (premiereType === "world" || premiereType === "international") {
    // Check if this would burn a premiere opportunity
    if (!options?.ignorePremiereGuard) {
      premiereRisk = true;
      reasons.push(`Premiere risk: This screening may affect future premiere eligibility. Premiere Guard active.`);
      riskLevel = "high";
      recommendedNextAction = "premiere_audit_before_screening";
    }
  }

  // 6. Deadline check
  const deadline = festivalRecord && festivalRecord.deadline ? new Date(festivalRecord.deadline) : null;
  if (deadline && new Date() > deadline) {
    reasons.push("Festival deadline has passed.");
    DEADLINE_CLOSED;
    if (!blocked) {
      riskLevel = "high";
      recommendedNextAction = "target_next_cycle";
    }
  }

  // 7. Previous submission restrictions
  if (!blocked) {
    const hasPriorSubmission = records.some(
      r => r.submissionMethod && r.result && r.result.toLowerCase() !== "not selected" && r.result.toLowerCase() !== "blocked"
    );
    if (hasPriorSubmission && !options?.allowPriorSubmission) {
      reasons.push("Film has had prior submissions; eligibility may be restricted depending on festival rules.");
      riskLevel = "medium";
      recommendedNextAction = "review_festival_prior_submission_policy";
    }
  }

  // 8. Waiver/free path classification
  const waiverPaths = ["waiver", "free", "free first"];
  if (waiverPaths.some(p => (festivalRecord && festivalRecord.feePath && festivalRecord.feePath.toLowerCase().includes(p)))) {
    // Waiver paths are eligible by default but flagged
    if (riskLevel === "low") {
      riskLevel = "medium";
      recommendedNextAction = "verify_waiver_eligibility";
    }
  }

  // Determine final status
  let status;
  if (blocked) status = DUPLICATE;
  else if (categoryError) status = CATEGORY_ERROR;
  else if (hold) status = HOLD;
  else if (duplicate) status = DUPLICATE;
  else if (premiereRisk && riskLevel === "high") status = PREMIERE_RISK;
  else if (deadline && new Date() > new Date(deadline)) status = DEADLINE_CLOSED;
  else if (reasons.length > 0 && riskLevel === "medium") status = HOLD;
  else status = ELIGIBLE;

  const result = new EligibilityResult(status, {
    reasons,
    missingData,
    riskLevel,
    recommendedNextAction,
    categoryError,
    premiereRisk,
    duplicate,
    hold,
    blocked,
  });

  // Store the decision in history
  decisionHistory[`${filmKey}-${festivalRecord.festivalName || "unknown"}-${festivalRecord.edition || "unknown"}`] = {
    filmKey,
    festivalName: festivalRecord.festivalName || "unknown",
    edition: festivalRecord.edition || festivalRecord.year || "unknown",
    status: status,
    reasons: result.reasons,
    evaluatedAt: new Date().toISOString(),
    options,
  };

  return result;
}

/**
 * Parse runtime string like "16:50" to minutes
 */
function parseRuntime(runtime) {
  if (!runtime) return 0;
  const parts = String(runtime).split(":");
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return parseInt(runtime, 10) || 0;
}

/**
 * Determine premiere type from film and screening status
 */
function determinePremiereType(filmKey, screeningStatus) {
  // In a full implementation, this would check the film's premiere history
  // For now, return based on screening status
  if (!screeningStatus) return "unknown";
  if (screeningStatus.includes("world") || screeningStatus.includes("کودكاي") || screeningStatus.includes("перв")) return "world";
  if (screeningStatus.includes("international") || screeningStatus.includes(" بین‌جهانی")) return "international";
  if (screeningStatus.includes("regional") || screeningStatus.includes(" منطقه")) return "regional";
  if (screeningStatus.includes("national") || screeningStatus.includes(" کشور")) return "national";
  if (screeningStatus.includes("online") || screeningStatus.includes(" آنلاین")) return "online_public";
  if (screeningStatus.includes("physical") || screeningStatus.includes(" فیزیکی")) return "physical_public";
  if (screeningStatus.includes("private") || screeningStatus.includes(" خصوصی")) return "private_internal";
  return "unknown";
}

/** 
 * Eligibility status constants
 */
export { ELIGIBLE, INELIGIBLE, HOLD, DUPLICATE, PREMIERE_RISK, CATEGORY_ERROR, DEADLINE_CLOSED, NEEDS_INQUIRY };

/**
 * Helper to check if status is a terminal blocking state
 */
export function isTerminalStatus(status) {
  return [DUPLICATE, CATEGORY_ERROR, INELIGIBLE, DEADLINE_CLOSED].includes(status);
}

/**
 * Helper to get priority order for statuses
 */
export function statusPriority(status) {
  const order = [INELIGIBLE, CATEGORY_ERROR, DEADLINE_CLOSED, DUPLICATE, PREMIERE_RISK, HOLD, ELIGIBLE];
  return order.indexOf(status);
}