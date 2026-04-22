import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { PARTS } from "@/lib/lessonData";
import { useProgress } from "@/hooks/useProgress";
import { CheckCircle2, Clock } from "lucide-react";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export function PartNav() {
  const loc = useLocation();
  const { progress } = useProgress();

  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const pct = Math.round((completedCount / 3) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>학습 진행률</span>
        <span className="font-medium">
          {completedCount} / 3 파트 완료 ({pct}%)
        </span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <nav className="mb-6 flex flex-col gap-2 sm:flex-row">
        {PARTS.map((p) => {
          const active = loc.pathname.endsWith(`/parts/${p.id}`);
          const prog = progress[p.id];
          const done = prog?.completed;
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
              <div className="flex items-center justify-between">
                <div className="font-bold">Part {p.id}</div>
                {done && (
                  <CheckCircle2
                    className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-accent")}
                  />
                )}
              </div>
              <div
                className={cn(
                  "text-xs",
                  active ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {p.pages}
              </div>
              {prog ? (
                <div
                  className={cn(
                    "mt-1.5 flex items-center gap-1 text-[11px]",
                    active ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  <Clock className="h-3 w-3" />
                  {done ? "완료 · " : "작성 중 · "}
                  {timeAgo(prog.updated_at)}
                </div>
              ) : (
                <div
                  className={cn(
                    "mt-1.5 text-[11px]",
                    active ? "text-primary-foreground/70" : "text-muted-foreground/70",
                  )}
                >
                  아직 시작하지 않음
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
