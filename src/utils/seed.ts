/**
 * Seeding utilities for demo data
 */

import type { StoredEntry } from "../index.type.ts";
import { generateId } from "./id.js";

export type SeedEntry = Omit<StoredEntry, "id" | "created_at">;

export function createSeedEntry(entry: SeedEntry): StoredEntry {
  return {
    ...entry,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
}

export function getSampleEntries(): StoredEntry[] {
  const samples: SeedEntry[] = [
    {
      type: "REACT_PATTERN",
      title: "useCallback with proper dependencies",
      content:
        "Always include all values that change over time as dependencies. This prevents stale closures and bugs.",
      tags: ["react", "hooks", "performance"],
      source: "testing",
    },
    {
      type: "ERROR_CORRECTION",
      title: "TypeError: Cannot read property of undefined",
      content:
        "Always validate data before accessing nested properties. Use optional chaining (?.) to safely access properties.",
      tags: ["javascript", "debugging"],
      source: "testing",
    },
    {
      type: "ARCH_DECISION",
      title: "Start with monolith",
      content:
        "For MVP: Start with monolith. Easier to deploy, debug, and maintain. Split to microservices only when necessary.",
      tags: ["architecture"],
      source: "testing",
    },
  ];

  return samples.map(createSeedEntry);
}

export function seedData(entries: SeedEntry[]): StoredEntry[] {
  const seeded = entries.map(createSeedEntry);
  return seeded;
}
