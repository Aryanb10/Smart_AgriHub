import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CropPredict from "@/pages/CropPredict";
import Fertilizer from "@/pages/Fertilizer";
import Disease from "@/pages/Disease";
import Irrigation from "@/pages/Irrigation";
import History from "@/pages/History";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {isAuthenticated && <Navigation />}
      <main>
        <Switch>
          <Route path="/" component={Home} />
          {isAuthenticated ? (
            <>
              <Route path="/crop-predict" component={CropPredict} />
              <Route path="/fertilizer" component={Fertilizer} />
              <Route path="/disease" component={Disease} />
              <Route path="/irrigation" component={Irrigation} />
              <Route path="/history" component={History} />
            </>
          ) : (
             /* Redirect non-auth users trying to access protected routes to home/login */
             <Route component={Home} />
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
