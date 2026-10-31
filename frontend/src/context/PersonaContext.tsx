import React, { createContext, useContext, useState, useEffect } from "react"
import { UserPersona } from "@/types/api"
import { apiClient } from "@/services/apiClient"

export const DEFAULT_PERSONAS: UserPersona[] = [
  {
    id: "user-sarah",
    name: "Sarah Lin",
    email: "sarah.lin@company.com",
    role: "Management",
    department: "Executive Office",
    groups: ["Management", "Executive Board"],
    can_post_announcement: true,
  },
  {
    id: "user-david",
    name: "David Miller",
    email: "david.miller@company.com",
    role: "Branch Manager",
    department: "Battambang Branch",
    groups: ["All Branch Managers", "Operations"],
    can_post_announcement: false,
  },
  {
    id: "user-emily",
    name: "Emily Tan",
    email: "emily.tan@company.com",
    role: "Staff",
    department: "Finance & Accounting",
    groups: ["Finance Department"],
    can_post_announcement: false,
  },
  {
    id: "user-alex",
    name: "Alex Vorn",
    email: "alex.vorn@company.com",
    role: "Staff",
    department: "Customer Service",
    groups: ["Frontline Operations"],
    can_post_announcement: false,
  },
  {
    id: "user-admin",
    name: "Portal Admin",
    email: "admin@company.com",
    role: "Portal Admin",
    department: "IT Infrastructure",
    groups: ["Portal Admins", "Management"],
    can_post_announcement: true,
  },
]

interface PersonaContextType {
  activePersona: UserPersona
  setActivePersona: (persona: UserPersona) => void
  personas: UserPersona[]
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined)

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [activePersona, setActivePersonaState] = useState<UserPersona>(DEFAULT_PERSONAS[0])

  const setActivePersona = (persona: UserPersona) => {
    setActivePersonaState(persona)
    apiClient.setCurrentUser(persona.id)
  }

  useEffect(() => {
    apiClient.setCurrentUser(activePersona.id)
  }, [activePersona])

  return (
    <PersonaContext.Provider
      value={{
        activePersona,
        setActivePersona,
        personas: DEFAULT_PERSONAS,
      }}
    >
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona(): PersonaContextType {
  const context = useContext(PersonaContext)
  if (!context) {
    throw new Error("usePersona must be used within a PersonaProvider")
  }
  return context
}

