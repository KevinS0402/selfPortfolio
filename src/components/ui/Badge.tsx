type BadgeProps = {
  label: string;
};

export function Badge({ label }: BadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-mist px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line/70">
      {label}
    </span>
  );
}
