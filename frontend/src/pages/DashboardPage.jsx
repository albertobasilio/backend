import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recipeService, nutritionService } from '../services/api';
import { ScanLine, ChefHat, CalendarDays, BarChart3, Heart, History, Clock, Flame, Trophy } from 'lucide-react';

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-line title" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line short" />
    </div>
);

const quickActions = [
    { path: '/scan', icon: ScanLine, label: 'Escanear', desc: 'Fotografe seus produtos', variant: 'scan' },
    { path: '/recipes', icon: ChefHat, label: 'Receitas', desc: 'Pratos moçambicanos', variant: 'recipe' },
    { path: '/favorites', icon: Heart, label: 'Favoritos', desc: 'Receitas guardadas', variant: 'favorites' },
    { path: '/history', icon: History, label: 'Histórico', desc: 'Scans anteriores', variant: 'history' },
    { path: '/meal-plan', icon: CalendarDays, label: 'Plano Semanal', desc: 'Organize refeições', variant: 'plan' },
    { path: '/nutrition', icon: BarChart3, label: 'Nutrição', desc: 'Saúde e bem-estar', variant: 'nutrition' },
    { path: '/challenges', icon: Trophy, label: 'Desafios', desc: 'Metas semanais', variant: 'history' },
];

const DashboardPage = () => {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        try {
            const [recipesRes, tipsRes] = await Promise.allSettled([
                recipeService.getAll(),
                nutritionService.getTips(),
            ]);

            if (recipesRes.status === 'fulfilled') setRecipes(recipesRes.value.data.slice(0, 4));
            if (tipsRes.status === 'fulfilled') setTips(tipsRes.value.data.slice(0, 3));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    return (
        <div className="page-enter">
            {/* Hero Greeting Card */}
            <div className="hero-card">
                <h1>{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
                <p>O que vamos cozinhar hoje?</p>
            </div>

            {/* Quick Actions with gradient cards */}
            <div className="card-grid" style={{ marginBottom: 28 }}>
                {quickActions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                        <Link to={action.path} key={action.path} style={{ textDecoration: 'none' }}>
                            <div className={`stat-card ${action.variant} animate-fadeInUp stagger-${idx + 1}`} style={{ cursor: 'pointer' }}>
                                <div className="stat-icon">
                                    <Icon size={22} />
                                </div>
                                <div className="stat-info">
                                    <h3>{action.label}</h3>
                                    <p>{action.desc}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Recipes */}
            <div style={{ marginBottom: 32 }}>
                <div className="animate-fadeInUp stagger-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Receitas Populares</h2>
                    <Link to="/recipes" className="btn btn-sm btn-secondary">Ver todas</Link>
                </div>
                {loading ? (
                    <div className="skeleton-grid">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : recipes.length > 0 ? (
                    <div className="card-grid">
                        {recipes.map((recipe, idx) => {
                            const CardWrapper = recipe.is_locked ? 'div' : Link;
                            const wrapperProps = recipe.is_locked
                                ? { key: recipe.id, style: { textDecoration: 'none', color: 'inherit', cursor: 'not-allowed' } }
                                : { key: recipe.id, to: `/recipes/${recipe.id}`, style: { textDecoration: 'none', color: 'inherit' } };
                            return (
                            <CardWrapper {...wrapperProps}>
                                <div className={`recipe-card animate-fadeInUp stagger-${idx + 1}`} style={recipe.is_locked ? { opacity: 0.7 } : null}>
                                    {recipe.image_url && (
                                        <div style={{ width: '100%', height: 120, overflow: 'hidden' }}>
                                            <img
                                                src={recipe.image_url}
                                                alt={recipe.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    <div className="recipe-card-body">
                                        <h3>{recipe.title}</h3>
                                        <p>{recipe.description}</p>
                                    </div>
                                    <div className="recipe-card-footer">
                                        <div className="recipe-meta">
                                            <span><Clock size={13} /> {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)}min</span>
                                            <span><Flame size={13} /> {recipe.calories}kcal</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {recipe.region && (
                                                <span className="recipe-badge region">{recipe.region}</span>
                                            )}
                                            {recipe.is_locked && (
                                                <span className="recipe-badge difficulty">Bloqueado</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardWrapper>
                        );})}
                    </div>
                ) : (
                    <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: 32 }}>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Escaneie sua geladeira para gerar receitas!</p>
                        <Link to="/scan" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Escanear</Link>
                    </div>
                )}
            </div>

            {/* Tips */}
            {tips.length > 0 && (
                <div className="animate-fadeInUp stagger-5">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Dicas Nutricionais</h2>
                    {tips.map((tip, i) => (
                        <div className={`tip-card animate-fadeInUp stagger-${i + 4}`} key={i}>
                            <div className="tip-icon">{tip.icon}</div>
                            <div className="tip-content">
                                <h4>{tip.title}</h4>
                                <p>{tip.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
