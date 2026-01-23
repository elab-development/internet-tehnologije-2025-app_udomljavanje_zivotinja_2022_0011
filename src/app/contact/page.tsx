import Button from "@/components/ui/Button";
export default function KontaktPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Kontakt</h1>
      <p className="mt-2 text-sm opacity-80">
        Imaš pitanje, predlog ili želiš da se uključiš kao volonter?
        Slobodno nam se javi.
      </p>

      <form className="mt-8 grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Ime i prezime</label>
          <input
            type="text"
            placeholder="Unesi ime i prezime"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Email adresa</label>
          <input
            type="email"
            placeholder="npr. ime@email.com"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Poruka</label>
          <textarea
            rows={5}
            placeholder="Napiši svoju poruku ovde..."
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <Button type="submit" className="mt-4 w-fit px-6">
        Pošalji poruku
        </Button>

      </form>

      {/* KONTAKT INFO */}
      <section className="mt-12 rounded-2xl border p-6">
        <h2 className="font-semibold">Kontakt informacije</h2>
        <ul className="mt-3 text-sm opacity-80">
          <li>📍 Beograd, Srbija</li>
          <li>📧 resqcollectivebelgrade@gmail.com</li>
          
        </ul>
      </section>
    </main>
  );
}
