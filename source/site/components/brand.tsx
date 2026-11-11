/** A marca do ryan-ui: um "r" com ponto, num quadrado arredondado. Usa a cor de destaque. */
export function BrandMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="7.5" fill="var(--accent)" />
      <path d="M8.75 17.25V11.9a3.9 3.9 0 0 1 3.9-3.9h1.1" stroke="var(--accent-foreground)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="15.6" cy="15.9" r="1.45" fill="var(--accent-foreground)" />
    </svg>
  );
}
