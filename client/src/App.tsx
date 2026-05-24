import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';
import AppLayout from './components/layout/app-layout';
import ProtectedRoute from './components/shared/protected-route';

// Pages
import Login from './pages/login';

// Owner Pages
import OwnerDashboard from './pages/owner/dashboard';
import OwnerSites from './pages/owner/sites';
import OwnerSiteDetails from './pages/owner/site-details';
import OwnerCashDispatch from './pages/owner/cash-dispatch';
import OwnerExpenses from './pages/owner/expenses';
import OwnerLedger from './pages/owner/ledger';
import OwnerReports from './pages/owner/reports';
import OwnerNotifications from './pages/owner/notifications';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/dashboard';
import SupervisorPendingReceipts from './pages/supervisor/pending-receipts';
import SupervisorAddExpense from './pages/supervisor/add-expense';
import SupervisorSiteLedger from './pages/supervisor/site-ledger';
import SupervisorNotifications from './pages/supervisor/notifications';

function App() {
  const { initialize, user, token } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Owner Routes */}
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<OwnerDashboard />} />
                  <Route path="sites" element={<OwnerSites />} />
                  <Route path="sites/:id" element={<OwnerSiteDetails />} />
                  <Route path="dispatch" element={<OwnerCashDispatch />} />
                  <Route path="expenses" element={<OwnerExpenses />} />
                  <Route path="ledger" element={<OwnerLedger />} />
                  <Route path="reports" element={<OwnerReports />} />
                  <Route path="notifications" element={<OwnerNotifications />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Supervisor Routes */}
        <Route
          path="/supervisor/*"
          element={
            <ProtectedRoute allowedRoles={['SUPERVISOR']}>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<SupervisorDashboard />} />
                  <Route path="receipts" element={<SupervisorPendingReceipts />} />
                  <Route path="expenses" element={<SupervisorAddExpense />} />
                  <Route path="ledger" element={<SupervisorSiteLedger />} />
                  <Route path="notifications" element={<SupervisorNotifications />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback Route redirects based on role */}
        <Route
          path="*"
          element={
            token && user ? (
              <Navigate
                to={user.role === 'OWNER' ? '/owner/dashboard' : '/supervisor/dashboard'}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
