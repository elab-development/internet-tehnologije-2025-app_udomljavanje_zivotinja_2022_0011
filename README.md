# ResQ Collective

ResQ Collective je web aplikacija za udomljavanje životinja i upravljanje procesom udomljavanja kroz više korisničkih uloga (ADMIN, VOLONTER, UDOMITELJ). Aplikacija omogućava pregled dostupnih životinja, slanje zahteva za udomljavanje, upravljanje zahtevima i automatske email notifikacije o promeni statusa.

**Autori:** Milica Miladinović, Milica Mileusnić  
**Predmet:** Internet tehnologije (Seminarski rad)

---

## Funkcionalnosti

- Registracija i prijava korisnika (JWT autentifikacija)
- Role-based pristup (ADMIN / VOLONTER / UDOMITELJ)
- Pregled i detalji životinja
- Slanje zahteva za udomljavanje
- Odobravanje/odbijanje zahteva (admin/volonter)
- Automatsko slanje email obaveštenja pri promeni statusa zahteva
- Upload slika životinja (Cloudinary)
- Mapa (Leaflet) i geokodiranje adrese (Nominatim / OpenStreetMap)
- Swagger / OpenAPI dokumentacija

---

## Uloge i dozvole

- **UDOMITELJ**
  - Pregled životinja
  - Slanje zahteva za udomljavanje
  - Pregled sopstvenih zahteva i statusa

- **VOLONTER**
  - Sve kao udomitelj
  - Postavljanje novih životinja na udomljavanje
  - Brisanje samo svojih postavljenih životinja

- **ADMIN**
  - Sve kao volonter
  - Upravljanje svim zahtevima i svim životinjama

---

## Eksterni servisi / API integracije

- **Cloudinary** – upload i hostovanje slika životinja
- **Gmail SMTP (nodemailer)** – slanje email notifikacija korisnicima
- **OpenStreetMap tiles** – prikaz mape
- **Nominatim (OpenStreetMap)** – geocoding endpoint (`/api/geocode?q=...`)

---

## Tehnologije

- Next.js (App Router) + React
- TypeScript
- Prisma ORM
- MySQL
- JWT (Bearer token)
- Docker i docker-compose
- Swagger / OpenAPI
- Leaflet / react-leaflet
- Nodemailer (SMTP)

---

## Struktura projekta (skraćeno)
prisma/
migrations/
schema.prisma
src/
app/
api/...
(pages)/...
components/
lib/
docker-compose.yml
Dockerfile


Najbitniji folderi:
- `src/app/api/*` – API rute (REST, JSON response)
- `src/lib/*` – pomoćne funkcije (auth, jwt, guard, prisma, mailer, openapi)
- `src/components/*` – reusable UI komponente (Button, Input, Modal, Navbar, Map...)

---

## Preduslovi

- Node.js 24
- MySQL 
- Docker + Docker Compose 

---

## Pokretanje lokalno (bez Dockera)

1. Kloniraj repozitorijum i instaliraj dependencije:
    npm install
2. Napravi .env na osnovu .env.example i podesi vrednosti.
3. Pokreni Prisma migracije:
    npx prisma migrate dev
4. Pokreni aplikaciju:
    npm run dev

Aplikacija će biti dostupna na:
http://localhost:3000

## Pokretanje preko Dockera

1. Napravi .env.docker na osnovu .env.example (ili koristi postojeći).
2. Pokreni:
    docker-compose up --build

Aplikacija:
http://localhost:3000


## Swagger / API dokumentacija

Swagger/OpenAPI je dostupan na rutama:

http://localhost:3000/api-docs

http://localhost:3000/api/openapi (OpenAPI JSON)

## Bezbednost (minimum 3 zaštite)

1. IDOR (Insecure Direct Object Reference) zaštita
  Aplikacija je zaštićena od IDOR napada kroz kombinaciju autentifikacije, autorizacije i provere vlasništva resursa. IDOR napad podrazumeva pokušaj pristupa ili izmene tuđih podataka manipulacijom ID vrednosti u URL-u.
  - Autentifikacija - Sve rute koje menjaju podatke (PUT, PATCH, DELETE) koriste requireAuth(req) što osigurava da samo ulogovani korisnici mogu pristupiti tim endpointima.
  - Autorizacija po ulozi - Pristup je dodatno ograničen preko requireRole(auth, ["VOLONTER", "ADMIN"]) ili requireRole(auth, ["ADMIN"]) čime se kontroliše koja korisnička uloga ima pravo na određenu akciju.
  - Provera vlasništva resursa - Pored provere uloge, sistem proverava da li korisnik pokušava da izmeni resurs koji mu pripada. Na primer, pri izmeni životinje se obeybeđuje da volonter može da menja samo one životinje koje je on postavio
  - Korišćenje identiteta iz JWT tokena - Identitet korisnika (userId) se nikada ne preuzima iz parametara zahteva, već isključivo iz JWT tokena:
    where: { korisnikId: auth.userId }
  Ovim se sprečava manipulacija ID vrednostima kroz klijentsku stranu.

