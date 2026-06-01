export function slugifyFinanceCode(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return normalized || "finance";
}

export function buildFeeItemDedupeKey(input: {
  feeGroupId: string;
  name: string;
  classId?: string | null;
  armId?: string | null;
  sessionId: string;
  termId: string;
}) {
  return [
    input.feeGroupId,
    input.name.trim().toLowerCase(),
    input.classId ?? "global",
    input.armId ?? "all-arms",
    input.sessionId,
    input.termId,
  ].join("::");
}
