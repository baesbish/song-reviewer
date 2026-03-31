import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-5">
          <Link to="/" className="font-display text-xs tracking-ultra uppercase text-foreground hover:opacity-60 transition-opacity">
            Vinyl Critique
          </Link>
          {!isHome && (
            <Link to="/" className="font-body text-[10px] tracking-mega uppercase text-muted-foreground hover:text-foreground transition-colors">
              Archive
            </Link>
          )}
        </div>
        <div className="h-px bg-foreground/10" />
      </header>
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}