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
    groups: ["Management", "Executive Board", "All Staff"],
    can_post_announcement: true,
  },
  {
    id: "user-david",
    name: "David Miller",
    email: "david.miller@company.com",
    role: "Branch Manager",
    department: "Battambang Branch",
    groups: ["All Branch Managers", "Operations", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-sreyneath",
    name: "Sreyneath Keo",
    email: "sreyneath.keo@company.com",
    role: "Branch Manager",
    department: "Siem Reap Branch",
    groups: ["All Branch Managers", "Operations", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-emily",
    name: "Emily Tan",
    email: "emily.tan@company.com",
    role: "Staff",
    department: "Finance & Accounting",
    groups: ["Finance Department", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-alex",
    name: "Alex Vorn",
    email: "alex.vorn@company.com",
    role: "Staff",
    department: "Customer Service",
    groups: ["Operations Team", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-sokha",
    name: "Sokha Chan",
    email: "sokha.chan@company.com",
    role: "Staff",
    department: "Human Resources",
    groups: ["Human Resources Department", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-dara",
    name: "Dara Pich",
    email: "dara.pich@company.com",
    role: "Staff",
    department: "Credit & Lending",
    groups: ["Credit & Lending", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-bopha",
    name: "Bopha Meng",
    email: "bopha.meng@company.com",
    role: "Staff",
    department: "Compliance & Legal",
    groups: ["Compliance & Legal", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-vichea",
    name: "Vichea Chea",
    email: "vichea.chea@company.com",
    role: "Staff",
    department: "IT Infrastructure",
    groups: ["IT & Cybersecurity", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-kalyan",
    name: "Kalyan Roeun",
    email: "kalyan.roeun@company.com",
    role: "Staff",
    department: "Marketing & Communications",
    groups: ["Marketing & Communications", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-rithy",
    name: "Rithy Sen",
    email: "rithy.sen@company.com",
    role: "Staff",
    department: "Internal Audit",
    groups: ["Internal Audit", "All Staff"],
    can_post_announcement: false,
  },
  {
    id: "user-sovann",
    name: "Sovann Kong",
    email: "sovann.kong@company.com",
    role: "Staff",
    department: "Operations Team",
    groups: ["Operations Team", "All Staff"],
    can_post_announcement: false,
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
