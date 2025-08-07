import path from "path";
import fs from "fs/promises";
import YAML from "yaml";
import { loadYamlFiles } from "./load-yaml";

export interface CodeExampleYAML {
  id?: string; // optional in YAML—slug will be canonical
  title?: string;
  name?: string; // legacy
  prompt?: string;
  tags?: unknown;
  camera?: unknown;
  microphone?: unknown;
}

export interface CodeExample {
  id: string;
  title: string;
  prompt: string;
  poster: string;
  iframeUrl: string;
  tags: string[];
  camera?: boolean;
  microphone?: boolean;
}

const CDN_BASE_URL = "https://cdn.openai.com/devhub/gpt5prompts";
const IFRAME_BASE_URL = "/";

// --- helpers to normalize YAML fields ---
function toStringArray(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value))
    return value.filter((v) => typeof v === "string") as string[];
  return undefined;
}
function toBool(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

// Build a **plain object** (no class)
function toCodeExample(
  id: string,
  data: Required<Pick<CodeExampleYAML, "title" | "prompt">> & {
    tags?: string[];
    camera?: boolean;
    microphone?: boolean;
  }
): CodeExample {
  return {
    id,
    title: data.title,
    prompt: data.prompt,
    poster: `${CDN_BASE_URL}/${id}.png`,
    iframeUrl: `${IFRAME_BASE_URL}${id}`,
    tags: data.tags ?? [],
    camera: data.camera,
    microphone: data.microphone,
  };
}

export async function loadApps(): Promise<CodeExample[]> {
  // Runs on the server; YAML files are one level up from the frontend package
  const repoRoot = path.resolve(process.cwd(), "..");
  const files = await loadYamlFiles(repoRoot);
  const apps: CodeExample[] = [];

  for (const file of files) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const obj = YAML.parse(raw) as CodeExampleYAML;

      const base = path.basename(file);
      const slug = base.replace(/\.(yaml|yml)$/i, "");

      const title =
        (typeof obj.title === "string" && obj.title) ||
        (typeof obj.name === "string" && obj.name) ||
        undefined;
      const prompt = typeof obj.prompt === "string" ? obj.prompt : undefined;
      if (!title || !prompt) continue;

      apps.push(
        toCodeExample(slug, {
          title,
          prompt,
          tags: toStringArray(obj.tags),
          camera: toBool(obj.camera),
          microphone: toBool(obj.microphone),
        })
      );
    } catch {
      // ignore malformed files
    }
  }

  apps.sort((a, b) => a.title.localeCompare(b.title));
  return apps; // ✅ plain objects, safe to pass to Client Components
}
