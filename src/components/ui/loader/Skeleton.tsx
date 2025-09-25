type Props = {
  className?: string;
};

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[color:var(--foreground)]/10 ${className}`}
    />
  );
}
