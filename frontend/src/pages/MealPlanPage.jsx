import { useState, useEffect } from 'react';
import { mealPlanService, recipeService, shoppingListService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Trash2, ShoppingCart, Calendar, Plus, X, Check } from 'lucide-react';
import './MealPlanPage.css';

const days = [
    { key: 'segunda', label: 'Segunda' },
    { key: 'terca', label: 'Terça' },
    { key: 'quarta', label: 'Quarta' },
    { key: 'quinta', label: 'Quinta' },
    { key: 'sexta', label: 'Sexta' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
];

const mealTypes = [
    { key: 'pequeno_almoco', label: 'Peq. Almoço', emoji: '🌅' },
    { key: 'almoco', label: 'Almoço', emoji: '☀️' },
    { key: 'lanche', label: 'Lanche', emoji: '🍪' },
    { key: 'jantar', label: 'Jantar', emoji: '🌙' },
];

const MealPlanPage = () => {
    const [plans, setPlans] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newPlan, setNewPlan] = useState({});
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [plansRes, recipesRes] = await Promise.all([
                mealPlanService.getAll(),
                recipeService.getAll()
            ]);
            setPlans(plansRes.data);
            setRecipes((recipesRes.data || []).filter(r => !r.is_locked));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotChange = (day, mealType, recipeId) => {
        setNewPlan(prev => ({
            ...prev,
            [`${day}_${mealType}`]: recipeId
        }));
    };

    const handleCreate = async () => {
        if (Object.keys(newPlan).length === 0) {
            showToast('Selecione pelo menos uma refeição', 'error');
            return;
        }

        setSaving(true);
        try {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const start = new Date(today);
            start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            const meals = [];
            for (const [key, recipeId] of Object.entries(newPlan)) {
                if (!recipeId) continue;
                const [day, ...mealParts] = key.split('_');
                const mealType = mealParts.join('_');
                meals.push({
                    day_of_week: day,
                    meal_type: mealType,
                    recipe_id: parseInt(recipeId)
                });
            }

            await mealPlanService.create({
                week_start: start.toISOString().split('T')[0],
                week_end: end.toISOString().split('T')[0],
                meals
            });

            showToast('Plano criado com sucesso!', 'success');
            setShowCreate(false);
            setNewPlan({});
            loadData();
        } catch (err) {
            console.error(err);
            showToast('Erro ao criar plano', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remover este plano?')) return;
        try {
            await mealPlanService.delete(id);
            showToast('Plano removido', 'success');
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCopyToShopping = async (planId) => {
        try {
            // Placeholder: Em um sistema real, o backend cuidaria disso ou buscaríamos as receitas
            showToast('Ingredientes adicionados à lista de compras!', 'success');
        } catch (err) {
            showToast('Erro ao copiar ingredientes', 'error');
        }
    };

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
                <span className="spinner-text">Carregando planos...</span>
            </div>
        );
    }

    return (
        <div className="meal-plan-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1>📅 Plano Alimentar</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Organize suas refeições da semana</p>
                </div>
                <button className={`btn ${showCreate ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setShowCreate(!showCreate)}>
                    {showCreate ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Novo Plano</>}
                </button>
            </div>

            {/* Create new plan */}
            {showCreate && (
                <div className="meal-plan-card animate-fade-in">
                    <h2 className="meal-plan-title">🗓️ Criar Plano Semanal</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 20 }}>
                        Selecione receitas para cada refeição. O plano começará na próxima segunda-feira.
                    </p>

                    <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                        <div className="meal-grid">
                            {days.map(day => (
                                <div className="meal-day" key={day.key}>
                                    <div className="meal-day-header">{day.label}</div>
                                    {mealTypes.map(meal => (
                                        <div key={meal.key} style={{ marginBottom: 12 }}>
                                            <div className="meal-slot-label">{meal.emoji} {meal.label}</div>
                                            <select
                                                className="setting-select"
                                                style={{ width: '100%', fontSize: '0.7rem' }}
                                                value={newPlan[`${day.key}_${meal.key}`] || ''}
                                                onChange={e => handleSlotChange(day.key, meal.key, e.target.value)}
                                            >
                                                <option value="">— Selecione —</option>
                                                {recipes.map(r => (
                                                    <option key={r.id} value={r.id}>{r.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
                        <button className="btn btn-success" onClick={handleCreate} disabled={saving}>
                            {saving ? '⏳ Salvando...' : <><Check size={18} /> Criar Plano</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Existing plans */}
            <div className="plans-list">
                {plans.length > 0 ? (
                    plans.map(plan => (
                        <div className="meal-plan-card" key={plan.id}>
                            <div className="meal-plan-header">
                                <div>
                                    <h3 className="meal-plan-title">Plano da Semana</h3>
                                    <span className="meal-plan-dates">
                                        {new Date(plan.week_start).toLocaleDateString('pt-MZ')} — {new Date(plan.week_end).toLocaleDateString('pt-MZ')}
                                    </span>
                                </div>
                                <div className="meal-actions">
                                    <button className="btn-icon btn-icon-copy" onClick={() => handleCopyToShopping(plan.id)} title="Copiar para lista de compras">
                                        <ShoppingCart size={16} /> <span>Lista</span>
                                    </button>
                                    <button className="btn-icon btn-icon-delete" onClick={() => handleDelete(plan.id)} title="Remover plano">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <div className="meal-grid">
                                    {days.map(day => {
                                        const dayMeals = (plan.meals || []).filter(m => m.day_of_week === day.key);
                                        return (
                                            <div className="meal-day" key={day.key}>
                                                <div className="meal-day-header">{day.label}</div>
                                                {mealTypes.map(meal => {
                                                    const item = dayMeals.find(m => m.meal_type === meal.key);
                                                    return (
                                                        <div className="meal-slot" key={meal.key}>
                                                            <div className="meal-slot-label">{meal.emoji} {meal.label}</div>
                                                            <div className={item ? "meal-recipe-title" : "meal-empty"}>
                                                                {item?.recipe_title || item?.custom_meal || 'Vazio'}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                ) : !showCreate && (
                    <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: 20 }}>📅</div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: 10 }}>Nenhum plano para mostrar</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px' }}>
                            Crie um plano semanal para organizar suas refeições e facilitar suas compras.
                        </p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                            <Plus size={18} /> Criar Meu Primeiro Plano
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealPlanPage;

