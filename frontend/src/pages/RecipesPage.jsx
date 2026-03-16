import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Clock, Flame, MapPin, Lock } from 'lucide-react';

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-line title" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line short" />
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 10 }}>
            <div className="skeleton-line short" />
        </div>
    </div>
);

const getDifficultyLabel = (d) => {
    if (d === 'easy') return 'Fácil';
    if (d === 'medium') return 'Médio';
    if (d === 'hard') return 'Difícil';
    return d;
};

const getDifficultyClass = (d) => {
    if (d === 'medium') return 'difficulty-medio';
    if (d === 'hard') return 'difficulty-dificil';
    return '';
};

const RecipesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [region, setRegion] = useState('');

    useEffect(() => { loadRecipes(); }, []);

    const loadRecipes = async () => {
        try {
            const res = await recipeService.getAll();
            setRecipes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeClick = async (recipeId) => {
        if (user?.role === 'guest') {
            await authService.logAction(`tentou ver receita ${recipeId} como guest`);
            navigate('/register');
            return;
        }
        navigate(`/recipes/${recipeId}`);
    };

    const getRecipeImage = (recipe, index) => {
        if (recipe.image_url && (recipe.image_url.startsWith('http') || recipe.image_url.startsWith('/'))) return recipe.image_url;
        
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

    const filtered = recipes.filter(r => {
        const tags = typeof r.tags === 'string' ? r.tags : JSON.stringify(r.tags || []);
        const isFastFood = tags.includes('fast_food');
        
        const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase());
        const matchRegion = !region || r.region === region;
        return !isFastFood && matchSearch && matchRegion;
    });

    return (
        <div className="page-enter">
            <div className="page-header">
                <h1>Receitas</h1>
                <p>Descubra pratos deliciosos de Moçambique</p>
            </div>

            {/* Filters */}
            <div className="animate-fadeInUp" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <div className="input-with-icon" style={{ flex: 1, minWidth: 180 }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Pesquisar receitas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <span className="input-icon"><Search size={18} /></span>
                </div>
                <div className="input-with-icon" style={{ width: 'auto', minWidth: 140 }}>
                    <select className="form-control" value={region} onChange={e => setRegion(e.target.value)} style={{ paddingLeft: 44 }}>
                        <option value="">Região</option>
                        <option value="Sul">Sul</option>
                        <option value="Centro">Centro</option>
                        <option value="Norte">Norte</option>
                    </select>
                    <span className="input-icon"><MapPin size={18} /></span>
                </div>
            </div>

            {/* Recipe Grid */}
            {loading ? (
                <div className="skeleton-grid">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length > 0 ? (
                <div className="card-grid">
                    {filtered.map((recipe, idx) => {
                        const isGuest = user?.role === 'guest';
                        const isLocked = recipe.is_locked || isGuest;
                        
                        return (
                            <div 
                                key={recipe.id} 
                                onClick={() => handleRecipeClick(recipe.id)}
                                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                            >
                                <div className={`recipe-card ${getDifficultyClass(recipe.difficulty)} animate-fadeInUp stagger-${Math.min(idx + 1, 6)}`} style={isLocked ? { opacity: 0.85 } : null}>
                                    <div className="recipe-card-image" style={{ width: '100%', height: 160, overflow: 'hidden', position: 'relative', background: '#1a1a1a' }}>
                                        <img
                                            src={getRecipeImage(recipe, idx)}
                                            alt={recipe.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { 
                                                e.target.src = 'https://images.unsplash.com/photo-1495195129352-aec325a55b65?w=500&q=80'; 
                                            }}
                                        />
                                        {isGuest && (
                                            <div style={{ 
                                                position: 'absolute', 
                                                inset: 0, 
                                                background: 'rgba(0,0,0,0.5)', 
                                                backdropFilter: 'blur(4px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                textAlign: 'center',
                                                padding: 10
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                                    <Lock size={20} />
                                                    Crie conta para ver
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                            {recipe.difficulty && (
                                                <span className="recipe-badge difficulty">{getDifficultyLabel(recipe.difficulty)}</span>
                                            )}
                                            {isLocked && (
                                                <span className="recipe-badge difficulty" style={{ background: 'var(--color-accent)', color: 'black' }}>
                                                    {isGuest ? 'Registo' : 'Bloqueado'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <h3>Nenhuma receita encontrada</h3>
                    <p>Tente pesquisar ou escanear produtos</p>
                    <Link to="/scan" className="btn btn-primary">Escanear</Link>
                </div>
            )}
        </div>
    );
};

export default RecipesPage;
