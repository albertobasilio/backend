import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeService, favoriteService, aiService, feedbackService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Star, MessageSquare, Send, Clock, Users, MapPin, Share2, Heart, ChevronLeft } from 'lucide-react';

const RecipeDetailPage = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [enriching, setEnriching] = useState(false);
    const [locked, setLocked] = useState(false);
    const [lockedMessage, setLockedMessage] = useState('');
    
    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average: 0, total: 0 });
    const [myRating, setMyRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const toast = useToast();

    useEffect(() => {
        loadRecipe();
        loadReviews();
    }, [id]);

    const loadRecipe = async () => {
        try {
            const [recipeRes, favRes] = await Promise.allSettled([
                recipeService.getById(id),
                favoriteService.check(id)
            ]);
            if (recipeRes.status === 'fulfilled') {
                setRecipe(recipeRes.value.data);
            } else {
                const status = recipeRes.reason?.response?.status;
                if (status === 403) {
                    setLocked(true);
                    setLockedMessage(recipeRes.reason?.response?.data?.message || 'Receita disponível apenas em planos superiores.');
                }
            }
            if (favRes.status === 'fulfilled') setIsFavorite(favRes.value.data?.is_favorite || false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            const res = await feedbackService.getRecipeReviews(id);
            setReviews(res.data.reviews || []);
            setStats(res.data.stats || { average: 0, total: 0 });
        } catch (err) {
            console.error('Error loading reviews:', err);
        }
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        if (myRating === 0) return toast.error('Selecione uma classificação');
        setSubmittingReview(true);
        try {
            await feedbackService.submitRecipeReview({
                recipe_id: id,
                rating: myRating,
                comment: myComment
            });
            toast.success('Avaliação enviada! Obrigado.');
            setMyComment('');
            setMyRating(0);
            loadReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao enviar avaliação');
        } finally {
            setSubmittingReview(false);
        }
    };

    const toggleFavorite = async () => {
        setFavLoading(true);
        try {
            if (isFavorite) {
                await favoriteService.remove(id);
                setIsFavorite(false);
                toast.success('Removido dos favoritos');
            } else {
                await favoriteService.add(id);
                setIsFavorite(true);
                toast.success('Adicionado aos favoritos! ❤️');
            }
        } catch (err) {
            toast.error('Erro ao atualizar favorito');
        } finally {
            setFavLoading(false);
        }
    };

    const shareWhatsApp = () => {
        const url = `${window.location.origin}/recipes/public/${id}`;
        const text = `🍲 Confere esta receita moçambicana: *${recipe?.title}*\n\n${recipe?.description}\n\n👉 ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const copyLink = async () => {
        const url = `${window.location.origin}/recipes/public/${id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copiado! 📋');
        } catch {
            toast.error('Erro ao copiar');
        }
    };

    const enrichRecipe = async () => {
        setEnriching(true);
        try {
            const ingredientNames = (recipe.ingredients || []).map(i => i.ingredient_name || i.name).filter(Boolean);
            const res = await aiService.enrichInstructions({
                title: recipe.title,
                description: recipe.description,
                ingredients: ingredientNames,
                current_instructions: recipe.instructions
            });
            if (res.data && res.data.instructions) {
                setRecipe(prev => ({ ...prev, instructions: res.data.instructions }));
                toast.success('Instruções detalhadas geradas com sucesso! ✨');
            } else {
                toast.error('Não foi possível gerar instruções detalhadas.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao detalhar receita com IA.');
        } finally {
            setEnriching(false);
        }
    };

    const getRecipeImage = (recipe) => {
        if (recipe?.image_url && recipe.image_url.startsWith('http')) return recipe.image_url;
        
        const foodImages = [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80',
            'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=500&q=80',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
            'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&q=80',
        ];
        
        const index = parseInt(id) || 0;
        return foodImages[index % foodImages.length];
    };

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
                <span className="spinner-text">Carregando receita...</span>
            </div>
        );
    }

    if (!recipe) {
        if (locked) {
            return (
                <div className="empty-state">
                    <div className="empty-icon">🔒</div>
                    <h3>Receita bloqueada</h3>
                    <p>{lockedMessage}</p>
                    <Link to="/plans" className="btn btn-primary">Ver Planos</Link>
                </div>
            );
        }
        return (
            <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>Receita não encontrada</h3>
                <Link to="/recipes" className="btn btn-primary">← Voltar às Receitas</Link>
            </div>
        );
    }

    const tags = typeof recipe.tags === 'string' ? JSON.parse(recipe.tags || '[]') : (recipe.tags || []);

    return (
        <div className="page-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Link to="/recipes" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <ChevronLeft size={16} /> Voltar às receitas
                </Link>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={toggleFavorite}
                        disabled={favLoading}
                        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                        <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button className="share-btn" onClick={shareWhatsApp} title="Partilhar no WhatsApp">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 200, height: 200, borderRadius: 'var(--radius-lg)',
                        background: '#1a1a1a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden', position: 'relative'
                    }}>
                        <img
                            src={getRecipeImage(recipe)}
                            alt={recipe.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { 
                                e.target.src = 'https://images.unsplash.com/photo-1495195129352-aec325a55b65?w=500&q=80'; 
                            }}
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: 250 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>{recipe.title}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <div style={{ display: 'flex', color: 'var(--color-accent)' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={14} fill={s <= Math.round(stats.average) ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        {stats.average.toFixed(1)} ({stats.total} avaliações)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{recipe.description}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                                <Clock size={16} className="text-primary" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)} min</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tempo total</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                                <Users size={16} className="text-primary" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{recipe.servings} porções</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rendimento</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                                <MapPin size={16} className="text-primary" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{recipe.region || 'Nacional'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Região</div>
                                </div>
                            </div>
                        </div>

                        {tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {tags.map((tag, i) => (
                                    <span key={i} style={{
                                        padding: '4px 12px', background: 'rgba(52, 211, 153, 0.1)',
                                        color: 'var(--color-primary-light)', borderRadius: 'var(--radius-xl)',
                                        fontSize: '0.75rem', fontWeight: 600
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="recipe-detail-grid">
                {/* Left: Ingredients */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MessageSquare size={18} className="text-primary" /> Produtos Necessários
                    </h2>
                    {(recipe.ingredients || []).length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                                    borderBottom: '1px solid var(--border)'
                                }}>
                                    <span style={{ fontSize: '1.1rem' }}>{ing.emoji || '🥘'}</span>
                                    <span style={{ flex: 1, fontSize: '0.9rem' }}>{ing.ingredient_name || ing.name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {ing.quantity} {ing.unit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Produtos não detalhados.</p>
                    )}
                </div>

                {/* Right: Nutrition */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>📊 Informação Nutricional</h2>
                    {[
                        { label: 'Calorias', value: recipe.calories, unit: 'kcal', color: '#34d399' },
                        { label: 'Proteínas', value: recipe.protein, unit: 'g', color: '#60a5fa' },
                        { label: 'Carbos', value: recipe.carbs, unit: 'g', color: '#fbbf24' },
                        { label: 'Gorduras', value: recipe.fat, unit: 'g', color: '#f87171' }
                    ].map(n => (
                        <div key={n.label} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                                <span>{n.label}</span>
                                <span style={{ fontWeight: 600 }}>{n.value || 0}{n.unit}</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: `${Math.min((n.value || 0) / (n.label === 'Calorias' ? 8 : 0.5), 100)}%`, 
                                    background: n.color,
                                    borderRadius: 3
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Instructions */}
            <div className="card" style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>👨‍🍳 Modo de Preparo</h2>
                    <button className="btn btn-secondary btn-sm" onClick={enrichRecipe} disabled={enriching}>
                        {enriching ? 'Processando...' : '✨ Detalhar com IA'}
                    </button>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    {recipe.instructions}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="card" style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={18} className="text-accent" fill="var(--color-accent)" /> 
                    Avaliações e Feedback
                </h2>
                
                {/* Submit Review Form */}
                <div style={{ marginBottom: 32, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>O que achou desta receita?</h3>
                    <form onSubmit={handleRatingSubmit}>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setMyRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    style={{ 
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                        color: star <= (hoverRating || myRating) ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Star size={28} fill={star <= (hoverRating || myRating) ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <textarea
                                className="form-control"
                                placeholder="Conte-nos a sua experiência... (opcional)"
                                value={myComment}
                                onChange={e => setMyComment(e.target.value)}
                                style={{ 
                                    marginBottom: 16, minHeight: 100, fontSize: '0.9rem', 
                                    padding: '12px', background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '12px'
                                }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%', borderRadius: '12px' }}
                            disabled={submittingReview || myRating === 0}
                        >
                            {submittingReview ? (
                                <span className="spinner" style={{ width: 18, height: 18 }} />
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Send size={16} /> Publicar Avaliação
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {reviews.length > 0 ? reviews.map((rev, i) => (
                        <div key={i} className="animate-fadeInUp" style={{ 
                            padding: '16px', background: 'rgba(255,255,255,0.01)', 
                            borderRadius: '16px', border: '1px solid var(--border)' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ 
                                        width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: '#064e3b'
                                    }}>
                                        {rev.user_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.user_name || 'Utilizador'}</span>
                                </div>
                                <div style={{ display: 'flex', color: 'var(--color-accent)' }}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={12} fill={s <= rev.rating ? 'currentColor' : 'none'} />
                                    ))}
                                </div>
                            </div>
                            {rev.comment && (
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                                    {rev.comment}
                                </p>
                            )}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} /> {new Date(rev.created_at).toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long' })}
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                            <MessageSquare size={40} style={{ marginBottom: 12 }} />
                            <p style={{ fontSize: '0.9rem' }}>Ainda não há avaliações. Seja o primeiro!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailPage;
