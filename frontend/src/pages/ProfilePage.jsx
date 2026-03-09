import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, ShieldCheck, 
    Settings, Save, HeartPulse, AlertCircle,
    ChevronRight, Gem, Star, Crown
} from 'lucide-react';

const dietaryOptions = [
    { key: 'gluten_free', label: 'Sem Glúten', emoji: '🌾' },
    { key: 'vegan', label: 'Vegano', emoji: '🌱' },
    { key: 'vegetarian', label: 'Vegetariano', emoji: '🥬' },
    { key: 'low_sugar', label: 'Baixo Açúcar', emoji: '🍬' },
    { key: 'diabetic', label: 'Diabético', emoji: '💉' },
    { key: 'child_diet', label: 'Criança', emoji: '👶' },
    { key: 'athlete', label: 'Atleta', emoji: '🏃' },
    { key: 'elderly', label: 'Idoso', emoji: '👴' },
    { key: 'pregnant', label: 'Gestante', emoji: '🤰' },
];

const regions = ['Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'];

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({ name: '', phone: '', region: 'Maputo' });
    const [dietary, setDietary] = useState({});
    const [allergies, setAllergies] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await authService.getProfile();
            const userData = res.data.user;
            const dp = res.data.dietaryProfile || {};
            setProfile({ name: userData.name, phone: userData.phone || '', region: userData.region || 'Maputo' });
            setDietary(dp);
            setAllergies(dp.allergies || '');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleDietary = (key) => {
        setDietary(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await authService.updateProfile(profile);
            await authService.updateDietaryProfile({
                ...dietary,
                allergies,
            });
            updateUser({ ...user, ...profile });
            setMessage('Perfil atualizado com sucesso! ✅');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Erro ao salvar perfil. ❌');
        } finally {
            setSaving(false);
        }
    };

    const getPlanBadge = () => {
        const plan = user?.plan || 'free';
        switch(plan) {
            case 'premium': return { icon: <Crown size={14} />, label: 'Premium', color: '#fcd34d', bg: 'rgba(251, 191, 36, 0.15)' };
            case 'pro': return { icon: <Gem size={14} />, label: 'Pro', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' };
            case 'basic': return { icon: <Star size={14} />, label: 'Básico', color: 'var(--color-primary)', bg: 'rgba(52, 211, 153, 0.15)' };
            default: return { icon: <ShieldCheck size={14} />, label: 'Gratuito', color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };
        }
    };

    const badge = getPlanBadge();

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
                <span className="spinner-text">A carregar o seu mundo...</span>
            </div>
        );
    }

    return (
        <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 100 }}>
            
            {/* Header Hero */}
            <div style={{ 
                background: 'var(--gradient-hero)', 
                borderRadius: '24px', 
                padding: '32px 24px', 
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(52, 211, 153, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '24px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.2rem', fontWeight: 800, color: 'white',
                        border: '2px solid rgba(255,255,255,0.2)'
                    }}>
                        {profile.name?.[0] || 'U'}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>{profile.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ 
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '4px 12px', borderRadius: '12px',
                                background: badge.bg, color: badge.color,
                                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                                {badge.icon} {badge.label}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{user?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}
                    style={{ marginBottom: 20 }}
                >
                    {message}
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                
                {/* Informações Pessoais */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <Settings size={20} color="var(--color-primary)" />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Configurações da Conta</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={14} /> Nome Completo
                            </label>
                            <input type="text" className="form-control" value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Phone size={14} /> Contacto
                            </label>
                            <input type="tel" className="form-control" placeholder="+258 84 xxx xxxx" value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin size={14} /> Província
                            </label>
                            <select className="form-control" value={profile.region}
                                onChange={e => setProfile({ ...profile, region: e.target.value })}>
                                {regions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Perfil Alimentar */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <HeartPulse size={20} color="#f87171" />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inteligência Alimentar</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                        A IA usará estas preferências para sugerir receitas e planos nutricionais.
                    </p>

                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '10px', 
                        marginBottom: 24,
                        padding: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px solid var(--border)'
                    }}>
                        {dietaryOptions.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => toggleDietary(opt.key)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    border: dietary[opt.key] ? '1px solid var(--color-primary)' : '1px solid var(--border)',
                                    background: dietary[opt.key] ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255,255,255,0.03)',
                                    color: dietary[opt.key] ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{opt.emoji}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertCircle size={14} /> Alergias ou Observações
                        </label>
                        <textarea
                            className="form-control"
                            placeholder="Ex: Alergia a amendoim, intolerância a lactose..."
                            value={allergies}
                            onChange={e => setAllergies(e.target.value)}
                            rows={3}
                            style={{ resize: 'none' }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div style={{ 
                marginTop: 32, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20 
            }}>
                <button 
                    className="btn btn-primary btn-lg" 
                    onClick={handleSave} 
                    disabled={saving}
                    style={{ 
                        width: '100%', 
                        maxWidth: '300px', 
                        height: '56px', 
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(52, 211, 153, 0.2)'
                    }}
                >
                    {saving ? (
                        <span className="spinner" style={{ width: 20, height: 20 }}></span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Save size={20} /> Guardar Alterações
                        </span>
                    )}
                </button>

                <div style={{ textAlign: 'center', opacity: 0.5 }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Desenvolvido por Mr Beto (basilio.infomidia.co.mz) • SI MZ v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
