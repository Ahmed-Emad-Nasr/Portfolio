"use client";

/*
 * Terminal.tsx
 * Author: Ahmed Emad Nasr
 *
 * A small terminal that opens when you type "3omda" anywhere on the site
 * (or from the palette). Not a gimmick — it is another way to browse the
 * same content: ls shows the cases, open opens one, cat cv downloads the CV.
 *
 * All lazy, so it takes no bytes from the main bundle.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useFocusTrap } from "@/app/core/utils/use-focus-trap";
import { m as motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import { CV_PDF_HREF, normalizePublicHref } from "@/app/core/config/shared";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { STATIC_PLATFORMS, THM_SNAPSHOT, tryHackMePlatform } from "@/app/core/config/platforms";

type Line = { id: number; text: string; kind: "in" | "out" | "err" | "dim" };

const BANNER = [
  "3OMDA SHELL v1.2 — information security portfolio",
  'Type "help" for commands, "exit" to close. There is a flag hidden in here.',
];

/* The hidden challenge: `ls -a` shows a dotfile, `cat` gives Base64, and
   `decode` (or any Base64 tool) gives the flag. Small, but it rewards exactly
   the habit the job needs — look at what is hidden, then decode it. */
const FLAG = "3omda{d3f3nd3rs_r34d_th3_l0gs}";
const FLAG_B64 = typeof btoa === "function" ? btoa(FLAG) : "";

/** Maximum number of lines kept — without it the DOM grows unbounded */
const MAX_LINES = 300;

/* One class per output line kind */
const LINE_CLASS: Record<string, string> = {
  in: "text-foreground whitespace-pre-wrap [word-break:break-word]",
  out: "text-foreground/65 whitespace-pre-wrap [word-break:break-word]",
  err: "text-primary-ink whitespace-pre-wrap",
  dim: "text-foreground/60 whitespace-pre-wrap",
};

