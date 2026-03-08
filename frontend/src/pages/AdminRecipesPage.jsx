import { useEffect, useState } from 'react';
import { adminService } from '../services/api';

const planOptions = ['free', 'basic', 'pro', 'premium'];

const AdminRecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [newRecipe, setNewRecipe] = useState({
        title: '',
        description: '',
        instructions: '',
        region: '',
        min_plan: 'free',
        is_regional_exclusive: false
    });

    const loadRecipes = async () => {
        setLoading(true);
        try {
            const res = await adminService.getRecipes();
            setRecipes(res.data || []);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erro ao carregar receitas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecipes();
    }, []);

    const startEdit = (recipe) => {
        setEditId(recipe.id);
        setEditData({
            title: recipe.title || '',
            description: recipe.description || '',
            instructions: recipe.instructions || '',
            region: recipe.region || '',
            min_plan: recipe.min_plan || 'free',
            is_regional_exclusive: !!recipe.is_regional_exclusive
        });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditData({});
    };

    const saveEdit = async (id) => {
        setMessage('');
        try {
            await adminService.updateRecipe(id, editData);
            setMessage('Receita atualizada com sucesso.');
            await loadRecipes();
            cancelEdit();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erro ao atualizar receita.');
        }
    };

    const deleteRecipe = async (id) => {
        if (!confirm('Remover receita?')) return;
        setMessage('');
        try {
            await adminService.deleteRecipe(id);
            setMessage('Receita removida.');
            await loadRecipes();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erro ao remover receita.');
        }
    };

    const createRecipe = async () => {
        setMessage('');
        if (!newRecipe.title || !newRecipe.instructions) {
            setMessage('Título e instruções são obrigatórios.');
            return;
        }
        try {
            await adminService.createRecipe(newRecipe);
            setMessage('Receita criada com sucesso.');
            setNewRecipe({
                title: '',
                description: '',
                instructions: '',
                region: '',
                min_plan: 'free',
                is_regional_exclusive: false
            });
            await loadRecipes();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erro ao criar receita.');
        }
    };

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
                <span className="spinner-text">Carregando receitas...</span>
            </div>
        );
    }

    return (
        <div className="page-enter">
            <div className="page-header">
                <h1>Admin: Conteúdo</h1>
                <p>Gerencie receitas e exclusividades regionais.</p>
            </div>

            {message && (
                <div className={`alert ${message.toLowerCase().includes('erro') ? 'alert-error' : 'alert-success'}`}>
                    {message}
                </div>
            )}

            <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 10 }}>Nova Receita</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                    <input
                        className="form-control"
                        placeholder="Título"
                        value={newRecipe.title}
                        onChange={e => setNewRecipe({ ...newRecipe, title: e.target.value })}
                    />
                    <input
                        className="form-control"
                        placeholder="Região"
                        value={newRecipe.region}
                        onChange={e => setNewRecipe({ ...newRecipe, region: e.target.value })}
                    />
                    <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Descrição"
                        value={newRecipe.description}
                        onChange={e => setNewRecipe({ ...newRecipe, description: e.target.value })}
                    />
                    <textarea
                        className="form-control"
                        rows={5}
                        placeholder="Instruções"
                        value={newRecipe.instructions}
                        onChange={e => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <select
                            className="form-control"
                            value={newRecipe.min_plan}
                            onChange={e => setNewRecipe({ ...newRecipe, min_plan: e.target.value })}
                        >
                            {planOptions.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={newRecipe.is_regional_exclusive}
                                onChange={e => setNewRecipe({ ...newRecipe, is_regional_exclusive: e.target.checked })}
                            />
                            Exclusiva regional
                        </label>
                    </div>
                    <button className="btn btn-primary" onClick={createRecipe}>Criar Receita</button>
                </div>
            </div>

            {editId && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 10 }}>Editar Receita</h3>
                    <div style={{ display: 'grid', gap: 10 }}>
                        <input
                            className="form-control"
                            placeholder="Título"
                            value={editData.title}
                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                        />
                        <input
                            className="form-control"
                            placeholder="Região"
                            value={editData.region}
                            onChange={e => setEditData({ ...editData, region: e.target.value })}
                        />
                        <textarea
                            className="form-control"
                            rows={3}
                            placeholder="Descrição"
                            value={editData.description}
                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                        />
                        <textarea
                            className="form-control"
                            rows={5}
                            placeholder="Instruções"
                            value={editData.instructions}
                            onChange={e => setEditData({ ...editData, instructions: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <select
                                className="form-control"
                                value={editData.min_plan}
                                onChange={e => setEditData({ ...editData, min_plan: e.target.value })}
                            >
                                {planOptions.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={!!editData.is_regional_exclusive}
                                    onChange={e => setEditData({ ...editData, is_regional_exclusive: e.target.checked })}
                                />
                                Exclusiva regional
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-primary" onClick={() => saveEdit(editId)}>Salvar</button>
                            <button className="btn btn-secondary" onClick={cancelEdit}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '10px 8px' }}>Título</th>
                            <th style={{ padding: '10px 8px' }}>Região</th>
                            <th style={{ padding: '10px 8px' }}>Plano</th>
                            <th style={{ padding: '10px 8px' }}>Exclusiva</th>
                            <th style={{ padding: '10px 8px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipes.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '10px 8px' }}>
                                    {editId === r.id ? (
                                        <input
                                            className="form-control"
                                            value={editData.title}
                                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                                        />
                                    ) : r.title}
                                </td>
                                <td style={{ padding: '10px 8px' }}>
                                    {editId === r.id ? (
                                        <input
                                            className="form-control"
                                            value={editData.region}
                                            onChange={e => setEditData({ ...editData, region: e.target.value })}
                                        />
                                    ) : (r.region || '-')}
                                </td>
                                <td style={{ padding: '10px 8px' }}>
                                    {editId === r.id ? (
                                        <select
                                            className="form-control"
                                            value={editData.min_plan}
                                            onChange={e => setEditData({ ...editData, min_plan: e.target.value })}
                                        >
                                            {planOptions.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    ) : (r.min_plan || 'free')}
                                </td>
                                <td style={{ padding: '10px 8px' }}>
                                    {editId === r.id ? (
                                        <input
                                            type="checkbox"
                                            checked={!!editData.is_regional_exclusive}
                                            onChange={e => setEditData({ ...editData, is_regional_exclusive: e.target.checked })}
                                        />
                                    ) : (r.is_regional_exclusive ? 'Sim' : 'Não')}
                                </td>
                                <td style={{ padding: '10px 8px', display: 'flex', gap: 6 }}>
                                    {editId === r.id ? (
                                        <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancelar</button>
                                    ) : (
                                        <>
                                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(r)}>Editar</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => deleteRecipe(r.id)} style={{ color: '#f87171' }}>Excluir</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRecipesPage;
