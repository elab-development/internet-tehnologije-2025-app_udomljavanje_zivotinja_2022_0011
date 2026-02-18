import MapZivotinja from "@/components/ui/MapZivotinja";
export default function PodrziNasCiljPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
       {/* POZADINSKA SLIKA */}
      <div className="absolute inset-0 -z-10 opacity-17">
        <img
          src="/dogs1.jpg"
          alt="background"
          className="h-full w-full object-cover"
        />
      </div>
      <section className="rounded-2xl border p-8">
        <h1 className="text-3xl font-bold">
          Podrži naš cilj
        </h1>

        <p className="mt-3 max-w-2xl text-sm opacity-80">
          Svaka podrška znači novu šansu za napuštene životinje.
          Zajedno možemo obezbediti sigurnost, brigu i dom.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Zašto je važno?</h2>
          <p className="mt-2 text-sm opacity-80">
            Hrana, veterinarski pregledi i privremeni smeštaj zahtevaju resurse.
            Vaša podrška direktno pomaže životinjama.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Kako možeš pomoći?</h2>
          <p className="mt-2 text-sm opacity-80">
            Deljenjem objava, volontiranjem ili donacijama doprinosiš većoj vidljivosti
            i boljim uslovima za životinje.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Naš cilj</h2>
          <p className="mt-2 text-sm opacity-80">
            Smanjenje broja napuštenih životinja i povezivanje sa odgovornim udomiteljima.
          </p>
        </div>
      </section>
      {/* MAPA UTICAJA */}
      <div className="mt-12">
        <MapZivotinja />
      </div>
    </main>
  );
}
