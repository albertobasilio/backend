import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import { Search, Clock, Flame, MapPin } from 'lucide-react';

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

    const filtered = recipes.filter(r => {
        const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase());
        const matchRegion = !region || r.region === region;
        return matchSearch && matchRegion;
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
                        const CardWrapper = recipe.is_locked ? 'div' : Link;
                        const wrapperProps = recipe.is_locked
                            ? { key: recipe.id, style: { textDecoration: 'none', color: 'inherit', cursor: 'not-allowed' } }
                            : { key: recipe.id, to: `/recipes/${recipe.id}`, style: { textDecoration: 'none', color: 'inherit' } };
                        return (
                        <CardWrapper {...wrapperProps}>
                            <div className={`recipe-card ${getDifficultyClass(recipe.difficulty)} animate-fadeInUp stagger-${Math.min(idx + 1, 6)}`} style={recipe.is_locked ? { opacity: 0.7 } : null}>
                                {recipe.image_url && (
                                    <div className="recipe-card-image" style={{ width: '100%', height: 160, overflow: 'hidden' }}>
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
                                        {recipe.difficulty && (
                                            <span className="recipe-badge difficulty">{getDifficultyLabel(recipe.difficulty)}</span>
                                        )}
                                        {recipe.is_locked && (
                                            <span className="recipe-badge difficulty">Bloqueado</span>
                                        )}
                                        {recipe.is_regional_exclusive && (
                                            <span className="recipe-badge region">Exclusiva</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardWrapper>
                    );})}
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
