import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { PARTS } from "@/lib/lessonData";

export function PartNav() {
  const loc = useLocation();
  return (
    <nav className="mx-auto mb-6 flex max-w-6xl gap-2 px-4 pt-4">
      {PARTS.map((p) => {
        const active = loc.pathname.endsWith(`/parts/${p.id}`);
        return (
          <Link
            key={p.id}
            to="/parts/$partId"
            params={{ partId: String(p.id) }}
            className={cn(
              "flex-1 rounded-lg border px-4 py-3 text-sm transition-all",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-secondary",
            )}
          >
            <div className="font-bold">Part {p.id}</div>
            <div className={cn("text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {p.pages}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
