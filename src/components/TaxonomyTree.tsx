import { ChevronDown, ChevronRight, Eye, Lock, MinusSquare, Search, ShieldCheck, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { sectionLabel, taxonomyGroups, taxonomyTotalCount, type TaxonomyGroup } from "@/lib/vsme-taxonomy";

type ParentState = "public" | "partial" | "confidential";

function groupState(group: TaxonomyGroup, isConfidential: (id: string) => boolean): ParentState {
  const ids = [group.id, ...group.children.map((child) => child.id)];
  const marked = ids.filter(isConfidential).length;
  if (marked === 0) return "public";
  if (marked === ids.length) return "confidential";
  return "partial";
}

function StateChip({ state, marked, total }: { state: ParentState; marked: number; total: number }) {
  if (state === "partial") {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-semibold text-muted-foreground">
        <MinusSquare className="size-3.5" aria-hidden="true" />
        {marked} of {total} confidential
      </span>
    );
  }
  const confidential = state === "confidential";
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

export function TaxonomyTree({
  confidentialIds,
  onSetGroup,
  onToggleNode,
  onSetAll,
}: {
  confidentialIds: Set<string>;
  onSetGroup: (group: TaxonomyGroup, confidential: boolean) => void;
  onToggleNode: (id: string, title: string, confidential: boolean) => void;
  onSetAll: (confidential: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(taxonomyGroups.map((g) => g.id)));

  const isConfidential = (id: string) => confidentialIds.has(id);
  const confidentialCount = confidentialIds.size;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return taxonomyGroups;
    return taxonomyGroups
      .map((group) => {
        const groupMatches = group.title.toLowerCase().includes(q) || group.tag.toLowerCase().includes(q);
        const children = group.children.filter(
          (child) => child.title.toLowerCase().includes(q) || child.tag.toLowerCase().includes(q),
        );
        if (groupMatches) return group;
        if (children.length > 0) return { ...group, children };
        return null;
      })
      .filter((group): group is TaxonomyGroup => group !== null);
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-panel">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-surface px-2.5 py-1 text-muted-foreground">
              Total fields: {taxonomyTotalCount}
            </span>
            <span className="rounded-full bg-confidential-soft px-2.5 py-1 text-confidential">
              {confidentialCount} confidential
            </span>
            <span className="rounded-full bg-public-soft px-2.5 py-1 text-public">
              {taxonomyTotalCount - confidentialCount} public
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(new Set())}>
              <ChevronDown /> Expand all
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(new Set(taxonomyGroups.map((g) => g.id)))}>
              <ChevronRight /> Collapse all
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onSetAll(true)}>
              <Lock /> Mark all confidential
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onSetAll(false)}>
              <Eye /> Reset all to public
            </Button>
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by field name or taxonomy tag…"
            aria-label="Search disclosure fields"
            className="h-10 bg-surface pl-9"
          />
        </div>
      </div>

      <div className="divide-y divide-border">
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">No fields match “{query}”.</p>
        )}
        {filtered.map((group) => {
          const state = groupState(group, isConfidential);
          const ids = [group.id, ...group.children.map((child) => child.id)];
          const marked = ids.filter(isConfidential).length;
          const isOpen = searching || !collapsed.has(group.id);

          return (
            <div key={group.id} className={cn("transition-colors", state === "confidential" && "bg-confidential-wash")}>
              <div className="flex flex-wrap items-start gap-3 px-3 py-3 sm:px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground"
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${group.title}`}
                  disabled={group.children.length === 0}
                  onClick={() =>
                    setCollapsed((current) => {
                      const next = new Set(current);
                      if (next.has(group.id)) next.delete(group.id);
                      else next.add(group.id);
                      return next;
                    })
                  }
                >
                  {group.children.length === 0 ? <span className="size-1.5 rounded-full bg-border" /> : isOpen ? <ChevronDown /> : <ChevronRight />}
                </Button>

                <div className="min-w-[200px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {group.code && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground">
                        {group.code}
                      </span>
                    )}
                    <p className="text-sm font-semibold">{group.title}</p>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {sectionLabel(group.code)}
                    </span>
                  </div>
                  <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{group.tag}</p>
                  {group.children.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">{group.children.length} child fields</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <StateChip state={state} marked={marked} total={ids.length} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Switch
                        checked={state === "confidential"}
                        onCheckedChange={(checked) => onSetGroup(group, checked)}
                        aria-label={`Mark ${group.title} and its child fields confidential`}
                        className={cn(
                          "data-[state=checked]:bg-confidential",
                          state === "partial" && "data-[state=unchecked]:bg-confidential-border",
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-60">
                      {state === "confidential"
                        ? "Release this section and all child fields to the public export"
                        : "Protect this section — all child fields follow"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {isOpen && group.children.length > 0 && (
                <ul className="border-t border-border/70 bg-surface/40">
                  {group.children.map((child) => {
                    const childConfidential = isConfidential(child.id);
                    return (
                      <li
                        key={child.id}
                        className={cn(
                          "flex flex-wrap items-center gap-3 border-l-2 px-3 py-2.5 pl-8 sm:px-4 sm:pl-14",
                          childConfidential ? "border-l-confidential bg-confidential-wash" : "border-l-transparent",
                        )}
                      >
                        <div className="min-w-[180px] flex-1">
                          <p className="text-sm font-medium">{child.title}</p>
                          <p className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground">{child.tag}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleNode(child.id, child.title, !childConfidential)}
                          aria-pressed={childConfidential}
                          className={cn(
                            "h-8",
                            childConfidential
                              ? "bg-confidential-soft text-confidential hover:bg-confidential-soft"
                              : "text-muted-foreground",
                          )}
                        >
                          {childConfidential ? <Lock /> : <Unlock />}
                          {childConfidential ? "Confidential" : "Public"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-confidential" aria-hidden="true" />
        Parent selections cascade to child fields; individual child overrides show a partial state.
      </div>
    </div>
  );
}
