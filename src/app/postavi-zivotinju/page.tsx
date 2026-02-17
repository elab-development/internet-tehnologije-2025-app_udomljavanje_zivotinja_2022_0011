"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/apiFetch";

type Role = "ADMIN" | "VOLONTER" | "UDOMITELJ";

function getRoleFromToken(): Role | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );

    const payload = JSON.parse(json);
    const r = payload?.role;
    if (r === "ADMIN" || r === "VOLONTER" || r === "UDOMITELJ") return r;
    return null;
  } catch {
    return null;
  }
}

// upload na Cloudinary
async function uploadSlikeNaCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Nedostaju Cloudinary env varijable. Proveri .env.local (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME i NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)."
    );
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Upload slike neuspešan.");
  }

 
  return data.secure_url as string;
}

export default function PostaviZivotinjuPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [ime, setIme] = useState("");
  const [vrsta, setVrsta] = useState<"pas" | "mačka">("pas");
  const [starost, setStarost] = useState<string>("");
  const [pol, setPol] = useState<"M" | "Ž">("M");
  const [lokacija, setLokacija] = useState("");
  const [opis, setOpis] = useState("");


  const [slikaFile, setSlikaFile] = useState<File | null>(null);
  const [slikaPreview, setSlikaPreview] = useState<string | null>(null);

  useEffect(() => {
    const r = getRoleFromToken();
    setRole(r);

    if (r !== "VOLONTER" && r !== "ADMIN") {
      router.replace("/udomljavanje");
    }
  }, [router]);

 
  useEffect(() => {
    if (!slikaFile) {
      setSlikaPreview(null);
      return;
    }
    const url = URL.createObjectURL(slikaFile);
    setSlikaPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [slikaFile]);

  async function onSubmit() {
    setError(null);
    setSuccess(null);

    const s = Number(starost);

    if (!ime.trim() || !lokacija.trim() || !opis.trim() || !Number.isFinite(s)) {
      setError("Popuni sva polja (starost mora biti broj).");
      return;
    }

    
    if (!slikaFile) {
      setError("Izaberi sliku životinje.");
      return;
    }


    if (!slikaFile.type.startsWith("image/")) {
      setError("Dozvoljene su samo slike.");
      return;
    }
    const max = 5 * 1024 * 1024; // 5MB
    if (slikaFile.size > max) {
      setError("Slika je prevelika (max 5MB).");
      return;
    }

    setLoading(true);
    try {
      //upload slike na Cloudinary
      const slikaUrl = await uploadSlikeNaCloudinary(slikaFile);

    
      await apiFetch("/zivotinje", {
        method: "POST",
        body: JSON.stringify({
          ime: ime.trim(),
          vrsta,
          starost: s,
          pol,
          lokacija: lokacija.trim(),
          opis: opis.trim(),
          slikaUrl, 
        }),
      });

      setSuccess("Životinja je uspešno postavljena.");

      router.push("/udomljavanje");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Greška pri postavljanju životinje.");
    } finally {
      setLoading(false);
    }
  }

  if (!role) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
          Učitavanje...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Postavi životinju</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="space-y-4 rounded-2xl border bg-white p-6">
       
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Slika životinje</label>
          <input
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            type="file"
            accept="image/*"
            onChange={(e) => setSlikaFile(e.target.files?.[0] ?? null)}
          />

          {slikaPreview && (
            <div className="mt-3 overflow-hidden rounded-2xl border">
              <img src={slikaPreview} alt="Preview" className="h-60 w-full object-cover" />
            </div>
          )}
        </div>

        <Input
          label={"Ime"}
          name={"ime"}
          placeholder="npr. Bubi"
          value={ime}
          onChange={(e) => setIme(e.target.value)}
        />

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Vrsta</label>
          <select
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            value={vrsta}
            onChange={(e) => setVrsta(e.target.value as any)}
          >
            <option value="pas">Pas</option>
            <option value="mačka">Mačka</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Starost (god)</label>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              type="number"
              min={0}
              value={starost}
              onChange={(e) => setStarost(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Pol</label>
            <select
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              value={pol}
              onChange={(e) => setPol(e.target.value as any)}
            >
              <option value="M">M</option>
              <option value="Ž">Ž</option>
            </select>
          </div>
        </div>

        <Input
          label={"Lokacija"}
          name={"lokacija"}
          placeholder="npr. Beograd"
          value={lokacija}
          onChange={(e) => setLokacija(e.target.value)}
        />

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Opis</label>
          <textarea
            className="w-full rounded-xl border p-3 text-sm"
            rows={5}
            placeholder="Napiši kratak opis..."
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Postavljam..." : "Postavi"}
          </Button>

          <button
            className="rounded-xl border px-4 py-2 text-sm hover:opacity-80"
            onClick={() => router.push("/udomljavanje")}
            type="button"
          >
            Nazad
          </button>
        </div>
      </div>
    </main>
  );
}
