import { usePersona } from "@/context/PersonaContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, User } from "lucide-react"

export function UserNav() {
  const { activePersona, setActivePersona, personas } = usePersona()

  const initials = activePersona.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 hover:opacity-85 transition-all duration-150 hover:scale-105 active:scale-95"
          title={activePersona.name}
        >
          <Avatar className="h-8 w-8 text-xs font-semibold">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-semibold leading-none">{activePersona.name}</p>
              <p className="text-xs text-muted-foreground">{activePersona.role}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Switch User Profile
          </div>
          {personas.map((persona) => {
            const isSelected = persona.id === activePersona.id
            return (
              <DropdownMenuItem
                key={persona.id}
                onClick={() => setActivePersona(persona)}
                className="flex items-center justify-between cursor-pointer py-2"
              >
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{persona.name}</span>
                    <span className="text-[10px] text-muted-foreground">{persona.role}</span>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

