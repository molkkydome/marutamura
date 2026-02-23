import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Molkky from "./pages/Molkky";
import BoardGames from "./pages/BoardGames";
import Activities from "./pages/Activities";
import Food from "./pages/Food";
import BBQ from "./pages/BBQ";
import Marta from "./pages/Marta";
import Tournament from "./pages/Tournament";
import History from "./pages/History";
import More from "./pages/More";
import FAQ from "./pages/FAQ";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/molkky"} component={Molkky} />
      <Route path={"/boardgames"} component={BoardGames} />
      <Route path={"/activities"} component={Activities} />
      <Route path={"/food"} component={Food} />
      <Route path={"/bbq"} component={BBQ} />
      <Route path={"/marta"} component={Marta} />
      <Route path={"/tournament"} component={Tournament} />
      <Route path={"/history"} component={History} />
      <Route path={"/more"} component={More} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
