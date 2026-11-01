import { useState, useEffect, useCallback } from "react"

export interface RouteState {
  tab: "announcements" | "templates" | "audit"
  announcementId: number | null
}

export function parsePath(pathname: string): RouteState {
  const cleanPath = pathname.replace(/^\/+|\/+$/g, "")
  const parts = cleanPath.split("/")

  if (parts[0] === "announcements" && parts[1]) {
    const id = parseInt(parts[1], 10)
    if (!isNaN(id)) {
      return { tab: "announcements", announcementId: id }
    }
  }

  if (parts[0] === "templates") {
    return { tab: "templates", announcementId: null }
  }

  if (parts[0] === "audit") {
    return { tab: "audit", announcementId: null }
  }

  return { tab: "announcements", announcementId: null }
}

export function useAppRouter() {
  const [route, setRoute] = useState<RouteState>(() => parsePath(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePath(window.location.pathname))
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const navigateToAnnouncement = useCallback((id: number) => {
    const targetPath = `/announcements/${id}`
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath)
      setRoute({ tab: "announcements", announcementId: id })
    }
  }, [])

  const navigateToAnnouncementsList = useCallback(() => {
    const targetPath = "/"
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath)
      setRoute({ tab: "announcements", announcementId: null })
    }
  }, [])

  const navigateToTab = useCallback((tab: "announcements" | "templates" | "audit") => {
    const targetPath = tab === "announcements" ? "/" : `/${tab}`
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath)
      setRoute({ tab, announcementId: null })
    }
  }, [])

  return {
    activeTab: route.tab,
    selectedAnnouncementId: route.announcementId,
    navigateToAnnouncement,
    navigateToAnnouncementsList,
    navigateToTab,
  }
}
