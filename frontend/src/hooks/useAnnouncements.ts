import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/services/apiClient"
import { usePersona } from "@/context/PersonaContext"

export function useAnnouncements(limit: number = 50, offset: number = 0) {
  const { activePersona } = usePersona()

  return useQuery({
    queryKey: ["announcements", activePersona.id, limit, offset],
    queryFn: () => apiClient.getAnnouncements(limit, offset),
  })
}

export function useAnnouncementDetails(id: number | null) {
  const { activePersona } = usePersona()

  return useQuery({
    queryKey: ["announcement", id, activePersona.id],
    queryFn: () => (id ? apiClient.getAnnouncementDetails(id) : Promise.reject("No ID")),
    enabled: !!id,
  })
}

export function usePostAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => apiClient.postAnnouncement(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useAuditLogs(limit: number = 50, offset: number = 0) {
  const { activePersona } = usePersona()

  return useQuery({
    queryKey: ["audit-logs", activePersona.id, limit, offset],
    queryFn: () => apiClient.getAuditLogs(limit, offset),
  })
}
