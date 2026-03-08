import { useEffect, useState } from 'react';
import { adminService } from '../services/api';

const AdminDashboardPage = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await adminService.getMetrics();
                setMetrics(res.data);
            } catch {
                setMetrics(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
                <span className="spinner-text">Carregando métricas...</span>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Sem dados</h3>
                <p>Não foi possível carregar as métricas.</p>
            </div>
        );
    }

    return (
        <div className="page-enter">
            <div className="page-header">
                <h1>Admin: Métricas</h1>
                <p>Visão geral do uso da plataforma (últimos 7 dias).</p>
            </div>

            <div className="card-grid">
                <div className="card">
                    <h3>Utilizadores</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{metrics.users_total}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>+{metrics.users_new_7d} novos/7 dias</p>
                </div>
                <div className="card">
                    <h3>Scans</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{metrics.scans_7d}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>últimos 7 dias</p>
                </div>
                <div className="card">
                    <h3>Ativos</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{metrics.active_users_7d}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>utilizadores ativos/7 dias</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                <div className="card">
                    <h3 style={{ marginBottom: 10 }}>Planos</h3>
                    {metrics.plans?.length ? (
                        metrics.plans.map(p => (
                            <div key={p.plan} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                                <span>{p.plan}</span>
                                <strong>{p.total}</strong>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>Sem dados.</p>
                    )}
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: 10 }}>Top Receitas (Favoritos)</h3>
                    {metrics.top_recipes?.length ? (
                        metrics.top_recipes.map(r => (
                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                                <span>{r.title}</span>
                                <strong>{r.favorites}</strong>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>Sem dados.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
