import { getAgentStatus, incrementRunCount, setRunning, setError, canRun } from "./agent-state.js";
import { getFilm } from "./data-layer.js";
import { determineFestivalStrategy } from "./agent-decision-layer.js";
import { addFestivalRecord } from "./festival-registry.js";
import { recordForensic, getFilmForensics } from "./distribution-forensics.js";
import { getNotifications, addNotification, markNotificationRead, approveNotification, rejectNotification, getPendingApprovals, getUnreadCount, getNotificationSummary } from "./notification-system.js";
import { FoRENSIC_CONFIDENCE } from "./distribution-forensics.js";

export default function handler(req, res) {
  const { filmKey, mode = "full" } = req.query;

  if (!filmKey) {
    return res.status(400).json({ error: "filmKey required" });
  }

  // Enforce cooldown - if another run is in progress, reject
  const canRunResult = canRun(filmKey);
  if (!canRunResult.allowed) {
    return res.status(429).json({
      status: "cooldown",
      reason: canRunResult.reason,
      filmKey,
    });
  }

  // Mark as running
  setRunning(filmKey, "researching");

  try {
    const film = getFilm(filmKey);
    if (!film) {
      setError(filmKey, "film_not_found");
      return res.status(404).json({
        status: "error",
        reason: "Film not found in data layer",
        filmKey,
      });
    }

    const notifications = getNotifications(filmKey);
    const unreadCount = getUnreadCount(filmKey);

    // Phase A: Research (AI advisory, deterministic decisions separate)
    const researchFindings = [];

    // Phase B: Deterministic evaluation using existing rule engines
    const eligibility = determineFestivalStrategy(filmKey, { mode });

    // Store findings with evidence
    if (eligibility.restrictions.length > 0) {
      const restriction = eligibility.restrictions[0];
      addNotification(filmKey, {
        type: "BLOCKED",
        message: restriction.message,
        details: `Restriction: ${restriction.type}`,
        status: "unread",
        relatedFindingId: restriction.type,
        approvalRequired: false,
      });
    }

    if (eligibility.recommendations.length > 0) {
      const rec = eligibility.recommendations[0];
      addNotification(filmKey, {
        type: "INFO",
        message: rec.message,
        details: `Recommendation: ${rec.type}`,
        status: "unread",
        relatedFindingId: rec.type,
        approvalRequired: false,
      });
    }

    // Phase C: Check for RED_FLAG forensic state
    const records = getFilmForensics(filmKey);
    const redFlagRecords = records.filter(r => r.confidence === FoRENSIC_CONFIDENCE.RED_FLAG);
    if (redFlagRecords.length > 0) {
      addNotification(filmKey, {
        type: "RED_FLAG",
        message: `Forensic RED_FLAG: ${redFlagRecords.length} record(s) with known issues`,
        details: "All submissions blocked until human review",
        status: "unread",
        approvalRequired: true,
        relatedFindingId: "red_flag",
      });
    }

    // Phase D: Check for pending approvals
    const pendingApprovals = getPendingApprovals(filmKey);
    if (pendingApprovals.length > 0) {
      addNotification(filmKey, {
        type: "APPROVAL_REQUEST",
        message: `${pendingApprovals.length} approval(s) pending`,
        details: "Human approval required before proceeding",
        status: "unread",
        approvalRequired: true,
        relatedFindingId: "approval_queue",
      });
    }

    // Increment run count and mark complete
    incrementRunCount(filmKey);

    const status = getAgentStatus(filmKey);

    return res.status(200).json({
      status: status.status,
      phase: status.phase,
      filmKey,
      findings: eligibility.restrictions.length + eligibility.recommendations.length,
      notifications: unreadCount,
      ready: canRunResult.allowed,
    });

  } catch (error) {
    setError(filmKey, error.message);
    return res.status(500).json({
      status: "error",
      reason: error.message,
      filmKey,
    });
  }
}