import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/services/apiClient"

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => apiClient.getTemplates(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
