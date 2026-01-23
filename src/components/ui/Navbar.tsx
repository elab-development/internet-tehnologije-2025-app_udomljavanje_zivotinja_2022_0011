"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

    return (
        <header className="w-full border-b bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

                {/* LOGO + NAZIV */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logofinal.png"
                        alt="ResQ collective logo"
                        width={32}
                        height={32}
                    />
                    <span className="text-lg font-semibold">
                        ResQ collective Beograd
                    </span>
                </Link>

                <ul className="flex gap-4">
                    {linkovi.map((l) => {
                        const active = pathname === l.href;
                        return (
                            <li key={l.href}>
                                <Link
                                    href={l.href}
                                    className={`text-sm transition hover:opacity-80 ${active ? "font-semibold underline" : ""
                                        }`}
                                >
                                    {l.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex gap-2">
                    <Link href="/login">
                        <Button className="w-fit px-4 py-2">
                            Prijava
                        </Button>
                    </Link>

                    <Link href="/register">
                        <Button className="w-fit px-4 py-2">
                            Registracija
                        </Button>
                    </Link>
                </div>

            </nav>
        </header>
    );
}