export default function Terminal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap([dialogRef], true);
  /* `npm run lint` failed on this: the lazy initialiser read and mutated
     lineId.current DURING render (react-hooks/refs). Under a concurrent
     render React may throw the result away — the ref keeps the increments
     from a render that never committed, so ids can collide with real lines
     later. The banner ids are known up front, so no ref is needed at all;
     the counter simply starts after them. */
  const lineId = useRef(BANNER.length);

  const [lines, setLines] = useState<Line[]>(() =>
    BANNER.map((text, index) => ({ id: index, text, kind: "dim" as const })),
  );
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const cases = useMemo(() => caseEvidenceLibrary, []);

  const print = useCallback((text: string, kind: Line["kind"] = "out") => {
    setLines((prev) => {
      const next = [...prev, { id: lineId.current++, text, kind }];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
  }, []);

  const printAll = useCallback(
    (texts: string[], kind: Line["kind"] = "out") => {
      setLines((prev) => {
        const next = [
          ...prev,
          ...texts.map((text) => ({ id: lineId.current++, text, kind })),
        ];
        return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
      });
    },
    [],
  );

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input) return;

      print(`3omda@portfolio:~$ ${input}`, "in");
      setHistory((h) => [input, ...h].slice(0, 50));
      setHistoryIndex(-1);

      const [command, ...args] = input.split(/\s+/);
      const arg = args.join(" ");

      switch (command.toLowerCase()) {
        case "help":
          printAll([
            "help              — this list",
            "whoami            — short bio",
            "ls                — list all cases",
            "ls <keyword>      — filter the list",
            "open <n|id>       — open a case page",
            "cat cv            — open the CV",
            "skills            — most used tools",
            "ranks             — public training profiles",
            "contact           — how to reach me",
            "neofetch          — system info, the portfolio way",
            "history           — commands you ran",
            "clear             — clear the screen",
            "exit              — close the terminal",
          ]);
          break;

        case "whoami":
          printAll([
            `${PORTFOLIO_DATA.profile.name} — ${PORTFOLIO_DATA.profile.title}.`,
            `Focus: ${PORTFOLIO_DATA.profile.focus.join(", ")}.`,
            `${cases.length} documented cases in the library.`,
          ]);
          break;

        case "ls": {
          if (arg === "-a" || arg === "-la" || arg === "-al") {
            printAll(["./", "../", ".flag", "cases/", "cv.pdf", "contact.txt"], "out");
            break;
          }
          const filtered = arg
            ? cases.filter((c) =>
                `${c.title} ${c.category} ${c.tools.join(" ")} ${c.tags.join(" ")}`
                  .toLowerCase()
                  .includes(arg.toLowerCase()),
              )
            : cases;

          if (!filtered.length) {
            print(`ls: no case matches "${arg}"`, "err");
            break;
          }

          printAll(
            filtered.map((c) => {
              const index = String(cases.indexOf(c) + 1).padStart(2, "0");
              return `${index}  ${c.title}  [${c.category}]`;
            }),
          );
          break;
        }

        case "open": {
          if (!arg) {
            print("open: needs a number or an id. Try: open 1", "err");
            break;
          }

          /* Accepts either a number from the list or the id itself. This used
             parseInt, which reads "3omda-custom-detection-rules" as 3 and
             "2fa-simple-bypass" as 2 — so opening either by id opened a
             different case. Only an all-digit argument is a list number now. */
          const target = /^\d+$/.test(arg)
            ? cases[Number(arg) - 1]
            : cases.find((c) => c.id === arg.toLowerCase());

          if (!target) {
            print(`open: no case "${arg}"`, "err");
            break;
          }

          print(`opening ${target.title}…`, "dim");
          onClose();
          router.push(`/blog/${target.id}`);
          break;
        }

        case "cat":
          if (arg === ".flag") {
            printAll([FLAG_B64, "", "hint: that is not plain text. try: decode <string>"], "out");
            break;
          }
          if (arg.toLowerCase() === "cv") {
            print("opening CV…", "dim");
            window.open(normalizePublicHref(CV_PDF_HREF), "_blank", "noopener");
          } else {
            print(`cat: ${arg || "missing operand"}: No such file`, "err");
          }
          break;

        case "skills": {
          const counts = new Map<string, number>();
          for (const item of cases) {
            for (const tool of item.tools) counts.set(tool, (counts.get(tool) ?? 0) + 1);
          }
          printAll(
            [...counts.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 12)
              .map(([tool, count]) => `${String(count).padStart(2, " ")}x  ${tool}`),
          );
          break;
        }

        case "ranks": {
          const all = [tryHackMePlatform({ ...THM_SNAPSHOT, live: false }), ...STATIC_PLATFORMS];
          printAll(all.map((p) => `${p.name.toLowerCase().replace(/\s+/g, "").padEnd(15, " ")}${p.url.replace(/^https:\/\//, "")}`));
          print(`tryhackme: top ${THM_SNAPSHOT.topPercentage}% worldwide · ${THM_SNAPSHOT.completedRoomsNumber} rooms`, "dim");
          break;
        }

        case "contact":
          printAll([
            `email     ${PORTFOLIO_DATA.profile.contact.email}`,
            `linkedin  ${PORTFOLIO_DATA.profile.contact.linkedin.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}`,
            `github    github.com/${PORTFOLIO_DATA.profile.contact.github}`,
          ]);
          break;

        case "decode": {
          if (!arg) {
            print("decode: needs a Base64 string", "err");
            break;
          }
          try {
            const text = atob(arg.trim());
            print(text, "out");
            if (text === FLAG) {
              printAll([
                "",
                "▲ flag captured. Nicely done.",
                `If you read logs like that, we should talk: ${PORTFOLIO_DATA.profile.contact.email}`,
              ], "dim");
            }
          } catch {
            print("decode: not valid Base64", "err");
          }
          break;
        }

        case "neofetch":
          printAll([
            "   ▄▀▀▄      3omda@portfolio",
            "  █ AE █     ───────────────",
            "   ▀▄▄▀      role     " + PORTFOLIO_DATA.profile.title,
            "             focus    " + PORTFOLIO_DATA.profile.focus.join(" · "),
            "             cases    " + cases.length,
            "             base     " + PORTFOLIO_DATA.profile.contact.location,
            "             shell    3omda-sh 1.2",
            "             theme    Neo-Samurai (dark)",
          ]);
          break;

        case "history":
          if (!history.length) print("history: empty", "dim");
          else printAll([...history].reverse().map((h, i) => `${String(i + 1).padStart(3, " ")}  ${h}`));
          break;

        case "sudo":
          print("Nice try. This incident has been reported.", "err");
          break;

        case "clear":
          setLines([]);
          break;

        case "exit":
          onClose();
          break;

        default:
          print(`${command}: command not found. Try "help".`, "err");
      }
    },
    [cases, history, onClose, print, printAll, router],
  );

  // ── focus + scroll lock ─────────────────────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keep the view pinned to the last line
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      run(value);
      setValue("");
      return;
    }

    // ArrowUp/Down move through previous commands, like any shell
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setValue(history[next]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      /* Clamped at -1 ("no history entry"): pressing Down on an empty
         prompt used to walk the index to -2, -3 … and the next Up then read
         history[-1] — undefined, which turned the input uncontrolled. */
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setValue(next < 0 ? "" : history[next] ?? "");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] flex items-start justify-center bg-background/70 px-4 pt-[12vh] backdrop-blur-sm"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="relative flex h-[min(520px,76vh)] w-full max-w-2xl flex-col overflow-hidden border border-foreground/10 bg-surface shadow-2xl"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-primary via-primary/40 to-transparent" aria-hidden="true" />
        <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-3">
          <span className="h-2 w-2 bg-primary" aria-hidden="true" />
          <span className="flex-1 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-foreground/60">3omda@portfolio: ~</span>
          <span className="brush-jp text-base text-foreground/30" lang="ja" aria-hidden="true" data-jp="端末" />
          <button
            type="button"
            className="border border-foreground/15 p-1.5 text-foreground/40 transition-colors hover:border-primary hover:text-primary-ink"
            onClick={onClose}
            aria-label="Close terminal"
          >
            <X size={14} />
          </button>
        </div>

        <div ref={bodyRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 font-mono text-[0.8125rem] leading-[1.65] max-sm:text-xs" data-lenis-prevent>
          {lines.map((line) => (
            <p key={line.id} className={LINE_CLASS[line.kind]}>
              {line.text}
            </p>
          ))}

          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="shrink-0 text-accent max-sm:text-[0.6875rem]" aria-hidden="true">
              3omda@portfolio:~$
            </span>
            <input
              ref={inputRef}
              className="min-w-0 flex-1 border-0 bg-transparent text-[1rem] text-foreground outline-none [font-family:inherit]"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal input"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
