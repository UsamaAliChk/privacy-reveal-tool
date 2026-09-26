import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronUp, Info, LockKeyhole, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/c2")({
  head: () => ({
    meta: [
      { title: "C2 Practices, Policies & Future Initiatives | VSME Reporting" },
      { name: "description", content: "Complete the C2 VSME disclosure with confidentiality controls for practices, policies, and future initiatives." },
      { property: "og:title", content: "C2 Practices, Policies & Future Initiatives | VSME Reporting" },
      { property: "og:description", content: "C2 module with section-level confidentiality controls for the VSME sustainability report." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: C2Module,
});

type FieldKey = "practices" | "monitoring" | "accountable";

const fieldConfig: { key: FieldKey; label: string; placeholder: string }[] = [
  { key: "practices", label: "Description of practices and policies", placeholder: "This is description of practices and policies" },
  { key: "monitoring", label: "Monitoring targets", placeholder: "This is our target" },
  { key: "accountable", label: "Accountable role or person", placeholder: "CEO" },
];

function C2Module() {
  const [expanded, setExpanded] = useState(true);
  const [confidential, setConfidential] = useState(false);
  const [completed, setCompleted] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("Sep 5, 2026");
  const [fields, setFields] = useState<Record<FieldKey, string>>({
    practices: "This is description of practices and policies",
    monitoring: "This is our target",
    accountable: "CEO",
  });

  const updateField = (key: FieldKey, value: string) => setFields((current) => ({ ...current, [key]: value }));

  const toggleConfidential = (value: boolean) => {
    setConfidential(value);
    toast.success(value ? "C2 section marked confidential" : "C2 section made public", {
      description: value ? "All fields in this section are hidden from the XBRL report." : "All fields in this section are visible in the XBRL report.",
    });
  };

  const reopenForm = () => {
    setCompleted(false);
    toast.info("Form reopened", { description: "C2 is open for editing again." });
  };

  const submitForm = () => {
    setCompleted(true);
    setLastUpdated(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
    toast.success("Report submitted", { description: "C2 Practices, policies and future initiatives has been completed." });
  };

  return (
    <TooltipProvider delayDuration={250}>
      <main className="min-h-screen bg-background px-3 py-5 text-foreground sm:px-6 sm:py-10 lg:py-14">
        <article className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-panel">
          <header className="border-b border-border bg-card px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="flex items-start gap-3.5">
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-foreground shadow-sm">C2</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl leading-tight sm:text-3xl">Description of practices, policies and future initiatives</h1>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" aria-label="About this module">
                          <Info />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Describe practices, policies and future initiatives for a more sustainable economy.</TooltipContent>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-muted-foreground"
                      onClick={() => setExpanded((value) => !value)}
                      aria-label={expanded ? "Collapse module" : "Expand module"}
                    >
                      {expanded ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className={cn("border border-transparent", completed ? "bg-live text-primary-foreground" : "bg-confidential text-primary-foreground")}>
                      {completed ? "Completed" : "In Progress"}
                    </Badge>
                    <Badge variant="secondary" className="border border-primary/15 bg-primary/8 text-primary">Comprehensive Module</Badge>
                    <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground">Volunteer</Badge>
                  </div>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-semibold">{completed ? "Completed" : "In Progress"}</p>
                <p className="mt-2 text-sm font-semibold">Version: 1</p>
              </div>
            </div>
          </header>

          {expanded && (
            <div className="space-y-7 p-5 sm:p-8">
              <div className={cn(
                "flex flex-col justify-between gap-4 rounded-md border p-4 sm:flex-row sm:items-center",
                confidential ? "border-confidential-border bg-confidential-wash" : "border-live/25 bg-live-soft/60",
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("grid size-9 place-items-center rounded-md", confidential ? "bg-confidential-soft text-confidential" : "bg-card text-muted-foreground")}>
                    <LockKeyhole className="size-4" />
                  </div>
                  <div>
                    <Label htmlFor="c2-confidential" className="text-sm font-semibold">Mark this entire section as confidential</Label>
                    <p className="mt-1 text-xs text-muted-foreground">Enabling this will hide all data in this section from XBRL report.</p>
                  </div>
                </div>
                <Switch id="c2-confidential" checked={confidential} onCheckedChange={toggleConfidential} className="data-[state=checked]:bg-confidential" />
              </div>

              {fieldConfig.map((field) => (
                <div key={field.key} className={cn(
                  "rounded-lg border p-5",
                  confidential ? "border-confidential-border bg-confidential-wash/70" : "border-border/70 bg-primary/5",
                )}>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor={`c2-${field.key}`} className="text-sm font-bold text-foreground">{field.label}</Label>
                    {confidential && (
                      <Badge variant="outline" className="gap-1.5 border-confidential-border bg-confidential-wash text-confidential">
                        <LockKeyhole className="size-3" /> Hidden from XBRL report
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    id={`c2-${field.key}`}
                    value={fields[field.key]}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    disabled={completed}
                    className={cn("mt-3 resize-y bg-card", confidential && "border-confidential-border bg-confidential-wash/40")}
                  />
                </div>
              ))}

              <div className="flex justify-end">
                {completed ? (
                  <Button variant="outline" onClick={reopenForm}>
                    <RotateCcw /> Reopen Form
                  </Button>
                ) : (
                  <Button onClick={submitForm}>
                    <Check /> Submit Form
                  </Button>
                )}
              </div>
            </div>
          )}

          <footer className="border-t border-border bg-muted/45 px-5 py-5 sm:px-8">
            <p className="text-xs text-muted-foreground">Last updated by <span className="font-medium text-foreground">Unknown</span>: {lastUpdated}</p>
          </footer>
        </article>
      </main>
    </TooltipProvider>
  );
}
