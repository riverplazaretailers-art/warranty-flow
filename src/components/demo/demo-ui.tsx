import type { ReactNode } from "react";

import type { PreflightStatus } from "@/product-api";
import { STATUS_LABEL } from "@/product-api/review";
import { cn } from "@/lib/utils";

export function StatusChip({
  status,
  className,
}: {
  status: PreflightStatus | "not_run";
  className?: string;
}) {
  const label = status === "not_run" ? "Not run" : STATUS_LABEL[status];
  const tone =
    status === "ready_for_dealer_review"
      ? "border-accent/50 text-accent"
      : status === "needs_facts"
        ? "border-foreground/30 text-foreground"
        : status === "not_run"
          ? "border-border text-muted-foreground"
          : "border-destructive/40 text-destructive";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em]",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-background", className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHead({
  eyebrow,
  title,
  lead,
  action,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">{title}</h1>
        {lead && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export const buttonClass =
  "inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex h-9 items-center rounded-sm border border-border px-4 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-stone-warm disabled:cursor-not-allowed disabled:opacity-50";
