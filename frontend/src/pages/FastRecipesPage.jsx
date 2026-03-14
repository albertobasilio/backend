import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Search, Clock, Flame, Zap, DollarSign, Lock } from 'lucide-react';

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-line title" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line short" />
    </div>
);

const FastRecipesPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadRecipes(); }, []);

    const loadRecipes = async () => {
        try {
            const res = await recipeService.getAll();
            const filtered = res.data.filter(r => {
                const tags = typeof r.tags === 'string' ? r.tags : JSON.stringify(r.tags || []);
                return tags.includes('fast_food');
            });
            setRecipes(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeClick = async (recipeId) => {
        if (user?.role === 'guest') {
            navigate('/register');
            return;
        }
        navigate(`/recipes/${recipeId}`);
    };

    const getRecipeImage = (recipe) => {
        if (recipe.image_url && recipe.image_url.startsWith('http')) return recipe.image_url;
        return null;
    };

    const filtered = recipes.filter(r => 
        !search || r.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-enter">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'var(--color-accent)', padding: 8, borderRadius: 12, color: 'black' }}>
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h1>{t('common.fastRecipes')}</h1>
                        <p>Pratos rápidos, económicos e deliciosos</p>
                    </div>
                </div>
            </div>

            <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
                <div className="input-with-icon">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Pesquisar snacks e pratos rápidos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <span className="input-icon"><Search size={18} /></span>
                </div>
            </div>

            {loading ? (
                <div className="skeleton-grid">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length > 0 ? (
                <div className="card-grid">
                    {filtered.map((recipe, idx) => {
                        const isGuest = user?.role === 'guest';
                        const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
                        const img = getRecipeImage(recipe);
                        
                        return (
                            <div 
                                key={recipe.id} 
                                onClick={() => handleRecipeClick(recipe.id)}
                                className="recipe-card animate-fadeInUp"
                                style={{ borderLeftColor: totalTime <= 20 ? 'var(--color-accent)' : 'var(--color-primary)' }}
                            >
                                <div style={{ height: 140, overflow: 'hidden', position: 'relative', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {img ? (
                                        <img
                                            src={img}
                                            alt={recipe.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '3rem', opacity: 0.3 }}>🥗</div>
                                    )}
                                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 4 }}>
                                        {totalTime <= 20 && (
                                            <span style={{ background: 'var(--color-accent)', color: 'black', padding: '2px 8px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Zap size={10} fill="currentColor" /> EXPRESSO
                                            </span>
                                        )}
                                    </div>
                                    {isGuest && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Lock size={20} color="white" />
                                        </div>
                                    )}
                                </div>
                                <div className="recipe-card-body">
                                    <h3 style={{ fontSize: '0.9rem' }}>{recipe.title}</h3>
                                    <p style={{ fontSize: '0.75rem', WebkitLineClamp: 2 }}>{recipe.description}</p>
                                </div>
                                <div className="recipe-card-footer" style={{ padding: '8px 16px' }}>
                                    <div className="recipe-meta">
                                        <span style={{ color: totalTime <= 20 ? 'var(--color-accent)' : 'inherit' }}>
                                            <Clock size={12} /> {totalTime}min
                                        </span>
                                        <span><Flame size={12} /> {recipe.calories}kcal</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">⚡</div>
                    <h3>Sem receitas rápidas no momento</h3>
                    <Link to="/recipes" className="btn btn-primary btn-sm">Ver todas</Link>
                </div>
            )}
        </div>
    );
};

export default FastRecipesPage;
