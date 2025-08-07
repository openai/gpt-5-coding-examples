import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function rimrafDirIfExists(dir) {
  if (await exists(dir)) {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

async function copyDir(src, dest) {
  const stat = await fs.stat(src);
  if (!stat.isDirectory()) {
    throw new Error(`Source is not a directory: ${src}`);
  }
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else if (entry.isSymbolicLink()) {
      const link = await fs.readlink(s);
      try {
        await fs.symlink(link, d);
      } catch {
        /* ignore */
      }
    } else if (entry.isFile()) {
      await fs.copyFile(s, d);
    }
  }
}

async function main() {
  const frontEndDir = path.resolve(__dirname, "..");
  const repoRoot = path.resolve(frontEndDir, "..");
  const srcDir = path.join(repoRoot, "apps");
  const publicDir = path.join(frontEndDir, "public");

  if (!(await exists(srcDir))) {
    console.log(`[copy-apps] No apps directory found at ${srcDir}, skipping.`);
    return;
  }

  await fs.mkdir(publicDir, { recursive: true });

  // Copy only subdirectories from apps/ to public/ directly.
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(publicDir, entry.name);

    if (entry.isDirectory()) {
      console.log(`[copy-apps] Copying ${s} -> ${d}`);
      await rimrafDirIfExists(d);
      await copyDir(s, d);
    } else if (entry.isFile()) {
      // Avoid copying top-level files like apps/index.html to prevent clobbering Next's routes.
      console.log(`[copy-apps] Skipping top-level file: ${entry.name}`);
    }
  }

  console.log(`[copy-apps] Done.`);
}

main().catch((err) => {
  console.error("[copy-apps] Failed:", err);
  process.exit(1);
});
