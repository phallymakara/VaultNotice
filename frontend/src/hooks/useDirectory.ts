import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/services/apiClient"

export function useDirectorySearch(query: string = "") {
  return useQuery({
    queryKey: ["directory-search", query],
    queryFn: () => apiClient.searchDirectory(query),
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ["current-user-profile", apiClient.getCurrentUser()],
    queryFn: () => apiClient.getCurrentUserProfile(),
  })
}

