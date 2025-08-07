import path from "path";
import fs from "fs/promises";

export async function loadYamlFiles(rootDir: string): Promise<string[]> {
  const results: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip heavy/system folders
        if (
          [
            "node_modules",
            ".git",
            ".next",
            "dist",
            "build",
            "out",
            ".vercel",
            "misc",
          ].includes(entry.name)
        )
          continue;
        await walk(fullPath);
      } else if (entry.isFile()) {
        if (
          entry.name.toLowerCase().endsWith(".yaml") ||
          entry.name.toLowerCase().endsWith(".yml")
        ) {
          results.push(fullPath);
        }
      }
    }
  }
  await walk(rootDir);
  return results;
}
