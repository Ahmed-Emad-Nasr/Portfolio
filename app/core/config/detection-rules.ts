/*
 * core/config/detection-rules.ts
 * Author: Ahmed Emad Nasr
 *
 * The custom Wazuh rule pack (case "3omda-custom-detection-rules"), as data:
 * rule id, alert level, the rule's own group, its description and its MITRE
 * ATT&CK id — extracted from the rule pack itself. Feeds the Detection
 * Library section on the home page. Small and client-safe on purpose.
 *
 * $(…) in a description is a Wazuh field placeholder, filled in at alert time.
 */

type DetectionRule = {
  id: number;
  /** Wazuh alert level, 0–15 */
  level: number;
  group: string;
  /** The bracketed tag at the start of the description */
  tag: string;
  text: string;
  mitre: string;
};

export const RULE_GROUP_LABEL: Record<string, string> = {
  "authentication": "Brute force & auth",
  "malware": "Malware & ransomware",
  "privilege_escalation": "Privilege escalation",
  "lateral_movement": "Lateral movement & C2",
  "web_attacks": "Web attacks",
  "exfiltration": "Exfiltration",
  "defense_evasion": "Defense evasion",
  "linux": "Linux persistence",
  "network": "Network"
};

export const detectionRules: readonly DetectionRule[] = [
  { id: 110001, level: 10, group: "authentication", tag: "BRUTE FORCE", text: "SSH: $(srcip) failed $(frequency) times in $(timeframe)s - Possible brute force attack.", mitre: "T1110.001" },
  { id: 110002, level: 14, group: "authentication", tag: "CRITICAL BRUTE FORCE", text: "SSH: $(srcip) failed $(frequency) times - Active brute force in progress!", mitre: "T1110.001" },
  { id: 110003, level: 10, group: "authentication", tag: "BRUTE FORCE", text: "RDP: $(srcip) failed $(frequency) times Possible RDP brute force.", mitre: "T1110.001" },
  { id: 110004, level: 12, group: "authentication", tag: "PASSWORD SPRAY", text: "Multiple accounts targeted from $(srcip) Password spray attack detected!", mitre: "T1110.003" },
  { id: 110005, level: 14, group: "authentication", tag: "BRUTE FORCE SUCCESS", text: "$(srcip) succeeded after multiple failures - Possible account compromise!", mitre: "T1110.001" },
  { id: 110006, level: 8, group: "authentication", tag: "LOCKOUT", text: "Account $(win.system.computer) was locked out Brute force may be occurring.", mitre: "T1110" },
  { id: 110010, level: 15, group: "malware", tag: "RANSOMWARE", text: "Mass file modification detected ($(frequency) files in $(timeframe)s) - Possible ransomware encryption!", mitre: "T1486" },
  { id: 110011, level: 14, group: "malware", tag: "RANSOMWARE", text: "Ransomware file extension detected: $(file) Immediate action required!", mitre: "T1486" },
  { id: 110012, level: 14, group: "malware", tag: "RANSOMWARE NOTE", text: "Ransom note file created: $(file) - Files may already be encrypted!", mitre: "T1486" },
  { id: 110013, level: 12, group: "malware", tag: "MALWARE", text: "Executable file dropped in suspicious location: $(file)", mitre: "T1059" },
  { id: 110014, level: 12, group: "malware", tag: "MALWARE", text: "Executable dropped in Windows Temp: $(file)", mitre: "T1059" },
  { id: 110015, level: 15, group: "malware", tag: "YARA HIT", text: "Malware confirmed by YARA: $(yara_rule) in file $(yara_scanned_file) - Auto-remediation triggered.", mitre: "T1204" },
  { id: 110020, level: 12, group: "privilege_escalation", tag: "PRIVESC", text: "Suspicious sudo command executed - Possible privilege escalation attempt.", mitre: "T1548.003" },
  { id: 110021, level: 13, group: "privilege_escalation", tag: "PRIVESC - SUID ABUSE", text: "Suspicious binary run as root via SUID: $(audit.exe) by user $(audit.auid)", mitre: "T1548.001" },
  { id: 110022, level: 12, group: "privilege_escalation", tag: "PRIVESC", text: "Sensitive privilege assigned to $(win.eventdata.subjectUserName): $(win.eventdata.privileges)", mitre: "T1134" },
  { id: 110023, level: 13, group: "privilege_escalation", tag: "PRIVESC", text: "SYSTEM process $(win.eventdata.image) spawned from user directory - Token theft suspected!", mitre: "T1134" },
  { id: 110024, level: 10, group: "privilege_escalation", tag: "PRIVESC/PERSISTENCE", text: "Scheduled task created via: $(win.eventdata.commandLine)", mitre: "T1053.005" },
  { id: 110025, level: 12, group: "privilege_escalation", tag: "PRIVESC", text: "User added to privileged group $(win.eventdata.targetUserName) by $(win.eventdata.subjectUserName)!", mitre: "T1078.002" },
  { id: 110030, level: 13, group: "lateral_movement", tag: "LATERAL MOVEMENT", text: "Remote execution tool detected: $(win.eventdata.image) - PsExec-style attack!", mitre: "T1021.002" },
  { id: 110031, level: 12, group: "lateral_movement", tag: "LATERAL MOVEMENT", text: "WMI spawned suspicious child: $(win.eventdata.image) - WMI abuse detected!", mitre: "T1047" },
  { id: 110032, level: 14, group: "lateral_movement", tag: "PASS-THE-HASH", text: "NTLM network logon from external workstation $(win.eventdata.workstationName) - PtH suspected!", mitre: "T1550.002" },
  { id: 110033, level: 12, group: "lateral_movement", tag: "C2 - DNS TUNNEL", text: "Excessive DNS queries from $(srcip): $(frequency) queries in $(timeframe)s - DNS tunneling/C2 suspected!", mitre: "T1071.004" },
  { id: 110034, level: 11, group: "lateral_movement", tag: "C2 BEACONING", text: "Regular connections from $(srcip) to same destination - C2 beacon pattern detected!", mitre: "T1071.001" },
  { id: 110035, level: 14, group: "lateral_movement", tag: "C2 DOWNLOAD", text: "PowerShell download cradle detected: $(win.eventdata.commandLine) - Possible C2 stage 1!", mitre: "T1059.001" },
  { id: 110036, level: 11, group: "lateral_movement", tag: "LATERAL MOVEMENT - SMB", text: "Multiple SMB auth attempts to different targets from $(srcip) - Possible lateral movement!", mitre: "T1021.002" },
  { id: 110040, level: 10, group: "web_attacks", tag: "SQLi", text: "SQL Injection attempt from $(srcip) - URL: $(url)", mitre: "T1190" },
  { id: 110041, level: 8, group: "web_attacks", tag: "XSS", text: "Cross-Site Scripting attempt from $(srcip)", mitre: "T1059.007" },
  { id: 110042, level: 12, group: "web_attacks", tag: "LFI", text: "Local File Inclusion attempt from $(srcip) - Possible path traversal!", mitre: "T1083" },
  { id: 110043, level: 14, group: "web_attacks", tag: "RCE", text: "Remote Code Execution attempt from $(srcip) - Critical web attack!", mitre: "T1190" },
  { id: 110044, level: 8, group: "web_attacks", tag: "WEB SCAN", text: "$(srcip) sending $(frequency) requests/min - Web scanner or directory brute force!", mitre: "T1595.003" },
  { id: 110045, level: 7, group: "web_attacks", tag: "ENUM", text: "$(srcip) caused $(frequency) HTTP 404/403 errors in $(timeframe)s - Possible directory enumeration!", mitre: "T1595" },
  { id: 110046, level: 14, group: "web_attacks", tag: "SURICATA WEB ATTACK", text: "Critical web attack: $(alert.signature) from $(src_ip)", mitre: "T1190" },
  { id: 110050, level: 12, group: "exfiltration", tag: "EXFILTRATION", text: "Large outbound transfer from $(src_ip): $(bytes_toserver) bytes - Data exfiltration suspected!", mitre: "T1048" },
  { id: 110051, level: 13, group: "exfiltration", tag: "EXFILTRATION", text: "Sensitive file accessed by $(audit.auid): $(audit.file.name) - Possible data staging!", mitre: "T1552.001" },
  { id: 110052, level: 11, group: "exfiltration", tag: "EXFILTRATION STAGING", text: "Archive of user data created: $(win.eventdata.commandLine)", mitre: "T1560.001" },
  { id: 110053, level: 11, group: "exfiltration", tag: "EXFILTRATION", text: "Significant outbound transfer on port $(dest_port) from $(src_ip) - Check for cloud upload!", mitre: "T1567" },
  { id: 110054, level: 9, group: "exfiltration", tag: "EXFILTRATION", text: "Screen capture or clipboard tool used: $(win.eventdata.image) - Possible data collection!", mitre: "T1113" },
  { id: 110055, level: 13, group: "exfiltration", tag: "DNS EXFIL", text: "Suspicious long DNS query ($(dns.rrname)) Possible DNS exfiltration!", mitre: "T1048.003" },
  { id: 110060, level: 14, group: "defense_evasion", tag: "DEFENSE EVASION", text: "Windows Event Log CLEARED by $(win.system.computer) - Active attack cover-up!", mitre: "T1070.001" },
  { id: 110061, level: 13, group: "defense_evasion", tag: "OBFUSCATION", text: "Encoded/obfuscated PowerShell command detected - Malicious script suspected!", mitre: "T1027" },
  { id: 110062, level: 14, group: "defense_evasion", tag: "PROCESS INJECTION", text: "Code injection detected into $(win.eventdata.targetImage) by $(win.eventdata.sourceImage)!", mitre: "T1055" },
  { id: 110063, level: 15, group: "defense_evasion", tag: "RANSOMWARE/DESTRUCTION", text: "Shadow copies being deleted: $(win.eventdata.commandLine) - CRITICAL!", mitre: "T1490" },
  { id: 110064, level: 13, group: "defense_evasion", tag: "AV BYPASS", text: "AMSI/Defender bypass attempt detected: $(win.eventdata.commandLine)", mitre: "T1562.001" },
  { id: 110070, level: 10, group: "linux", tag: "PERSISTENCE", text: "Crontab modified: $(file) - Possible persistence mechanism installed!", mitre: "T1053.003" },
  { id: 110071, level: 12, group: "linux", tag: "PERSISTENCE", text: "SSH authorized_keys modified: $(file) - Backdoor key may have been added!", mitre: "T1098.004" },
  { id: 110072, level: 14, group: "linux", tag: "ROOTKIT", text: "Critical system file modified: $(file) - Possible LD_PRELOAD rootkit!", mitre: "T1574.006" },
  { id: 110073, level: 13, group: "linux", tag: "ROOTKIT", text: "Kernel module operation detected - Possible rootkit loading!", mitre: "T1547.006" },
  { id: 110074, level: 14, group: "linux", tag: "ACCOUNT MANIPULATION", text: "Critical auth file modified: $(file) Possible backdoor account!", mitre: "T1136.001" },
  { id: 110080, level: 10, group: "network", tag: "PORT SCAN", text: "$(srcip) scanning multiple ports ($(frequency) in $(timeframe)s) - Network reconnaissance!", mitre: "T1046" },
  { id: 110081, level: 15, group: "network", tag: "CRITICAL NETWORK", text: "Multiple critical Suricata alerts from $(srcip) - Active attack campaign!", mitre: "T1595" },
  { id: 110082, level: 11, group: "network", tag: "C2 EVASION", text: "TOR/VPN/Proxy connection detected from $(src_ip) to $(tls.sni) - C2 evasion attempt!", mitre: "T1090.003" },
  { id: 110083, level: 10, group: "network", tag: "ICMP EXFIL", text: "Excessive ICMP from $(srcip) - Possible ICMP tunneling/exfiltration!", mitre: "T1095" },
];
