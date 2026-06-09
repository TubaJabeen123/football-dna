"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({ href, title, children }: { href:string; title:string; children:React.ReactNode }) {
  const path = usePathname();
  return (
    <Link href={href} title={title} className={`nav-icon${path===href?" active":""}`}>
      {children}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">FD</div>

      <NavItem href="/" title="Player Compare">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </NavItem>

      <NavItem href="/worldcup" title="World Cup Mode">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
      </NavItem>

      <NavItem href="/leaderboard" title="Top Players">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="18" y="3" width="4" height="18" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/>
          <rect x="2" y="13" width="4" height="8" rx="1"/>
        </svg>
      </NavItem>

      <div style={{flex:1}} className="spacer"/>
      <div style={{width:"28px",height:"1px",background:"var(--border)",margin:"4px 0"}} className="divider"/>

      <NavItem href="/about" title="About">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
        </svg>
      </NavItem>
    </aside>
  );
}