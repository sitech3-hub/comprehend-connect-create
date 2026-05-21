---
name: concept-based-worksheet
description: Build Korean-classroom concept-based inquiry (개념기반탐구) English activity worksheets — data-driven Parts with inquiry intro, reading passages, vocab/grammar MCQs, "My Voice" reflection writing with modeling examples, autosave to Supabase, and a teacher dashboard. Use when the user asks to build/extend a lesson activity sheet (활동지), add a new Part, add MCQs, or replicate this worksheet pattern in a new project.
---

# Concept-Based Worksheet (개념기반탐구 활동지)

A data-driven lesson worksheet pattern: one config file (`lessonData.ts`) drives a single render component (`PartView.tsx`), routes per Part, autosave to Supabase, and a teacher view.

## When to use

- "활동지 만들어줘", "Part 5 추가해줘", "어휘 문제 더 넣어줘", "예시 글(modeling) 넣어줘"
- Replicating this template in a new English/inquiry-based lesson project.

## Core data shape (`src/lib/lessonData.ts`)

```ts
export type VocabQ   = { word: string; definition: string; choices: string[]; answer: string };
export type GrammarQ = { question: string; choices: string[]; answer: string; explanation: string };

export type Part = {
  id: number;
  title: string;          // "Part 1 · The Future of Food"
  subtitle: string;
  pages: string;          // "pp. 61–62"
  inquiry?:  { question: string; placeholder: string };       // 개념기반 도입 질문
  passages:  { heading?: string; body: string }[];            // Reading (\n\n for paragraphs)
  textbookQs?: { id: string; q: string }[];                   // 교과서 본문 질문
  vocab?: VocabQ[];                                           // 영영사전 어휘 (4지선다)
  grammar: GrammarQ[];                                        // 문법 (4지선다, 단어형태 고르기 권장)
  reflectionPrompt?: string;                                  // My Voice 영작 지시
  reflectionConcepts?: string[];                              // 핵심 개념 태그
  reflectionKeywords?: string[];                              // 클릭해 삽입되는 키워드
  reflectionModel?: { title: string; body: string; note?: string }; // 예시 글 (modeling)
};
```

## Authoring rules

- **Language**: 설명/지시문은 한국어, 본문·문항·예시 글은 영어.
- **MCQ는 4지선다**. 정답 위치를 랜덤하게 분산(0/1/2/3 균등). 한 위치에 몰리면 안 됨.
- **Grammar 문항**: 문법 용어를 직접 묻지 말고 "Choose the correct form/word" 형태로 빈칸 채우기.
- **Vocab**: `definition`은 영영사전 스타일 한 문장. `choices` 4개 중 하나가 정답과 동일 문자열.
- **Reflection**:
  - `reflectionConcepts`: 3–5개 핵심 개념 (Sustainability, Identity 등).
  - `reflectionKeywords`: 9개 내외 (실질 어휘 + 담화 표지 "I believe that", "for example").
  - `reflectionModel.body`: 5–7문장, ~100단어, 키워드 2개 이상 자연 포함. `note`에 학생용 안내.
- **새 Part 추가 시 체크리스트**:
  1. `PARTS` 배열에 항목 추가
  2. `src/components/PartNav.tsx`의 네비 목록 갱신
  3. `useProgress`/`useCriteria` 등 Part 개수 의존 로직 확인
  4. id 타입(`1 | 2 | 3 | 4`)을 number로 넓혔는지 확인 — 좁은 유니언이면 라우트/컴포넌트 시그니처도 함께 수정

## Rendering (`src/components/PartView.tsx`)

단일 컴포넌트가 위 데이터를 받아 섹션별로 렌더:
1. 상단 저장 상태 바 (sticky)
2. 헤더 (pages / title / subtitle)
3. Inquiry 카드 (`tone="inquiry"`, Textarea)
4. Reading (passages + `<details>`로 textbookQs)
5. Vocabulary `QuizItem` 리스트
6. Grammar `QuizItem` 리스트
7. My Voice: 개념 태그 + 키워드 칩(클릭 시 reflection에 삽입) + 예시 글 `<details>` + Textarea + word count
8. 하단 저장 바 (sticky, 수동 저장 버튼)

`QuizItem`은 선택 시 정답이면 accent, 오답이면 hint 표시.

## Persistence

- **Supabase 테이블 `submissions`** (이미 존재): `user_id, part, vocab_answers jsonb, grammar_answers jsonb, reflection, inquiry_answer`. `(user_id, part)` upsert.
- **user_email/user_name은 절대 클라이언트 페이로드에 넣지 않음** — `submissions_fill_user_identity()` 트리거가 `auth.users`에서 채움.
- **자동 저장**: 변경 후 3초 debounce + `beforeunload` 경고. 초기 hydration 동안은 `hydratingRef`로 autosave 차단.
- **RLS**: 학생은 자기 행만, 교사(`has_role(uid,'teacher')`)는 전체 조회.

## Auth & Roles

- `user_roles` 테이블 + `app_role` enum (`student`/`teacher`).
- `handle_new_user()` 트리거가 화이트리스트 이메일에 `teacher` 부여, 그 외는 `student`.
- `useAuth`는 클라이언트 이메일 매칭 금지 — DB의 `user_roles` 조회로 `isTeacher` 결정.
- `/teacher` 라우트: `isTeacher && isGoogle && emailVerified` 가드.

## Design tokens

- 미니멀, 충분한 여백, 모노톤 + 포인트 1–2색.
- 시맨틱 토큰만 사용: `bg-card`, `border-border`, `text-muted-foreground`, `bg-inquiry`/`text-inquiry-foreground` (개념 섹션 강조), `text-primary`, `text-accent`. 직접 색상 클래스(`text-white` 등) 금지.
- 카드: `rounded-2xl border border-border bg-card p-6 shadow-sm`.

## Common tasks → recipes

| 요청 | 작업 |
| --- | --- |
| "Part N 추가" | `PARTS`에 항목 추가 + `PartNav` 갱신 + id 유니언 확장 |
| "문법 문제를 단어형태 고르기로" | `GrammarQ.question`을 빈칸 + "Choose the correct form/word"로 재작성, `choices`는 단어 형태 4개 |
| "객관식 정답이 한 위치에 몰림" | 모든 문항에서 answer index를 0/1/2/3에 균등 배분되도록 셔플 (`lessonData.ts` 일괄 변환) |
| "My Voice에 예시 글" | 각 Part에 `reflectionModel: { title, body, note }` 추가, `PartView`의 `<details>` 블록이 자동 표시 |
| "교사 대시보드" | `/teacher` 라우트에서 `submissions` 전체 조회 + `completion_criteria` 기준 충족 여부 표시 |

## Don'ts

- Edge Functions 만들지 말 것 — 서버 로직은 `createServerFn` 사용 (이 프로젝트는 단순 upsert라 클라이언트에서 직접 호출).
- `src/integrations/supabase/{client,types}.ts` 수정 금지.
- 정답 위치를 항상 같은 인덱스에 두지 말 것.
- 문법 문제에서 "다음 중 수동태인 것은?" 같이 문법 용어를 직접 묻지 말 것.
