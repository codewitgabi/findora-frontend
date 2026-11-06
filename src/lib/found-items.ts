import { authenticatedRequest } from "./auth";
import type { UploadedImage } from "./lost-items";

/** `handed_to` value meaning the finder kept the item (no office holds it). */
export const FINDER_KEEPS_IT = "I still have it";
export const HANDED_TO_OPTIONS = [
  { value: FINDER_KEEPS_IT, label: "I still have it" },
  { value: "Security office", label: "Handed to the security office" },
  { value: "Library front desk", label: "Handed to the library front desk" },
  { value: "Other office", label: "Handed to another campus office" },
] as const;

/** Human wording for where a found item is, e.g. "Held at Security office". */
export function heldAtLabel(handedTo: string, finderLabel = "Finder still has it") {
  return handedTo === FINDER_KEEPS_IT ? finderLabel : `Held at ${handedTo}`;
}

/** The office holding the item, or "" when the finder kept it. */
export function officeHolding(handedTo: string | null) {
  return handedTo && handedTo !== FINDER_KEEPS_IT ? handedTo : "";
}

export interface FoundItemInput {
  item_name: string;
  category: string;
  color: string;
  description: string;
  photo: string;
  found_location: string;
  date_found: string;
  condition: string;
  handed_to: string;
}

export interface FoundItem extends FoundItemInput {
  id: string;
  user_id: string;
  created_at: string;
}

export function uploadFoundItemImage(file: File) {
  const body = new FormData();
  body.append("file", file);

  return authenticatedRequest<UploadedImage>("/found-items/images", {
    method: "POST",
    body,
  });
}

export function createFoundItem(input: FoundItemInput) {
  return authenticatedRequest<FoundItem>("/found-items", {
    method: "POST",
    body: input,
  });
}
