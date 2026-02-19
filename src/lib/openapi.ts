export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "UdomiMe API",
    version: "1.0.0",
    description:
      "API specifikacija za aplikaciju za udomljavanje životinja. Obuhvata autentifikaciju, životinje, zahteve za usvajanje, zahteve za volontera, notifikacije i kontakt poruke.",
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "Auth" },
    { name: "Životinje" },
    { name: "Zahtevi usvajanje" },
    { name: "Zahtevi volonter" },
    { name: "Notifikacije" },
    { name: "Kontakt" },
  ],

  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },

    schemas: {
      // Standardizovan wrapper po tvom ok()/fail() formatu
      OkResponse: {
        type: "object",
        properties: { data: {} },
        required: ["data"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
            required: ["message"],
          },
        },
        required: ["error"],
      },

      // ENUM-i iz šeme
      Role: {
        type: "string",
        enum: ["ADMIN", "VOLONTER", "UDOMITELJ"],
      },
      StatusZivotinje: {
        type: "string",
        enum: ["AKTIVNA", "UDOMLJENA", "PAUZIRANA"],
      },
      StatusZahteva: {
        type: "string",
        enum: ["NA_CEKANJU", "ODOBREN", "ODBIJEN", "OTKAZAN"],
      },
      StatusNotifikacije: {
        type: "string",
        enum: ["DRAFT", "POSLATA", "NEUSPESNA"],
      },

      // MODELI
      Korisnik: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          ime: { type: "string", example: "Milica" },
          prezime: { type: "string", example: "Mileusnić" },
          email: { type: "string", example: "milica@email.com" },
          role: { $ref: "#/components/schemas/Role" },
          datumRodjenja: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "ime", "prezime", "email", "role", "createdAt", "updatedAt"],
      },

      Zivotinja: {
        type: "object",
        properties: {
          id: { type: "integer", example: 10 },
          ime: { type: "string", example: "Luna" },
          vrsta: { type: "string", example: "Pas" },
          starost: { type: "integer", example: 3 },
          pol: { type: "string", example: "Ž" },
          lokacija: { type: "string", example: "Beograd" },
          status: { $ref: "#/components/schemas/StatusZivotinje" },
          opis: { type: "string", example: "Umiljata i dobra sa decom." },
          slikaUrl: { type: "string", nullable: true, example: "https://..." },
          postavljeno: { type: "string", format: "date-time" },
          korisnikId: { type: "integer", example: 2 },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "ime",
          "vrsta",
          "starost",
          "pol",
          "lokacija",
          "status",
          "opis",
          "postavljeno",
          "korisnikId",
          "updatedAt",
        ],
      },

      ZahtevZaUsvajanje: {
        type: "object",
        properties: {
          id: { type: "integer", example: 100 },
          kontakt: { type: "string", example: "+381 6x xxx xxxx" },
          motivacija: { type: "string", example: "Imam uslove i iskustvo..." },
          status: { $ref: "#/components/schemas/StatusZahteva" },
          vremePodnosenjaZahteva: { type: "string", format: "date-time" },
          komentarVolontera: { type: "string", nullable: true },
          korisnikId: { type: "integer", example: 5 },
          zivotinjaId: { type: "integer", example: 10 },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "kontakt",
          "motivacija",
          "status",
          "vremePodnosenjaZahteva",
          "korisnikId",
          "zivotinjaId",
          "updatedAt",
        ],
      },

      ZahtevZaVolontera: {
        type: "object",
        properties: {
          id: { type: "integer", example: 55 },
          iskustvo: { type: "string", example: "Radio/la u azilu 2 godine." },
          motivacija: { type: "string", example: "Želim da pomognem." },
          status: { $ref: "#/components/schemas/StatusZahteva" },
          vremePodnosenjaZahteva: { type: "string", format: "date-time" },
          korisnikId: { type: "integer", example: 5 },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "iskustvo",
          "motivacija",
          "status",
          "vremePodnosenjaZahteva",
          "korisnikId",
          "updatedAt",
        ],
      },

      Notifikacija: {
        type: "object",
        properties: {
          id: { type: "integer", example: 7 },
          naMail: { type: "string", example: "udomitelj@email.com" },
          naslov: { type: "string", example: "Odobren zahtev" },
          tekst: { type: "string", example: "Vaš zahtev je odobren..." },
          status: { $ref: "#/components/schemas/StatusNotifikacije" },
          vremeSlanja: { type: "string", format: "date-time" },
          zahtevId: { type: "integer", example: 100 },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "naMail", "naslov", "tekst", "status", "vremeSlanja", "zahtevId", "updatedAt"],
      },

      KontaktPoruka: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          ime: { type: "string", example: "Milica Mileusnić" },
          email: { type: "string", example: "milica@email.com" },
          poruka: { type: "string", example: "Želim da se uključim kao volonter." },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "ime", "email", "poruka", "createdAt"],
      },

      // REQUEST DTOs (da Swagger ima jasne inpute)
      KontaktReq: {
        type: "object",
        properties: {
          ime: { type: "string" },
          email: { type: "string" },
          poruka: { type: "string" },
        },
        required: ["ime", "email", "poruka"],
      },

      ZivotinjaCreateReq: {
        type: "object",
        properties: {
          ime: { type: "string" },
          vrsta: { type: "string" },
          starost: { type: "integer" },
          pol: { type: "string" },
          lokacija: { type: "string" },
          opis: { type: "string" },
          slikaUrl: { type: "string", nullable: true },
        },
        required: ["ime", "vrsta", "starost", "pol", "lokacija", "opis"],
      },

      ZahtevUsvajanjeCreateReq: {
        type: "object",
        properties: {
          zivotinjaId: { type: "integer" },
          kontakt: { type: "string" },
          motivacija: { type: "string" },
        },
        required: ["zivotinjaId", "kontakt", "motivacija"],
      },

      ZahtevVolonterCreateReq: {
        type: "object",
        properties: {
          iskustvo: { type: "string" },
          motivacija: { type: "string" },
        },
        required: ["iskustvo", "motivacija"],
      },
    },
  },

 paths: {
  // AUTH
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Registracija (PUBLIC)",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object" } } },
      },
      responses: {
        "201": { description: "Korisnik registrovan" },
        "400": {
          description: "Validacija",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login (PUBLIC)",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object" } } },
      },
      responses: {
        "200": { description: "Uspešan login (JWT token u response-u)" },
        "400": {
          description: "Validacija",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Logout (AUTH)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Logout uspešan" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },

  // GEOCODE (eksterni API wrapper)
  "/api/geocode": {
    get: {
      tags: ["Kontakt"],
      summary: "Geocode / pretraga lokacije (PUBLIC)",
      parameters: [
        { name: "q", in: "query", required: true, schema: { type: "string" }, description: "Tekst lokacije (npr. 'Beograd')" },
      ],
      responses: {
        "200": { description: "Rezultati geokodiranja" },
        "400": {
          description: "Validacija",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },

  // KONTAKT
  "/api/kontakt": {
    post: {
      tags: ["Kontakt"],
      summary: "Slanje kontakt poruke (PUBLIC)",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/KontaktReq" } } },
      },
      responses: {
        "201": { description: "Poruka poslata" },
        "400": {
          description: "Validacija",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "500": {
          description: "Greška na serveru",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
    get: {
      tags: ["Kontakt"],
      summary: "Lista kontakt poruka (ADMIN)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Lista poruka" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "403": {
          description: "Zabranjeno",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },

  // ME
  "/api/me": {
    get: {
      tags: ["Auth"],
      summary: "Trenutno ulogovan korisnik (AUTH)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Korisnik" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/me/dashboard": {
    get: {
      tags: ["Auth"],
      summary: "Dashboard podaci za ulogovanog korisnika (AUTH)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Dashboard data" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/me/zahtevi-usvajanje": {
    get: {
      tags: ["Zahtevi usvajanje"],
      summary: "Moji zahtevi za usvajanje (AUTH – udomitelj)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Lista mojih zahteva" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },

  // ŽIVOTINJE
  "/api/zivotinje": {
    get: {
      tags: ["Životinje"],
      summary: "Lista životinja (PUBLIC)",
      responses: { "200": { description: "Lista životinja" } },
    },
    post: {
      tags: ["Životinje"],
      summary: "Dodavanje životinje (VOLONTER/ADMIN)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ZivotinjaCreateReq" } } },
      },
      responses: {
        "201": { description: "Životinja kreirana" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "403": {
          description: "Zabranjeno",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/zivotinje/{id}": {
    get: {
      tags: ["Životinje"],
      summary: "Detalji životinje (PUBLIC)",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      responses: {
        "200": { description: "Detalji životinje" },
        "404": {
          description: "Nije pronađena",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
    delete: {
      tags: ["Životinje"],
      summary: "Brisanje životinje (VOLONTER/ADMIN; volonter samo svoje)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      responses: {
        "200": { description: "Obrisano" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "403": {
          description: "Zabranjeno",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },

  // ZAHTEVI – USVAJANJE
  "/api/zahtevi-usvajanje": {
    post: {
      tags: ["Zahtevi usvajanje"],
      summary: "Kreiranje zahteva za usvajanje (UDOMITELJ)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ZahtevUsvajanjeCreateReq" } } },
      },
      responses: {
        "201": { description: "Zahtev kreiran" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "403": {
          description: "Zabranjeno",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
    get: {
      tags: ["Zahtevi usvajanje"],
      summary: "Lista zahteva za usvajanje (VOLONTER/ADMIN)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Lista zahteva" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "403": {
          description: "Zabranjeno",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/zahtevi-usvajanje/{id}": {
    get: {
      tags: ["Zahtevi usvajanje"],
      summary: "Detalji zahteva za usvajanje (AUTH)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      responses: { "200": { description: "Detalji zahteva" } },
    },
  },

  // ZAHTEVI – VOLONTERA
  "/api/zahtevi-volontera": {
    post: {
      tags: ["Zahtevi volonter"],
      summary: "Kreiranje zahteva za volontera (UDOMITELJ)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ZahtevVolonterCreateReq" } } },
      },
      responses: {
        "201": { description: "Zahtev kreiran" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "403": {
          description: "Zabranjeno",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
    get: {
      tags: ["Zahtevi volonter"],
      summary: "Lista zahteva za volontera (ADMIN)",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Lista zahteva" } },
    },
  },
  "/api/zahtevi-volontera/{id}": {
    get: {
      tags: ["Zahtevi volonter"],
      summary: "Detalji zahteva za volontera (AUTH)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      responses: { "200": { description: "Detalji zahteva" } },
    },
  },

  // STATUS PROMENA: /api/zahtevi/[id]/status
  "/api/zahtevi/{id}/status": {
    patch: {
      tags: ["Zahtevi usvajanje"],
      summary: "Promena statusa zahteva (VOLONTER/ADMIN)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { $ref: "#/components/schemas/StatusZahteva" },
                komentarVolontera: { type: "string", nullable: true },
              },
              required: ["status"],
            },
          },
        },
      },
      responses: {
        "200": { description: "Status ažuriran" },
        "401": {
          description: "Neautorizovano",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        "403": {
          description: "Zabranjeno",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
},
} as const;
