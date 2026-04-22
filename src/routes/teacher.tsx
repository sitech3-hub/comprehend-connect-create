import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { PARTS } from "@/lib/lessonData";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Users, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher")({
  component: TeacherPage,
});

type Sub = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  part: number;
  vocab_answers: Record<string, string>;
  grammar_answers: Record<string, string>;
  reflection: string;
  inquiry_answer: string;
  updated_at: string;
};

function TeacherPage() {
  const { user, loading, isTeacher } = useAuth();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [fetching, setFetching] = useState(true);
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [filterPart, setFilterPart] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (!isTeacher) return;
    setFetching(true);
    supabase
      .from("submissions")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setSubs((data as Sub[]) ?? []);
        setFetching(false);
      });
  }, [isTeacher]);

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (!isTeacher)
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <h1 className="text-xl font-bold">접근 권한이 없습니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            교사 대시보드는 지정된 선생님 계정만 접근할 수 있어요.
          </p>
        </div>
      </div>
    );

  // group by user
  const byUser = new Map<string, { email: string; name: string | null; parts: Map<number, Sub> }>();
  for (const s of subs) {
    if (filterPart && s.part !== filterPart) continue;
    if (!byUser.has(s.user_id))
      byUser.set(s.user_id, { email: s.user_email, name: s.user_name, parts: new Map() });
    byUser.get(s.user_id)!.parts.set(s.part, s);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">교사 대시보드</h1>
            <p className="text-sm text-muted-foreground">
              학생들의 활동 현황과 답변을 확인할 수 있어요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-bold">{byUser.size}</span>명의 학생
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <FileCheck2 className="h-4 w-4 text-accent" />
              <span className="font-bold">{subs.length}</span>개의 제출
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {([0, 1, 2, 3] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={filterPart === p ? "default" : "outline"}
              onClick={() => setFilterPart(p)}
            >
              {p === 0 ? "전체" : `Part ${p}`}
            </Button>
          ))}
        </div>

        {fetching ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            불러오는 중...
          </div>
        ) : byUser.size === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            아직 제출된 활동이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(byUser.entries()).map(([uid, u]) => {
              const open = openUser === uid;
              return (
                <div key={uid} className="overflow-hidden rounded-xl border border-border bg-card">
                  <button
                    onClick={() => setOpenUser(open ? null : uid)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                        {(u.name ?? u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{u.name ?? u.email.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((p) => (
                          <span
                            key={p}
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold",
                              u.parts.has(p)
                                ? "bg-accent/20 text-accent-foreground"
                                : "bg-muted text-muted-foreground/50",
                            )}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </button>
                  {open && (
                    <div className="space-y-4 border-t border-border bg-secondary/30 p-5">
                      {[1, 2, 3].map((p) => {
                        const s = u.parts.get(p);
                        const part = PARTS.find((x) => x.id === p)!;
                        return (
                          <div key={p} className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-2 text-sm font-bold text-primary">{part.title}</p>
                            {!s ? (
                              <p className="text-xs text-muted-foreground">미제출</p>
                            ) : (
                              <div className="space-y-3 text-sm">
                                <ScoreRow label="어휘" answers={s.vocab_answers} items={part.vocab.map((v) => ({ key: v.word, answer: v.answer }))} />
                                <ScoreRow label="문법" answers={s.grammar_answers} items={part.grammar.map((g, i) => ({ key: String(i), answer: g.answer }))} />
                                <Field label="🌱 개념탐구 도입 답변" text={s.inquiry_answer} />
                                <Field label="💭 개념기반 영작" text={s.reflection} />
                                <p className="text-right text-xs text-muted-foreground">
                                  최종 저장: {new Date(s.updated_at).toLocaleString("ko-KR")}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreRow({
  label,
  answers,
  items,
}: {
  label: string;
  answers: Record<string, string>;
  items: { key: string; answer: string }[];
}) {
  const correct = items.filter((it) => answers?.[it.key] === it.answer).length;
  return (
    <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
      <span className="font-medium">{label}</span>
      <span className="font-mono text-sm">
        <span className="text-accent-foreground font-bold">{correct}</span>
        <span className="text-muted-foreground"> / {items.length}</span>
      </span>
    </div>
  );
}

function Field({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm leading-relaxed">
        {text || <span className="text-muted-foreground">(작성 안 됨)</span>}
      </p>
    </div>
  );
}
