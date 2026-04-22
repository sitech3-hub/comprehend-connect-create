import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Criteria = {
  min_reflection_words: number;
  min_vocab_answers: number;
  min_grammar_answers: number;
  require_inquiry: boolean;
};

export const DEFAULT_CRITERIA: Criteria = {
  min_reflection_words: 10,
  min_vocab_answers: 5,
  min_grammar_answers: 3,
  require_inquiry: true,
};

export function isPartCompleteWith(
  c: Criteria,
  row: {
    reflection: string;
    inquiry_answer: string;
    vocab_answers: Record<string, string>;
    grammar_answers: Record<string, string>;
  },
) {
  const words = row.reflection.trim().split(/\s+/).filter(Boolean).length;
  const inquiryOk = c.require_inquiry ? row.inquiry_answer.trim().length > 0 : true;
  const vocabCount = Object.keys(row.vocab_answers ?? {}).length;
  const grammarCount = Object.keys(row.grammar_answers ?? {}).length;
  return (
    words >= c.min_reflection_words &&
    inquiryOk &&
    vocabCount >= c.min_vocab_answers &&
    grammarCount >= c.min_grammar_answers
  );
}

export function useCriteria() {
  const [criteria, setCriteria] = useState<Criteria>(DEFAULT_CRITERIA);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("completion_criteria")
      .select("min_reflection_words, min_vocab_answers, min_grammar_answers, require_inquiry")
      .limit(1)
      .maybeSingle();
    if (data) setCriteria(data as Criteria);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { criteria, loading, refresh, setCriteria };
}
