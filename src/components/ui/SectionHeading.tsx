import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
