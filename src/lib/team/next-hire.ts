/**
 * The next hire, from a team's gaps: which skills a new person would add the
 * most, and a first draft of the job description that asks for them. The
 * draft uses the words the job-description reader listens for, so the role it
 * becomes weights those skills highest. A manager edits it before anything
 * happens; it is a starting point, not a decision.
 */

export interface TeamGap {
  key: string;
  name: string;
  reason: "low_team_level" | "single_point" | "no_one_strong";
}

const PRIORITY: Record<TeamGap["reason"], number> = { no_one_strong: 0, single_point: 1, low_team_level: 2 };

/** One line per skill, written so the reader's signals for that skill are present. */
const ASK: Record<string, { en: string; ar: string }> = {
  communication: {
    en: "Communicates clearly in writing and in person: explains complex points simply, listens well and persuades without pressure.",
    ar: "يتواصل بوضوح كتابةً وشفهيًا: يشرح الأفكار المعقدة ببساطة، ويحسن الإصغاء، ويجيد الإقناع دون ضغط.",
  },
  collaboration: {
    en: "Builds strong relationships with stakeholders and partners with other teams to get things done.",
    ar: "يبني علاقات قوية مع أصحاب المصلحة، ويعمل بروح التعاون مع الفرق الأخرى لإنجاز العمل.",
  },
  leadership: {
    en: "Takes ownership, mentors and coaches others, and sets direction when it is unclear.",
    ar: "يتحمّل المسؤولية، ويتولى توجيه الآخرين وإرشادهم، ويحسن قيادة الفريق حين يغيب الوضوح.",
  },
  management: {
    en: "Plans and prioritises the work, manages deadlines and resources, and follows through on what was agreed.",
    ar: "يحسن التخطيط وترتيب الأولويات، ويلتزم بالمواعيد ويدير الموارد، ويحرص على متابعة ما اتُّفق عليه.",
  },
  "critical-thinking": {
    en: "Analyses data to find the root cause, weighs the evidence and turns metrics into insight.",
    ar: "يحلل البيانات للوصول إلى السبب الجذري، ويقرأ المؤشرات بعناية ويحوّلها إلى فهم واضح.",
  },
  judgment: {
    en: "Makes sound decisions under pressure, weighs risk and trade-offs, and knows when to escalate.",
    ar: "يتخذ قرارات سليمة تحت الضغط، ويوازن بين المخاطر والبدائل، ويعرف متى يلجأ إلى التصعيد.",
  },
  adaptability: {
    en: "Adapts quickly in a fast-paced, changing environment, is comfortable with ambiguity and learns quickly.",
    ar: "يتكيف بسرعة في بيئة متغيرة، ويتعامل مع الغموض بهدوء، ويتمتع بالمرونة والقدرة على التعلم بسرعة.",
  },
  "product-thinking": {
    en: "Thinks about the user and the product: understands customer needs, shapes the roadmap and tests ideas with small experiments.",
    ar: "يفكر في المستخدم والمنتج: يفهم احتياجات المستفيدين، ويسهم في خارطة الطريق، ويختبر الأفكار بتجارب صغيرة.",
  },
  technical: {
    en: "Brings solid technical depth in the tools and systems the team relies on.",
    ar: "يمتلك عمقًا تقنيًا في الأدوات والأنظمة التي يعتمد عليها الفريق.",
  },
};

export interface NextHire {
  skills: { key: string; name: string; reason: TeamGap["reason"] }[];
  jobDescription: string;
}

/** The skills a new person would add the most (up to three), most urgent first. */
export function hireSkills(gaps: TeamGap[]): TeamGap[] {
  return [...gaps]
    .filter((g) => ASK[g.key])
    .sort((a, b) => PRIORITY[a.reason] - PRIORITY[b.reason])
    .slice(0, 3);
}

function list(items: string[], locale: "en" | "ar"): string {
  if (items.length <= 1) return items[0] ?? "";
  if (locale === "ar") return `${items.slice(0, -1).join("، ")} و${items.at(-1)}`;
  return items.length === 2 ? `${items[0]} and ${items[1]}` : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export function nextHire(team: { name: string; gaps: TeamGap[] }, locale: "en" | "ar"): NextHire | null {
  const skills = hireSkills(team.gaps);
  if (!skills.length) return null;
  const names = skills.map((s) => (locale === "en" ? s.name.toLowerCase() : s.name));
  const asks = skills.map((s) => `- ${ASK[s.key]![locale]}`);
  const jobDescription =
    locale === "ar"
      ? [
          `عضو جديد في فريق ${team.name}`,
          "",
          `يبحث فريق ${team.name} عن زميل جديد. تُظهر تقييمات الفريق أن أكبر إضافة يمكن أن يقدّمها الشخص المناسب هي في ${list(names, locale)}.`,
          "",
          "ما نبحث عنه",
          ...asks,
          "- يشارك ما يتعلمه مع زملائه ويرفع مستوى الفريق من حوله.",
          "",
          "عن الفريق",
          "فريق صغير يعمل بجدية ويقدّر الوضوح والصدق في العمل اليومي.",
        ].join("\n")
      : [
          `${team.name}: new team member`,
          "",
          `${team.name} is hiring. The team's assessments show that the right person would add the most in ${list(names, locale)}.`,
          "",
          "What we're looking for",
          ...asks,
          "- Shares what they know with colleagues and lifts the people around them.",
          "",
          "About the team",
          "A small team that works hard and values clarity and honesty in the everyday work.",
        ].join("\n");
  return { skills: skills.map((s) => ({ key: s.key, name: s.name, reason: s.reason })), jobDescription };
}
