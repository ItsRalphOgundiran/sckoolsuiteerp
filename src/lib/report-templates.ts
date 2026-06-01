export type ReportTemplateLayout = {
  header?: boolean;
  sections?: string[];
};

export type ReportTemplateConfig = {
  name: string;
  level?: string;
  classGroupName?: string;
  className?: string;
  isDefault?: boolean;
  layout?: ReportTemplateLayout;
};

export type ResolvedReportTemplate = {
  template: ReportTemplateConfig | null;
  variant: "prenursery" | "primary" | "standard";
  sections: string[];
  showHeader: boolean;
};

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function matches(value: string | undefined, target: string | null | undefined) {
  const normalizedValue = normalize(value);
  const normalizedTarget = normalize(target);
  return Boolean(normalizedValue && normalizedTarget && normalizedValue === normalizedTarget);
}

function includes(value: string | undefined, target: string | null | undefined) {
  const normalizedValue = normalize(value);
  const normalizedTarget = normalize(target);
  return Boolean(normalizedValue && normalizedTarget && normalizedTarget.includes(normalizedValue));
}

export function resolveReportTemplate(
  templates: ReportTemplateConfig[] | undefined,
  context: { className?: string | null; classGroupName?: string | null },
): ResolvedReportTemplate {
  const items = Array.isArray(templates) ? templates : [];
  const matched =
    items.find((item) => matches(item.className, context.className)) ??
    items.find((item) => matches(item.classGroupName, context.classGroupName)) ??
    items.find((item) => includes(item.level, context.classGroupName)) ??
    items.find((item) => item.isDefault === true) ??
    items[0] ??
    null;

  const templateName = normalize(matched?.name || matched?.level);
  const inferredSource = templateName || normalize(context.classGroupName) || normalize(context.className);
  const variant = inferredSource.includes("prenursery")
    ? "prenursery"
    : inferredSource.includes("primary")
      ? "primary"
      : "standard";
  const sections = matched?.layout?.sections?.length ? matched.layout.sections : ["bio", "performance", "attendance"];
  const showHeader = matched?.layout?.header !== false;

  return {
    template: matched,
    variant,
    sections,
    showHeader,
  };
}
