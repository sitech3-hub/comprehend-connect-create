import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Leaf } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, isTeacher } = useAuth();
  const { loading: progressLoading, nextPartId } = useProgress();

  if (loading || (user && progressLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (user) {
    if (isTeacher) return <Navigate to="/teacher" />;
    return <Navigate to="/parts/$partId" params={{ partId: String(nextPartId()) }} />;
  }

  const signIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if ("error" in result && result.error) {
      toast.error("로그인 실패: " + (result.error as Error).message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-secondary via-background to-inquiry">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs backdrop-blur">
          <Leaf className="h-3.5 w-3.5 text-accent" />
          <span className="font-medium">시민고등학교 · 영어1 활동지</span>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <BookOpen className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            The Future of Food
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            English 1 · Lesson 3 — 개념기반탐구학습 활동지
          </p>

          <p className="mt-8 max-w-lg text-sm text-muted-foreground">
            지문을 읽고 어휘·문법 문제를 풀고, 자신의 생각을 영어로 표현해 보세요.
            <br />
            모든 활동은 안전하게 저장되어 선생님께서 확인하실 수 있습니다.
          </p>
        </div>

        <div className="mt-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
          <h2 className="mb-1 text-center text-lg font-bold">시작하기</h2>
          <p className="mb-5 text-center text-sm text-muted-foreground">
            학교 구글 계정으로 로그인하세요
          </p>
          <Button onClick={signIn} size="lg" className="w-full" variant="outline">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"
              />
            </svg>
            Google로 로그인
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            교사: <span className="font-mono">hongjinwoo@simin.hs.kr</span>,{" "}
            <span className="font-mono">sitech3@simin.hs.kr</span>
          </p>
        </div>

        <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          개념기반탐구학습 (Concept-Based Inquiry Learning)
        </div>
      </div>
    </div>
  );
}
