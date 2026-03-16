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
import SettingsPage from './pages/SettingsPage';
import FeedbackPage from './pages/FeedbackPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import PlansPage from './pages/PlansPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ChallengesPage from './pages/ChallengesPage';
import FastRecipesPage from './pages/FastRecipesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRecipesPage from './pages/AdminRecipesPage';

import GuestLock from './components/GuestLock';

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
    
    if (!user) return <Navigate to="/login" />;
    
    return <Outlet />;
};

const RestrictGuestRoute = ({ featureName }) => {
    const { user } = useAuth();
    if (user?.role === 'guest') {
        return <GuestLock featureName={featureName} />;
    }
    return <Outlet />;
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
            
            <Route element={<Layout />}>
                {/* Public Routes */}
                <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/recipes" replace />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="/fast-recipes" element={<FastRecipesPage />} />
                <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                <Route path="/challenges" element={<ChallengesPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    
                    <Route element={<RestrictGuestRoute featureName="Análise com IA" />}>
                        <Route path="/scan" element={<ScanPage />} />
                    </Route>
                    
                    <Route element={<RestrictGuestRoute featureName="Perfil de Utilizador" />}>
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                    
                    <Route element={<RestrictGuestRoute featureName="Configurações" />}>
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                    
                    <Route element={<RestrictGuestRoute featureName="Feedback" />}>
                        <Route path="/feedback" element={<FeedbackPage />} />
                    </Route>
                    
                    <Route element={<PlanRoute minPlan="basic" />}>
                        <Route element={<RestrictGuestRoute featureName="Plano de Refeição" />}>
                            <Route path="/meal-plan" element={<MealPlanPage />} />
                        </Route>
                        <Route element={<RestrictGuestRoute featureName="Meus Favoritos" />}>
                            <Route path="/favorites" element={<FavoritesPage />} />
                        </Route>
                        <Route element={<RestrictGuestRoute featureName="Histórico" />}>
                            <Route path="/history" element={<HistoryPage />} />
                        </Route>
                    </Route>
                    
                    <Route element={<PlanRoute minPlan="pro" />}>
                        <Route element={<RestrictGuestRoute featureName="Lista de Compras" />}>
                            <Route path="/shopping-list" element={<ShoppingListPage />} />
                        </Route>
                        <Route element={<RestrictGuestRoute featureName="Nutrição" />}>
                            <Route path="/nutrition" element={<NutritionPage />} />
                        </Route>
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
