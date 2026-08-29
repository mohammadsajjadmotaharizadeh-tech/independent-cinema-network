/**
 * Category Error Detection - Automatic mismatch detection between
 * film identity/genre and festival section/category
 */

/**
 * Film genre classification
 */
function classifyFilmGenre(genreString) {
  if (!genreString) return "unknown";

  const g = genreString.toLowerCase();

  // Magic realism, drama, narrative, fiction, short, tanz
  if (
    g.includes("رئالیسم جادویی") ||
    g.includes("درام") ||
    g.includes("قصیده") ||
    g.includes("طنز") ||
    g.includes("fikr") ||
    g.includes("short") &&
      !g.includes("مستند")
  ) {
    return "fiction";
  }

  // Documentary, mentest, susbtil
  if (
    g.includes("مستند") ||
    g.includes("documentary") ||
    g.includes("م") ||
    g.includes("obs") ||
    g.includes("short") && g.includes("مستند")
  ) {
    return "documentary";
  }

  // Animation, movaghagh, animent
  if (
    g.includes("\u0027anim") ||
    g.includes("\u0027animation\u0027") ||
    g.includes("\u0027anim\u0027") ||
    g.includes("فرمانAnimation") ||
    g.includes(" animation")
  ) {
    return "animation";
  }

  return "unknown";
}

/**
 * Festival section classification
 */
function classifyFestivalSection(sectionString) {
  if (!sectionString) return "unknown";

  const s = sectionString.toLowerCase();

  // Documentaries section
  if (
    s.includes("docs") ||
    s.includes("مستند") ||
    s.includes("documentary") ||
    s.includes("Mdm") ||
    s.includes("Mdf")
  ) {
    return "documentary";
  }

  // Animation section
  if (
    s.includes("anim") ||
    s.includes("\u0027animation\u0027") ||
    s.includes(" Animation") ||
    s.includes(" anim")
  ) {
    return "animation";
  }

  // Narrative/Fiction section (default)
  return "fiction";
}

/**
 * Detect category mismatch between film and festival
 * Returns { mismatch: boolean, filmGenre: string, festivalSection: string, details: string }
 */
export function detectCategoryMismatch(film, festivalSection) {
  const filmGenre = classifyFilmGenre(film.genre);
  const festivalSectionClass = classifyFestivalSection(festivalSection);

  let mismatch = false;
  let details = "";

  if (filmGenre !== "unknown" && festivalSectionClass !== "unknown" && filmGenre !== festivalSectionClass) {
    mismatch = true;
    details = `Category mismatch detected: film genre "${filmGenre}" does not match festival section "${festivalSectionClass}". ` +
      `Such records must NOT count as clean artistic rejection data. ` +
      `Recommend: verify category eligibility before submission, or request section reassignment.`;
  } else if (filmGenre === "unknown") {
    details = "Could not classify film genre from available metadata. " +
      "Recommend: add genre field to film profile for proper category matching.";
  } else {
    details = "No category mismatch. Film genre and festival section are compatible.";
  }

  return {
    mismatch,
    filmGenre,
    festivalSection: festivalSectionClass,
    details,
  };
}

/**
 * Batch detect category mismatches for all films and festival records
 */
export function batchDetectMismatches() {
  const films = require("./data-layer").getAllFilms();
  const registry = require("./festival-registry").getFestivalRecords;

  const results = [];

  for (const filmKey of Object.keys(films)) {
    const film = films[filmKey];
    const records = registry(filmKey);

    for (const record of records) {
      const mismatchResult = detectCategoryMismatch(film, record.section || record.festivalName || "unknown");

      results.push({
        filmKey,
        filmTitle: film.title,
        festivalName: record.festivalName || "unknown",
        edition: record.edition || "unknown",
        section: record.section || "unknown",
        ...mismatchResult,
      });
    }
  }

  return results;
}

/**
 * Get category error log entries
 */
export function getCategoryLog() {
  const data = require("./data-layer").getAllFilms();
  return data._categoryLog || {};
}

export { classifyFilmGenre, classifyFestivalSection };