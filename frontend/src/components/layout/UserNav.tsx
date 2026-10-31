import { usePersona } from "@/context/PersonaContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { Check, ShieldCheck, User } from "lucide-react"

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

      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold leading-none">{activePersona.name}</p>
                {activePersona.can_post_announcement && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                    <ShieldCheck className="h-2.5 w-2.5 mr-0.5 text-primary" /> Management
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-none text-muted-foreground">{activePersona.email}</p>
              <p className="text-[11px] text-muted-foreground">
                {activePersona.department}
              </p>
            </div>
          </div>

          {activePersona.groups.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/60">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">ASSIGNED GROUPS</p>
              <div className="flex flex-wrap gap-1">
                {activePersona.groups.map((group) => (
                  <span
                    key={group}
                    className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>
          )}
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

