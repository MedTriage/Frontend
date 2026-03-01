"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import {
  NavbarRoot,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "./ui/resizable-navbar";

const NAV_LINKS = [
  { name: "Home", link: "/" },
  { name: "About", link: "/about" },
  { name: "Console", link: "/chat" },
];

export function Navbar({ alwaysVisible }: { alwaysVisible?: boolean } = {}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV_LINKS.map((item) => ({
    ...item,
    active: pathname === item.link,
  }));

  return (
    <NavbarRoot alwaysVisible={alwaysVisible}>
      {/* ── Desktop ── */}
      <NavBody>
        {/* Left — Logo */}
        <Link
          href="/"
          className="relative z-20 flex items-center gap-2.5 shrink-0 mr-4"
        >
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-mono text-sm tracking-wider uppercase text-foreground">
            MedTriage
          </span>
        </Link>

        {/* Center — Links */}
        <NavItems items={navItems} />

        {/* Right — Auth + Theme */}
        <div className="relative z-20 flex items-center gap-2 shrink-0">
          <NavbarButton href="/login" variant="secondary">
            <LogIn className="w-3 h-3" />
            Log in
          </NavbarButton>
          <NavbarButton href="/signup" variant="primary">
            <UserPlus className="w-3 h-3" />
            Sign up
          </NavbarButton>
          <ThemeToggle />
        </div>
      </NavBody>

      {/* ── Mobile ── */}
      <MobileNav>
        <MobileNavHeader>
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-mono text-sm tracking-wider uppercase text-foreground">
              MedTriage
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavToggle
              isOpen={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        >
          {navItems.map((item) => (
            <a
              key={item.link}
              href={item.link}
              onClick={() => setMobileOpen(false)}
              className={`font-mono text-sm w-full ${
                item.active ? "text-accent" : "text-muted hover:text-foreground"
              }`}
            >
              {item.name}
            </a>
          ))}
          <div className="flex w-full gap-2 pt-2">
            <NavbarButton
              href="/login"
              variant="secondary"
              className="flex-1 justify-center"
            >
              <LogIn className="w-3 h-3" />
              Log in
            </NavbarButton>
            <NavbarButton
              href="/signup"
              variant="primary"
              className="flex-1 justify-center"
            >
              <UserPlus className="w-3 h-3" />
              Sign up
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </NavbarRoot>
  );
}
