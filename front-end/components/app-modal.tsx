"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CodeExample } from "@/lib/code-examples";
import { CopyButton } from "@/components/ui/copy-button";
import { Shuffle } from "lucide-react";
import Link from "next/link";

interface AppModalProps {
  active: CodeExample | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: () => void;
}

export function AppModal({ active, open, onOpenChange }: AppModalProps) {
  const iframePermissions = React.useMemo(() => {
    const perms = [
      active?.camera && "camera",
      active?.microphone && "microphone",
    ].filter(Boolean);
    return perms.length > 0 ? perms.join("; ") : undefined;
  }, [active]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-full md:min-w-[80vw] md:h-[80vh] p-4 overflow-scroll">
        {active && (
          <div className="flex w-full h-full flex-col-reverse gap-6 md:flex-row">
            <div className="flex w-full flex-col md:w-2/3">
              <div className="flex-1 w-full rounded border">
                <iframe
                  src={`${active.iframeUrl}/`}
                  title={`${active.title} demo`}
                  className="h-[80vh] w-full md:h-full overflow-scroll"
                  allow={iframePermissions}
                />
              </div>
            </div>
            <div className="flex w-full min-h-0 flex-col gap-3 md:w-1/3">
              <div className="flex flex-col items-center justify-center w-full h-full box-border pt-4 md:pt-0">
                <div className="flex flex-col items-center justify-between mb-4">
                  <DialogTitle className="text-2xl font-semibold leading-tight flex items-center gap-2">
                    {active.title}
                  </DialogTitle>
                  <Link
                    href={active.iframeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 text-sm hover:text-gray-500 transition-colors duration-100 mt-2 justify-center"
                  >
                    Open in new tab
                  </Link>
                  <div className="flex justify-center gap-2 mt-6 md:justify-start">
                    <Link
                      href={`https://chatgpt.com/?model=gpt-5&prompt=${encodeURIComponent(
                        active.prompt
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg"
                    >
                      <Shuffle size={16} /> Open in ChatGPT
                    </Link>
                    <CopyButton copyValue={() => active.prompt} />
                  </div>
                </div>
                <div className="px-4 py-6">
                  <div className="text-sm text-gray-900 font-medium mb-2">
                    Prompt:
                  </div>
                  <div
                    className="relative overflow-auto max-h-[65vh] md:max-h-full
before:sticky before:top-0 before:right-0 before:left-0 before:z-[1] before:h-4 before:pointer-events-none before:content-[''] before:bg-[linear-gradient(to_bottom,var(--color-surface),transparent)]
after:sticky  after:bottom-0 after:right-0 after:left-0 after:z-[1] after:h-4 after:pointer-events-none  after:content-['']  after:bg-[linear-gradient(to_top,var(--color-surface),transparent)]"
                  >
                    <div className="whitespace-pre-wrap break-words font-mono text-sm md:max-h-[40vh] overflow-scroll">
                      {active.prompt}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
