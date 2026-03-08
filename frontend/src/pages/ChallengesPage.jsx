import { useEffect, useState } from 'react';
import { challengeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Trophy, Target } from 'lucide-react';

const ChallengesPage = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState(null);
    const toast = useToast();

    const loadChallenges = async () => {
        setLoading(true);
        try {
            const res = await challengeService.getActive();
            setChallenges(res.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao carregar desafios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChallenges();
    }, []);

    const joinChallenge = async (id) => {
        setJoiningId(id);
        try {
            await challengeService.join(id);
            toast.success('Desafio ativado!');
            await loadChallenges();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao entrar no desafio.');
        } finally {
            setJoiningId(null);
        }
    };

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
                <span className="spinner-text">Carregando desafios...</span>
            </div>
        );
    }

    return (
        <div className="page-enter">
            <div className="page-header">
                <h1>Desafios Semanais</h1>
                <p>Pequenas metas para manter a consistência.</p>
            </div>

            {challenges.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏆</div>
                    <h3>Nenhum desafio ativo</h3>
                    <p>Volte mais tarde para novos desafios.</p>
                </div>
            ) : (
                <div className="card-grid">
                    {challenges.map((ch) => {
                        const percent = Math.min(100, Math.round((ch.progress / ch.target_value) * 100));
                        return (
                            <div key={ch.id} className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10, background: 'rgba(251,191,36,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fcd34d'
                                    }}>
                                        <Trophy size={18} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{ch.title}</h3>
                                        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                                            {ch.start_date} → {ch.end_date}
                                        </div>
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text-secondary)' }}>{ch.description}</p>

                                <div style={{ marginTop: 12, marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem' }}>
                                        <span><Target size={12} /> {ch.progress}/{ch.target_value}</span>
                                        <span>{percent}%</span>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, marginTop: 6 }}>
                                        <div style={{
                                            width: `${percent}%`,
                                            height: '100%',
                                            borderRadius: 999,
                                            background: percent >= 100 ? '#34d399' : 'var(--color-primary)',
                                            transition: 'width .3s ease'
                                        }} />
                                    </div>
                                </div>

                                {ch.reward_text && (
                                    <div className="info-pill" style={{ marginBottom: 10 }}>
                                        🎁 {ch.reward_text}
                                    </div>
                                )}

                                {ch.completed ? (
                                    <button className="btn btn-secondary" disabled style={{ width: '100%' }}>
                                        Concluído
                                    </button>
                                ) : ch.joined ? (
                                    <button className="btn btn-primary" disabled style={{ width: '100%' }}>
                                        Em andamento
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => joinChallenge(ch.id)}
                                        disabled={joiningId === ch.id}
                                    >
                                        {joiningId === ch.id ? 'Ativando...' : 'Participar'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChallengesPage;
