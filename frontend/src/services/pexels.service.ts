const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface PexelsPhoto {
  id: number;
  url: string;
  url_medium: string;
  photographer: string;
  alt: string;
}

export async function searchPexelsPhotos(query: string, perPage = 1): Promise<PexelsPhoto[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({ query: query.trim(), per_page: String(perPage) });
  try {
    const res = await fetch(`${BASE_URL}/media/photos?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.photos ?? [];
  } catch {
    return [];
  }
}
