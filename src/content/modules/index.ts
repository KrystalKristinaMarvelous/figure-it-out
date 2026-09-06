import type { ModuleDef } from "@/lib/schema/types";
import { UNIVERSAL_MODULES } from "./universal";
import { CREATIVE_MODULES } from "./creative";
import { ACADEMIC_MODULES } from "./academic";
import { PROFESSIONAL_MODULES } from "./professional";
import { PERSONAL_MODULES } from "./personal";

/** The whole module library — the source of truth. The DB is seeded from this. */
export const ALL_MODULES: ModuleDef[] = [
  ...UNIVERSAL_MODULES,
  ...CREATIVE_MODULES,
  ...ACADEMIC_MODULES,
  ...PROFESSIONAL_MODULES,
  ...PERSONAL_MODULES,
];

const BY_KEY = new Map(ALL_MODULES.map((m) => [m.key, m]));

if (process.env.NODE_ENV !== "production") {
  const seen = new Set<string>();
  for (const m of ALL_MODULES) {
    if (seen.has(m.key)) throw new Error(`Duplicate module key: ${m.key}`);
    seen.add(m.key);
  }
}

export function getModuleDef(key: string): ModuleDef | undefined {
  return BY_KEY.get(key);
}

/** Filter a list of keys to those that have a definition, preserving order. */
export function resolveModuleKeys(keys: string[]): ModuleDef[] {
  return keys.map((k) => BY_KEY.get(k)).filter((m): m is ModuleDef => Boolean(m));
}

export function modulesForCategory(category: string): ModuleDef[] {
  return ALL_MODULES.filter(
    (m) =>
      m.universal ||
      !m.categoryAffinity?.length ||
      m.categoryAffinity.includes(category),
  );
}

export function universalModules(): ModuleDef[] {
  return ALL_MODULES.filter((m) => m.universal);
}

export const MODULE_COUNT = ALL_MODULES.length;
