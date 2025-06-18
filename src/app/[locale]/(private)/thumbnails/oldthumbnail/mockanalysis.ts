// mock-analysis.ts
export const thumbnailOptions = [
  {
    id: "A",
    title: "Cover A",
    imageUrl: "/thumbnail1.png",
    coreDesign: "Close-up + yellow",
  },
  {
    id: "B",
    title: "Cover B",
    imageUrl: "/thumbnail2.png",
    coreDesign: "Black + white + large text",
  },
  {
    id: "C",
    title: "Cover C",
    imageUrl: "/thumbnail3.png",
    coreDesign: "Scene + small heading",
  },
];

export const aiAnalysis = {
  A: "recommended",
  B: "not_recommended",
  C: "recommended",
};

export const radarData = {
  A: { clarity: 4.8, branding: 4.2, stoppingPower: 5 },
  B: { clarity: 3.2, branding: 3.5, stoppingPower: 2.9 },
  C: { clarity: 4.0, branding: 4.5, stoppingPower: 4.2 },
};

export const teamVotes = [
  { name: "Jen", voted: "A", comment: "I vote A because it looks so eye-catching!" },
  { name: "Greg", voted: "C", comment: "C has the best aesthetic imo" },
  { name: "Anna", voted: "A", comment: "A pops out more to me" },
];

export const summary = {
  final: "A",
  reason:
    "It’s the most visually *striking* image when compared, and matches thumbnail styles in our top-performing videos.",
};

export const learnings = [
  "Faces worked better than a visual scene",
  "Minimal colors are more effective",
];
