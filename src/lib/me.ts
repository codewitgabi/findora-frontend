import { authenticatedRequest, type RegisteredUser } from "./auth";
import { withQuery, type Page } from "./api";

export type ItemStatus = "pending" | "active" | "matched" | "resolved" | "rejected";
export type ClaimStatus = "pending" | "approved" | "rejected";

export interface MyReport { id: string; report_type: "lost" | "found"; item_name: string; last_seen_or_found_location: string; status: ItemStatus; created_at: string; }
export interface Summary { my_reports: number; active_matches: number; claims_pending: number; }
export interface MyClaim { id: string; item_id: string; item_name: string; item_location: string; evidence_text: string; status: ClaimStatus; admin_note: string | null; created_at: string; }
export interface AppNotification { id: string; type: "match" | "claim" | "status"; title: string; message: string; is_read: boolean; created_at: string; }
export interface NotificationPage extends Page<AppNotification> { unread_count: number; }

export const NOTIFICATIONS_CHANGED = "findora:notifications-changed";

export function updateProfile(input: { full_name?: string; phone?: string }) {
  return authenticatedRequest<RegisteredUser>("/me", { method: "PATCH", body: input });
}
export function changePassword(input: { current_password: string; new_password: string }) {
  return authenticatedRequest<null>("/me/change-password", { method: "POST", body: input });
}
export function getSummary() {
  return authenticatedRequest<Summary>("/me/summary");
}
export function listMyReports(page = 1, pageSize = 10) {
  return authenticatedRequest<Page<MyReport>>(withQuery("/me/reports", { page, page_size: pageSize }));
}
export function listMyClaims(page = 1) {
  return authenticatedRequest<Page<MyClaim>>(withQuery("/me/claims", { page }));
}
export function listNotifications(page = 1, pageSize = 20) {
  return authenticatedRequest<NotificationPage>(withQuery("/me/notifications", { page, page_size: pageSize }));
}
export async function markNotificationRead(id: string) {
  await authenticatedRequest<null>(`/me/notifications/${id}/read`, { method: "PATCH" });
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}
export async function markAllNotificationsRead() {
  await authenticatedRequest<null>("/me/notifications/read-all", { method: "POST" });
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}
