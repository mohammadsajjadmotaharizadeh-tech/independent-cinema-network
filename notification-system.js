import { getRegistry, persistToDisk } from "./data-layer.js";

function nextId() {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getNotifications(filmKey) {
  const registry = getRegistry();
  return registry[`notifications_${filmKey}`] || [];
}

export function addNotification(filmKey, note) {
  const registry = getRegistry();
  const key = `notifications_${filmKey}`;
  if (!registry[key]) registry[key] = [];

  const notification = {
    id: nextId(),
    filmKey,
    type: note.type || "INFO",
    message: note.message || "",
    details: note.details || "",
    timestamp: note.timestamp || new Date().toISOString(),
    status: note.status || "unread",
    sourceUrl: note.sourceUrl || null,
    relatedFindingId: note.relatedFindingId || null,
    approvalRequired: note.approvalRequired || false,
    approvedBy: note.approvedBy || null,
    approvedAt: note.approvedAt || null,
    directorComment: note.directorComment || null,
  };

  registry[key].push(notification);
  persistToDisk();
  return notification;
}

export function markNotificationRead(filmKey, notificationId) {
  const registry = getRegistry();
  const key = `notifications_${filmKey}`;
  const notifications = registry[key] || [];
  const notif = notifications.find(n => n.id === notificationId);
  if (notif) {
    notif.status = "read";
    persistToDisk();
    return notif;
  }
  return null;
}

export function markAllRead(filmKey) {
  const registry = getRegistry();
  const key = `notifications_${filmKey}`;
  const notifications = registry[key] || [];
  notifications.forEach(n => { n.status = "read"; });
  persistToDisk();
  return notifications;
}

export function approveNotification(filmKey, notificationId, approvedBy, comment = "") {
  const registry = getRegistry();
  const key = `notifications_${filmKey}`;
  const notif = (registry[key] || []).find(n => n.id === notificationId);
  if (!notif) return { success: false, error: "Notification not found" };

  notif.status = "approved";
  notif.approvedBy = approvedBy;
  notif.approvedAt = new Date().toISOString();
  notif.directorComment = comment;
  persistToDisk();
  return notif;
}

export function rejectNotification(filmKey, notificationId, approvedBy, comment = "") {
  const registry = getRegistry();
  const key = `notifications_${filmKey}`;
  const notif = (registry[key] || []).find(n => n.id === notificationId);
  if (!notif) return { success: false, error: "Notification not found" };

  notif.status = "rejected";
  notif.approvedBy = approvedBy;
  notif.approvedAt = new Date().toISOString();
  notif.directorComment = comment;
  persistToDisk();
  return notif;
}

export function getPendingApprovals(filmKey) {
  const notifications = getNotifications(filmKey);
  return notifications.filter(
    n => n.approvalRequired && (n.status === "unread" || n.status === "read")
  );
}

export function getUnreadCount(filmKey) {
  return getNotifications(filmKey).filter(n => n.status === "unread").length;
}

export function getNotificationSummary(filmKey) {
  const notifications = getNotifications(filmKey);
  return {
    total: notifications.length,
    unread: getUnreadCount(filmKey),
    approvalsPending: getPendingApprovals(filmKey).length,
    byType: {
      INFO: notifications.filter(n => n.type === "INFO").length,
      WARNING: notifications.filter(n => n.type === "WARNING").length,
      APPROVAL_REQUEST: notifications.filter(n => n.type === "APPROVAL_REQUEST").length,
      BLOCKED: notifications.filter(n => n.type === "BLOCKED").length,
      RED_FLAG: notifications.filter(n => n.type === "RED_FLAG").length,
    },
  };
}
