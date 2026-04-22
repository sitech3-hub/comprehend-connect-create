import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { PARTS } from "@/lib/lessonData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Circle, Cloud, CloudOff, Lightbulb, Loader2, Save, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "success" | "error";

function timeAgo(iso: string | null) {
  if (!iso) return "저장 기록 없음";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 10) return "방금 전 저장됨";
  if (diff < 60) return `${Math.floor(diff)}초 전 저장됨`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전 저장됨`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전 저장됨`;
  return `${Math.floor(diff / 86400)}일 전 저장됨`;
}

type SubmissionRow = {
  vocab_answers: Record<string, string>;
  grammar_answers: Record<string, string>;
  reflection: string;
  inquiry_answer: string;
  updated_at: string;
};


export function PartView({ partId }: { partId: 1 | 2 | 3 }) {
  const part = PARTS.find((p) => p.id === partId)!;
  const { user } = useAuth();
  const { refresh } = useProgress();
  const [vocab, setVocab] = useState<Record<string, string>>({});
  const [grammar, setGrammar] = useState<Record<string, string>>({});
  const [reflection, setReflection] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Refresh "time ago" label every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    setVocab({}); setGrammar({}); setReflection(""); setInquiry(""); setLastSavedAt(null);
    supabase
      .from("submissions")
      .select("vocab_answers, grammar_answers, reflection, inquiry_answer, updated_at")
      .eq("user_id", user.id)
      .eq("part", partId)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as SubmissionRow | null;
        if (!row) return;
        setVocab((row.vocab_answers as Record<string, string>) || {});
        setGrammar((row.grammar_answers as Record<string, string>) || {});
        setReflection(row.reflection || "");
        setInquiry(row.inquiry_answer || "");
        setLastSavedAt(row.updated_at);
      });
  }, [user, partId]);

  const save = async () => {
    if (!user) return;
    setSaveStatus("saving");
    setSaveError(null);
    const { error } = await supabase.from("submissions").upsert(
      {
        user_id: user.id,
        user_email: user.email ?? "",
        user_name: (user.user_metadata?.full_name as string) ?? (user.user_metadata?.name as string) ?? null,
        part: partId,
        vocab_answers: vocab,
        grammar_answers: grammar,
        reflection,
        inquiry_answer: inquiry,
      },
      { onConflict: "user_id,part" },
    );
    if (error) {
      setSaveStatus("error");
      setSaveError(error.message);
      toast.error("저장 실패: " + error.message);
    } else {
      setSaveStatus("success");
      setLastSavedAt(new Date().toISOString());
      toast.success("저장되었어요 ✓");
      refresh();
    }
  };

  const insertKeyword = (kw: string) => {
    setReflection((prev) => {
      const sep = prev.length === 0 || /\s$/.test(prev) ? "" : " ";
      return prev + sep + kw + " ";
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-20">
      {/* Top save status bar */}
      <div
        className={cn(
          "sticky top-2 z-20 flex items-center justify-between gap-3 rounded-xl border px-4 py-2 text-sm shadow-sm backdrop-blur",
          saveStatus === "saving" && "border-primary/40 bg-primary/10",
          saveStatus === "error" && "border-destructive/40 bg-destructive/10",
          saveStatus === "success" && "border-accent/40 bg-accent/10",
          saveStatus === "idle" && "border-border bg-card/90",
        )}
      >
        <SaveStatusIndicator status={saveStatus} error={saveError} lastSavedAt={lastSavedAt} />
        <span className="hidden text-xs text-muted-foreground sm:inline">자동으로 30초마다 표시 갱신</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">{part.pages}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{part.title}</h1>
        <p className="mt-1 text-muted-foreground">{part.subtitle}</p>
      </div>

      {/* Inquiry intro */}
      <Section icon={<Lightbulb className="h-5 w-5" />} title="개념기반탐구 도입 질문" tone="inquiry">
        <p className="text-base font-medium leading-relaxed text-inquiry-foreground">
          {part.inquiry.question}
        </p>
        <Textarea
          value={inquiry}
          onChange={(e) => setInquiry(e.target.value)}
          placeholder={part.inquiry.placeholder}
          className="mt-4 min-h-32 bg-background"
        />
      </Section>

      {/* Reading passages */}
      <Section title="📖 Reading" subtitle="천천히 읽고, 모르는 단어는 표시해 두세요.">
        <div className="space-y-6">
          {part.passages.map((p, i) => (
            <article key={i} className="rounded-xl border border-border bg-secondary/40 p-5">
              {p.heading && <h3 className="mb-3 text-xl font-bold">{p.heading}</h3>}
              <p className="whitespace-pre-line text-[15px] leading-relaxed">{p.body}</p>
            </article>
          ))}
        </div>
        <details className="mt-4 rounded-lg border border-border bg-card p-3 text-sm">
          <summary className="cursor-pointer font-semibold">교과서 본문 질문 보기</summary>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {part.textbookQs.map((q) => (
              <li key={q.id}>
                <span className="font-bold text-foreground">{q.id}.</span> {q.q}
              </li>
            ))}
          </ul>
        </details>
      </Section>

      {/* Vocabulary */}
      <Section title="🔤 Vocabulary · 영영사전 어휘 풀이 (5문제)">
        <div className="space-y-4">
          {part.vocab.map((v, i) => (
            <QuizItem
              key={v.word}
              index={i + 1}
              prompt={
                <>
                  <span className="font-bold text-primary">{v.word}</span>{" "}
                  <span className="text-muted-foreground">— Choose the meaning:</span>
                </>
              }
              choices={v.choices}
              value={vocab[v.word] ?? ""}
              answer={v.answer}
              onChange={(c) => setVocab({ ...vocab, [v.word]: c })}
              hint={`Definition: ${v.definition}`}
            />
          ))}
        </div>
      </Section>

      {/* Grammar */}
      <Section title="✍️ Grammar · 문법 구조 확인 (3문제)">
        <div className="space-y-4">
          {part.grammar.map((g, i) => (
            <QuizItem
              key={i}
              index={i + 1}
              prompt={<span>{g.question}</span>}
              choices={g.choices}
              value={grammar[String(i)] ?? ""}
              answer={g.answer}
              onChange={(c) => setGrammar({ ...grammar, [String(i)]: c })}
              hint={g.explanation}
            />
          ))}
        </div>
      </Section>

      {/* Reflection */}
      <Section icon={<Sparkles className="h-5 w-5" />} title="💭 My Voice · 개념기반 영작" tone="inquiry">
        <p className="font-medium leading-relaxed text-inquiry-foreground">
          {part.reflectionPrompt}
        </p>

        <div className="mt-5 rounded-xl border border-inquiry-foreground/15 bg-background/60 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-inquiry-foreground/80">
            🧭 핵심 개념 (Key Concepts)
          </p>
          <div className="flex flex-wrap gap-2">
            {part.reflectionConcepts.map((c) => (
              <span
                key={c}
                className="rounded-full border border-inquiry-foreground/30 bg-inquiry px-3 py-1 text-xs font-semibold text-inquiry-foreground"
              >
                {c}
              </span>
            ))}
          </div>

          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-inquiry-foreground/80">
            💡 도움 키워드 (클릭해서 추가)
          </p>
          <div className="flex flex-wrap gap-2">
            {part.reflectionKeywords.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => insertKeyword(k)}
                className="group flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <span className="opacity-60 group-hover:opacity-100">+</span>
                {k}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Write your reflection in English... (위의 키워드를 클릭하면 자동으로 추가돼요)"
          className="mt-4 min-h-44 bg-background"
        />
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {reflection.trim().split(/\s+/).filter(Boolean).length} words
        </p>
      </Section>

      {/* Save bar */}
      <div className="sticky bottom-4 z-30 mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <SaveStatusIndicator status={saveStatus} error={saveError} lastSavedAt={lastSavedAt} />
        <Button onClick={save} disabled={saveStatus === "saving"} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saveStatus === "saving" ? "저장 중..." : "저장하기"}
        </Button>
      </div>
    </div>
  );
}

