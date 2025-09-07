
"use client";

import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { NavItem } from "@/types";

interface CommandMenuProps {
    navItems: NavItem[];
    setActiveModule: (module: NavItem['id']) => void;
}

export function CommandMenu({ navItems, setActiveModule }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const { t } = useLanguage();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <Button
        variant="outline"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full p-0 shadow-lg z-20"
        onClick={() => setOpen(true)}
      >
        <Search className="h-6 w-6"/>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t('searchNodes') + '...'} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Modules">
            {navItems.map((item) => (
              <CommandItem
                key={item.id}
                value={t(item.labelKey)}
                onSelect={() => runCommand(() => setActiveModule(item.id))}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{t(item.labelKey)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
