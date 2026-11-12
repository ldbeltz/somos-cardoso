"use client";
import { useLanguage, LanguageSwitcher } from "@/components/language";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { Brand } from "@/components/shell";
import { GiftArt, Icon } from "@/components/icons";
export default function AuthPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [register, setRegister] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [google, setGoogle] = useState(false);
  useEffect(() => {
    api<{ google: boolean }>("/auth/providers")
      .then((p) => setGoogle(p.google))
      .catch(() => {});
    api("/auth/me")
      .then(() => router.replace("/"))
      .catch(() => {});
    const params = new URLSearchParams(window.location.search);
    if (params.has("error"))
      queueMicrotask(() =>
        setError(
          "Google sign-in could not be completed. Try another sign-in method.",
        ),
      );
  }, [router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(
          register
            ? {
                name: data.get("name"),
                email: data.get("email"),
                password: data.get("password"),
                phoneNumber: data.get("phoneNumber"),
              }
            : { email: data.get("email"), password: data.get("password") },
        ),
      });
      router.replace("/");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-copy">
          <span className="eyebrow light">{t("OUR PEOPLE. OUR PLACE.")}</span>
          <h1>
            {" "}
            {t("A little closer,")} <br /> {t("wherever")}{" "}
            <em>{t("we are.")}</em>
          </h1>
          <p>
            {" "}
            {t(
              "Some things are better together. Welcome to our little corner of the world.",
            )}{" "}
          </p>
          <GiftArt />
          <span className="story-note">
            <Icon name="star" size={16} />{" "}
            {t("New traditions. The same family.")}{" "}
          </span>
        </div>
        <p className="auth-bottom">
          {t("THE CARDOSO FAMILY · ALWAYS CONNECTED")}
        </p>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-language">
            <LanguageSwitcher />
          </div>
          <span className="eyebrow">{t("COME ON IN")}</span>
          <h2>{register ? t("Join the family space.") : t("Welcome back.")}</h2>
          <p className="muted">
            {register
              ? t("A place for the memories we’ll make together.")
              : t("Your people, your plans, and a little Christmas magic.")}
          </p>
          <div className="auth-tabs" aria-label={t("Authentication options")}>
            <button
              type="button"
              aria-pressed={!register}
              onClick={() => {
                setRegister(false);
                setError("");
              }}
            >
              {" "}
              {t("Sign in")}{" "}
            </button>
            <button
              type="button"
              aria-pressed={register}
              onClick={() => {
                setRegister(true);
                setError("");
              }}
            >
              {" "}
              {t("Create account")}{" "}
            </button>
          </div>
          <form onSubmit={submit} key={register ? "register" : "login"}>
            {register && (
              <label>
                {" "}
                {t("Your name")}{" "}
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder={t("How the family knows you")}
                />
              </label>
            )}
            <label>
              {" "}
              {t("Email address")}{" "}
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder={t("you@example.com")}
              />
            </label>
            <label>
              {" "}
              {t("Password")}{" "}
              <input
                name="password"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                required
                minLength={register ? 10 : 1}
                maxLength={72}
                placeholder={
                  register ? t("At least 10 characters") : t("Your password")
                }
              />
            </label>
            {register && (
              <label>
                {" "}
                {t("WhatsApp number")}{" "}
                <input
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  minLength={10}
                  maxLength={24}
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                />
                <small>
                  {" "}
                  {t(
                    "Include your area code. If you omit the country code, we’ll use +55.",
                  )}{" "}
                </small>
              </label>
            )}
            {error && (
              <p className="error" role="alert">
                {t(error)}
              </p>
            )}
            <button className="button full" disabled={busy}>
              {busy
                ? t("One moment…")
                : register
                  ? t("Create my account")
                  : t("Sign in to our space")}
              <Icon name="arrow" size={18} />
            </button>
          </form>
          <div className="divider">
            <span>{t("or keep it simple")}</span>
          </div>
          {google ? (
            <a
              className="button secondary full"
              href="/oauth2/authorization/google"
            >
              <span className="google-mark" aria-hidden="true">
                G
              </span>{" "}
              {t("Continue with Google")}{" "}
            </a>
          ) : (
            <p className="provider-note">
              {" "}
              {t("Google sign-in will be available once it’s configured.")}{" "}
            </p>
          )}
          <p className="privacy-note">
            <Icon name="leaf" size={15} />{" "}
            {t("A private space for our family. A place to feel at home.")}{" "}
          </p>
        </div>
      </section>
    </main>
  );
}
