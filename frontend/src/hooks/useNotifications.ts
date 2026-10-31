import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/services/apiClient"
import { usePersona } from "@/context/PersonaContext"

export function useMyNotifications() {
  const { activePersona } = usePersona()

  return useQuery({
    queryKey: ["notifications", activePersona.id],
    queryFn: () => apiClient.getMyNotifications(),
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
  })
}

