import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import MealPlanPage from './pages/MealPlanPage';
import ShoppingListPage from './pages/ShoppingListPage';
import NutritionPage from './pages/NutritionPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import PlansPage from './pages/PlansPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ChallengesPage from './pages/ChallengesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRecipesPage from './pages/AdminRecipesPage';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
                <span className="spinner-text">Carregando...</span>
            </div>
        );
    }
    return user ? <Outlet /> : <Navigate to="/login" />;
};

const PLAN_ORDER = ['free', 'basic', 'pro', 'premium'];

const PlanRoute = ({ minPlan }) => {
    const { user } = useAuth();
    if (user?.role === 'admin') return <Outlet />;
    const currentIdx = PLAN_ORDER.indexOf(user?.plan || 'free');
    const minIdx = PLAN_ORDER.indexOf(minPlan || 'free');
    return currentIdx >= minIdx ? <Outlet /> : <Navigate to="/plans" />;
};

const AdminRoute = () => {
    const { user } = useAuth();
    return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
};

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />

            {/* Protected routes with shared layout */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/scan" element={<ScanPage />} />
                    <Route path="/recipes" element={<RecipesPage />} />
                    <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route element={<PlanRoute minPlan="basic" />}>
                        <Route path="/meal-plan" element={<MealPlanPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                    </Route>
                    <Route element={<PlanRoute minPlan="pro" />}>
                        <Route path="/shopping-list" element={<ShoppingListPage />} />
                        <Route path="/nutrition" element={<NutritionPage />} />
                    </Route>
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                        <Route path="/admin/recipes" element={<AdminRecipesPage />} />
                    </Route>
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
