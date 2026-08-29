import { initPremiereMap, addFestivalRecord as addFestRecord } from "./festival-registry.js";
const premiereMap = initPremiereMap();

/**
 * Premiere exposure types
 */
const PremiereType = {
  WORLD: "world",
  INTERNATIONAL: "international",
  REGIONAL: "regional",
  NATIONAL: "national",
  ONLINE_PUBLIC: "online_public",
  PHYSICAL_PUBLIC: "physical_public",
  PRIVATE_INTERNAL: "private_internal",
  UNKNOWN: "unknown",
};

/**
 * Screening status values
 */
const ScreeningStatus = {
  SCREENED: "screened",
  PENDING: "pending",
  NOT_SCREENED: "not_screened",
  CANCELLED: "cancelled",
};

/**
 * Add premiere mapping from a festival record
 */
function addPremiereMapping(filmKey, festivalRecord) {
  const festivalName = festivalRecord.festivalName || "unknown";
  const edition = festivalRecord.edition || festivalRecord.year || "unknown";
  const screening = festivalRecord.screening || "unknown";

  // Determine premiere type
  let premiereType = PremiereType.UNKNOWN;
  const screeningLower = String(screening).toLowerCase();

  if (screeningLower.includes("world") || screeningLower.includes("перв") || screeningLower.includes("first")) {
    premiereType = PremiereType.WORLD;
  } else if (screeningLower.includes("international") || screeningLower.includes(" بین‌جهانی") || screeningLower.includes("intern")) {
    premiereType = PremiereType.INTERNATIONAL;
  } else if (screeningLower.includes("regional") || screeningLower.includes(" منطقه")) {
    premiereType = PremiereType.REGIONAL;
  } else if (screeningLower.includes("national") || screeningLower.includes(" کشور")) {
    premiereType = PremiereType.NATIONAL;
  } else if (screeningLower.includes("online") || screeningLower.includes(" آنلاین")) {
    premiereType = PremiereType.ONLINE_PUBLIC;
  } else if (screeningLower.includes("physical") || screeningLower.includes(" فیزیکی") || screeningLower.includes(" cinema")) {
    premiereType = PremiereType.PHYSICAL_PUBLIC;
  } else if (screeningLower.includes("private") || screeningLower.includes(" خصوصی")) {
    premiereType = PremiereType.PRIVATE_INTERNAL;
  }

  const key = `${filmKey}-${festivalName}-${edition}`;

  premiereMap[key] = {
    filmKey,
    festivalName,
    edition,
    premiereType,
    screening: screening,
    screened: screening !== "unknown" && !screening.toLowerCase().includes("pending"),
    date: festivalRecord.screeningDate,
    premiereImpact: festivalRecord.premiereImpact || "unknown",
    sourceProof: festivalRecord.sourceProof || "none",
    lastUpdated: new Date().toISOString(),
  };

  return premiereMap[key];
}

/**
 * Get premiere mapping
 */
function getPremiereMapping(filmKey, festivalName, edition) {
  const key = `${filmKey}-${festivalName}-${edition}`;
  return premiereMap[key] || null;
}

/**
 * Get all premiere mappings for a film
 */
function getAllPremiereMappings(filmKey) {
  return Object.values(premiereMap).filter(m => m.filmKey === filmKey);
}

/**
 * Calculate whether a planned screening may burn future festival eligibility
 * @param {string} filmKey - The film key
 * @param {object} plannedScreening - {festivalName, edition, screeningType, date}
 * @returns {object} - { safeToScreen, riskLevel, reasons }
 */
function canScreenWithoutBurning(filmKey, plannedScreening) {
  const mappings = getAllPremiereMappings(filmKey);
  const { festivalName, edition, screeningType } = plannedScreening;

  let hasPremiereConflict = false;
  let riskLevel = "low";
  const reasons = [];

  // Check if this film already has a world/international premiere
  for (const m of mappings) {
    if (m.premiereType === PremiereType.WORLD || m.premiereType === PremiereType.INTERNATIONAL) {
      hasPremiereConflict = true;

      // If the new screening is the same or lower tier, it's safe
      if (
        m.premiereType === PremiereType.WORLD ||
        (PremiereType.INTERNATIONAL && screeningType !== PremiereType.WORLD)
      ) {
        // New screening would burn the world/intern premiere
        hasPremiereConflict = true;
        riskLevel = "high";
        reasons.push(
          `Film already has ${m.premiereType} premiere at festival edition ${m.edition}. ` +
          `Planned ${screeningType} screening would burn this premiere eligibility.`
        );
      }
    }
  }

  // If no prior premiere, any screening establishes a premiere
  if (!hasPremiereConflict && screeningType !== PremiereType.PRIVATE_INTERNAL) {
    // It's safe to screen - this will be the first premiere
    reasons.push("No prior premiere established; this screening will set the premiere baseline.");
    return { safeToScreen: true, riskLevel, reasons };
  }

  if (hasPremiereConflict) {
    // Check if there's a waiver/free route that could salvage
    for (const m of mappings) {
      if (m.premiereImpact && m.premiereImpact.toLowerCase().includes("waiver")) {
        riskLevel = "medium";
        reasons.push("Premiere conflict, but waiver/free route may be available for this festival tier.");
        break;
      }
    }
  }

  return { safeToScreen: riskLevel !== "high", riskLevel, reasons };
}

/**
 * Get premiere risk status for a film at a festival
 */
function getPremiereRiskStatus(filmKey, festivalName, edition) {
  const mapping = getPremiereMapping(filmKey, festivalName, edition);
  if (!mapping) return { type: "unknown", risk: "none", note: "No prior premiere data for this festival." };

  if (mapping.premiereType === PremiereType.WORLD || mapping.premiereType === PremiereType.INTERNATIONAL) {
    return {
      type: mapping.premiereType,
      risk: "high",
      note: `This is a ${mapping.premiereType} premiere. Screening here may burn future elite festival eligibility.`,
    };
  }

  if (mapping.premiereType === PremiereType.REGIONAL || mapping.premiereType === PremiereType.NATIONAL) {
    return {
      type: mapping.premiereType,
      risk: "medium",
      note: `Regional/national premiere. Screening is lower risk than world/international but still affects trajectory.`,
    };
  }

  if (mapping.premiereType === PremiereType.ONLINE_PUBLIC) {
    return {
      type: mapping.premiereType,
      risk: "medium",
      note: `Online public screening. May have premiere implications depending on festival policy.`,
    };
  }

  if (mapping.premiereType === PremiereType.PRIVATE_INTERNAL) {
    return {
      type: mapping.premiereType,
      risk: "low",
      note: "Private/internal screening. No premiere risk.",
    };
  }

  return { type: mapping.premiereType, risk: "low", note: "Unknown premiere type." };
}

export {
  PremiereType,
  ScreeningStatus,
  addPremiereMapping,
  getPremiereMapping,
  getAllPremiereMappings,
  canScreenWithoutBurning,
  getPremiereRiskStatus,
};