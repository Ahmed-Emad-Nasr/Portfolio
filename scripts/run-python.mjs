#!/usr/bin/env node
/*
 * scripts/run-python.mjs — run a Python script on any OS.
 *
 *   node scripts/run-python.mjs scripts/pdf-clean.py public/Assets/Cases [--force]
 *
 * "python3" is not a safe name to call from npm: on Windows it is usually the
 * Microsoft Store shortcut, which prints "Python was not found" and fails the
 * whole `npm run verify`. This tries the launchers in order — `py -3`
 * (Windows), `python3`, `python` — and uses the first one that is a real
 * Python 3. If none is, it says how to install Python and exits 0, so the
 * optional clean-up step never blocks the build.
 */
import { spawnSync } from "node:child_process";

const CANDIDATES = process.platform === "win32"
  ? [["py", ["-3"]], ["python", []], ["python3", []]]
  : [["python3", []], ["python", []]];

function isPython3(cmd, pre) {
  const r = spawnSync(cmd, [...pre, "-c", "import sys; print(sys.version_info[0])"], { encoding: "utf8", shell: false });
  return r.status === 0 && r.stdout.trim() === "3";
}

const found = CANDIDATES.find(([cmd, pre]) => isPython3(cmd, pre));
const [script, ...args] = process.argv.slice(2);

if (!found) {
  console.log(
    `${script}: skipped — Python 3 not found.\n` +
      "  Install it from https://www.python.org/downloads/ (tick \"Add python.exe to PATH\"),\n" +
      "  then run:  pip install -r requirements.txt",
  );
  process.exit(0);
}

const [cmd, pre] = found;
const r = spawnSync(cmd, [...pre, script, ...args], { stdio: "inherit", shell: false });
process.exit(r.status ?? 1);
