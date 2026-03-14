import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaWhatsapp, FaRobot, FaCamera, FaStar, FaArrowLeft, FaGem, FaCrown } from 'react-icons/fa';

const PlansPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const plans = [
        {
            id: 'free',
            name: 'Gratuito',
            price: '0 MT',
            scans: 1,
            accessLevel: 'Essencial',
            features: ['1 scan/dia', 'Deteção básica', 'Receitas rápidas'],
            color: 'rgba(255, 255, 255, 0.03)',
            iconColor: 'var(--text-secondary)',
            buttonClass: 'btn-secondary',
            icon: <FaCamera size={18} />
        },
        {
            id: 'basic',
            name: 'Básico',
            price: '55 MT',
            period: '/mês',
            scans: 5,
            accessLevel: 'Organizador',
            features: ['5 scans/dia', 'Histórico completo', 'Plano semanal'],
            color: 'rgba(52, 211, 153, 0.05)',
            iconColor: 'var(--color-primary)',
            buttonClass: 'btn-primary',
            icon: <FaRobot size={18} />
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '199 MT',
            period: '/mês',
            scans: 10,
            accessLevel: 'Inteligente',
            features: ['10 scans/dia', 'Nutrição detalhada', 'Lista automática'],
            color: 'rgba(59, 130, 246, 0.08)',
            iconColor: '#60a5fa',
            buttonClass: 'btn-primary',
            isPopular: true,
            icon: <FaGem size={18} />
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '500 MT',
            period: '/mês',
            scans: 20,
            accessLevel: 'Master Chef',
            features: ['20 scans/dia', 'Suporte Prioritário', 'Dicas exclusivas'],
            color: 'rgba(168, 85, 247, 0.08)',
            iconColor: '#a78bfa',
            buttonClass: 'btn-primary',
            icon: <FaCrown size={18} />
        }
    ];

    const handleSubscribe = (plan) => {
        if (plan.id === 'free') {
            if (user) navigate('/');
            else navigate('/register');
            return;
        }
        const message = `Olá! Quero ativar o plano *${plan.name}* (Valor: ${plan.price}).`;
        const url = `https://wa.me/258848546384?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="page-enter" style={{ paddingBottom: 60 }}>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingTop: 10 }}>
                    <button 
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: '12px', width: 40, height: 40, padding: 0 }}
                    >
                        <FaArrowLeft size={14} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Planos SI</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Escolha a sua experiência</p>
                    </div>
                </div>

                <div className="plans-container" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                background: plan.color,
                                border: plan.isPopular ? '1px solid var(--color-primary)' : '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {plan.isPopular && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    background: 'var(--color-primary)',
                                    color: '#064e3b',
                                    padding: '2px 10px',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    borderBottomLeftRadius: '10px',
                                    textTransform: 'uppercase'
                                }}>
                                    Popular
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: '12px', 
                                    background: 'rgba(255,255,255,0.05)', color: plan.iconColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    {plan.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>{plan.name}</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                        {plan.features.map((f, i) => (
                                            <span key={i} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <FaCheck size={8} color="var(--color-primary)" /> {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '90px' }}>
                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    className={`btn ${plan.buttonClass} btn-sm`}
                                    style={{ marginTop: '8px', width: '100%', fontSize: '0.75rem', height: '32px' }}
                                >
                                    {plan.id === 'free' ? 'Ativar' : 'Aderir'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ marginTop: 40, textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        Todos os planos incluem suporte técnico e atualizações de IA. <br/>
                        <b>Desenvolvido por Mr Beto (basilio.infomidia.co.mz)</b>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlansPage;
