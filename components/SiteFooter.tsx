import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer>
      <div className="footer-brand">A<span>-</span>LINX</div>
      <ul className="footer-links">
        <li><Link href="/panelized">Panelized</Link></li>
        <li><Link href="/volumetric">Volumetric</Link></li>
        <li><a href="/#projects">Projects</a></li>
        <li><a href="/#team">Team</a></li>
      </ul>
      <div className="footer-copy">© 2025 A-LINX Building Technologies</div>
    </footer>
  );
}
