import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, GraduationCap } from "lucide-react";

export function AppHeader() {
  const { user, isTeacher, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/parts/$partId" params={{ partId: "1" }} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">English 1 · Lesson 3</p>
            <p className="text-xs text-muted-foreground leading-tight">The Future of Food</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {isTeacher && (
            <Button asChild variant="secondary" size="sm">
              <Link to="/teacher">
                <GraduationCap className="mr-1.5 h-4 w-4" />
                교사 대시보드
              </Link>
            </Button>
          )}
          {user && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
