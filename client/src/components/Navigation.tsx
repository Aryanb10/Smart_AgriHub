import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sprout, TestTube, Bug, History, LogOut, Menu, X, LayoutDashboard, Droplets } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/crop-predict", label: "Crop Advisor", icon: Sprout },
    { href: "/fertilizer", label: "Fertilizer", icon: TestTube },
    { href: "/disease", label: "Disease Detect", icon: Bug },
    { href: "/irrigation", label: "Irrigation", icon: Droplets },
    { href: "/history", label: "History", icon: History },
  ];

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Sprout size={20} />
              </div>
              <span className="font-display font-bold text-xl text-foreground">AgriAI</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {links.map((link) => {
                const isActive = location === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <img 
                src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full bg-muted border border-border"
              />
            </div>
            <button
              onClick={() => logout()}
              className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {links.map((link) => {
              const isActive = location === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center px-3 mb-3">
                <img 
                  src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full bg-muted mr-3"
                />
                <div>
                  <div className="text-base font-medium text-foreground">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
