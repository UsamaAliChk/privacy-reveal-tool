import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Building2,
  Check,
  Factory,
  Globe2,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entity Profile | Disclosure Workspace" },
      {
        name: "description",
        content: "Manage an entity profile with section-level confidentiality controls.",
      },
      { property: "og:title", content: "Entity Profile | Disclosure Workspace" },
      {
        property: "og:description",
        content: "A secure workspace for managing entity information and disclosure visibility.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntityProfile,
});

type SectionId = "general" | "subsidiaries" | "certifications" | "properties";

type Subsidiary = {
  id: number;
  name: string;
  jurisdiction: string;
  ownership: string;
};

const generalFields = [
  { id: "legalName", label: "Legal entity name", value: "Northstar Dynamics, Inc." },
  { id: "tradingName", label: "Trading name", value: "Northstar Dynamics" },
  { id: "registration", label: "Registration number", value: "US-DE-8472916" },
  { id: "entityType", label: "Legal form", value: "Corporation" },
  { id: "founded", label: "Year established", value: "2012" },
  { id: "industry", label: "Primary industry", value: "Advanced manufacturing" },
  { id: "employees", label: "Employees", value: "428" },
  { id: "website", label: "Website", value: "northstardynamics.example" },
  { id: "headquarters", label: "Headquarters", value: "Boston, Massachusetts" },
  { id: "reportingPeriod", label: "Reporting period", value: "FY 2026" },
];

const initialSubsidiaries: Subsidiary[] = [
  { id: 1, name: "Northstar Robotics GmbH", jurisdiction: "Germany", ownership: "100%" },
  { id: 2, name: "Northstar Systems Ltd.", jurisdiction: "United Kingdom", ownership: "85%" },
  { id: 3, name: "Polaris Materials, Inc.", jurisdiction: "United States", ownership: "72%" },
];

const certifications = [
  { name: "ISO 14001", detail: "Environmental management", valid: "Valid through 2028" },
  { name: "ISO 9001", detail: "Quality management", valid: "Valid through 2027" },
  { name: "EcoVadis Gold", detail: "Sustainability rating", valid: "Awarded 2026" },
];

const properties = [
  { name: "Boston Headquarters", detail: "Office · 84,000 sq ft", location: "Massachusetts, US" },
  { name: "Dresden Production Site", detail: "Manufacturing · 126,000 sq ft", location: "Saxony, DE" },
  { name: "Cambridge Research Lab", detail: "R&D · 42,500 sq ft", location: "Cambridgeshire, UK" },
];

function ConfidentialityStatus({ inherited, confidential }: { inherited: boolean; confidential: boolean }) {
  if (inherited) {
    return (
      <Badge className="gap-1.5 border-confidential-border bg-confidential-soft text-confidential shadow-none hover:bg-confidential-soft">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Inherited
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        "gap-1.5 border-transparent shadow-none",
        confidential
          ? "bg-confidential-soft text-confidential hover:bg-confidential-soft"
          : "bg-public-soft text-public hover:bg-public-soft",
      )}
    >
      {confidential ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
      {confidential ? "Confidential" : "Public"}
    </Badge>
  );
}

