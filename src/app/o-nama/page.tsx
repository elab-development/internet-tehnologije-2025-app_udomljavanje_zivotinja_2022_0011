export default function AboutUsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="absolute inset-0 -z-10 opacity-17">
        <img
          src="/dogs1.jpg"
          alt="background"
          className="h-full w-full object-cover"
        />
      </div>
      <section className="rounded-2xl border p-8">
        <h1 className="text-3xl font-bold">
          Ko smo mi i čime se bavi ResQ collective Beograd?
        </h1>

        <p className="mt-3 max-w-2xl text-sm opacity-80">
          Platforma za udomljavanje životinja nastala je sa idejom da
          olakša proces pronalaska doma i poveže ljude dobre volje.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Naša misija</h2>
          <p className="mt-2 text-sm opacity-80">
            Da omogućimo transparentan i siguran proces udomljavanja.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Naše vrednosti</h2>
          <p className="mt-2 text-sm opacity-80">
            Empatija, odgovornost i briga o životinjama su u centru svega što radimo.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Zajednica</h2>
          <p className="mt-2 text-sm opacity-80">
            Okupljamo volontere, udomitelje i skloništa kako bismo zajedno
            napravili trajnu promenu.
          </p>
        </div>
      </section>
    </main>
  );
}
