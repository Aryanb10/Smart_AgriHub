import { useAuth } from "@/hooks/use-auth";
import Dashboard from "./Dashboard";
import { Loader2, Sprout } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sprout size={20} />
            </div>
            <span className="font-display font-bold text-xl text-foreground">AgriAI</span>
          </div>
          <a href="/api/login" className="text-sm font-medium hover:text-primary transition-colors">
            Login
          </a>
        </div>
      </nav>

      <div className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground leading-tight">
              Smarter Farming with <span className="text-primary">Artificial Intelligence</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Optimize your harvest with precision. Get instant AI recommendations for crops, fertilizers, and disease treatments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/api/login" className="btn-primary text-lg h-14 px-8">
                Get Started
              </a>
              <button className="px-8 py-3 rounded-xl font-medium text-foreground hover:bg-muted transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            {/* Abstract visual representation instead of generic stock photo */}
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl" />
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-accent/30 rounded-full blur-3xl animate-pulse delay-700" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                 <Sprout size={120} className="text-primary drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
