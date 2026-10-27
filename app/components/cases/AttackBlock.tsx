"use client";

/* The ATT&CK coverage matrix with its data, as one lazy chunk */

import AttackCoverage from "./AttackCoverage";
import { attackCoverage } from "@/app/core/config/library-data";

export default function AttackBlock() {
  return <AttackCoverage {...attackCoverage} />;
}
