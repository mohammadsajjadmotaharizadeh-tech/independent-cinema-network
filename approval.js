import { approveNotification, rejectNotification } from "./notification-system.js";

export default function handler(req, res) {
  const { filmKey, notificationId, action, comment } = req.body;

  if (!filmKey || !notificationId || !action) {
    return res.status(400).json({ error: "filmKey, notificationId, and action required" });
  }

  if (action === "approve") {
    const result = approveNotification(filmKey, notificationId, req.username || "director", comment || "");
    return res.status(200).json({ success: result.success, notification: result });
  }

  if (action === "reject") {
    const result = rejectNotification(filmKey, notificationId, req.username || "director", comment || "");
    return res.status(200).json({ success: result.success, notification: result });
  }

  return res.status(400).json({ error: "Invalid action. Use 'approve' or 'reject'." });
}