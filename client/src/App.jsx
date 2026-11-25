import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { GroupOrderProvider } from "./context/GroupOrderContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { GroupOrderBanner } from "./components/group/GroupOrderBanner";
import { CartDrawer } from "./components/cart/CartDrawer";
import { ConflictModal } from "./components/cart/ConflictModal";
import { AuthModal } from "./components/auth/AuthModal";
import { CreateOrJoinModal } from "./components/group/CreateOrJoinModal";
import { ToastContainer } from "./components/common/ToastContainer";
import { LandingPage } from "./pages/LandingPage";
import { ExplorePage } from "./pages/ExplorePage";
import { RestaurantDetailPage } from "./pages/RestaurantDetailPage";
import { GroupOrderRoomPage } from "./pages/GroupOrderRoomPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrdersHistoryPage } from "./pages/OrdersHistoryPage";

function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <GroupOrderBanner />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/group/:roomCode" element={<GroupOrderRoomPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<OrdersHistoryPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      <Footer />

      <CartDrawer />
      <AuthModal />
      <ConflictModal />
      <CreateOrJoinModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <GroupOrderProvider>
              <AppShell />
            </GroupOrderProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
