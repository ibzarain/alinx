import type { ReactNode } from "react";
import Link from "next/link";

const SOLUTION_LINKS = [
  { href: "/panelized", label: "Panelized" },
  { href: "/volumetric", label: "Volumetric" },
] as const;

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
] as const;

const BROCHURES = [
  {
    title: "Corporate Overview",
    pdf: "/assets/brochures/A-Linx-Overview.pdf",
  },
  {
    title: "Panelized Construction",
    pdf: "/assets/brochures/A-Linx-Panelized-Brochure.pdf",
  },
] as const;

const OFFICES = [
  {
    label: "Head Office",
    lines: [
      "5175 Concession Road 8",
      "Oldcastle (Windsor), ON",
      "N0R 1L0",
    ],
  },
  {
    label: "Cambridge",
    lines: ["375 Boxwood Drive", "Cambridge, ON", "N3E 0A7"],
  },
  {
    label: "Mississauga",
    lines: ["5900 Explorer Drive", "Mississauga, ON", "L4W 5L2"],
  },
] as const;

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/alinx_buildtech/",
    label: "Instagram",
    icon: "/images/icons/Instagram_Glyph_Black.svg",
  },
  {
    href: "https://www.linkedin.com/company/a-linxbuildtech/",
    label: "LinkedIn",
    icon: "/images/icons/InBug-Black.png",
  },
] as const;

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="footer-col">
      <h3 className="footer-col-title">{title}</h3>
      {children}
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-inner">
        <div className="footer-main">
          <div className="footer-brand-col">
            <Link href="/" className="footer-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/alinx-logo.png"
                alt="A-LINX Building Technologies"
                className="footer-logo-img"
                width={120}
                height={40}
                loading="lazy"
                decoding="async"
              />
            </Link>
            <div className="footer-socials">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`A-Linx on ${social.label}`}
                  className="footer-social-link"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={social.icon} alt="" loading="lazy" decoding="async" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Solutions">
            <ul className="footer-links">
              {SOLUTION_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Company">
            <ul className="footer-links">
              {COMPANY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Resources">
            <ul className="footer-links">
              {BROCHURES.map((b) => (
                <li key={b.title}>
                  <a href={b.pdf} target="_blank" rel="noopener noreferrer">
                    {b.title}
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Contact">
            <ul className="footer-links">
              <li>
                <a href="tel:2267247219">226-724-7219</a>
              </li>
              <li>
                <a href="mailto:connect@alinx.build">connect@alinx.build</a>
              </li>
            </ul>
          </FooterColumn>
        </div>

        <div className="footer-offices-row">
          {OFFICES.map((office) => (
            <div key={office.label} className="footer-office">
              <span className="footer-office-label">{office.label}</span>
              <address>
                {office.lines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < office.lines.length - 1 && <br />}
                  </span>
                ))}
              </address>
            </div>
          ))}
        </div>

        <div className="footer-sustainability">
          <h4 className="footer-sustainability-title">
            Our Commitment to Sustainability
          </h4>
          <p className="footer-sustainability-text">
            Environmentally responsible and resource-efficient construction
            practices are core principles of our business, guiding everything
            we do from planning to design, construction, operation,
            maintenance, fabrication and waste management. Sustainable
            construction is not only ethical but practical. Reducing our
            overall environmental impacts offers immediate and long-term
            advantages to our clients and the community.
          </p>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © <span className="a-linx-word">A-Linx</span> Building Technologies
            2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
