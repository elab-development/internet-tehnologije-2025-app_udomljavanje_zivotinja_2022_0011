"use client";

import Button from "@/components/ui/Button";

export type AnimalItem = {
  id: number;
  ime: string;
  vrsta: string;
  status: string;
  starost?: number;
  lokacija?: string;
  slikaUrl?: string; 
};

export default function AnimalCard({
  zivotinja,
  onOpen,
  onAdopt,
}: {
  zivotinja: AnimalItem;
  onOpen: (id: number) => void;
  onAdopt: (id: number) => void;
}) {
  const isPas = zivotinja.vrsta?.toLowerCase().includes("pas");
  

  return (
    <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onOpen(zivotinja.id)}
      >
        {/* Slika */}
        <div className="relative border-b bg-gray-50">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-50">
            {zivotinja.slikaUrl ? (
              <img
                src={zivotinja.slikaUrl}
                alt={zivotinja.ime}
                className="h-64 w-full object-contain bg-gray-50"
          
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl">
                
              </div>
            )}
          </div>

          <div className="absolute right-3 top-3 rounded-full border bg-white/90 px-2 py-1 text-xs">
            {zivotinja.status}
          </div>
        </div>

        {/* Info */}
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
                lokacija: {zivotinja.lokacija}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* CTA */}
      <div className="px-4 pb-4">
        <Button
          onClick={(e: any) => {
            e?.stopPropagation?.(); 
            onAdopt(zivotinja.id);
          }}
        >
          Udomi
        </Button>
      </div>
    </div>
  );
}
