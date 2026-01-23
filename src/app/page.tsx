import Link from "next/link";
import Button from "@/components/ui/Button";


export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl border p-8">
        <h1 className="text-3xl font-bold">
          Udomi prijatelja. Promeni život.
        </h1>

        <p className="mt-3 max-w-2xl text-sm opacity-80">
          Naš cilj je da povežemo udomitelje, volontere i skloništa na jednom mestu.
          Pregledaj životinje, filtriraj po kriterijumima i pošalji zahtev za udomljavanje.
        </p>

        <div className="mt-6 flex gap-3">
          <Link href="/udomljavanje">
            <Button className="w-fit px-4 py-2">
              Pogledaj životinje
            </Button>
          </Link>

          <Link
            href="/podrzi-nas-cilj"

          > <Button className="w-fit px-4 py-2">
              Podrži naš cilj
            </Button>

          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Siguran proces</h2>
          <p className="mt-2 text-sm opacity-80">
            Jasni koraci i praćenje statusa zahteva za udomljavanje.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Programi i aktivnosti</h2>
          <p className="mt-2 text-sm opacity-80">
            Kroz godine, pokretali smo brojne inicijative za pomoć napuštenim i ugroženim životinjama. Zajedno pravimo promenu!
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Zajednica</h2>
          <p className="mt-2 text-sm opacity-80">
            Volonteri i udomitelji zajedno grade bolji sistem.
          </p>
        </div>
      </section>
    </main>
  );
}
