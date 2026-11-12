export function Icon({
  name,
  size = 22,
}: {
  name: "gift" | "arrow" | "star" | "people" | "calendar" | "leaf" | "logout";
  size?: number;
}) {
  const paths = {
    gift: (
      <>
        <path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12" />
        <path d="M12 9H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z" />
      </>
    ),
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    star: (
      <path d="m12 2 2.8 6.6L22 9l-5.5 4.7 1.8 7L12 17l-6.3 3.7 1.8-7L2 9l7.2-.4Z" />
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 2v6m10-6v6M3 11h18m-13 5h2m4 0h2" />
      </>
    ),
    leaf: <path d="M20 3C8 1 2 8 5 15s16 6 15-12ZM4 21 16 8" />,
    logout: (
      <>
        <path d="M9 4H4v16h5m6-13 5 5-5 5m-6-5h11" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function GiftArt() {
  return (
    <div className="gift-art" aria-hidden="true">
      <span className="art-star s1">✧</span>
      <span className="art-star s2">✦</span>
      <span className="art-star s3">✧</span>
      <span className="art-circle" />
      <div className="gift-box">
        <span className="gift-ribbon" />
        <span className="gift-lid" />
        <span className="bow left" />
        <span className="bow right" />
      </div>
      <span className="art-sprig">❋</span>
    </div>
  );
}
