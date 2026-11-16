"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Brand } from "@/components/shell";
import { LanguageSwitcher, useLanguage } from "@/components/language";
import { ApiError, api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/helpers";
import { PhoneInput } from "@/components/phone-input";

type InviteStatus = "SCHEDULED" | "DRAWN" | "NOT_DRAWN";
type Invite = {
  id?: number;
  secretSantaId?: number;
  name: string;
  drawAt: string;
  status: InviteStatus;
  myWord?: string | null;
  word?: string | null;
  secretWord?: string | null;
};

export default function SecretSantaInvite({ token }: { token: string }) {
  const { t, locale } = useLanguage();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secretWord, setSecretWord] = useState("");
  const [recipientName, setRecipientName] = useState("");

  useEffect(() => {
    api<Invite>(`/secret-santas/invites/${encodeURIComponent(token)}`)
      .then((loadedInvite) => {
        setInvite(loadedInvite);
        setSecretWord(loadedInvite.myWord || loadedInvite.word || loadedInvite.secretWord || "");
      })
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
      setSecretWord(result.myWord || result.word || result.secretWord || "");
      setJoined(true);
    } catch (err) {
      const message = errorMessage(err);
      if (/registration has closed/i.test(message)) {
        setRegistrationClosed(true);
        setError("");
      } else if (err instanceof ApiError && err.status === 409) {
        if (/already registered/i.test(message)) {
          setError("This phone number is already registered for this event.");
        } else {
          setRegistrationClosed(true);
          setError("");
        }
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function reveal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invite) return;
    const santaId = invite.secretSantaId ?? invite.id;
    if (!santaId) {
      setError("The draw details are unavailable for this invite.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api<{ id: string; name: string }>(
        `/secret-santas/${santaId}/reveal`,
        {
          method: "POST",
          body: JSON.stringify({ word: secretWord.trim() }),
        },
      );
      setRecipientName(result.name);
    } catch (err) {
      setError(errorMessage(err));
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
              {invite.status !== "SCHEDULED" || registrationClosed ? (
                <p className="muted" role="status">
                  {t("Registration is closed for this Secret Santa.")}
                </p>
              ) : null}
              {joined ? (
                <>
                  <p className="success" role="status">
                    {t("You’re in! You’ve joined this Secret Santa.")}
                  </p>
                  {(invite.myWord || invite.word || invite.secretWord) && (
                    <>
                      <div className="secret-word" role="status">
                        <span className="eyebrow">{t("YOUR SECRET WORD")}</span>
                        <strong>{invite.myWord || invite.word || invite.secretWord}</strong>
                      </div>
                      <p className="warning" role="note">
                        {t("Save this secret word. You’ll need it to check your match after the draw.")}
                      </p>
                    </>
                  )}
                </>
              ) : invite.status === "SCHEDULED" && !registrationClosed ? (
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
                    <PhoneInput
                      name="phoneNumber"
                      autoComplete="tel"
                      inputMode="tel"
                      minLength={15}
                      maxLength={15}
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
              ) : null}
              <div id="result">
              {invite.status === "DRAWN" && (
                recipientName ? (
                  <div className="recipient">
                    <span className="eyebrow">{t("YOU’RE GIVING A GIFT TO")}</span>
                    <strong>{recipientName}</strong>
                  </div>
                ) : (
                  <form onSubmit={reveal}>
                    <h2>{t("Reveal your match")}</h2>
                    <label>
                      {t("Your secret word")}
                      <input
                        value={secretWord}
                        onChange={(event) => setSecretWord(event.currentTarget.value)}
                        required
                      />
                    </label>
                    {error && <p className="error" role="alert">{t(error)}</p>}
                    <button className="button full" disabled={busy}>
                      {busy ? t("One moment…") : t("Reveal my match")}
                    </button>
                  </form>
                )
              )}
              </div>
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
