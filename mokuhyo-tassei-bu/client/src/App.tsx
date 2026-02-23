import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppLayout } from "./components/AppLayout";
import Home from "./pages/Home";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import GoalForm from "./pages/GoalForm";
import Community from "./pages/Community";
import Diary from "./pages/Diary";
import DiaryForm from "./pages/DiaryForm";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/goals" component={Goals} />
        <Route path="/goals/new" component={GoalForm} />
        <Route path="/goals/:id/edit" component={GoalForm} />
        <Route path="/goals/:id" component={GoalDetail} />
        <Route path="/community" component={Community} />
        <Route path="/diary" component={Diary} />
        <Route path="/diary/new" component={DiaryForm} />
        <Route path="/diary/:id/edit" component={DiaryForm} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/profile" component={Profile} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
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
