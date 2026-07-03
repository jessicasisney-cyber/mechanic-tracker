import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#e2e8f0] bg-[#0f172a]">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-white">
            <WrenchIcon className="text-[#60a5fa]" />
            <span className="text-lg font-bold tracking-tight">
              RS Autoworks
            </span>
          </Link>
          <nav className="ml-4 hidden gap-6 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#cbd5e1] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1" />
          <a
            href="tel:+12818016752"
            className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-bold text-white"
          >
            (281) 801-6752
          </a>
        </div>
        <nav className="flex gap-5 border-t border-white/10 px-6 py-2 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#cbd5e1]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-10 text-sm text-[#64748b]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-[#0f172a]">
              <WrenchIcon className="h-4 w-4 text-[#2563eb]" />
              RS Autoworks
            </div>
            <p className="mt-2 max-w-xs">
              Splendora, Texas — by appointment only.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <a href="tel:+12818016752" className="hover:text-[#2563eb]">
              (281) 801-6752
            </a>
            <a
              href="mailto:jessicasisney@gmail.com"
              className="hover:text-[#2563eb]"
            >
              jessicasisney@gmail.com
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <Link href="/privacy" className="hover:text-[#2563eb]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#2563eb]">
              Terms
            </Link>
            <Link href="/login" className="hover:text-[#2563eb]">
              Staff Login
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-5xl text-xs text-[#94a3b8]">
          © {new Date().getFullYear()} RS Autoworks. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
