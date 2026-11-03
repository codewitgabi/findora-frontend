import { authenticatedRequest } from "./auth";
import { withQuery, type Page } from "./api";
import type { ClaimStatus, ItemStatus } from "./me";

export interface Category { id: string; name: string; item_count?: number; }
export interface SearchFilters { q?: string; category?: string; color?: string; location?: string; date_from?: string; date_to?: string; report_type?: string; }
export interface SearchResult { id: string; item_name: string; report_type: "lost" | "found"; location: string; date: string; photo: string | null; score: number | null; }
export interface SimilarItem { id: string; item_name: string; location: string; score: number; }
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
  created_at: string;
  is_owner: boolean;
  similar_items: SimilarItem[];
  my_claim: { id: string; status: ClaimStatus } | null;
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
export function submitClaim(itemId: string, evidenceText: string) {
  return authenticatedRequest<{ id: string; item_id: string; status: ClaimStatus; created_at: string }>(`/items/${itemId}/claims`, {
    method: "POST",
    body: { evidence_text: evidenceText },
  });
}
