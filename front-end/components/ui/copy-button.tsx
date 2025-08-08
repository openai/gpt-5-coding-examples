import { type MouseEvent, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

const copyText = async (text: string) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error: unknown) {
      console.error(error);
    }
  }
};

export type CopyButtonProps = {
  copyValue: string | (() => string);
  children?:
    | React.ReactNode
    | ((props: { copied: boolean }) => React.ReactNode);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & Omit<any, "children">;

export const CopyButton = ({
  children,
  copyValue,
  onClick,
  ...restProps
}: CopyButtonProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const copiedTimeout = useRef<number | null>(null);

  const handleClick = (evt: MouseEvent<HTMLDivElement>) => {
    if (copied) {
      return;
    }

    setCopied(true);
    onClick?.(evt);

    copyText(typeof copyValue === "function" ? copyValue() : copyValue);

    copiedTimeout.current = window.setTimeout(() => {
      setCopied(false);
    }, 1300);
  };

  useEffect(() => {
    return () => {
      if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
    };
  }, []);

  return (
    <div
      {...restProps}
      onClick={handleClick}
      className="flex items-center gap-2 cursor-pointer z-10"
    >
      <div className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors duration-100">
        {copied ? (
          <Check key="copied-icon" size={16} />
        ) : (
          <Copy key="copy-icon" size={16} />
        )}
      </div>
      {typeof children === "function" ? children({ copied }) : children}
    </div>
  );
};