2. XSS (Cross-Site Scripting) zaštita
  Aplikacija je zaštićena od XSS napada tako što se korisnički unosi ne renderuju kao HTML, već kao običan tekst.
  Kako je XSS sprečen:
    - React/Next.js po difoltu “escape”-uje vrednosti koje se prikazuju u JSX-u, pa se potencijalno zlonamerni sadržaj poput <script>...</script> prikazuje kao tekst, a ne izvršava se.
    - U aplikaciji se ne koristi dangerouslySetInnerHTML, niti se sadržaj iz baze ubacuje direktno u HTML.
    - Tekstualni inputi se dodatno obrađuju pre upisa/prikaza (npr. .trim()), a na kritičnim poljima se mogu postaviti i ograničenja dužine (npr. opis, komentar).

  Manual test (provera):
    XSS je testiran unosom sledećih vrednosti u tekstualna polja:
      <script>alert("XSS")</script>
      <img src=x onerror=alert("XSS")>
    Nakon čuvanja i prikaza, sadržaj se prikazuje kao tekst i ne izvršava se, što potvrđuje da XSS nije moguć kroz standardni UI prikaz.

3. CORS zaštita
  API server ne dozvoljava cross-origin pristup od drugih domena. Privatne API rute (npr. /api/me, /api/me/dashboard) zahtevaju validan JWT token. Testiranjem direktnog poziva iz browser konzole bez Authorization header-a:
    fetch("http://localhost:3000/api/me")
  server vraća 401 Unauthorized, čime se potvrđuje da privatni podaci nisu javno dostupni.

4. SQL Injection zaštita
  Aplikacija je zaštićena od SQL Injection napada korišćenjem Prisma ORM-a, koji automatski koristi parametrizovane upite. Svi pristupi bazi se vrše kroz ORM metode kao što su:
    prisma.korisnik.findUnique({ where: { email } })
  što sprečava ubacivanje SQL komandi kroz korisnički unos.
  Manual test je izvršen pokušajem logovanja sa vrednošću:
    ' OR 1=1 --
  Aplikacija je pravilno odbila pristup, čime je potvrđeno da SQL Injection nije moguć.


## Seed (opciono)
U repozitorijumu postoji prisma/seed.ts, ali seed trenutno nije obavezan i nije aktivno korišćen u standardnom flow-u.

# Deploy
Produkcijska verzija aplikacije postavljena je na cloud infrastrukturu korišćenjem sledećih servisa:
  Render - za hostovanje Next.js web aplikacije
  Railway - za hostovanje MySQL baze podataka

Deploy aplikacije je u potpunosti automatizovan.
Prilikom svakog push-a na main granu:
1. Pokreću se automatizovani testovi
2. Gradi se Docker image aplikacije
3. Image se objavljuje na GitHub Container Registry (GHCR)
4. Aktivira se Render Deploy Hook
5. Render automatski redeploy-uje aplikaciju

## Konfiguracija okruženja (.env)

Aplikacija koristi environment promenljive za konfiguraciju baze podataka, autentifikacije i eksternih servisa. U repozitorijumu se nalazi .env.example fajl koji prikazuje sve potrebne promenljive bez stvarnih vrednosti iz bezbednosnih razloga.

Za lokalno pokretanje potrebno je:

1. Kopirati .env.example
2. Preimenovati u .env
3. Popuniti odgovarajuće vrednosti

Primer promenljivih koje aplikacija koristi:

    DATABASE_URL – konekcija ka MySQL bazi
    JWT_SECRET – tajni ključ za potpisivanje JWT tokena
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME – Cloudinary cloud ime
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET – preset za upload slika
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS – konfiguracija email servisa
    NODE_ENV – runtime okruženje


## Automatizovani testovi

U projektu su implementirani automatizovani testovi korišćenjem **Vitest** alata. Testovi se izvršavaju nad posebnom MySQL test bazom koja se pokreće u Docker kontejneru (`db_test`) i ne utiče na razvojnu bazu.

### Preduslovi
- Instaliran **Docker** i **Docker Compose**
- Instaliran **Node.js** i **npm**

### Pokretanje testova
Jedna komanda pokreće sve što je potrebno:
- podiže test bazu (`db_test`)
- primenjuje Prisma migracije na test bazu
- pokreće Vitest testove

    npm run test:e2e

### Pokretanje samo testova
Pokreće samo Vitest testove (koristi već pripremljenu test bazu):
  npm test

### Test baza
Test baza se pokreće kroz docker-compose.yml servis db_test i mapirana je na port 3307.
Korišćeni test DB connection string (primer):
  mysql://root:resq_rootpass_test@localhost:3307/resq_collective_test

### Šta testovi pokrivaju
Testovi proveravaju ključne delove aplikacije:
  Public ruta: GET /api/zivotinje vraća status 200 i validan JSON format
  Autentifikacija: POST /api/zivotinje bez tokena vraća 401
  Autorizacija: POST /api/zivotinje sa ulogom koja nije dozvoljena vraća 403
  Kreiranje resursa: POST /api/zivotinje sa VOLONTER ulogom vraća 201