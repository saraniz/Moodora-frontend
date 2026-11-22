import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, Switch } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { StudioLayout } from "@/components/layout/StudioLayout";
import { Toast } from "@/components/layout/Toast";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { CollagePage } from "@/pages/collage/CollagePage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ExplorePage } from "@/pages/explore/ExplorePage";
import { LandingPage } from "@/pages/landing/LandingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlannerPage } from "@/pages/planner/PlannerPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";

const queryClient = new QueryClient();

function Routes() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route>
        <StudioLayout>
          <Switch>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/planner" component={PlannerPage} />
            <Route path="/collage" component={CollagePage} />
            <Route path="/explore" component={ExplorePage} />
            <Route path="/projects" component={ProjectsPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </StudioLayout>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <ErrorBoundary>
          <Routes />
        </ErrorBoundary>
        <Toast />
      </Router>
    </QueryClientProvider>
  );
}
