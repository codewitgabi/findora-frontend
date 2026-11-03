import { authenticatedRequest } from "./auth";
import type { UploadedImage } from "./lost-items";

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
