import { getNotifications, markNotificationRead, markAllRead, getPendingApprovals, getUnreadCount, getNotificationSummary } from "./notification-system.js";

export default function handler(req, res) {
  const { filmKey, action } = req.query;

  if (!filmKey) {
    return res.status(400).json({ error: "filmKey required" });
  }

  if (action === "get") {
    const notifications = getNotifications(filmKey);
    return res.status(200).json(notifications);
  }

  if (action === "unread-count") {
    const count = getUnreadCount(filmKey);
    return res.status(200).json({ unreadCount: count });
  }

  if (action === "summary") {
    const summary = getNotificationSummary(filmKey);
    return res.status(200).json(summary);
  }

  if (action === "mark-read") {
    const { notificationId } = req.body;
    const result = markNotificationRead(filmKey, notificationId);
    return res.status(200).json(result);
  }

  if (action === "mark-all-read") {
    const result = markAllRead(filmKey);
    return res.status(200).json(result);
  }

  if (action === "pending-approvals") {
    const approvals = getPendingApprovals(filmKey);
    return res.status(200).json(approvals);
  }

  return res.status(400).json({ error: "Invalid action. Use: get, unread-count, summary, mark-read, mark-all-read, pending-approvals" });
}