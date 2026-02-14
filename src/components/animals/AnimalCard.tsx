"use client";

import Button from "@/components/ui/Button";

export type AnimalItem = {
  id: number;
  ime: string;
  vrsta: string;
  status: string;
  starost?: number;
  lokacija?: string;
};

export default function AnimalCard({
  zivotinja,
  onOpen,
  onAdopt,
}: {
  zivotinja: AnimalItem;
  onOpen: () => void;
  onAdopt: () => void;
}) {
  const ikonica = zivotinja.vrsta?.toLowerCase().includes("pas") ? "pas" : "macka";

  return (
    <div className="group rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <button className="w-full text-left" onClick={onOpen}>
        <div className="relative overflow-hidden rounded-t-2xl border-b bg-gray-50">
          <div className="flex aspect-[4/3] items-center justify-center text-6xl">
            {ikonica}
          </div>

          <div className="absolute right-3 top-3 rounded-full border bg-white/90 px-2 py-1 text-xs">
            {zivotinja.status}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold leading-tight">
              {zivotinja.ime}
            </h3>
            <span className="text-xs text-gray-500">{zivotinja.vrsta}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
            {typeof zivotinja.starost === "number" && (
              <span className="rounded-full bg-gray-100 px-2 py-1">
                {zivotinja.starost} god
              </span>
            )}
            {zivotinja.lokacija && (
              <span className="rounded-full bg-gray-100 px-2 py-1">
                lok {zivotinja.lokacija}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="px-4 pb-4">
        <Button onClick={onAdopt}>Udomi</Button>
      </div>
    </div>
  );
}
