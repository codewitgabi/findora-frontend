import { authenticatedRequest } from "./auth";
import { withQuery, type Page } from "./api";
import type { Category } from "./items";
import type { ClaimStatus, ItemStatus } from "./me";

export interface AdminStats { pending_reports: number; pending_claims: number; flagged_items: number; resolved_this_week: number; }
export interface AdminReport { id: string; item_name: string; report_type: "lost" | "found"; reporter_name: string; location: string; created_at: string; status: ItemStatus; }
export interface AdminClaim { id: string; item_id: string; item_name: string; item_location: string; claimant_name: string; claimant_email: string; evidence_text: string; status: ClaimStatus; created_at: string; }
export interface AdminUser { id: string; full_name: string; email: string; role: "user" | "admin"; account_status: "active" | "suspended"; created_at: string; report_count: number; }
export interface AuditLog { id: string; admin_name: string; action: string; target_type: "claim" | "report" | "user" | "category"; target_id: string; created_at: string; }

export function getAdminStats() {
  return authenticatedRequest<AdminStats>("/admin/stats");
}
export function listAdminReports(params: { status?: string; q?: string; page?: number; page_size?: number }) {
  return authenticatedRequest<Page<AdminReport>>(withQuery("/admin/reports", params));
}
export function setReportStatus(id: string, status: "active" | "rejected" | "resolved", note?: string) {
  return authenticatedRequest<AdminReport>(`/admin/reports/${id}/status`, { method: "PATCH", body: { status, note: note || undefined } });
}
export function listAdminClaims(params: { status?: string; page?: number; page_size?: number }) {
  return authenticatedRequest<Page<AdminClaim>>(withQuery("/admin/claims", params));
}
export function decideClaim(id: string, status: "approved" | "rejected", adminNote?: string) {
  return authenticatedRequest<null>(`/admin/claims/${id}`, { method: "PATCH", body: { status, admin_note: adminNote || undefined } });
}
export function listAdminUsers(params: { q?: string; page?: number }) {
  return authenticatedRequest<Page<AdminUser>>(withQuery("/admin/users", params));
}
export function setUserStatus(id: string, accountStatus: "active" | "suspended") {
  return authenticatedRequest<AdminUser>(`/admin/users/${id}`, { method: "PATCH", body: { account_status: accountStatus } });
}
export function createCategory(name: string) {
  return authenticatedRequest<Category>("/admin/categories", { method: "POST", body: { name } });
}
export function deleteCategory(id: string) {
  return authenticatedRequest<null>(`/admin/categories/${id}`, { method: "DELETE" });
}
export function listAuditLogs(params: { target_type?: string; page?: number }) {
  return authenticatedRequest<Page<AuditLog>>(withQuery("/admin/audit-logs", params));
}
