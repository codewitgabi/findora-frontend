import { authenticatedRequest } from "./auth";

export interface UploadedImage {
  url: string;
  public_id: string;
  resource_type: string;
}

export interface LostItemInput {
  item_name: string;
  category: string;
  color: string;
  description: string;
  /** Optional: many owners have no photo of what they lost. */
  photo?: string | null;
  /** Private details that help verify a claim. Only the owner and staff see them. */
  identifying_marks?: string | null;
  last_seen_location: string;
  date_lost: string;
}

export interface LostItem extends LostItemInput {
  id: string;
  user_id: string;
  created_at: string;
}

export function uploadLostItemImage(file: File) {
  const body = new FormData();
  body.append("file", file);

  return authenticatedRequest<UploadedImage>("/lost-items/images", {
    method: "POST",
    body,
  });
}

export function createLostItem(input: LostItemInput) {
  return authenticatedRequest<LostItem>("/lost-items", {
    method: "POST",
    body: input,
  });
}
