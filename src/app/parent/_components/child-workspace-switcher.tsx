"use client";

import { useRouter } from "next/navigation";

type ChildOption = {
  id: string;
  name: string;
};

export function ChildWorkspaceSwitcher({
  childOptions,
  currentChildId,
}: {
  childOptions: ChildOption[];
  currentChildId: string;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
      <span className="whitespace-nowrap">Switch child</span>
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
        value={currentChildId}
        onChange={(event) => {
          const targetId = event.target.value;
          if (!targetId || targetId === currentChildId) return;
          router.push(`/parent/children/${targetId}`);
        }}
      >
        {childOptions.map((child) => (
          <option key={child.id} value={child.id}>{child.name}</option>
        ))}
      </select>
    </label>
  );
}
