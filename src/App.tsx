import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CollectionsPage from "./pages/Collections.tsx";
import BlogPage from "./pages/Blog.tsx";
import BlogPostPage from "./pages/BlogPost.tsx";
import CheckoutPage from "./pages/Checkout.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import AdminLayout from "./pages/admin/Layout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminProducts from "./pages/admin/Products.tsx";
import AdminCategories from "./pages/admin/Categories.tsx";
import AdminReviews from "./pages/admin/Reviews.tsx";
import AdminBlog from "./pages/admin/Blog.tsx";
import AdminOrders from "./pages/admin/Orders.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { CartDrawer } from "@/components/hanrose/CartDrawer";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = "G-SZV4D36T8K";

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    window.gtag?.("config", GA_ID, { page_path: location.pathname + location.search });
  }, [location]);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <AuthProvider>
            <PageTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CartDrawer />
          </AuthProvider>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
