"use client";
import { useLanguage, LanguageSwitcher } from "@/components/language";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Player } from "@/lib/types";
import { initials } from "@/lib/helpers";
import { api, errorMessage } from "@/lib/api";
import { Icon } from "./icons";
import { CardosoMark } from "./cardoso-mark";
export function Brand() {
  const { t } = useLanguage();
  return (
    <Link className="brand" href="/" aria-label={t("Somos Cardoso home")}>
      <span className="brand-symbol">
        <CardosoMark size={72} />
      </span>
      <span>
        família <strong>cardoso</strong>
        <small>{t("A PLACE FOR OUR FAMILY")}</small>
      </span>
    </Link>
  );
}
export function Shell({
  user,
  children,
}: {
  user: Player;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const path = usePathname(),
    router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await api("/auth/logout", { method: "POST" });
      router.replace("/auth");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }
  return (
    <>
      <a className="skip-link" href="#main">
        {" "}
        {t("Skip to content")}{" "}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav aria-label={t("Main navigation")}>
            <Link href="/" aria-current={path === "/" ? "page" : undefined}>
              {" "}
              {t("Home")}{" "}
            </Link>
            <Link
              href="/secret-santa"
              aria-current={
                path.startsWith("/secret-santa") ? "page" : undefined
              }
            >
              {" "}
              {t("Secret Santa")}{" "}
            </Link>
          </nav>
          <LanguageSwitcher />
          <div className="account">
            <span className="avatar">{initials(user.name)}</span>
            <span className="account-name">{user.name.split(" ")[0]}</span>
            <button
              className="icon-button"
              onClick={logout}
              disabled={busy}
              aria-label={t("Sign out")}
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </header>
      {error && (
        <p className="error container" role="alert">
          {t(error)}
        </p>
      )}
      <main className="container" id="main">
        {children}
      </main>
      <footer className="site-footer">
        <Brand />
        <span>{t("Different stories. One family.")}</span>
        <span>
          {" "}
          {t("Made for the moments that matter")}{" "}
          <span aria-hidden="true">♡</span>
        </span>
        <span>{t("Created with love by Humberto Lima")}</span>
      </footer>
    </>
  );
}
export function Loading({ error }: { error?: string }) {
  const { t } = useLanguage();
  return (
    <main className="loading-page">
      <LanguageSwitcher />
      <Brand />
      {error ? (
        <>
          <p className="error" role="alert">
            {t(error)}
          </p>
          <button className="button" onClick={() => window.location.reload()}>
            {" "}
            {t("Try again")}{" "}
          </button>
        </>
      ) : (
        <p role="status">{t("Opening our family space…")}</p>
      )}
    </main>
  );
}
