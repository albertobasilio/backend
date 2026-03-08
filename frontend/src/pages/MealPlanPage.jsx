import { useState, useEffect } from 'react';
import { mealPlanService, recipeService } from '../services/api';

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

            setShowCreate(false);
            setNewPlan({});
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remover este plano?')) return;
        try {
            await mealPlanService.delete(id);
            loadData();
        } catch (err) {
            console.error(err);
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
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1>📅 Plano Alimentar Semanal</h1>
                    <p>Organize suas refeições da semana</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                    {showCreate ? '✕ Cancelar' : '+ Novo Plano'}
                </button>
            </div>

            {/* Create new plan */}
            {showCreate && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>🗓️ Criar Plano Semanal</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                        Selecione receitas para cada refeição. Deixe vazio os dias que preferir.
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                        <div className="meal-grid">
                            {days.map(day => (
                                <div className="meal-day" key={day.key}>
                                    <div className="meal-day-header">{day.label}</div>
                                    {mealTypes.map(meal => (
                                        <div key={meal.key} style={{ marginBottom: 8 }}>
                                            <div className="meal-slot-label">{meal.emoji} {meal.label}</div>
                                            <select
                                                className="form-control"
                                                style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                                                value={newPlan[`${day.key}_${meal.key}`] || ''}
                                                onChange={e => handleSlotChange(day.key, meal.key, e.target.value)}
                                            >
                                                <option value="">— Vazio —</option>
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                        <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
                        <button className="btn btn-success" onClick={handleCreate} disabled={saving}>
                            {saving ? '⏳ Salvando...' : '✅ Criar Plano'}
                        </button>
                    </div>
                </div>
            )}

            {/* Existing plans */}
            {plans.length > 0 ? (
                plans.map(plan => (
                    <div className="card" key={plan.id} style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                                    Semana: {new Date(plan.week_start).toLocaleDateString('pt-MZ')} - {new Date(plan.week_end).toLocaleDateString('pt-MZ')}
                                </h3>
                                
                            </div>
                            <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(plan.id)} style={{ color: '#ff4757' }}>
                                🗑️ Remover
                            </button>
                        </div>

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
                                                    <div style={{ fontSize: '0.8rem', fontWeight: item ? 600 : 400, color: item ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                        {item?.recipe_title || item?.custom_meal || '—'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            ) : !showCreate && (
                <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>Nenhum plano criado</h3>
                    <p>Crie um plano alimentar semanal para organizar suas refeições e economizar dinheiro.</p>
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Criar Primeiro Plano</button>
                </div>
            )}
        </div>
    );
};

export default MealPlanPage;

