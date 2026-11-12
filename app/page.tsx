"use client";
import { useLanguage } from "@/components/language";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "@/components/session";
import { Shell, Loading } from "@/components/shell";
import { GiftArt, Icon } from "@/components/icons";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/helpers";
import type { Player, Santa } from "@/lib/types";
export default function Home() {
  const { t, locale } = useLanguage();
  const { user, setUser, error } = useSession();
  const [groups, setGroups] = useState<Santa[]>([]),
    [loadError, setLoadError] = useState(""),
    [notice, setNotice] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    if (user)
      api<Santa[]>("/secret-santas")
        .then(setGroups)
        .catch((err) => setLoadError(errorMessage(err)));
  }, [user]);
  async function savePhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const data = new FormData(event.currentTarget);
      setUser(
        await api<Player>("/auth/me", {
          method: "PUT",
          body: JSON.stringify({ phoneNumber: data.get("phone") }),
        }),
      );
      setNotice("Your WhatsApp number is saved.");
    } catch (err) {
      setNotice(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  if (!user) return <Loading error={t(error)} />;
  const upcoming = groups
    .filter((g) => g.isParticipant && g.status === "SCHEDULED")
    .sort((a, b) => Date.parse(a.drawAt) - Date.parse(b.drawAt));
  return (
    <Shell user={user}>
      <section className="page-heading">
        <span className="eyebrow">{t("OUR FAMILY, TOGETHER")}</span>
        <h1>
          {" "}
          {t("Good to have you here,")} <br />
          <em>{user.name.split(" ")[0]}.</em>
        </h1>
        <p className="muted">
          {" "}
          {t("A shared space for the little things that bring us closer.")}{" "}
        </p>
      </section>
      <section className="home-hero">
        <div>
          <span className="eyebrow light">
            {t("A NEW TRADITION STARTS HERE")}
          </span>
          <h2>
            {" "}
            {t("A little mystery.")} <br />
            {t("A whole lot of")} <em>{t("love.")}</em>
          </h2>
          <p>
            {" "}
            {t(
              "Our Secret Santa is here. Bring the family together, pick a draw date, and let the surprises begin.",
            )}{" "}
          </p>
          <Link className="button cream" href="/secret-santa">
            {" "}
            {t("Let’s make some Christmas magic")}{" "}
            <Icon name="arrow" size={19} />
          </Link>
          <span className="hero-footnote">
            {" "}
            {t("ONE FAMILY. COUNTLESS REASONS TO CELEBRATE.")}{" "}
          </span>
        </div>
        <GiftArt />
      </section>
      <div className="home-grid">
        <section className="panel">
          <span className="section-kicker">
            <Icon name="calendar" /> {t("ON THE FAMILY CALENDAR")}{" "}
          </span>
          <h2>{t("The next little surprise.")}</h2>
          {loadError ? (
            <p className="error" role="alert">
              {t(loadError)}
            </p>
          ) : upcoming.length ? (
            <>
              <p className="large-text">{upcoming[0].name}</p>
              <p className="muted">
                {t("Draws")} {formatDate(upcoming[0].drawAt, locale)}
              </p>
              <Link className="text-link" href="/secret-santa">
                {" "}
                {t("See your Secret Santas")} <Icon name="arrow" size={17} />
              </Link>
            </>
          ) : (
            <>
              <p className="muted">
                {" "}
                {t(
                  "No upcoming draws for you just yet. Start a new tradition or join the family’s next Secret Santa.",
                )}{" "}
              </p>
              <Link className="text-link" href="/secret-santa">
                {" "}
                {t("Find your next gathering")} <Icon name="arrow" size={17} />
              </Link>
            </>
          )}
        </section>
        <section className="panel profile-panel">
          <span className="section-kicker">
            <Icon name="people" /> {t("YOUR PLACE IN THE FAMILY")}{" "}
          </span>
          <h2>{t("Keep the surprises coming.")}</h2>
          <p className="muted">
            {" "}
            {t(
              "Your private match arrives on WhatsApp. Keep your number up to date.",
            )}{" "}
          </p>
          <form onSubmit={savePhone}>
            <label htmlFor="phone">{t("WhatsApp number")}</label>
            <div className="inline-form">
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                minLength={10}
                maxLength={24}
                inputMode="tel"
                defaultValue={user.phoneNumber || ""}
                placeholder="(11) 99999-9999"
              />
              <button className="button" disabled={saving}>
                {saving ? t("Saving…") : t("Save")}
              </button>
            </div>
            <small>
              {" "}
              {t(
                "Include your area code. The country code is optional (default: +55).",
              )}{" "}
            </small>
            {notice && (
              <p role="status" className="form-notice">
                {t(notice)}
              </p>
            )}
          </form>
        </section>
      </div>
      <div className="family-note">
        <Icon name="leaf" size={30} />
        <p>
          {" "}
          {t("The best part of every plan?")} <br />
          <em>{t("The people we share it with.")}</em>
        </p>
      </div>
    </Shell>
  );
}
