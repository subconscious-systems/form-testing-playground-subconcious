import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { FormProvider } from "@/contexts/FormContext";
import Index from "./pages/Index";
import FormPage from "./pages/FormPage";
import MultipageFormPage from "./pages/MultipageFormPage";
import FormCompletePage from "./pages/FormCompletePage";
import FormCompletionDetailsPage from "./pages/FormCompletionDetailsPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Component to handle session cleanup
const SessionCleanup = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if the current path is NOT a completion page
    const isCompletionPage = location.pathname.includes('/complete') || location.pathname.includes('/completion_details');

    if (!isCompletionPage) {
      // Clear all form evaluation data from session storage
      // We iterate through all keys and remove those starting with 'form-evaluation-'
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('form-evaluation-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FormProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionCleanup />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/:formId/complete" element={<FormCompletePage />} />
            <Route path="/:formId/completion_details" element={<FormCompletionDetailsPage />} />
            <Route path="/:formId/page/:page" element={<MultipageFormPage />} />
            <Route path="/:formId" element={<FormPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FormProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
