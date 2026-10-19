import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';
import { useReveal } from '../lib/hooks';

export const cn = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ');

/** Fades its children in once, the first time they scroll into view. */
export function Reveal({
  as,
  className,
  delay = 0,
  children,
}: {
  as?: ElementType;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const Tag = as ?? 'div';
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={cn('reveal', shown && 'is-shown', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}

export function Section({
  id,
  number,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  number: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mb-12 max-w-2xl">
          <p className="font-mono text-sm text-accent">
            {String(number).padStart(2, '0')} / {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h2>
          {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function Chip({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'accent' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs',
        tone === 'accent' ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line bg-surface-2 text-ink',
      )}
    >
      {children}
    </span>
  );
}

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: 'primary' | 'secondary' | 'ghost'; external?: boolean };

/** A link that looks like a button. External links open in a new tab and never leak the referrer window. */
export function ButtonLink({ variant = 'primary', external, className, children, ...rest }: ButtonProps) {
  return (
    <a
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 active:scale-[0.98]',
        variant === 'primary' &&
          'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/20 hover:brightness-110',
        variant === 'secondary' && 'border border-line bg-surface text-ink hover:border-accent hover:text-accent',
        variant === 'ghost' && 'text-ink hover:bg-surface-2',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-line bg-surface p-6 shadow-sm transition-colors duration-300', className)}>
      {children}
    </div>
  );
}
