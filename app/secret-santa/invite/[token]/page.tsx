import { Suspense } from "react";
import SecretSantaInvite from "./secret-santa-invite";

function InviteLoading() {
  return (
    <main className="invite-page">
      <section className="invite-card">
        <p className="muted" role="status">
          Loading invite…
        </p>
      </section>
    </main>
  );
}

async function InvitePageContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <SecretSantaInvite token={token} />;
}

export default function SecretSantaInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={<InviteLoading />}>
      <InvitePageContent params={params} />
    </Suspense>
  );
}
