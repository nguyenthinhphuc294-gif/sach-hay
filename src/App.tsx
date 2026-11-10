import React, { lazy, Suspense, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, useMatch } from 'react-router';
import { checkoutStore } from './checkout/store';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBannerSlider } from './components/HeroBannerSlider';
import { QuickCategories } from './components/QuickCategories';
import { FlashSaleSection } from './components/FlashSaleSection';
import { ShoppingTrendsSection } from './components/ShoppingTrendsSection';
import { CategorySpotlightSection } from './components/CategorySpotlightSection';
import { TopRankingSection } from './components/TopRankingSection';
import { CatalogPage } from './components/CatalogPage';
import { BookDetailPage } from './components/BookDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AccountPage } from './components/AccountPage';
import AboutContactPage from './components/AboutContactPage.jsx';
import { AdminLogin } from './components/AdminLogin';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import PromoBannerModal from './components/PromoBannerModal.jsx';
import { BankTransferPayment, readPaymentReceipt, savePaymentReceipt } from './components/BankTransferPayment';
import type { OrderResult } from './checkout/api';

const AdminPortal = lazy(() => import('./components/AdminPortal').then(module => ({ default: module.AdminPortal })));

const MainAppContent: React.FC = () => {
  const { activeView, adminStatus, lastCreatedOrder } = useStore();
  const isAboutPage = Boolean(useMatch('/about'));

  const [orderLookupMode, setOrderLookupMode] = useState<'manual' | 'created' | null>(null);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(readPaymentReceipt);
  const [initialPayment, setInitialPayment] = useState<OrderResult['payment']>();
  const [isBankPaymentOpen, setIsBankPaymentOpen] = useState(Boolean(paymentReceipt));

  const handleOrderCompleted = (payment?: OrderResult['payment']) => {
    if (payment) {
      const receipt = { orderCode: payment.orderCode, token: payment.token };
      savePaymentReceipt(receipt);
      setPaymentReceipt(receipt);
      setInitialPayment(payment);
      setIsBankPaymentOpen(true);
      return;
    }
    setIsOrderSuccessOpen(true);
  };

  const handleTrackCreatedOrder = () => {
    setIsOrderSuccessOpen(false);
    setOrderLookupMode('created');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0] text-[#333333]">
      {/* 3-Part Sticky Header */}
      <Header onOpenOrderLookup={() => setOrderLookupMode('manual')} />

      {/* Main View Area */}
      <main className="flex-1">
        {paymentReceipt && !isBankPaymentOpen && (
          <div className="mx-auto max-w-7xl px-4 pt-3">
            <button type="button" onClick={() => setIsBankPaymentOpen(true)}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
              Xem thanh toán đơn {paymentReceipt.orderCode}
            </button>
          </div>
        )}
        <Routes>
          <Route path="/about" element={<AboutContactPage />} />
          <Route path="*" element={
            <>
              {activeView === 'home' && (
                <div className="space-y-4">
                  <HeroBannerSlider />
                  <QuickCategories />
                  <FlashSaleSection />
                  <ShoppingTrendsSection />
                  <CategorySpotlightSection />
                  <TopRankingSection />
                </div>
              )}
              {activeView === 'catalog' && <CatalogPage />}
              {activeView === 'book_detail' && <BookDetailPage />}
              {activeView === 'cart' && <CartPage />}
              {activeView === 'checkout' && <CheckoutPage onOrderCompleted={handleOrderCompleted} />}
              {activeView === 'account' && <AccountPage />}
              {activeView === 'admin' && (
                adminStatus === 'authenticated' ? (
                  <Suspense fallback={<p role="status" className="p-6 text-center">Đang mở trang quản trị…</p>}>
                    <AdminPortal />
                  </Suspense>
                ) : adminStatus === 'checking' ? (
                  <p role="status" className="p-6 text-center">Đang kiểm tra phiên đăng nhập…</p>
                ) : <AdminLogin />
              )}
            </>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Toasts */}
      <ToastContainer />

      {activeView === 'home' && !isAboutPage && !isBankPaymentOpen && !isOrderSuccessOpen && !orderLookupMode && (
        <PromoBannerModal />
      )}

      {paymentReceipt && isBankPaymentOpen && (
        <BankTransferPayment key={paymentReceipt.orderCode} receipt={paymentReceipt}
          initialPayment={initialPayment} onDismiss={finished => {
            setIsBankPaymentOpen(false);
            setInitialPayment(undefined);
            if (finished) {
              savePaymentReceipt(null);
              setPaymentReceipt(null);
            }
          }} />
      )}
      {/* Order Success Confirmation Modal */}
      {isOrderSuccessOpen && (
        <OrderSuccessModal
          onClose={() => setIsOrderSuccessOpen(false)}
          onTrackOrder={handleTrackCreatedOrder}
        />
      )}

      {/* Order Tracking Modal */}
      {orderLookupMode && (
        <OrderTrackingModal
          initialOrderCode={orderLookupMode === 'created' ? lastCreatedOrder?.orderCode : undefined}
          initialPhone={orderLookupMode === 'created' ? lastCreatedOrder?.phone : undefined}
          onClose={() => setOrderLookupMode(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Provider store={checkoutStore}>
        <StoreProvider>
          <MainAppContent />
        </StoreProvider>
      </Provider>
    </BrowserRouter>
  );
}
