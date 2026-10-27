import ScrambleText from "@/app/core/components/ScrambleText";
import FadeIn from "@/app/core/components/FadeIn";

interface SectionHeaderProps {
  eyebrow: string;
  japanese: string;
  titleA: string;
  titleB: string;
  description?: string;
  align?: "left" | "split";
  /** h1 on pages where this is the page title (case library, CV …) */
  as?: "h1" | "h2";
}

export default function SectionHeader({
  eyebrow,
  japanese,
  titleA,
  titleB,
  description,
  align = "left",
  as: Heading = "h2",
}: SectionHeaderProps) {
  return (
    <FadeIn x={-32} y={0} duration={0.7}
  className={align === "split" ? "mb-16 md:mb-20" : "mb-16 md:mb-20 max-w-3xl"}
>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
        <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">
          <ScrambleText text={eyebrow} />
        </span>
        <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp={japanese} />
      </div>
      <Heading className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
        <span className="text-foreground">{titleA}</span> <br />
        <span className="text-primary italic">{titleB}</span>
      </Heading>
      {description ? (
        <p className="mt-5 text-base md:text-lg text-foreground/60 font-light leading-relaxed max-w-2xl">
          {description}
        </p>
      ) : null}
    </FadeIn>
  );
}
