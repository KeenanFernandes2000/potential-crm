import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/layout/MainLayout";
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import Companies from "@/pages/companies";
import Deals from "@/pages/deals";
import Lists from "@/pages/lists";
import Forms from "@/pages/forms";
import Calendar from "@/pages/calendar";
import SocialMedia from "@/pages/social";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/companies" component={Companies} />
      <Route path="/deals" component={Deals} />
      <Route path="/lists" component={Lists} />
      <Route path="/forms" component={Forms} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/social" component={SocialMedia} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainLayout>
          <Router />
        </MainLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
