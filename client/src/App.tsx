import { Switch, Route, useLocation } from "wouter";
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
import FormEmbed from "@/pages/forms/embed/[id]";
import FormSubmissions from "@/pages/forms/submissions/[id]";
import Calendar from "@/pages/calendar";
import Email from "@/pages/email";
import SocialMedia from "@/pages/social";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Quotations from "@/pages/quotations";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/companies" component={Companies} />
      <Route path="/deals" component={Deals} />
      <Route path="/quotations" component={Quotations} />
      <Route path="/lists" component={Lists} />
      <Route path="/forms" component={Forms} />
      <Route path="/forms/embed/:id" component={FormEmbed} />
      <Route path="/forms/submissions/:id" component={FormSubmissions} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/email" component={Email} />
      <Route path="/social" component={SocialMedia} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isEmbedRoute = location.startsWith('/forms/embed/');

  // For embedded forms, don't use the main layout
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {isEmbedRoute ? (
          <Router />
        ) : (
          <MainLayout>
            <Router />
          </MainLayout>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
