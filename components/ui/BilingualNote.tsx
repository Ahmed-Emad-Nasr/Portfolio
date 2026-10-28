type BilingualNoteProps = {
  children: string;
  label?: string;
};

export default function BilingualNote({ children, label = "Arabic brief" }: BilingualNoteProps) {
  return (
    <div className="mt-5 border-t border-foreground/5 pt-4" lang="ar" dir="rtl">
      <span className="mb-2 block text-right font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-tertiary" lang="en" dir="ltr">
        {label}
      </span>
      <p className="text-right text-xs leading-relaxed text-foreground/70">{children}</p>
    </div>
  );
}
