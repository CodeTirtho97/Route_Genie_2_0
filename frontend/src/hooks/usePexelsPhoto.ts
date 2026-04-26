import { useQuery } from "@tanstack/react-query";
import { searchPexelsPhotos, type PexelsPhoto } from "../services/pexels.service";

export function usePexelsPhoto(query: string, enabled = true) {
  return useQuery<PexelsPhoto | null>({
    queryKey: ["pexels", query.trim().toLowerCase()],
    queryFn: async () => {
      const photos = await searchPexelsPhotos(query, 1);
      return photos[0] ?? null;
    },
    enabled: enabled && query.trim().length > 1,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
