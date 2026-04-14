import { cn } from "@/lib/utils";
import { useApp } from "@/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { ModuleIcon } from "./ModuleIcon";

export function ModuleSidebar() {
  const {
    modules, activeModule, navigateTo, view,
    showAddModule, setShowAddModule, newModuleName, setNewModuleName, addModule,
  } = useApp();

  return (
    <div className="w-[200px] border-r border-border flex flex-col shrink-0">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modules</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 flex flex-col gap-0.5">
          {modules.map((m) => {
            const isActive = view === "modules" && m.id === activeModule;
            const count = m.tasks.length;
            return (
              <button
                key={m.id}
                id={`module-${m.id}`}
                onClick={() => navigateTo(m.id)}
                className={cn(
                  "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left transition-colors text-xs",
                  isActive
                    ? "bg-surface-high text-foreground"
                    : "text-muted-foreground hover:bg-surface-mid hover:text-foreground"
                )}
              >
                <ModuleIcon name={m.icon} className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{m.name}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] min-w-[18px] text-center rounded-full px-1",
                    isActive ? "bg-primary/20 text-primary" : "bg-surface-high text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Add module */}
      <div className="p-2 border-t border-border">
        {showAddModule ? (
          <div className="flex gap-1">
            <Input
              autoFocus
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addModule(); if (e.key === "Escape") setShowAddModule(false); }}
              placeholder="Module name…"
              className="h-7 text-xs"
            />
            <Button size="sm" onClick={addModule} className="h-7 px-2">Add</Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowAddModule(true)} className="w-full justify-start text-xs text-muted-foreground">
            <Plus className="h-3 w-3 mr-1" /> Add Module
          </Button>
        )}
      </div>
    </div>
  );
}
