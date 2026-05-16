const gradeScale = [
  { min: 95, grade: "A+", gpa: 5 },
  { min: 90, grade: "A", gpa: 4.5 },
  { min: 80, grade: "B+", gpa: 4 },
  { min: 70, grade: "B", gpa: 3 },
  { min: 60, grade: "C+", gpa: 2.5 },
  { min: 55, grade: "C", gpa: 2 },
  { min: 50, grade: "C-", gpa: 1.5 },
  { min: 45, grade: "D", gpa: 1 },
  { min: 40, grade: "E", gpa: 0.5 },
  { min: 0, grade: "U", gpa: 0 },
] as const;

export function calculateGrade(total: number) {
  return gradeScale.find((entry) => total >= entry.min) ?? gradeScale[gradeScale.length - 1];
}

export function computeScore(caScore: number, examScore: number) {
  const total = caScore + examScore;
  const gradeMeta = calculateGrade(total);
  return {
    total,
    grade: gradeMeta.grade,
    gpa: gradeMeta.gpa,
  };
}
