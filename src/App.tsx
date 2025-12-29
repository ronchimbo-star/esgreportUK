import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";

const About = lazy(() => import("@/pages/About"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Frameworks = lazy(() => import("@/pages/Frameworks"));
const FrameworksAuth = lazy(() => import("@/pages/FrameworksAuth"));
const Contact = lazy(() => import("@/pages/Contact"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const Onboarding = lazy(() => import("@/pages/auth/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Reports = lazy(() => import("@/pages/Reports"));
const ReportNew = lazy(() => import("@/pages/ReportNew"));
const ReportDetail = lazy(() => import("@/pages/ReportDetail"));
const ReportDataEntry = lazy(() => import("@/pages/ReportDataEntry"));
const ReportPreview = lazy(() => import("@/pages/ReportPreview"));
const ReportShare = lazy(() => import("@/pages/ReportShare"));
const ReportTemplates = lazy(() => import("@/pages/ReportTemplates"));
const ReportCompare = lazy(() => import("@/pages/ReportCompare"));
const PublicReport = lazy(() => import("@/pages/PublicReport"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const ActivityLog = lazy(() => import("@/pages/ActivityLog"));
const DataManagement = lazy(() => import("@/pages/DataManagement"));
const DataImport = lazy(() => import("@/pages/DataImport"));
const Search = lazy(() => import("@/pages/Search"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
const Documents = lazy(() => import("@/pages/Documents"));
const TeamManagement = lazy(() => import("@/pages/TeamManagement"));
const Admin = lazy(() => import("@/pages/Admin"));
const NewsAdmin = lazy(() => import("@/pages/admin/NewsAdmin"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const AnalyticsDashboard = lazy(() => import("@/pages/admin/AnalyticsDashboard"));
const SiteSettings = lazy(() => import("@/pages/admin/SiteSettings"));
const Financial = lazy(() => import("@/pages/admin/Financial"));
const ContactManagement = lazy(() => import("@/pages/admin/ContactManagement"));
const Billing = lazy(() => import("@/pages/Billing"));
const News = lazy(() => import("@/pages/News"));
const NewsDetail = lazy(() => import("@/pages/NewsDetail"));
const API = lazy(() => import("@/pages/API"));
const CaseStudies = lazy(() => import("@/pages/CaseStudies"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Support = lazy(() => import("@/pages/Support"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Switch>
          <Route path="/" component={Landing} />
          <Route path="/about" component={About} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/frameworks" component={Frameworks} />
          <Route path="/contact" component={Contact} />
          <Route path="/api" component={API} />
          <Route path="/case-studies" component={CaseStudies} />
          <Route path="/faq" component={FAQ} />
          <Route path="/support" component={Support} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />

          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/frameworks-auth" component={FrameworksAuth} />
          <Route path="/reports" component={Reports} />
          <Route path="/reports/new" component={ReportNew} />
          <Route path="/reports/:id" component={ReportDetail} />
          <Route path="/reports/:id/data" component={ReportDataEntry} />
          <Route path="/reports/:id/preview" component={ReportPreview} />
          <Route path="/reports/:id/share" component={ReportShare} />
          <Route path="/templates" component={ReportTemplates} />
          <Route path="/compare" component={ReportCompare} />
          <Route path="/shared/:token" component={PublicReport} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/profile" component={Profile} />
          <Route path="/activity" component={ActivityLog} />
          <Route path="/data-management" component={DataManagement} />
          <Route path="/data-import" component={DataImport} />
          <Route path="/search" component={Search} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/ai-assistant" component={AIAssistant} />
          <Route path="/documents" component={Documents} />
          <Route path="/team" component={TeamManagement} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/news" component={NewsAdmin} />
          <Route path="/admin/users" component={UserManagement} />
          <Route path="/admin/analytics" component={AnalyticsDashboard} />
          <Route path="/admin/settings" component={SiteSettings} />
          <Route path="/admin/financial" component={Financial} />
          <Route path="/admin/contacts" component={ContactManagement} />
          <Route path="/dashboard/billing" component={Billing} />

          <Route path="/news" component={News} />
          <Route path="/news/:slug" component={NewsDetail} />

              <Route component={NotFound} />
            </Switch>
          </Suspense>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
