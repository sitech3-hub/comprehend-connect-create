export type VocabQ = { word: string; definition: string; choices: string[]; answer: string };
export type GrammarQ = { question: string; choices: string[]; answer: string; explanation: string };

export type Part = {
  id: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  pages: string;
  inquiry?: { question: string; placeholder: string };
  passages: { heading?: string; body: string }[];
  textbookQs?: { id: string; q: string }[];
  vocab?: VocabQ[];
  grammar: GrammarQ[];
  reflectionPrompt?: string;
  reflectionConcepts?: string[];
  reflectionKeywords?: string[];
  reflectionModel?: { title: string; body: string; note?: string };
};

export const PARTS: Part[] = [
  {
    id: 1,
    title: "Part 1 · The Future of Food",
    subtitle: "Why our diets matter for the planet",
    pages: "pp. 61–62",
    inquiry: {
      question:
        "Concept-Based Inquiry: What does it mean for food to be 'the essence of life'? How might the relationship between food, culture, and the environment shape our future?",
      placeholder:
        "Share your initial thinking. What concepts come to mind when you connect food, identity, and sustainability?",
    },
    passages: [
      {
        heading: "The Future of Food",
        body:
          "Food is the essence of life as it fuels us, brings us together, and connects communities to their cultures. What and how we eat is also crucial in sustaining all life on this planet.\n\nAccording to the UN population prospects report, by 2050, the global population is expected to increase to around 10 billion. This means that, to feed everyone, it will take 56% more food than is produced in the world today. Unfortunately, there is not enough agricultural land available to provide larger future populations with the kinds of diet people are eating in most countries today.",
      },
      {
        body:
          "In addition to this, industrial food systems generate more than one third of all greenhouse gas emissions. The processes we rely on to produce, transport, and store meals and raw ingredients, not to mention the landfills covered with food waste, are speeding up climate change. Animal-based foods, including red meat, milk products, and farmed shrimp, are generally associated with the highest greenhouse gas emissions. Especially, our meat production accelerates global warming significantly, uses shrinking supplies of fresh water, destroys forests and grasslands, and damages soil.\n\nBasically, we are in a tight bind of our own making. Against this reality, it is vital for us to seek sustainable alternatives to our current diets. Let us explore some ways we could be eating in the near future.",
      },
    ],
    textbookQs: [
      { id: "Q1", q: "How is food the essence of life?" },
      { id: "Q2", q: "How much more food will it take to feed the expected global population in 2050?" },
      { id: "Q3", q: "What kinds of food are generally associated with the highest greenhouse gas emissions?" },
      { id: "Q4", q: "Think & Talk: Is there anything you have been personally doing to make the food culture more sustainable?" },
    ],
    vocab: [
      {
        word: "essence",
        definition: "the basic, real, and invariable nature of a thing or its significant features",
        choices: ["a small detail of something", "the basic and most important quality of something", "an unimportant addition", "a chemical reaction"],
        answer: "the basic and most important quality of something",
      },
      {
        word: "crucial",
        definition: "decisive or critical, especially in the success or failure of something",
        choices: ["optional and minor", "extremely important", "delayed in time", "easily replaced"],
        answer: "extremely important",
      },
      {
        word: "sustain",
        definition: "to strengthen or support physically or mentally; to cause to continue for an extended period",
        choices: ["to destroy gradually", "to keep something going over time", "to ignore", "to replace quickly"],
        answer: "to keep something going over time",
      },
      {
        word: "agricultural",
        definition: "relating to farming, the cultivation of soil, and the raising of crops or livestock",
        choices: ["related to manufacturing cars", "related to space exploration", "related to farming", "related to banking"],
        answer: "related to farming",
      },
      {
        word: "emission",
        definition: "the production and discharge of something, especially gas or radiation",
        choices: ["a kind of music", "the release of gas into the air", "the storage of water", "a written report"],
        answer: "the release of gas into the air",
      },
    ],
    grammar: [
      {
        question:
          "Choose the correct form: 'By 2050, the global population _____ to increase to around 10 billion.'",
        choices: ["expects", "is expected", "expecting", "has expect"],
        answer: "is expected",
        explanation: "Passive voice (be + p.p.) — the population is the receiver of the action.",
      },
      {
        question: "Pick the gerund used as subject: '_____ everyone will take 56% more food.'",
        choices: ["Feed", "To feeding", "Feeding", "Fed"],
        answer: "Feeding",
        explanation: "A gerund (-ing) functions as the subject of the sentence.",
      },
      {
        question:
          "Choose the correct word form: 'Animal-based foods are generally ___ with the highest greenhouse gas emissions.'",
        choices: ["associate", "associated", "associating", "association"],
        answer: "associated",
        explanation: "Passive form (be + p.p.): 'are associated with'.",
      },
    ],
    reflectionPrompt:
      "Concept-Based Reflection: How does your personal relationship with food connect to global sustainability? Write 4–6 sentences in English using at least two key vocabulary words from this part.",
    reflectionConcepts: ["Sustainability", "Identity", "Interdependence", "Responsibility"],
    reflectionKeywords: [
      "essence of life", "sustainable diet", "greenhouse gas emissions",
      "agricultural land", "cultural identity", "future generations",
      "personally", "I believe that", "for example",
    ],
    reflectionModel: {
      title: "예시 글 (Modeling)",
      body:
        "Personally, I believe that food is truly the essence of life because it shapes both our culture and our future. In my family, sharing traditional Korean meals connects me to my cultural identity, but I also realize that my daily choices affect the planet. For example, eating red meat every day adds to greenhouse gas emissions and uses too much agricultural land. To build a more sustainable diet, I have started having one meatless day each week and finishing the food on my plate. These small actions may seem minor, but I think they show responsibility toward future generations and the environment we all share.",
      note: "위 글은 6문장, 약 100단어로 핵심 개념(Sustainability, Identity, Responsibility)과 키워드를 자연스럽게 포함한 예시입니다. 그대로 베끼지 말고, 자신의 경험으로 바꿔 써 보세요.",
    },
  },
  {
    id: 2,
    title: "Part 2 · Lab-grown Meat & Insects",
    subtitle: "Reimagining protein for a crowded planet",
    pages: "pp. 63–64",
    inquiry: {
      question:
        "Concept-Based Inquiry: How might 'unfamiliar' food sources reshape our cultural identity? Why do humans accept some innovations and reject others?",
      placeholder:
        "Think about the concepts of innovation, acceptance, and tradition. What patterns do you notice in how cultures adopt new foods?",
    },
    passages: [
      {
        heading: "Lab-grown Meat",
        body:
          "Lab-grown meat is animal flesh grown inside a laboratory. It is an alternative to red meat obtained by increasingly unsustainable farming practices. Studies show that producing lab-grown meat by using renewable energy would have a significantly lower carbon footprint than raising farm animals and making meat products in the most sustainable way.\n\nThis is how lab-grown meat is made. To begin with, lab scientists carefully remove a small number of cells from an animal. Then, they multiply and grow the harvested cells, and they produce real tissue, which is quite similar to conventional meat in terms of texture and smell. In this way, they can transform lab-grown cells into steak, chicken breasts, or hamburger meat. The final product itself is a real cut of meat, ready to be cooked.",
      },
      {
        heading: "Insects",
        body:
          "Even though eating insects may seem strange to some people, they have been part of human diets for a very long time. In fact, insect eating is practiced in about 130 countries!\n\nInsects will be important in the fight against hunger and climate change. They use much fewer resources than farm animals to produce the same amount of protein and can be raised on food waste, which makes raising them very cost-effective.\n\nThe main barrier to using insects as a source of protein is the negative image they have. Insects are associated with disease and dirt, so manufacturers of insect food products must overcome this to successfully win the public over. One solution has been to change the look of the insects, by drying and grinding them into powder. Rich in protein, insect flour is gaining popularity as a healthier replacement for wheat flour. In addition, insect oils are a promising field; they are already being used in some parts of the world for cooking.",
      },
    ],
    textbookQs: [
      { id: "Q5", q: "What is lab-grown meat?" },
      { id: "Q6", q: "What is the first step in making lab-grown meat?" },
      { id: "Q7", q: "What kinds of meat can lab-grown cells be transformed into?" },
      { id: "Q8", q: "What makes raising insects cost-effective?" },
      { id: "Q9", q: "What is the main barrier to using insects as a source of protein?" },
    ],
    vocab: [
      {
        word: "alternative",
        definition: "one of two or more available possibilities",
        choices: ["a forbidden choice", "another option that can be chosen", "the only option", "a copy"],
        answer: "another option that can be chosen",
      },
      {
        word: "conventional",
        definition: "based on or in accordance with what is generally done or believed",
        choices: ["highly experimental", "traditional or usual", "extremely rare", "secret"],
        answer: "traditional or usual",
      },
      {
        word: "harvest",
        definition: "to gather a crop; here, to collect cells or material for use",
        choices: ["to throw away", "to gather or collect", "to plant", "to destroy"],
        answer: "to gather or collect",
      },
      {
        word: "barrier",
        definition: "a circumstance or obstacle that keeps people or things apart or prevents progress",
        choices: ["a smooth path", "an opportunity", "an obstacle preventing progress", "a reward"],
        answer: "an obstacle preventing progress",
      },
      {
        word: "cost-effective",
        definition: "producing good results for the amount of money spent",
        choices: ["very expensive with little benefit", "providing good value for the money", "free of charge", "complicated to make"],
        answer: "providing good value for the money",
      },
    ],
    grammar: [
      {
        question:
          "Pick the correct relative pronoun: 'real tissue, _____ is quite similar to conventional meat'",
        choices: ["who", "which", "whose", "where"],
        answer: "which",
        explanation: "Non-restrictive relative clause referring to a thing → 'which'.",
      },
      {
        question:
          "Identify the participle phrase function: 'Rich in protein, insect flour is gaining popularity.'",
        choices: ["adverbial of time", "reduced relative clause modifying 'insect flour'", "noun phrase", "imperative"],
        answer: "reduced relative clause modifying 'insect flour'",
        explanation: "'(Being) Rich in protein' modifies 'insect flour' — a participial reduction.",
      },
      {
        question: "Choose the correct comparative: 'Insects use much _____ resources than farm animals.'",
        choices: ["few", "fewer", "less", "little"],
        answer: "fewer",
        explanation: "'Resources' is countable → use 'fewer' (not 'less').",
      },
    ],
    reflectionPrompt:
      "Concept-Based Reflection: Would you eat lab-grown meat or insect protein? Explain by connecting the concepts of innovation, sustainability, and cultural identity. Write 4–6 sentences in English.",
    reflectionConcepts: ["Innovation", "Acceptance", "Tradition", "Cultural Identity"],
    reflectionKeywords: [
      "alternative protein", "lab-grown meat", "insect flour",
      "cost-effective", "barrier", "overcome", "win the public over",
      "in my opinion", "however", "on the other hand",
    ],
  },
  {
    id: 3,
    title: "Part 3 · 3D Printed Food & Algae",
    subtitle: "Technology, nature, and the future of nutrition",
    pages: "pp. 65–66",
    inquiry: {
      question:
        "Concept-Based Inquiry: How can technology and nature work together to solve global problems? What responsibilities do individuals carry in a connected world?",
      placeholder:
        "Reflect on the concepts of interdependence, responsibility, and change. How do small choices add up to large impacts?",
    },
    passages: [
      {
        heading: "3D Printed Food",
        body:
          "3D food printing has the potential to save the environment, while revolutionizing food production; for example, it can convert alternative ingredients such as proteins from insects into delicious meals. The underlying concept for food printing is the same as any other 3D printing. In 3D food printing, various inks — liquid forms of food — are placed one layer at a time to build complex 3D constructs with full textures and customized nutrients.\n\n3D food printing can be readily undertaken in many parts of the globe. Various food inks with adequate nutrients and favorable flavors can be sent to areas that are hard to get to, where food can be printed on site. In this way, 3D printed food with necessary nutrients can be provided for large populations in areas affected by a natural disaster or a crisis developed by humans.",
      },
      {
        heading: "Algae",
        body:
          "Algae are the fastest growing plant organisms in nature and a great alternative source of vitamins, proteins, and minerals. Not only full of nutrients, they are also easy to grow and don't take up precious land space as they are grown in water. They can grow in places where normal food crops wouldn't survive and yield much higher productivity than crops grown on land. In addition, they create very rich habitats for plants and animals. On top of that, algae are very good at trapping carbon themselves, which helps slow down global warming.\n\nIndividual diets are complex and culturally influenced. It is a huge task to change one's diet to reduce the impact of food on climate, and not everyone can or will take the step forward. However, with the increasing demand for food and its effects on global warming, we ourselves need to start considering bringing changes to our diets. It's time for everyone to be a little more familiar with the unfamiliar.",
      },
    ],
    textbookQs: [
      { id: "Q10", q: "How is food made in 3D food printing?" },
      { id: "Q12", q: "What is the nutritional benefit of algae?" },
      { id: "Q13", q: "What is the advantage of algae in terms of global warming?" },
      { id: "Q14", q: "Think & Talk: Among the four kinds of food in the text, which do you think will be the most popular in 2050?" },
    ],
    vocab: [
      {
        word: "revolutionize",
        definition: "to change something radically or fundamentally",
        choices: ["to keep something the same", "to slightly improve", "to change something completely", "to delay"],
        answer: "to change something completely",
      },
      {
        word: "underlying",
        definition: "lying beneath the surface; fundamental",
        choices: ["obvious and visible", "fundamental and basic", "irrelevant", "decorative"],
        answer: "fundamental and basic",
      },
      {
        word: "adequate",
        definition: "satisfactory or acceptable in quality or quantity",
        choices: ["far too little", "barely enough or sufficient", "luxurious", "completely missing"],
        answer: "barely enough or sufficient",
      },
      {
        word: "yield",
        definition: "to produce or provide a natural, agricultural, or industrial product",
        choices: ["to consume entirely", "to produce or give as a result", "to refuse", "to delay"],
        answer: "to produce or give as a result",
      },
      {
        word: "habitat",
        definition: "the natural home or environment of an animal, plant, or other organism",
        choices: ["a man-made factory", "a natural environment of a living thing", "a kind of food", "a written law"],
        answer: "a natural environment of a living thing",
      },
    ],
    grammar: [
      {
        question:
          "Identify the conjunction usage: '_____ full of nutrients, they are also easy to grow.'",
        choices: ["Not only", "Either", "Neither", "Both"],
        answer: "Not only",
        explanation: "'Not only ... but also' construction with inversion-style fronting.",
      },
      {
        question:
          "Choose the correct relative adverb: 'They can grow in places _____ normal food crops wouldn't survive.'",
        choices: ["which", "what", "where", "when"],
        answer: "where",
        explanation: "Relative adverb 'where' refers to 'places' (location).",
      },
      {
        question:
          "Pick the correct gerund usage: 'we need to start _____ bringing changes to our diets.'",
        choices: ["consider", "considered", "considering", "to considering"],
        answer: "considering",
        explanation: "'Start' takes a gerund (-ing) here; 'considering' is also a gerund taking 'bringing' as its object.",
      },
    ],
    reflectionPrompt:
      "Concept-Based Reflection: 'It's time for everyone to be a little more familiar with the unfamiliar.' What does this mean for you personally? Connect to the concepts of change, responsibility, and global citizenship. Write 5–7 sentences in English.",
    reflectionConcepts: ["Change", "Responsibility", "Interdependence", "Global Citizenship"],
    reflectionKeywords: [
      "3D printed food", "algae", "trapping carbon",
      "natural disaster", "global warming", "individual diet",
      "as a global citizen", "I will", "step forward", "the unfamiliar",
    ],
  },
  {
    id: 4,
    title: "Part 4 · Grammar",
    subtitle: "유사관계대명사 & 독립부정사",
    pages: "Grammar Focus",
    passages: [
      {
        heading: "1. 유사관계대명사 (Pseudo-Relative Pronouns): as · but · than",
        body:
          "유사관계대명사는 형태상 접속사·전치사처럼 보이지만, 선행사를 받아 관계대명사처럼 절을 이끄는 단어입니다. 대표적으로 as / but / than 세 가지가 있습니다.\n\n• as — 'such, the same, as'와 같은 표현 뒤에서 선행사를 받습니다.\n  예) She is wearing the same dress as I bought yesterday. (내가 어제 산 것과 같은 드레스)\n  예) Choose such books as will help you. (너에게 도움이 될 만한 그런 책들을 골라라.)\n\n• but — 부정문에서 'who/which ... not'의 의미로 쓰입니다. (= that ... not)\n  예) There is no rule but has exceptions. (예외 없는 규칙은 없다.)\n  → = There is no rule that does not have exceptions.\n\n• than — 비교급(more, less, -er) 뒤에서 선행사를 받습니다.\n  예) Don't spend more money than is needed. (필요한 것보다 더 많은 돈을 쓰지 마라.)\n  예) He read more books than were on the shelf. (선반에 있던 것보다 더 많은 책을 읽었다.)",
      },
      {
        heading: "2. 독립부정사 (Independent Infinitives)",
        body:
          "독립부정사는 to부정사가 문장 전체를 수식하는 부사구처럼 쓰여, 화자의 태도나 부연 설명을 더하는 관용 표현입니다. 문장의 다른 성분과 문법적으로 직접 연결되지 않고 콤마로 분리됩니다.\n\n자주 쓰이는 독립부정사:\n• to be honest / to be frank (with you) — 솔직히 말하면\n• to tell (you) the truth — 사실대로 말하면\n• to begin with / to start with — 우선, 먼저\n• to make matters worse — 설상가상으로\n• to make a long story short — 간단히 말하자면\n• strange to say — 이상한 말이지만\n• needless to say — 말할 필요도 없이\n• so to speak — 말하자면\n• to do A justice — A를 정당하게 평가하면\n\n예) To be honest, I don't like the new design. (솔직히 말하면, 새 디자인이 마음에 들지 않아.)\n예) To make matters worse, it started to rain. (설상가상으로, 비가 내리기 시작했다.)\n예) Needless to say, health is more important than wealth. (말할 필요도 없이, 건강이 부보다 중요하다.)",
      },
    ],
    grammar: [
      // ── 유사관계대명사 5문항 ──
      {
        question: "[유사관계대명사] Choose the correct word: 'She has the same bag ___ I do.'",
        choices: ["that", "as", "than", "but"],
        answer: "as",
        explanation: "'the same ... as' 구문 — 선행사 'the same bag'을 받는 유사관계대명사 'as'.",
      },
      {
        question: "[유사관계대명사] Choose the correct word: 'There is no one ___ has weaknesses.'",
        choices: ["as", "than", "but", "which"],
        answer: "but",
        explanation: "부정문에서 'but'은 'who ... not'의 뜻 — '약점이 없는 사람은 없다'.",
      },
      {
        question: "[유사관계대명사] Choose the correct word: 'Don't drink more water ___ is necessary.'",
        choices: ["as", "than", "but", "that"],
        answer: "than",
        explanation: "비교급 'more ... than' 뒤에서 선행사를 받는 유사관계대명사 'than'.",
      },
      {
        question: "[유사관계대명사] Choose the correct word: 'Choose such friends ___ will encourage you.'",
        choices: ["who", "than", "but", "as"],
        answer: "as",
        explanation: "'such ... as' 구문 — 선행사 'such friends'를 받는 'as'.",
      },
      {
        question: "[유사관계대명사] Choose the correct word: 'There were more guests at the party ___ had been expected.'",
        choices: ["as", "than", "but", "what"],
        answer: "than",
        explanation: "비교급 'more ... than' 뒤의 유사관계대명사 'than' (= than those who).",
      },
      // ── 독립부정사 5문항 ──
      {
        question: "[독립부정사] Choose the correct expression: '___, I don't agree with the plan.'",
        choices: ["To be honest", "To honest", "Honest to be", "Being honest"],
        answer: "To be honest",
        explanation: "'솔직히 말하면'의 독립부정사는 'To be honest'.",
      },
      {
        question: "[독립부정사] Choose the correct expression: '___, the bus broke down on the way home.'",
        choices: ["To make matter worse", "To making matters worse", "To make matters worse", "Make matters worse"],
        answer: "To make matters worse",
        explanation: "'설상가상으로' = 'To make matters worse' (matters는 항상 복수형).",
      },
      {
        question: "[독립부정사] Choose the correct expression: '___, I have never been abroad.'",
        choices: ["To telling the truth", "To tell the truth", "Tell the truth", "Telling the truth"],
        answer: "To tell the truth",
        explanation: "'사실대로 말하면' = 'To tell the truth'.",
      },
      {
        question: "[독립부정사] Choose the correct expression: '___, exercise is essential for good health.'",
        choices: ["Need not to say", "Needing to say", "Needless to say", "No need to say"],
        answer: "Needless to say",
        explanation: "'말할 필요도 없이' = 'Needless to say'.",
      },
      {
        question: "[독립부정사] Choose the correct expression: '___, he is a walking dictionary.'",
        choices: ["So to speak", "So speaking", "To so speak", "Speaking so"],
        answer: "So to speak",
        explanation: "'말하자면' = 'So to speak'.",
      },
    ],
  },
];
