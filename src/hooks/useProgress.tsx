import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PartProgress = {
  part: number;
  updated_at: string;
  completed: boolean;
};

// A part is considered "complete" when reflection has at least 10 words
// AND inquiry_answer is non-empty AND there is at least one vocab/grammar answer.
function isComplete(row: {
  reflection: string;
  inquiry_answer: string;
  vocab_answers: Record<string, string>;
  grammar_answers: Record<string, string>;
}) {
  const words = row.reflection.trim().split(/\s+/).filter(Boolean).length;
  const hasInquiry = row.inquiry_answer.trim().length > 0;
  const hasQuiz =
    Object.keys(row.vocab_answers || {}).length > 0 ||
    Object.keys(row.grammar_answers || {}).length > 0;
  return words >= 10 && hasInquiry && hasQuiz;
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<number, PartProgress>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("submissions")
      .select("part, updated_at, reflection, inquiry_answer, vocab_answers, grammar_answers")
      .eq("user_id", user.id);
    const map: Record<number, PartProgress> = {};
    (data ?? []).forEach((r) => {
      map[r.part] = {
        part: r.part,
        updated_at: r.updated_at,
        completed: isComplete({
          reflection: r.reflection,
          inquiry_answer: r.inquiry_answer,
          vocab_answers: (r.vocab_answers as Record<string, string>) || {},
          grammar_answers: (r.grammar_answers as Record<string, string>) || {},
        }),
      };
    });
    setProgress(map);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Next part to continue: first part that isn't completed; if all done, last edited.
  const nextPartId = (): 1 | 2 | 3 => {
    for (const id of [1, 2, 3] as const) {
      if (!progress[id]?.completed) return id;
    }
    const sorted = Object.values(progress).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
    return ((sorted[0]?.part as 1 | 2 | 3) ?? 1) as 1 | 2 | 3;
  };

  return { progress, loading, refresh, nextPartId };
}
