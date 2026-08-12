export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-7 flex items-center gap-4" role="separator" aria-orientation="horizontal">
      <span className="h-px flex-1 bg-rule" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}

export default AuthDivider;
