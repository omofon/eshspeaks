export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-4" role="separator" aria-orientation="horizontal">
      <span className="h-px flex-1 bg-line" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-soft">
        {label}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export default AuthDivider;
