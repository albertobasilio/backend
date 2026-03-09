import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recipeService, nutritionService } from '../services/api';
import { 
    ScanLine, ChefHat, CalendarDays, BarChart3, Heart, 
    History, Clock, Flame, Trophy, Download, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SkeletonCard = () => (
    <div className="skeleton-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px' }}>
        <div className="skeleton-line title" style={{ width: '60%', height: '20px', marginBottom: '12px' }} />
        <div className="skeleton-line medium" style={{ width: '80%', height: '12px', marginBottom: '8px' }} />
        <div className="skeleton-line short" style={{ width: '40%', height: '12px' }} />
    </div>
);

const quickActions = [
    { path: '/scan', icon: ScanLine, label: 'Escanear', desc: 'Identificar ingredientes', variant: 'scan' },
    { path: '/recipes', icon: ChefHat, label: 'Receitas', desc: 'Sabor de Moçambique', variant: 'recipe' },
    { path: '/favorites', icon: Heart, label: 'Favoritos', desc: 'Seus pratos salvos', variant: 'favorites' },
    { path: '/history', icon: History, label: 'Histórico', desc: 'Scans realizados', variant: 'history' },
    { path: '/meal-plan', icon: CalendarDays, label: 'Plano Semanal', desc: 'Organize sua dieta', variant: 'plan' },
    { path: '/nutrition', icon: BarChart3, label: 'Nutrição', desc: 'Saúde e equilíbrio', variant: 'nutrition' },
];

const DashboardPage = () => {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    useEffect(() => {
        loadDashboard();

        // PWA Install Logic
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBanner(true);
        });

        window.addEventListener('appinstalled', () => {
            setShowInstallBanner(false);
            setDeferredPrompt(null);
        });
    }, []);

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

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBanner(false);
        }
        setDeferredPrompt(null);
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const getRecipeImage = (recipe, index) => {
        if (recipe.image_url && recipe.image_url.startsWith('http')) return recipe.image_url;
        
        const foodImages = [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80',
            'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=500&q=80',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
            'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&q=80',
        ];
        
        return foodImages[index % foodImages.length];
    };

    return (
        <div className="page-enter" style={{ paddingBottom: 100 }}>
            
            {/* PWA Install Banner */}
            <AnimatePresence>
                {showInstallBanner && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            background: 'var(--gradient-primary)',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 10px 25px rgba(52, 211, 153, 0.2)',
                            cursor: 'pointer'
                        }}
                        onClick={handleInstallClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: '12px' }}>
                                <Download size={20} color="white" />
                            </div>
                            <div>
                                <h4 style={{ color: '#064e3b', fontWeight: 800, margin: 0, fontSize: '0.95rem' }}>Baixar Aplicativo</h4>
                                <p style={{ color: 'rgba(6, 78, 59, 0.7)', fontSize: '0.75rem', margin: 0 }}>Instale o Sabor Inteligente no seu telemóvel</p>
                            </div>
                        </div>
                        <ArrowRight size={20} color="#064e3b" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Greeting Card */}
            <div className="hero-card" style={{ marginBottom: 32 }}>
                <h1 style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 900, 
                    color: 'white', 
                    marginBottom: 4,
                    letterSpacing: '-0.5px' 
                }}>
                    {greeting()}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0 }}>
                    O que vamos cozinhar hoje?
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ marginBottom: 40 }}>
                <h2 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 800, 
                    color: 'white', 
                    marginBottom: 16, 
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    opacity: 0.9
                }}>
                    Acesso Rápido
                </h2>
                <div className="card-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {quickActions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <Link to={action.path} key={action.path} style={{ textDecoration: 'none' }}>
                                <div className={`stat-card ${action.variant} animate-fadeInUp stagger-${idx + 1}`} 
                                     style={{ 
                                         padding: '16px', 
                                         borderRadius: '16px',
                                         height: '100%',
                                         display: 'flex',
                                         flexDirection: 'column',
                                         alignItems: 'flex-start',
                                         gap: '12px',
                                         background: 'rgba(255,255,255,0.03)'
                                     }}>
                                    <div className="stat-icon" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="stat-info">
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>{action.label}</h3>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{action.desc}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Recipes */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ 
                        fontSize: '1rem', 
                        fontWeight: 800, 
                        color: 'white', 
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        opacity: 0.9
                    }}>
                        Receitas Populares
                    </h2>
                    <Link to="/recipes" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                        Ver todas
                    </Link>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : recipes.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {recipes.map((recipe, idx) => (
                            <Link key={recipe.id} to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="recipe-card animate-fadeInUp" style={{ borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                                    <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden', background: '#1a1a1a' }}>
                                        <img
                                            src={getRecipeImage(recipe, idx)}
                                            alt={recipe.title}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                            onLoad={(e) => e.target.style.opacity = 1}
                                            className="recipe-img-hover"
                                        />
                                        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>
                                            {recipe.region || 'MZ'}
                                        </div>
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: 6, lineHeight: '1.3' }}>
                                            {recipe.title}
                                        </h3>
                                        <div style={{ display: 'flex', gap: 8, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Clock size={10} /> {recipe.prep_time_min}m
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Flame size={10} /> {recipe.calories}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '40px 20px', borderRadius: '20px' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Comece sua jornada culinária agora!</p>
                        <Link to="/scan" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}>
                            Primeiro Scan
                        </Link>
                    </div>
                )}
            </div>

            {/* Footer Signature */}
            <div style={{ marginTop: 60, textAlign: 'center', opacity: 0.3 }}>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Sabor Inteligente MZ • Desenvolvido por Mr Beto
                </p>
            </div>
        </div>
    );
};

export default DashboardPage;
