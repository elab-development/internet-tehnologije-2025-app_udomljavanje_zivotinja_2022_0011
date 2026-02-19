"use client";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">API Dokumentacija (Swagger)</h1>
      <p className="mt-2 text-sm opacity-80">
        Swagger UI za UdomiMe API. Specifikacija: <code>/api/openapi</code>
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        <SwaggerUI url="/api/openapi" />
      </div>
    </main>
  );
}
