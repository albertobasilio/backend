import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaWhatsapp, FaRobot, FaCamera, FaStar } from 'react-icons/fa';

const PlansPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const plans = [
        {
            id: 'free',
            name: 'Teste Gratis',
            price: '0 MT',
            scans: 1,
            accessLevel: 'Nivel Inicial',
            headline: 'Entrada para testar o sistema com recursos limitados',
            features: [
                '1 scan por dia para testar a experiencia',
                'Modo "o que tenho em casa" com lista manual',
                'Nao inclui historico de scans, favoritos e plano semanal',
                'Nao inclui nutricao nem lista de compras'
            ],
            color: 'rgba(255, 255, 255, 0.05)',
            iconColor: 'var(--text-secondary)',
            buttonClass: 'btn-secondary',
            icon: <FaCamera size={24} />
        },
        {
            id: 'basic',
            name: 'Basico',
            price: '55 MT',
            period: '/mes',
            scans: 5,
            accessLevel: 'Nivel Pago 1',
            headline: 'Para quem usa com frequencia e quer organizar a rotina',
            features: [
                '5 scans por dia para manter constancia',
                'Historico de scans e favoritos para nao perder ideias',
                'Inclui plano semanal, mas ainda sem nutricao e lista de compras',
                'Desafios semanais para manter consistencia'
            ],
            color: 'rgba(52, 211, 153, 0.1)',
            iconColor: 'var(--color-primary)',
            buttonClass: 'btn-primary',
            isPopular: false,
            icon: <FaRobot size={24} />
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '199 MT',
            period: '/mes',
            scans: 8,
            accessLevel: 'Nivel Pago 2',
            headline: 'Plano completo para decisao inteligente no dia a dia',
            features: [
                '8 scans por dia para rotina intensa',
                'Tudo do Basico sem as limitacoes de nutricao e compras',
                'Nutricao detalhada e lista de compras inteligente por refeicao',
                'Receitas regionais exclusivas (selecionadas)'
            ],
            color: 'rgba(59, 130, 246, 0.15)',
            iconColor: '#60a5fa',
            buttonClass: 'btn-primary',
            isPopular: true,
            icon: <FaStar size={24} />
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '500 MT',
            period: '/mes',
            scans: 20,
            accessLevel: 'Nivel Pago 3',
            headline: 'Maximo desempenho para familias e uso profissional',
            features: [
                '20 scans por dia para liberdade total',
                'Tudo do Pro com folga para uso intensivo',
                'Receitas regionais exclusivas e conteudos premium',
                'Prioridade maxima no suporte e acesso antecipado a novidades'
            ],
            color: 'rgba(168, 85, 247, 0.15)',
            iconColor: '#a78bfa',
            buttonClass: 'btn-primary',
            isPopular: false,
            icon: <FaStar size={24} color="#fcd34d" />
        }
    ];

    const handleSubscribe = (plan) => {
        if (plan.id === 'free') {
            if (user) {
                navigate('/');
            } else {
                navigate('/register');
            }
            return;
        }

        const message = `Ola, gostaria de subscrever ao plano ${plan.name} do Sabor Inteligente por ${plan.price}.`;
        const url = `https://wa.me/258848546384?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="page-enter">
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40, paddingTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
                            Voltar
                        </button>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: 16 }}
                    >
                        Escolha o seu plano
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 720, margin: '0 auto' }}
                    >
                        Escolha o plano ideal para sua rotina e desbloqueie mais scans, recursos e produtividade na cozinha.
                    </motion.p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 20,
                    paddingBottom: 40
                }}>
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                border: plan.isPopular ? '2px solid var(--color-primary)' : '1px solid var(--border)',
                                transform: plan.isPopular ? 'scale(1.05)' : 'none',
                                zIndex: plan.isPopular ? 10 : 1,
                                background: plan.color,
                                padding: 0,
                                overflow: 'hidden'
                            }}
                        >
                            {plan.isPopular && (
                                <div style={{
                                    background: 'var(--color-primary)',
                                    color: '#064e3b',
                                    fontSize: '.75rem',
                                    fontWeight: 700,
                                    padding: '4px 12px',
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    borderBottomLeftRadius: 10,
                                    textTransform: 'uppercase'
                                }}>
                                    Mais Popular
                                </div>
                            )}

                            <div style={{ padding: 24, paddingBottom: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>{plan.name}</h3>
                                    <div style={{
                                        padding: 10,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: plan.iconColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {plan.icon}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 8 }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{plan.price}</span>
                                    {plan.period && <span style={{ marginLeft: 4, fontSize: '1rem', color: 'var(--text-secondary)' }}>{plan.period}</span>}
                                </div>
                                <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    {plan.scans} {plan.scans === 1 ? 'scan por dia' : 'scans por dia'}
                                </p>
                                <p style={{ fontSize: '.8rem', color: 'var(--color-primary-light)', marginBottom: 20 }}>
                                    {plan.accessLevel}
                                </p>
                                <p style={{ fontSize: '.85rem', color: 'var(--text-main)', marginBottom: 20, lineHeight: 1.5 }}>
                                    {plan.headline}
                                </p>
                            </div>

                            <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <ul style={{ listStyle: 'none', marginBottom: 32 }}>
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16, fontSize: '.9rem', color: 'var(--text-main)' }}>
                                            <div style={{ flexShrink: 0, marginRight: 12, marginTop: 2, color: 'var(--color-primary)' }}>
                                                <FaCheck size={14} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    className={`btn ${plan.buttonClass} btn-block-mobile`}
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {plan.id === 'free' ? <FaCamera size={18} /> : <FaWhatsapp size={18} />}
                                    {plan.id === 'free' ? 'Comecar Gratis' : 'Subscrever Agora'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default PlansPage;
