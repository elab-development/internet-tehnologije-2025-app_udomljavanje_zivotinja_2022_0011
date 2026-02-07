"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

const linkovi = [
  { href: "/", label: "Početna" },
  { href: "/o-nama", label: "O nama" },
  { href: "/udomljavanje", label: "Udomljavanje" },
  { href: "/podrzi-nas-cilj", label: "Podrži naš cilj" },
  { href: "/contact", label: "Kontakt" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // proveri token + rolu pri mount-u i pri promeni rute
  useEffect(() => {
    const token = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setRole(r);
  }, [pathname]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_logged_in");

    window.location.href = "/";
  }

  return (
    <header className="w-full border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logofinal.png"
            alt="ResQ collective logo"
            width={32}
            height={32}
          />
          <span className="text-lg font-semibold">ResQ collective Beograd</span>
        </Link>

        <ul className="flex gap-4">
          {linkovi.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`text-sm transition hover:opacity-80 ${
                  pathname === l.href ? "font-semibold underline" : ""
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          {isLoggedIn ? (
            <>
              {role === "UDOMITELJ" && (
                <Link href="/volonter">
                  <Button className="w-fit px-4 py-2">
                    Postani volonter
                  </Button>
                </Link>
              )}

              {role === "ADMIN" && (
                <Link href="/admin/volonteri">
                  <Button className="w-fit px-4 py-2">
                    Zahtevi za volontere
                  </Button>
                </Link>
              )}

              <Button onClick={logout} className="w-fit px-4 py-2">
                Odjava
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button className="w-fit px-4 py-2">Prijava</Button>
              </Link>
              <Link href="/register">
                <Button className="w-fit px-4 py-2">Registracija</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
