import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Check,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  Info,
  Lock,
  MoreHorizontal,
  ShieldCheck,
  Unlock,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TaxonomyTree } from "@/components/TaxonomyTree";
import { cn } from "@/lib/utils";
import {
  taxonomyAllIds,
  taxonomyGroups,
  taxonomyTotalCount,
  type TaxonomyGroup,
} from "@/lib/vsme-taxonomy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Disclosure Workspace | Field-level confidentiality" },
      {
        name: "description",
        content: "Prepare financial disclosures and control which fields appear in public exports.",
      },
      { property: "og:title", content: "Disclosure Workspace" },
      {
        property: "og:description",
        content: "A secure workspace for preparing public financial disclosures.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DisclosureWorkspace,
});

type Treatment = "switch" | "trailing" | "review" | "tree";
type PreviewMode = "internal" | "public";

type DisclosureField = {
  id: string;
  label: string;
  value: string;
  description: string;
  confidential: boolean;
};

const initialFields: DisclosureField[] = [
  {
    id: "entity",
    label: "Entity name",
    value: "Northstar Dynamics, Inc.",
    description: "Legal name used in the filing",
    confidential: false,
  },
  {
    id: "revenue",
    label: "Total revenue",
    value: "$48,750,000",
    description: "Gross revenue for fiscal year 2026",
    confidential: false,
  },
  {
    id: "expenses",
    label: "Operating expenses",
    value: "$31,420,000",
    description: "Total operating costs before tax",
    confidential: false,
  },
  {
    id: "compensation",
    label: "Executive compensation",
    value: "$3,860,000",
    description: "Combined compensation for named officers",
    confidential: true,
  },
  {
    id: "research",
    label: "R&D investment",
    value: "$9,280,000",
    description: "Research and product development spend",
    confidential: true,
  },
  {
    id: "income",
    label: "Net income",
    value: "$5,940,000",
    description: "Income after tax and extraordinary items",
    confidential: false,
  },
];

const treatments: Array<{ id: Treatment; label: string }> = [
  { id: "switch", label: "Inline toggle" },
  { id: "trailing", label: "Trailing lock" },
  { id: "review", label: "Bulk review" },
  { id: "tree", label: "Hierarchical tree" },
];

function StatusBadge({ confidential }: { confidential: boolean }) {
  const Icon = confidential ? Lock : Eye;
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
        confidential ? "bg-confidential-soft text-confidential" : "bg-public-soft text-public",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {confidential ? "Confidential" : "Public"}
    </span>
  );
}

