import Image from "next/image";

/** The Colouresh icon + wordmark lockup, from public/images/logo/wordmark.svg. */
export function LogoWordmark({
  className = "w-[130px]",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/logo/wordmark.svg"
      alt="Colouresh"
      width={1200}
      height={240}
      className={`h-auto ${className}`}
      priority={priority}
    />
  );
}

export default LogoWordmark;
