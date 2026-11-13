"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Brand } from "@/components/shell";
import { LanguageSwitcher, useLanguage } from "@/components/language";
import { ApiError, api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/helpers";

type Invite = { name: string; drawAt: string };

export default function SecretSantaInvite({ token }: { token: string }) {
  const { t, locale } = useLanguage();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Invite>(`/secret-santas/invites/${encodeURIComponent(token)}`)
      .then(setInvite)
      .catch((err) => setError(errorMessage(err)));
  }, [token]);

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      const result = await api<Invite>(
        `/secret-santas/invites/${encodeURIComponent(token)}/join`,
        {
          method: "POST",
          body: JSON.stringify({
            name: String(values.get("name")).trim(),
            phoneNumber: String(values.get("phoneNumber")).trim(),
          }),
        },
      );
      setInvite(result);
      setJoined(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "This phone number is already registered for this event."
          : errorMessage(err),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="site-header invite-header">
        <div className="header-inner">
          <Brand />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="invite-page" id="main">
        <section className="invite-card">
          <span className="eyebrow">{t("A LITTLE CHRISTMAS MAGIC")}</span>
          <span className="invite-icon" aria-hidden="true">
            ✦
          </span>
          {invite ? (
            <>
              <h1>{invite.name}</h1>
              <p className="muted">
                {t("The draw is scheduled for {date}.", {
                  date: formatDate(invite.drawAt, locale),
                })}
              </p>
              {joined ? (
                <p className="success" role="status">
                  {t("You’re in! You’ve joined this Secret Santa.")}
                </p>
              ) : (
                <form onSubmit={join}>
                  <h2>{t("Join the Secret Santa")}</h2>
                  <label>
                    {t("Your name")}
                    <input
                      name="name"
                      autoComplete="name"
                      maxLength={120}
                      required
                    />
                  </label>
                  <label>
                    {t("WhatsApp phone number")}
                    <input
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+55 11 99999-9999"
                      required
                    />
                    <small>
                      {t("Include your country code so we can send your match.")}
                    </small>
                  </label>
                  {error && (
                    <p className="error" role="alert">
                      {t(error)}
                    </p>
                  )}
                  <button className="button full" disabled={busy}>
                    {busy ? t("Joining…") : t("Join the draw")}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <h1>{t("You’re invited.")}</h1>
              {error ? (
                <p className="error" role="alert">
                  {t(error)}
                </p>
              ) : (
                <p className="muted" role="status">
                  {t("Loading invite…")}
                </p>
              )}
            </>
          )}
        </section>
      </main>
      <footer className="site-footer invite-footer">
        <Brand />
        <span>{t("Different stories. One family.")}</span>
        <span>{t("Created with love by Humberto Lima")}</span>
      </footer>
    </>
  );
}
