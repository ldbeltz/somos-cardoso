import Image from "next/image";

export function CardosoMark({ size = 72 }: { size?: number }) {
  return (
    <Image
      src="/cardoso-tree.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      unoptimized
      style={{ width: "100%", height: "auto" }}
    />
  );
}
