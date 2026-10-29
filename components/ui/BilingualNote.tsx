type BilingualNoteProps = {
  children: string;
  label?: string;
};

export default function BilingualNote({ children, label = "ملخص عربي // AR" }: BilingualNoteProps) {
  return (
    <div className="mt-5 border-t border-foreground/5 pt-4" lang="ar" dir="rtl">
      <span className="mb-2 block text-right font-mono text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-tertiary">
        {label}
      </span>
      <p className="border-r-2 border-r-primary/40 pr-3 text-right text-xs leading-[1.8] text-foreground/75 [unicode-bidi:plaintext]">
        {children}
      </p>
    </div>
  );
}