function SectionHeader({
  id,
  title,
  description,
  icon: Icon,
  masterConfidential,
  confidential,
  onChange,
}: {
  id: SectionId;
  title: string;
  description: string;
  icon: typeof Building2;
  masterConfidential: boolean;
  confidential: boolean;
  onChange: (id: SectionId, value: boolean) => void;
}) {
  const effectiveConfidential = masterConfidential || confidential;

  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface text-primary">
          <Icon className="size-4.5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5 self-end sm:self-auto">
        <ConfidentialityStatus inherited={masterConfidential} confidential={effectiveConfidential} />
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Switch
                checked={effectiveConfidential}
                disabled={masterConfidential}
                onCheckedChange={(checked) => onChange(id, checked)}
                aria-label={`Mark ${title} confidential`}
                className="data-[state=checked]:bg-confidential"
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {masterConfidential
              ? "Inherited from Card Confidentiality"
              : effectiveConfidential
                ? "Make this section public"
                : "Make this section confidential"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function EntityProfile() {
  const [masterConfidential, setMasterConfidential] = useState(false);
  const [sectionConfidential, setSectionConfidential] = useState<Record<SectionId, boolean>>({
    general: false,
    subsidiaries: true,
    certifications: false,
    properties: false,
  });
  const [fields, setFields] = useState(() => Object.fromEntries(generalFields.map((field) => [field.id, field.value])));
  const [subsidiaries, setSubsidiaries] = useState(initialSubsidiaries);
  const [nextSubsidiaryId, setNextSubsidiaryId] = useState(4);

  const updateSection = (id: SectionId, value: boolean) => {
    setSectionConfidential((current) => ({ ...current, [id]: value }));
    toast.success(`${sectionTitles[id]} is now ${value ? "confidential" : "public"}`);
  };

  const updateMaster = (value: boolean) => {
    setMasterConfidential(value);
    toast.success(value ? "Entire card marked confidential" : "Card-level confidentiality removed", {
      description: value ? "All sections now inherit this setting." : "Section-level settings have been restored.",
    });
  };

  const addSubsidiary = () => {
    const id = nextSubsidiaryId;
    setNextSubsidiaryId((current) => current + 1);
    setSubsidiaries((current) => [
      ...current,
      { id, name: "New subsidiary", jurisdiction: "Jurisdiction", ownership: "100%" },
    ]);
    toast.success("Subsidiary added");
  };

  const removeSubsidiary = (id: number, name: string) => {
    setSubsidiaries((current) => current.filter((subsidiary) => subsidiary.id !== id));
    toast.success(`${name} removed`);
  };

  return (
    <TooltipProvider delayDuration={250}>
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <Building2 className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold sm:text-base">Entity Registry</p>
                <p className="hidden text-xs text-muted-foreground sm:block">Organization record</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="size-4 text-public" aria-hidden="true" />
              Changes saved
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-6">
            <p className="text-sm font-medium text-primary">Organization settings</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-normal">Entity profile</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Maintain the organization record and control which groups are included in external disclosures.
            </p>
          </div>

          <Card className={cn("overflow-hidden rounded-lg border-border shadow-panel", masterConfidential && "border-confidential-border")}>
            <CardHeader className={cn("border-b border-border p-5 sm:p-6", masterConfidential && "bg-confidential-wash")}>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className={cn("grid size-12 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground", masterConfidential && "bg-confidential")}>
                    {masterConfidential ? <Lock className="size-5" /> : <Building2 className="size-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-semibold">Northstar Dynamics, Inc.</h2>
                      <Badge variant="outline" className="bg-surface text-muted-foreground">Active</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" /> Boston, Massachusetts · US-DE-8472916
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-3 sm:justify-start">
                  <div className="text-right">
                    <Label htmlFor="card-confidentiality" className="text-sm font-semibold">Card Confidentiality</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {masterConfidential ? "All sections are protected" : "Set all sections at once"}
                    </p>
                  </div>
                  <Switch
                    id="card-confidentiality"
                    checked={masterConfidential}
                    onCheckedChange={updateMaster}
                    className="data-[state=checked]:bg-confidential"
                  />
                </div>
              </div>
              {masterConfidential && (
                <div className="mt-4 flex items-start gap-2 rounded-md border border-confidential-border bg-confidential-soft px-3 py-2.5 text-xs leading-5 text-confidential">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Every section inherits Card Confidentiality. Turn it off to restore individual section settings.
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <section aria-labelledby="general-heading">
                <SectionHeader
                  id="general"
                  title="General Information"
                  description="Legal identity, operating details, and reporting profile"
                  icon={Building2}
                  masterConfidential={masterConfidential}
                  confidential={sectionConfidential.general}
                  onChange={updateSection}
                />
                <div className={cn("grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6", (masterConfidential || sectionConfidential.general) && "bg-confidential-wash/40")}>
                  {generalFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-xs text-muted-foreground">{field.label}</Label>
                      <Input
                        id={field.id}
                        value={fields[field.id] ?? ""}
                        onChange={(event) => setFields((current) => ({ ...current, [field.id]: event.target.value }))}
                        className="h-10 bg-surface"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section aria-labelledby="subsidiaries-heading" className="border-t border-border">
                <SectionHeader
                  id="subsidiaries"
                  title="Subsidiaries"
                  description={`${subsidiaries.length} controlled corporate entities`}
                  icon={Factory}
                  masterConfidential={masterConfidential}
                  confidential={sectionConfidential.subsidiaries}
                  onChange={updateSection}
                />
                <div className={cn("p-5 sm:p-6", (masterConfidential || sectionConfidential.subsidiaries) && "bg-confidential-wash/40")}>
                  <div className="overflow-hidden rounded-md border border-border bg-surface">
                    {subsidiaries.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-muted-foreground">No subsidiaries added.</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {subsidiaries.map((subsidiary) => (
                          <div key={subsidiary.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_180px_80px_36px] sm:items-center">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                                <Building2 className="size-4" aria-hidden="true" />
                              </div>
                              <p className="truncate text-sm font-semibold">{subsidiary.name}</p>
                            </div>
                            <p className="pl-11 text-sm text-muted-foreground sm:pl-0">{subsidiary.jurisdiction}</p>
                            <Badge variant="secondary" className="ml-11 w-fit sm:ml-0">{subsidiary.ownership}</Badge>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSubsidiary(subsidiary.id, subsidiary.name)}
                                  aria-label={`Remove ${subsidiary.name}`}
                                  className="ml-auto size-8 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove subsidiary</TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={addSubsidiary} className="mt-4">
                    <Plus /> Add subsidiary
                  </Button>
                </div>
              </section>

              <div className="grid border-t border-border lg:grid-cols-2 lg:divide-x lg:divide-border">
                <section aria-labelledby="certifications-heading">
                  <SectionHeader
                    id="certifications"
                    title="Certifications"
                    description="Standards and third-party ratings"
                    icon={Award}
                    masterConfidential={masterConfidential}
                    confidential={sectionConfidential.certifications}
                    onChange={updateSection}
                  />
                  <div className={cn("space-y-3 p-5 sm:p-6", (masterConfidential || sectionConfidential.certifications) && "bg-confidential-wash/40")}>
                    {certifications.map((certification) => (
                      <div key={certification.name} className="flex items-start gap-3 rounded-md border border-border bg-surface p-3.5">
                        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-public-soft text-public">
                          <Award className="size-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{certification.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{certification.detail}</p>
                          <p className="mt-2 text-xs font-medium text-public">{certification.valid}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section aria-labelledby="properties-heading" className="border-t border-border lg:border-t-0">
                  <SectionHeader
                    id="properties"
                    title="Properties"
                    description="Principal offices and operating sites"
                    icon={MapPin}
                    masterConfidential={masterConfidential}
                    confidential={sectionConfidential.properties}
                    onChange={updateSection}
                  />
                  <div className={cn("space-y-3 p-5 sm:p-6", (masterConfidential || sectionConfidential.properties) && "bg-confidential-wash/40")}>
                    {properties.map((property) => (
                      <div key={property.name} className="flex items-start gap-3 rounded-md border border-border bg-surface p-3.5">
                        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-primary">
                          <MapPin className="size-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{property.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{property.detail}</p>
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                            <Globe2 className="size-3" aria-hidden="true" /> {property.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </TooltipProvider>
  );
}

const sectionTitles: Record<SectionId, string> = {
  general: "General Information",
  subsidiaries: "Subsidiaries",
  certifications: "Certifications",
  properties: "Properties",
};