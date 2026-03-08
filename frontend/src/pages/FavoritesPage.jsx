import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService } from '../services/api';
import { useToast } from '../context/ToastContext';

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const res = await favoriteService.getAll();
            setFavorites(res.data);
        } catch (err) {
            toast.error('Erro ao carregar favoritos.');
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (recipeId) => {
        try {
            await favoriteService.remove(recipeId);
            setFavorites(prev => prev.filter(f => f.id !== recipeId));
            toast.success('Removido dos favoritos');
        } catch (err) {
            toast.error('Erro ao remover favorito.');
        }
    };

    if (loading) {
        return (
            <div className="page-enter">
                <div className="page-header">
                    <h1>❤️ Meus Favoritos</h1>
                    <p>As suas receitas favoritas guardadas</p>
                </div>
                <div className="card-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card skeleton-card" style={{ height: 180 }}>
                            <div className="skeleton-line" style={{ width: '60%', height: 18 }} />
                            <div className="skeleton-line" style={{ width: '100%', height: 12, marginTop: 12 }} />
                            <div className="skeleton-line" style={{ width: '80%', height: 12, marginTop: 8 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter">
            <div className="page-header">
                <h1>❤️ Meus Favoritos</h1>
                <p>{favorites.length} {favorites.length === 1 ? 'receita guardada' : 'receitas guardadas'}</p>
            </div>

            {favorites.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💔</div>
                    <h3>Sem favoritos ainda</h3>
                    <p>Explore receitas e toque no ❤️ para guardar aqui</p>
                    <Link to="/recipes" className="btn btn-primary">🍲 Ver Receitas</Link>
                </div>
            ) : (
                <div className="card-grid">
                    {favorites.map(recipe => {
                        const CardWrapper = recipe.is_locked ? 'div' : Link;
                        const wrapperProps = recipe.is_locked
                            ? { style: { textDecoration: 'none', color: 'inherit', cursor: 'not-allowed' } }
                            : { to: `/recipes/${recipe.id}`, style: { textDecoration: 'none', color: 'inherit' } };
                        return (
                        <div key={recipe.id} className="card" style={{ position: 'relative', opacity: recipe.is_locked ? 0.7 : 1 }}>
                            <button
                                onClick={() => removeFavorite(recipe.id)}
                                className="favorite-btn active"
                                style={{ position: 'absolute', top: 12, right: 12 }}
                                title="Remover dos favoritos"
                            >
                                ❤️
                            </button>

                            <CardWrapper {...wrapperProps}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, paddingRight: 40 }}>
                                    {recipe.title}
                                </h3>
                                <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                                    {recipe.description}
                                </p>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <span className="info-pill">⏱ {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)}min</span>
                                    <span className="info-pill">🔥 {recipe.calories || 0}kcal</span>
                                    {recipe.region && <span className="info-pill">📍 {recipe.region}</span>}
                                    {recipe.is_locked && <span className="info-pill">🔒 Bloqueado</span>}
                                </div>
                            </CardWrapper>

                            {recipe.favorited_at && (
                                <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: 10 }}>
                                    Guardada em {new Date(recipe.favorited_at).toLocaleDateString('pt-MZ')}
                                </p>
                            )}
                        </div>
                    );})}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
