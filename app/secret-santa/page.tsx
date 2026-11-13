"use client";
import { useLanguage } from "@/components/language";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { useSession } from "@/components/session";
import { Shell, Loading } from "@/components/shell";
import { Icon } from "@/components/icons";
import { DrawDatePicker } from "@/components/draw-date-picker";
import { api, errorMessage, ApiError } from "@/lib/api";
import { createPayload, formatDate, initials } from "@/lib/helpers";
import type { Player, Santa, SantaDetail } from "@/lib/types";
export default function SecretSantaPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const { user, error: sessionError } = useSession();
  const [groups, setGroups] = useState<Santa[]>([]),
    [players, setPlayers] = useState<Player[]>([]),
    [selected, setSelected] = useState<number[]>([]),
    [detail, setDetail] = useState<SantaDetail | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [copied, setCopied] = useState(false);
  const [now, setNow] = useState(0);
  const [drawAt, setDrawAt] = useState("");
  const detailId = detail?.id;
  const inviteUrl = detail?.inviteToken
    ? `/secret-santa/invite/${encodeURIComponent(detail.inviteToken)}`
    : "";
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const inviteLink = inviteUrl && origin ? new URL(inviteUrl, origin).toString() : inviteUrl;
  async function reload() {
    const [s, p] = await Promise.all([
      api<Santa[]>("/secret-santas"),
      api<Player[]>("/players"),
    ]);
    setGroups(s);
    setPlayers(p);
  }
  useEffect(() => {
    if (!user) return;
    Promise.all([api<Santa[]>("/secret-santas"), api<Player[]>("/players")])
      .then(([s, p]) => {
        setGroups(s);
        setPlayers(p);
        setNow(Date.now());
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setNow(Date.now());
      poll();
    }, 30000);
    function poll() {
      api<Santa[]>("/secret-santas")
        .then(setGroups)
        .catch(() => {});
      if (detailId)
        api<SantaDetail>(`/secret-santas/${detailId}`)
          .then(setDetail)
          .catch(() => {});
    }
    return () => clearInterval(interval);
  }, [user, detailId]);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    setNotice("");
    const form = event.currentTarget;
    try {
      const values = new FormData(form);
      const payload = createPayload(
        String(values.get("name")),
        drawAt,
        selected,
        user.id,
      );
      const created = await api<SantaDetail>("/secret-santas", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const authenticatedDetail = await api<SantaDetail>(
        `/secret-santas/${created.id}`,
      );
      await reload();
      setDetail(authenticatedDetail);
      form.reset();
      setDrawAt("");
      setSelected([]);
      setNotice(
        "Your Secret Santa is ready. Share the invite link so more people can join.",
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function open(group: Santa) {
    setBusy(true);
    setError("");
    try {
      if (!group.isParticipant) {
        await api(`/secret-santas/${group.id}/join`, { method: "POST" });
        await reload();
      }
      setDetail(await api<SantaDetail>(`/secret-santas/${group.id}`));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401)
        router.replace("/auth");
      else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function leave() {
    if (!detail) return;
    setBusy(true);
    setError("");
    try {
      await api(`/secret-santas/${detail.id}/players/me`, { method: "DELETE" });
      setDetail(null);
      await reload();
      setNotice("You have left this Secret Santa.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Loading error={sessionError} />;
  return (
    <Shell user={user}>
      <section className="page-heading santa-heading">
        <div>
          <span className="eyebrow">{t("A LITTLE CHRISTMAS MAGIC")}</span>
          <h1>
            {" "}
            {t("It’s a secret.")} <br />
            <em>{t("Until it isn’t.")}</em>
          </h1>
          <p className="muted">
            {" "}
            {t("One name. One thoughtful gift. A surprise for everyone.")}{" "}
          </p>
        </div>
        <div className="heading-seal" aria-hidden="true">
          <Icon name="gift" size={44} />
          <span>{t("GIVEN WITH LOVE")}</span>
        </div>
      </section>
      <div className="steps-strip">
        <span>
          <b>01</b> {t("Bring your people")}{" "}
        </span>
        <span>
          <b>02</b> {t("Set the draw date")}{" "}
        </span>
        <span>
          <b>03</b> {t("Get your match on WhatsApp")}{" "}
        </span>
      </div>
      {error && (
        <p className="error" role="alert">
          {t(error)}
        </p>
      )}
      {notice && (
        <p className="success" role="status">
          {t(notice)}
        </p>
      )}
      {!user.phoneNumber && (
        <p className="warning">
          {" "}
          {t("Add your WhatsApp number on the")}{" "}
          <Link href="/">{t("home page")}</Link>{" "}
          {t("before creating or joining a draw.")}{" "}
        </p>
      )}
      <div className="santa-grid">
        <section>
          <div className="section-title">
            <h2>{t("The family’s Secret Santas")}</h2>
            <span className="count">{groups.length}</span>
          </div>
          {loading ? (
            <p role="status" className="panel">
              {" "}
              {t("Gathering the family’s plans…")}{" "}
            </p>
          ) : groups.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="gift" size={36} />
              </span>
              <h3>{t("Every tradition starts with someone.")}</h3>
              <p className="muted">
                {" "}
                {t(
                  "Create the first Secret Santa and give the family something to look forward to.",
                )}{" "}
              </p>
            </div>
          ) : (
            <div className="group-list">
              {groups.map((group) => (
                <article
                  className={`group-card ${detail?.id === group.id ? "selected" : ""}`}
                  key={group.id}
                >
                  <div className="group-card-top">
                    <span
                      className={`badge ${group.status === "DRAWN" ? "drawn" : group.status === "NOT_DRAWN" ? "not-drawn" : ""}`}
                    >
                      {group.status === "DRAWN"
                        ? t("Draw complete")
                        : group.status === "NOT_DRAWN"
                          ? t("Not drawn")
                          : t("Upcoming draw")}
                    </span>
                    {group.isParticipant && (
                      <span className="member-label">{t("You’re in")}</span>
                    )}
                  </div>
                  <h3>{group.name}</h3>
                  <p>
                    <Icon name="calendar" size={16} />
                    {formatDate(group.drawAt, locale)}
                  </p>
                  <div className="group-card-bottom">
                    <span>
                      <Icon name="people" size={17} />
                      {group.playerCount} {t("players")}{" "}
                    </span>
                    <button
                      className="text-link"
                      disabled={
                        busy ||
                        (!group.isParticipant &&
                          (group.status === "DRAWN" ||
                            Date.parse(group.drawAt) <= now ||
                            !user.phoneNumber))
                      }
                      onClick={() => open(group)}
                    >
                      {group.isParticipant
                        ? t("Open Secret Santa")
                        : t("Join the family")}
                      <Icon name="arrow" size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {detail && (
            <section className="detail-panel" aria-labelledby="detail-title">
              <div className="section-title">
                <span className="eyebrow">{t("YOUR SECRET SANTA")}</span>
                <button
                  type="button"
                  className="icon-button close-button"
                  aria-label={t("Close Secret Santa details")}
                  onClick={() => setDetail(null)}
                >
                  ×
                </button>
              </div>
              <h2 id="detail-title">{detail.name}</h2>
              <p className="muted">
                {detail.status === "DRAWN"
                  ? t("The names have been drawn.")
                  : detail.status === "NOT_DRAWN"
                    ? t("This draw was not completed. No matches or notifications were sent.")
                    : t("The draw is set for {date}.", {
                        date: formatDate(detail.drawAt, locale),
                      })}
              </p>
              {detail.inviteToken && (
                <div className="invite-share">
                  <label htmlFor="invite-url">{t("Invite more people")}</label>
                  <div className="invite-url-row">
                    <input
                      id="invite-url"
                      readOnly
                      value={inviteLink}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <button
                      type="button"
                      className="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            new URL(inviteUrl, window.location.origin).toString(),
                          );
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch {
                          setError("Could not copy the invite link. Select and copy it instead.");
                        }
                      }}
                    >
                      {copied ? t("Copied") : t("Copy link")}
                    </button>
                  </div>
                </div>
              )}
              {detail.status === "DRAWN" && detail.myRecipient ? (
                <div className="recipient">
                  <span className="eyebrow">
                    {t("YOU’RE GIVING A GIFT TO")}
                  </span>
                  <strong>{detail.myRecipient.name}</strong>
                  <small>
                    {detail.notificationStatus === "SENT"
                      ? t(
                          "Your WhatsApp notification was accepted by the messaging provider.",
                        )
                      : detail.notificationStatus === "SENDING"
                        ? t("Your WhatsApp notification is being sent.")
                        : t(
                            "Your WhatsApp notification is pending. Your match is safely saved here.",
                          )}
                  </small>
                </div>
              ) : detail.status === "NOT_DRAWN" ? (
                <div className="sealed-match">
                  <Icon name="gift" size={28} />
                  <p>{t("This draw was not completed. No matches or notifications were sent.")}</p>
                </div>
              ) : (
                <div className="sealed-match">
                  <Icon name="gift" size={28} />
                  <p>{t("Your match stays wrapped until the draw.")}</p>
                </div>
              )}
              <h3 className="small-heading">
                {t("Everyone around the circle")}
              </h3>
              <div className="player-chips">
                {detail.players.map((p) => (
                  <span key={p.id}>
                    <b>{initials(p.name)}</b>
                    {p.name}
                    {p.id === user.id ? t(" (you)") : ""}
                  </span>
                ))}
              </div>
              {detail.creatorId !== user.id &&
                detail.status === "SCHEDULED" &&
                Date.parse(detail.drawAt) > now && (
                  <button
                    className="text-link danger"
                    disabled={busy || detail.playerCount <= 2}
                    onClick={leave}
                  >
                    {" "}
                    {t("Leave this Secret Santa")}{" "}
                  </button>
                )}
            </section>
          )}
        </section>
        <aside className="create-panel">
          <span className="section-kicker">
            <Icon name="star" /> {t("START SOMETHING LOVELY")}{" "}
          </span>
          <h2>{t("A surprise in the making.")}</h2>
          <p className="muted">
            {" "}
            {t("You bring the people. We’ll take care of the names.")}{" "}
          </p>
          <form onSubmit={create}>
            <label>
              {" "}
              {t("Give it a name")}{" "}
              <input
                name="name"
                required
                maxLength={120}
                placeholder={t("Christmas with the Cardosos")}
              />
            </label>
            <div className="draw-date-field">
              {" "}
              <span className="field-label">{t("When should we draw?")}</span>
              <DrawDatePicker
                locale={locale}
                value={drawAt}
                onChange={setDrawAt}
                label={t("Date and time (dd/mm/yyyy HH:mm)")}
              />
              <small>
                {t("In your local time. The draw happens automatically.")}
              </small>
            </div>
            <fieldset>
              <legend>{t("Who’s in the circle?")}</legend>
              <p className="muted field-help">
                {" "}
                {t(
                  "You’re already included. Invite others now or share a link after creating.",
                )}{" "}
              </p>
              <div className="participant-picker">
                <div className="participant self">
                  <span className="avatar small">{initials(user.name)}</span>
                  <span>
                    {user.name}
                    <small>{t("You · always included")}</small>
                  </span>
                  <span aria-hidden="true">✓</span>
                </div>
                {players
                  .filter((p) => p.id !== user.id)
                  .map((player) => (
                    <label
                      className={`participant ${!player.phoneNumber ? "unavailable" : ""}`}
                      key={player.id}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(player.id)}
                        disabled={!player.phoneNumber}
                        onChange={(event) =>
                          setSelected((prev) =>
                            event.target.checked
                              ? [...prev, player.id]
                              : prev.filter((id) => id !== player.id),
                          )
                        }
                      />
                      <span className="avatar small">
                        {initials(player.name)}
                      </span>
                      <span>
                        {player.name}
                        <small>
                          {player.phoneNumber
                            ? t("Ready for a surprise")
                            : t("Needs a WhatsApp number")}
                        </small>
                      </span>
                    </label>
                  ))}
              </div>
              {players.filter((p) => p.id !== user.id && p.phoneNumber)
                .length === 0 && (
                <p className="field-help muted">
                  {" "}
                  {t(
                    "Ask another family member to create an account and add their WhatsApp number.",
                  )}{" "}
                </p>
              )}
            </fieldset>
            <button
              className="button full"
              disabled={busy || !user.phoneNumber}
            >
              {busy ? t("One moment…") : t("Create Secret Santa")}
              <Icon name="arrow" size={18} />
            </button>
          </form>
          <div className="circle-note">
            <Icon name="gift" size={21} />
            <p>
              {" "}
              {t("Everyone gives. Everyone receives.")} <br />{" "}
              {t("Each match is shared privately.")}{" "}
            </p>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
