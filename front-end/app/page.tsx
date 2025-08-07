export const dynamic = "force-static";
import { AppGrid } from "@/components/app-grid";
import { loadApps } from "@/lib/code-examples";

export default async function Home() {
  const apps = await loadApps();

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-gray-50 to-blue-100">
      <main className="mx-auto w-full py-6">
        <h1 className="text-3xl font-bold font-mono text-center mb-4">
          GPT-5 coding examples
        </h1>
        <AppGrid apps={apps} />
      </main>
    </div>
  );
}
