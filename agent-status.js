import { getAgentStatus } from "./agent-state.js";
import { getNotifications, getUnreadCount, getNotificationSummary } from "./notification-system.js";
import { getFilmForensics, getEvidence } from "./distribution-forensics.js";

export default function handler(req, res) {
  const { filmKey } = req.query;

  if (!filmKey) {
    return res.status(400).json({ error: "filmKey required" });
  }

  const status = getAgentStatus(filmKey);
  const notifications = getNotifications(filmKey);
  const unreadCount = getUnreadCount(filmKey);
  const summary = getNotificationSummary(filmKey);

  const filmForensics = getFilmForensics(filmKey);

  return res.status(200).json({
    agentStatus: status,
    notifications,
    unreadCount,
    notificationSummary: summary,
    forensicSummary: {
      totalRecords: filmForensics.length,
      dominantConfidence: filmForensics.reduce(
        (acc, r) => {
          acc[r.confidence] = (acc[r.confidence] || 0) + 1;
          return acc;
        },
        {}
      ),
    },
  });
}