function SaveStatusIndicator({
  status,
  error,
  lastSavedAt,
}: {
  status: SaveStatus;
  error: string | null;
  lastSavedAt: string | null;
}) {
  if (status === "saving") {
    return (
      <p className="flex items-center gap-2 text-xs sm:text-sm text-primary">
        <Loader2 className="h-4 w-4 animate-spin" /> 저장 중...
      </p>
    );
  }
  if (status === "error") {
    return (
      <p className="flex items-center gap-2 text-xs sm:text-sm text-destructive">
        <CloudOff className="h-4 w-4" /> 저장 실패{error ? ` — ${error}` : ""}
      </p>
    );
  }
  if (status === "success") {
    return (
      <p className="flex items-center gap-2 text-xs sm:text-sm">
        <CheckCircle2 className="h-4 w-4 text-accent" />
        <span className="text-foreground">저장 완료</span>
        <span className="text-muted-foreground">· {timeAgo(lastSavedAt)}</span>
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
      {lastSavedAt ? <Cloud className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {timeAgo(lastSavedAt)}
    </p>
  );
}

function Section({
  title,
  subtitle,
  children,
  icon,
  tone,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "inquiry";
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-6 shadow-sm",
        tone === "inquiry" ? "border-inquiry-foreground/20 bg-inquiry" : "border-border bg-card",
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className={cn("text-lg font-bold", tone === "inquiry" && "text-inquiry-foreground")}>
          {title}
        </h2>
      </div>
      {subtitle && <p className="mb-4 -mt-3 text-sm text-muted-foreground">{subtitle}</p>}
      {children}
    </section>
  );
}

function QuizItem({
  index,
  prompt,
  choices,
  value,
  answer,
  onChange,
  hint,
}: {
  index: number;
  prompt: React.ReactNode;
  choices: string[];
  value: string;
  answer: string;
  onChange: (c: string) => void;
  hint: string;
}) {
  const correct = value && value === answer;
  const wrong = value && value !== answer;
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index}
        </span>
        <p className="text-sm leading-relaxed">{prompt}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((c) => {
          const selected = value === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                selected
                  ? correct
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              {selected ? (
                <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", correct ? "text-accent" : "text-primary")} />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
              )}
              <span>{c}</span>
            </button>
          );
        })}
      </div>
      {(correct || wrong) && (
        <p className={cn("mt-3 text-xs", correct ? "text-accent-foreground" : "text-muted-foreground")}>
          {correct ? "✓ Correct! " : "💡 Hint: "}
          {hint}
        </p>
      )}
    </div>
  );
}
