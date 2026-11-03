import React, { createContext, useContext, useState, useEffect } from "react"
import { UserPersona } from "@/types/api"
import { apiClient } from "@/services/apiClient"
import { DEFAULT_PERSONAS } from "@/constants/personas"

export { DEFAULT_PERSONAS }

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
