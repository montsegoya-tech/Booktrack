import Image from "next/image";
import { FORMATS } from "@/lib/formats";
import type { BookFormat } from "@/types";

export default function FormatBadge({ format }: { format: BookFormat }) {
  const { label, iconPath } = FORMATS[format];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e8b4b4] text-xs text-[#0f172a] border border-[#d9a0a0]">
      <Image src={iconPath} alt={label} width={14} height={14} />
      {label}
    </span>
  );
}
