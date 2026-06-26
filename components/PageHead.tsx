import Link from "next/link";

export default function PageHead({
  title,
  theme = "light",
}: {
  title: string;
  theme?: "light" | "dark";
}) {
  return (
    <header className={`page-head reveal${theme === "dark" ? " page-head--dark" : ""}`}>
      <Link href="/" className="page-head-back">
        <svg viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M9 2L4 7L9 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Home
      </Link>
      <h1 className="page-head-title">{title}</h1>
    </header>
  );
}
