import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Criteria, isPartCompleteWith, useCriteria } from "@/hooks/useCriteria";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { PARTS } from "@/lib/lessonData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Minus,
  Users,
} from "lucide-react";
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

type StudentRow = {
  user_id: string;
  email: string;
  name: string | null;
  parts: Map<number, Sub>;
  completed: number;
  completionRate: number;
  lastSavedAt: string | null;
};

type SortKey = "name" | "completionRate" | "lastSavedAt";
type SortDir = "asc" | "desc";

function isPartComplete(s: Sub, c: Criteria) {
  return isPartCompleteWith(c, {
    reflection: s.reflection,
    inquiry_answer: s.inquiry_answer,
    vocab_answers: s.vocab_answers,
    grammar_answers: s.grammar_answers,
  });
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function TeacherPage() {
  const { user, loading, isTeacher } = useAuth();
  const { criteria, refresh: refreshCriteria } = useCriteria();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [fetching, setFetching] = useState(true);
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [filterPart, setFilterPart] = useState<0 | 1 | 2 | 3>(0);
  const [filterStatus, setFilterStatus] = useState<"all" | "complete" | "incomplete" | "none">("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("completionRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const rows: StudentRow[] = useMemo(() => {
    const byUser = new Map<string, StudentRow>();
    for (const s of subs) {
      let r = byUser.get(s.user_id);
      if (!r) {
        r = {
          user_id: s.user_id,
          email: s.user_email,
          name: s.user_name,
          parts: new Map(),
          completed: 0,
          completionRate: 0,
          lastSavedAt: null,
        };
        byUser.set(s.user_id, r);
      }
      r.parts.set(s.part, s);
      if (!r.lastSavedAt || new Date(s.updated_at) > new Date(r.lastSavedAt)) {
        r.lastSavedAt = s.updated_at;
      }
    }
    for (const r of byUser.values()) {
      r.completed = Array.from(r.parts.values()).filter((s) => isPartComplete(s, criteria)).length;
      r.completionRate = Math.round((r.completed / 3) * 100);
    }
    let arr = Array.from(byUser.values());

    // search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (r) => r.email.toLowerCase().includes(q) || (r.name ?? "").toLowerCase().includes(q),
      );
    }
    // status filter (applied per filtered part if set, otherwise overall)
    if (filterStatus !== "all") {
      arr = arr.filter((r) => {
        if (filterPart) {
          const s = r.parts.get(filterPart);
          if (filterStatus === "none") return !s;
          if (filterStatus === "complete") return s && isPartComplete(s, criteria);
          if (filterStatus === "incomplete") return s && !isPartComplete(s, criteria);
        } else {
          if (filterStatus === "complete") return r.completed === 3;
          if (filterStatus === "incomplete") return r.completed > 0 && r.completed < 3;
          if (filterStatus === "none") return r.completed === 0 && r.parts.size === 0;
        }
        return true;
      });
    }
    // sort
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = (a.name ?? a.email).localeCompare(b.name ?? b.email);
      else if (sortKey === "completionRate") cmp = a.completionRate - b.completionRate;
      else if (sortKey === "lastSavedAt") {
        const av = a.lastSavedAt ? new Date(a.lastSavedAt).getTime() : 0;
        const bv = b.lastSavedAt ? new Date(b.lastSavedAt).getTime() : 0;
        cmp = av - bv;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [subs, search, filterPart, filterStatus, sortKey, sortDir, criteria]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

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

  const totalStudents = new Set(subs.map((s) => s.user_id)).size;

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
              <span className="font-bold">{totalStudents}</span>명의 학생
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <FileCheck2 className="h-4 w-4 text-accent" />
              <span className="font-bold">{subs.length}</span>개의 제출
            </div>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen((o) => !o)}>
              <Settings2 className="mr-2 h-4 w-4" />
              완료 기준 설정
            </Button>
          </div>
        </div>

        {settingsOpen && (
          <CriteriaPanel
            criteria={criteria}
            onSaved={() => {
              refreshCriteria();
            }}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            placeholder="학생 이름 / 이메일 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56"
          />
          <div className="flex gap-1 rounded-md border border-border bg-card p-1">
            {([0, 1, 2, 3] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPart(p)}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium",
                  filterPart === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p === 0 ? "전체 Part" : `Part ${p}`}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-md border border-border bg-card p-1">
            {(
              [
                ["all", "전체"],
                ["complete", "완료"],
                ["incomplete", "진행중"],
                ["none", "미시작"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilterStatus(k)}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium",
                  filterStatus === k
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            불러오는 중...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            조건에 맞는 학생이 없습니다.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>
                    <SortBtn label="학생" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                  </TableHead>
                  {[1, 2, 3].map((p) => (
                    <TableHead key={p} className="text-center">Part {p}</TableHead>
                  ))}
                  <TableHead className="text-right">
                    <SortBtn
                      label="완료율"
                      active={sortKey === "completionRate"}
                      dir={sortDir}
                      onClick={() => toggleSort("completionRate")}
                    />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortBtn
                      label="마지막 저장"
                      active={sortKey === "lastSavedAt"}
                      dir={sortDir}
                      onClick={() => toggleSort("lastSavedAt")}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const open = openUser === r.user_id;
                  return (
                    <Fragment key={r.user_id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setOpenUser(open ? null : r.user_id)}
                      >
                        <TableCell>
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {(r.name ?? r.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{r.name ?? r.email.split("@")[0]}</p>
                              <p className="text-xs text-muted-foreground">{r.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        {[1, 2, 3].map((p) => {
                          const s = r.parts.get(p);
                          const done = s ? isPartComplete(s, criteria) : false;
                          return (
                            <TableCell key={p} className="text-center">
                              <span
                                className={cn(
                                  "inline-flex h-7 w-7 items-center justify-center rounded-full",
                                  !s && "bg-muted text-muted-foreground/40",
                                  s && done && "bg-accent/20 text-accent-foreground",
                                  s && !done && "bg-primary/10 text-primary",
                                )}
                                title={
                                  !s
                                    ? "미시작"
                                    : done
                                      ? "완료"
                                      : "진행중"
                                }
                              >
                                {!s ? <Minus className="h-3.5 w-3.5" /> : done ? <Check className="h-4 w-4" /> : "·"}
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-full",
                                  r.completionRate === 100 ? "bg-accent" : "bg-primary",
                                )}
                                style={{ width: `${r.completionRate}%` }}
                              />
                            </div>
                            <span className="w-10 text-right font-mono text-sm font-bold">
                              {r.completionRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {timeAgo(r.lastSavedAt)}
                        </TableCell>
                      </TableRow>
                      {open && (
                        <TableRow key={r.user_id + "-detail"}>
                          <TableCell colSpan={6} className="bg-secondary/30 p-5">
                            <div className="space-y-4">
                              {[1, 2, 3].map((p) => {
                                const s = r.parts.get(p);
                                const part = PARTS.find((x) => x.id === p)!;
                                return (
                                  <div key={p} className="rounded-lg border border-border bg-card p-4">
                                    <p className="mb-2 text-sm font-bold text-primary">{part.title}</p>
                                    {!s ? (
                                      <p className="text-xs text-muted-foreground">미제출</p>
                                    ) : (
                                      <div className="space-y-3 text-sm">
                                        <ScoreRow
                                          label="어휘"
                                          answers={s.vocab_answers}
                                          items={part.vocab.map((v) => ({ key: v.word, answer: v.answer }))}
                                        />
                                        <ScoreRow
                                          label="문법"
                                          answers={s.grammar_answers}
                                          items={part.grammar.map((g, i) => ({ key: String(i), answer: g.answer }))}
                                        />
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
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function SortBtn({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {!active ? (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      ) : dir === "asc" ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
    </button>
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
        <span className="font-bold text-accent-foreground">{correct}</span>
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

function CriteriaPanel({
  criteria,
  onSaved,
  onClose,
}: {
  criteria: Criteria;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Criteria>(criteria);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(criteria);
  }, [criteria]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("completion_criteria")
      .update({
        min_reflection_words: draft.min_reflection_words,
        min_vocab_answers: draft.min_vocab_answers,
        min_grammar_answers: draft.min_grammar_answers,
        require_inquiry: draft.require_inquiry,
      })
      .eq("singleton", true);
    setSaving(false);
    if (error) toast.error("저장 실패: " + error.message);
    else {
      toast.success("완료 기준이 업데이트되었어요");
      onSaved();
    }
  };

  const reset = () => {
    setDraft({
      min_reflection_words: 10,
      min_vocab_answers: 5,
      min_grammar_answers: 3,
      require_inquiry: true,
    });
  };

  return (
    <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">완료 기준 설정</h2>
          <p className="text-xs text-muted-foreground">
            아래 조건을 모두 만족해야 해당 Part가 "완료"로 표시돼요. 학생 진행률에도 즉시 반영돼요.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          닫기
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField
          label="영작 최소 단어 수"
          value={draft.min_reflection_words}
          onChange={(v) => setDraft({ ...draft, min_reflection_words: v })}
        />
        <NumberField
          label="어휘 최소 정답 수"
          max={5}
          value={draft.min_vocab_answers}
          onChange={(v) => setDraft({ ...draft, min_vocab_answers: v })}
        />
        <NumberField
          label="문법 최소 정답 수"
          max={3}
          value={draft.min_grammar_answers}
          onChange={(v) => setDraft({ ...draft, min_grammar_answers: v })}
        />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
        <div>
          <Label className="text-sm font-medium">개념탐구 도입 답변 필수</Label>
          <p className="text-xs text-muted-foreground">
            끄면 도입 질문이 비어 있어도 완료 처리돼요.
          </p>
        </div>
        <Switch
          checked={draft.require_inquiry}
          onCheckedChange={(v) => setDraft({ ...draft, require_inquiry: v })}
        />
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={reset}>
          기본값
        </Button>
        <Button onClick={save} disabled={saving} size="sm">
          {saving ? "저장 중..." : "기준 저장"}
        </Button>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n) && n >= 0) onChange(n);
        }}
        className="mt-1 h-9"
      />
      {max !== undefined && (
        <p className="mt-1 text-[10px] text-muted-foreground">최대 {max}개 출제</p>
      )}
    </div>
  );
}
