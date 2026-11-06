import { authenticatedRequest } from "./auth";
import { withQuery, type Page } from "./api";
import type { ClaimStatus, HandoverStatus, ItemStatus } from "./me";

export interface Category { id: string; name: string; item_count?: number; }
export interface SearchFilters { q?: string; category?: string; color?: string; location?: string; date_from?: string; date_to?: string; report_type?: string; status?: string; }
export type CloseReason = "found_it" | "no_longer_needed" | "other" | "removed_by_admin" | "duplicate";
export interface SearchResult { id: string; item_name: string; report_type: "lost" | "found"; location: string; date: string; photo: string | null; score: number | null; }
export interface SimilarItem { id: string; item_name: string; location: string; score: number; }
export interface MatchedItem { id: string; item_name: string; report_type: "lost" | "found"; location: string; status: ItemStatus; }
export interface ItemDetail {
  id: string;
  report_type: "lost" | "found";
  item_name: string;
  category: string;
  color: string;
  description: string;
  photo: string | null;
  location: string;
  date: string;
  status: ItemStatus;
  condition: string | null;
  /** Where the finder left a found item. `null` for lost reports. */
  handed_to: string | null;
  /** Private: only returned to the owner and staff. */
  identifying_marks: string | null;
  close_reason: CloseReason | null;
  created_at: string;
  updated_at: string | null;
  is_owner: boolean;
  similar_items: SimilarItem[];
  /** Reports matching linked to this one. Only filled for the owner and admins. */
  matched_items: MatchedItem[];
  /** The approved claim on the viewer's own report. */
  handover: { claim_id: string; pickup_location: string | null; handover_status: HandoverStatus | null } | null;
  my_claim: { id: string; status: ClaimStatus; pickup_location: string | null; handover_status: HandoverStatus | null } | null;
}

// Seeded server-side; used when the category list can't be loaded so forms still work.
const FALLBACK_CATEGORIES = ["Bags", "Electronics", "ID cards & documents", "Keys", "Clothing", "Other"];

/** Category names for a select, keeping `current` selectable even if it was removed. */
export function categoryNames(loaded: { items: Category[] } | undefined, current?: string) {
  const names = loaded?.items.map((category) => category.name) ?? FALLBACK_CATEGORIES;
  return current && !names.includes(current) ? [current, ...names] : names;
}

export function listCategories() {
  return authenticatedRequest<{ items: Category[]; total: number }>("/categories");
}
export function searchItems(filters: SearchFilters, page = 1) {
  return authenticatedRequest<Page<SearchResult>>(withQuery("/items/search", { ...filters, page }));
}
export function searchItemsByImage(file: File, filters: SearchFilters) {
  const body = new FormData();
  body.append("file", file);
  for (const [key, value] of Object.entries(filters)) {
    if (value) body.append(key, value);
  }
  return authenticatedRequest<Page<SearchResult>>("/items/search/image", { method: "POST", body });
}
export function getItem(id: string) {
  return authenticatedRequest<ItemDetail>(`/items/${id}`);
}
/** Fields an owner can change. Send only what changed; `photo: null` removes a lost report's photo. */
export interface ItemUpdate {
  item_name?: string;
  category?: string;
  color?: string;
  description?: string;
  photo?: string | null;
  location?: string;
  date?: string;
  identifying_marks?: string | null;
  condition?: string;
  handed_to?: string;
}
export function updateItem(id: string, changes: ItemUpdate) {
  return authenticatedRequest<ItemDetail>(`/items/${id}`, { method: "PATCH", body: changes });
}
export function closeItem(id: string, reason: "found_it" | "no_longer_needed" | "other", note?: string) {
  return authenticatedRequest<ItemDetail>(`/items/${id}/close`, { method: "POST", body: { reason, note: note || undefined } });
}
export function submitClaim(itemId: string, evidenceText: string) {
  return authenticatedRequest<{ id: string; item_id: string; status: ClaimStatus; created_at: string }>(`/items/${itemId}/claims`, {
    method: "POST",
    body: { evidence_text: evidenceText },
  });
}