function DisclosureWorkspace() {
  const [fields, setFields] = useState(initialFields);
  const [treatment, setTreatment] = useState<Treatment>("switch");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("public");
  const [confidentialIds, setConfidentialIds] = useState<Set<string>>(() => new Set<string>());

  const isTree = treatment === "tree";
  const totalCount = isTree ? taxonomyTotalCount : fields.length;
  const confidentialCount = isTree ? confidentialIds.size : fields.filter((field) => field.confidential).length;
  const publicCount = totalCount - confidentialCount;

  const visibleFields = useMemo(
    () => (previewMode === "internal" ? fields : fields.filter((field) => !field.confidential)),
    [fields, previewMode],
  );

  const visibleTaxonomy = useMemo(
    () =>
      taxonomyGroups
        .map((group) => ({
          group,
          hidden: previewMode === "public" && confidentialIds.has(group.id),
          children: group.children.filter(
            (child) => previewMode === "internal" || !confidentialIds.has(child.id),
          ),
        }))
        .filter((entry) => !entry.hidden || entry.children.length > 0),
    [confidentialIds, previewMode],
  );

  const setConfidential = (id: string, confidential: boolean) => {
    const field = fields.find((item) => item.id === id);
    setFields((current) => current.map((item) => (item.id === id ? { ...item, confidential } : item)));
    if (field) {
      toast.success(`${field.label} is now ${confidential ? "confidential" : "public"}`, {
        description: confidential
          ? "It will be omitted from the public export."
          : "It will appear in the public export.",
      });
    }
  };

  const setTaxonomyNode = (id: string, title: string, confidential: boolean) => {
    setConfidentialIds((current) => {
      const next = new Set(current);
      if (confidential) next.add(id);
      else next.delete(id);
      return next;
    });
    toast.success(`${title} is now ${confidential ? "confidential" : "public"}`);
  };

  const setTaxonomyGroup = (group: TaxonomyGroup, confidential: boolean) => {
    const ids = [group.id, ...group.children.map((child) => child.id)];
    setConfidentialIds((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (confidential) next.add(id);
        else next.delete(id);
      }
      return next;
    });
    toast.success(`${group.title} marked ${confidential ? "confidential" : "public"}`, {
      description: group.children.length
        ? `${group.children.length} child fields updated to match.`
        : undefined,
    });
  };

  const setAllTaxonomy = (confidential: boolean) => {
    setConfidentialIds(confidential ? new Set(taxonomyAllIds) : new Set<string>());
    toast.success(confidential ? "All taxonomy fields marked confidential" : "All taxonomy fields reset to public");
  };

  const updateValue = (id: string, value: string) => {
    setFields((current) => current.map((item) => (item.id === id ? { ...item, value } : item)));
  };

  const setAll = (confidential: boolean) => {
    setFields((current) => current.map((field) => ({ ...field, confidential })));
    toast.success(confidential ? "All fields marked confidential" : "All fields marked public");
  };

  const exportPublic = () => {
    const exportData = isTree
      ? {
          disclosures: taxonomyAllIds.filter((id) => !confidentialIds.has(id)),
        }
      : Object.fromEntries(
          fields.filter((field) => !field.confidential).map((field) => [field.label, field.value]),
        );
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = isTree ? "vsme-public-disclosure.json" : "northstar-public-disclosure.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Public disclosure exported", {
      description: `${publicCount} fields included. ${confidentialCount} confidential fields omitted.`,
    });
  };

  return (
    <TooltipProvider delayDuration={250}>
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-5 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <FileCheck2 className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-base font-semibold leading-none">Disclosure Workspace</p>
                <p className="mt-1 text-xs text-muted-foreground">FY 2026 Annual Filing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <Check className="size-3.5 text-public" aria-hidden="true" />
                Changes saved
              </div>
              <Button variant="ghost" size="icon" aria-label="More options">
                <MoreHorizontal />
              </Button>
              <Button onClick={exportPublic}>
                <Download />
                <span className="hidden sm:inline">Export public filing</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-5 py-7 lg:px-8 lg:py-9">
          <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="size-4" aria-hidden="true" />
                Northstar Dynamics, Inc.
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-normal sm:text-4xl">Financial disclosure</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Complete the filing and control exactly what is shared outside your organization.
              </p>
            </div>
            <div aria-label="Confidentiality control style" className="flex w-full gap-1 rounded-md border border-border bg-muted p-1 xl:w-auto">
              {treatments.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTreatment(item.id)}
                  aria-pressed={treatment === item.id}
                  className={cn(
                    "h-8 flex-1 px-3 text-muted-foreground shadow-none xl:flex-none",
                    treatment === item.id && "bg-surface text-foreground shadow-sm hover:bg-surface",
                  )}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </section>

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section aria-labelledby="disclosure-fields-heading">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 id="disclosure-fields-heading" className="font-display text-lg font-semibold">
                    {isTree ? "VSME taxonomy fields" : "Disclosure fields"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isTree
                      ? `${taxonomyGroups.length} parent sections · ${taxonomyTotalCount} fields · parent selections cascade`
                      : "Six required fields · values save automatically"}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="About field confidentiality">
                      <Info />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">Confidential fields remain visible internally but are excluded from external exports.</TooltipContent>
                </Tooltip>
              </div>

              {isTree ? (
                <TaxonomyTree
                  confidentialIds={confidentialIds}
                  onSetGroup={setTaxonomyGroup}
                  onToggleNode={setTaxonomyNode}
                  onSetAll={setAllTaxonomy}
                />
              ) : treatment === "review" ? (
                <BulkReview fields={fields} onChange={setConfidential} onSetAll={setAll} />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {fields.map((field) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      treatment={treatment}
                      onChange={(value) => updateValue(field.id, value)}
                      onConfidentialChange={(value) => setConfidential(field.id, value)}
                    />
                  ))}
                </div>
              )}
            </section>

            <aside className="xl:sticky xl:top-6 xl:self-start" aria-labelledby="preview-heading">
              <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-panel">
                <div className="border-b border-border p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live preview</p>
                      <h2 id="preview-heading" className="mt-1 font-display text-lg font-semibold">Filing output</h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-live-soft px-2.5 py-1 text-xs font-semibold text-live">
                      <span className="size-1.5 rounded-full bg-live" /> Live
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewMode("internal")}
                      className={cn("shadow-none", previewMode === "internal" && "bg-surface shadow-sm hover:bg-surface")}
                    >
                      <Eye /> Internal view
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewMode("public")}
                      className={cn("shadow-none", previewMode === "public" && "bg-surface shadow-sm hover:bg-surface")}
                    >
                      <EyeOff /> Public export
                    </Button>
                  </div>
                </div>

                <div className="min-h-[420px] bg-document p-4 sm:p-6">
                  <div className="mx-auto min-h-[360px] max-w-sm border border-border bg-surface px-6 py-7 shadow-paper sm:px-8">
                    <div className="border-b border-foreground pb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {isTree ? "VSME sustainability report" : "Annual financial disclosure"}
                      </p>
                      <h3 className="mt-1.5 font-display text-xl font-semibold">Northstar Dynamics, Inc.</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Fiscal year ending December 31, 2026</p>
                    </div>
                    {isTree ? (
                      <div className="max-h-[420px] space-y-3 overflow-y-auto py-3">
                        {visibleTaxonomy.map(({ group, hidden, children }) => (
                          <div key={group.id}>
                            <p className={cn("text-xs font-semibold", hidden && "text-muted-foreground line-through")}>
                              {group.code ? `${group.code} · ` : ""}
                              {group.title}
                            </p>
                            {children.length > 0 && (
                              <ul className="mt-1 space-y-0.5 pl-3">
                                {children.map((child) => (
                                  <li key={child.id} className="text-[11px] leading-5 text-muted-foreground">
                                    · {child.title}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {visibleFields.map((field) => (
                          <div key={field.id} className="flex items-start justify-between gap-5 py-3.5">
                            <span className="text-xs leading-5 text-muted-foreground">{field.label}</span>
                            <span className="text-right text-xs font-semibold leading-5">{field.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {previewMode === "public" && confidentialCount > 0 && (
                      <div className="mt-5 flex items-start gap-2 border-l-2 border-confidential bg-confidential-soft p-3 text-xs text-confidential">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <p><strong>{confidentialCount} {confidentialCount === 1 ? "field" : "fields"} omitted</strong><br />Protected values are not included in this export.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border bg-surface px-5 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-public">{publicCount} public</span>
                    <span className="text-border">/</span>
                    <span className="font-semibold text-confidential">{confidentialCount} confidential</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {previewMode === "public"
                      ? `${publicCount} of ${totalCount} included`
                      : `${totalCount} of ${totalCount} visible`}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}

function FieldCard({
  field,
  treatment,
  onChange,
  onConfidentialChange,
}: {
  field: DisclosureField;
  treatment: Exclude<Treatment, "review">;
  onChange: (value: string) => void;
  onConfidentialChange: (value: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-4 transition-colors",
        field.confidential ? "border-confidential-border bg-confidential-wash" : "border-border",
      )}
    >
      <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
        <label htmlFor={field.id} className="text-sm font-semibold">{field.label}</label>
        {treatment === "switch" ? (
          <div className="flex items-center gap-2">
            <StatusBadge confidential={field.confidential} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Switch
                  checked={field.confidential}
                  onCheckedChange={onConfidentialChange}
                  aria-label={`Mark ${field.label} as confidential`}
                  className="data-[state=checked]:bg-confidential"
                />
              </TooltipTrigger>
              <TooltipContent>{field.confidential ? "Make visible in public export" : "Exclude from public export"}</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <StatusBadge confidential={field.confidential} />
        )}
      </div>
      <div className="relative">
        <Input
          id={field.id}
          value={field.value}
          onChange={(event) => onChange(event.target.value)}
          className={cn("h-11 bg-surface font-medium", treatment === "trailing" && "pr-12")}
        />
        {treatment === "trailing" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onConfidentialChange(!field.confidential)}
                aria-label={`${field.confidential ? "Make" : "Mark"} ${field.label} ${field.confidential ? "public" : "confidential"}`}
                className={cn(
                  "absolute right-1 top-1 size-9",
                  field.confidential ? "bg-confidential-soft text-confidential hover:bg-confidential-soft" : "text-muted-foreground",
                )}
              >
                {field.confidential ? <Lock /> : <Unlock />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{field.confidential ? "Confidential — click to make public" : "Public — click to protect"}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{field.description}</p>
    </div>
  );
}

function BulkReview({
  fields,
  onChange,
  onSetAll,
}: {
  fields: DisclosureField[];
  onChange: (id: string, value: boolean) => void;
  onSetAll: (value: boolean) => void;
}) {
  const allConfidential = fields.every((field) => field.confidential);
  const noneConfidential = fields.every((field) => !field.confidential);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allConfidential ? true : noneConfidential ? false : "indeterminate"}
            onCheckedChange={(checked) => onSetAll(checked === true)}
            aria-label="Select all fields"
          />
          <span className="text-sm font-semibold">Field visibility review</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onSetAll(false)}><Eye /> Make all public</Button>
          <Button variant="ghost" size="sm" onClick={() => onSetAll(true)}><Lock /> Protect all</Button>
        </div>
      </div>
      <div className="hidden grid-cols-[minmax(180px,1fr)_minmax(150px,0.7fr)_150px] border-b border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground md:grid">
        <span>Disclosure field</span><span>Current value</span><span>Export status</span>
      </div>
      <div className="divide-y divide-border">
        {fields.map((field) => (
          <div
            key={field.id}
            className={cn(
              "grid gap-3 px-4 py-4 transition-colors md:grid-cols-[minmax(180px,1fr)_minmax(150px,0.7fr)_150px] md:items-center",
              field.confidential && "bg-confidential-wash",
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={field.confidential}
                onCheckedChange={(checked) => onChange(field.id, checked === true)}
                aria-label={`Mark ${field.label} confidential`}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold">{field.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
              </div>
            </div>
            <p className="pl-7 text-sm font-medium md:pl-0">{field.value}</p>
            <div className="pl-7 md:pl-0"><StatusBadge confidential={field.confidential} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}