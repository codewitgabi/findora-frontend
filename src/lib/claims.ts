import { authenticatedRequest } from "./auth";
import type { ClaimStatus, HandoverStatus, ItemStatus } from "./me";

/** How the viewer relates to a claim. The API never exposes names or contact details. */
export type ClaimRole = "claimant" | "reporter" | "admin";

export interface ClaimDetail {
  id: string;
  item_id: string;
  item_name: string;
  item_photo: string | null;
  item_report_type: "lost" | "found";
  item_location: string;
  item_status: ItemStatus;
  status: ClaimStatus;
  /** `null` for the reporter: only the claimant and admins see the evidence. */
  evidence_text: string | null;
  admin_note: string | null;
  pickup_location: string | null;
  handover_status: HandoverStatus | null;
  collected_at: string | null;
  created_at: string;
  my_role: ClaimRole;
  can_message: boolean;
  can_confirm_collection: boolean;
}

export interface ClaimMessage { id: string; sender_role: ClaimRole; body: string; is_mine: boolean; created_at: string; }

export function getClaim(id: string) {
  return authenticatedRequest<ClaimDetail>(`/claims/${id}`);
}
export function confirmCollection(id: string) {
  return authenticatedRequest<ClaimDetail>(`/claims/${id}/collected`, { method: "POST" });
}
export function listClaimMessages(id: string) {
  return authenticatedRequest<{ items: ClaimMessage[] }>(`/claims/${id}/messages`);
}
export function sendClaimMessage(id: string, body: string) {
  return authenticatedRequest<ClaimMessage>(`/claims/${id}/messages`, { method: "POST", body: { body } });
}

/** Display name for a participant role, given what kind of report was claimed. */
export function roleLabel(role: ClaimRole, reportType: "lost" | "found") {
  if (role === "admin") return "Admin";
  if (role === "reporter") return reportType === "found" ? "Finder" : "Reporter";
  return "Claimant";
}
