import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import MainLayout from "@/layout/MainLayout";
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import ContactDetail from "@/pages/contacts/ContactDetail";
import Companies from "@/pages/companies";
import Partners from "@/pages/partners";
import Deals from "@/pages/deals";
import DealDetail from "@/pages/deals/DealDetail";
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
import Invoiced from "@/pages/invoiced";
import Users from "@/pages/users";
import LoginPage from "@/pages/auth/LoginPage";
import NotFound from "@/pages/not-found";

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Switch>
      <Route path="/login" component={() => { window.location.href = "/"; return null; }} />
      <Route path="/" component={Dashboard} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/contacts/:id" component={ContactDetail} />
      <Route path="/companies" component={Companies} />
      <Route path="/partners" component={Partners} />
      <Route path="/deals" component={Deals} />
      <Route path="/deals/:id" component={DealDetail} />
      <Route path="/quotations" component={Quotations} />
      <Route path="/invoiced" component={Invoiced} />
      <Route path="/lists" component={Lists} />
      <Route path="/forms" component={Forms} />
      <Route path="/forms/submissions/:id" component={FormSubmissions} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/email" component={Email} />
      <Route path="/social" component={SocialMedia} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isEmbedRoute = location.startsWith('/forms/embed/');
  const isLoginRoute = location === '/login';

  if (isEmbedRoute) {
    return <FormEmbed />;
  }

  if (isLoginRoute) {
    return <LoginPage />;
  }

  return (
    <MainLayout>
      <ProtectedRoutes />
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
