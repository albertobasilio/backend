import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Construction, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const { t } = useTranslation();

    // Define a data de retorno: Segunda-feira, 17 de Março de 2026 às 08:00
    const targetDate = new Date('2026-03-17T08:00:00').getTime();

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                <div className="auth-logo">
                    <span className="logo-emoji">MZ</span>
                    <h1>Sabor Inteligente</h1>
                    <p>Nutricionista de Geladeira Inteligente</p>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

                <div className="maintenance-content" style={{ padding: '20px 0' }}>
                    <Construction size={48} color="#facc15" style={{ marginBottom: '16px' }} />
                    <h2 style={{ color: '#fff', marginBottom: '12px' }}>Sistema em Manutenção</h2>

                    <div className="alert alert-info" style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: '#93c5fd',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left',
                        padding: '15px'
                    }}>
                        <AlertCircle size={20} />
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            Estamos realizando melhorias técnicas. O acesso será restabelecido na
                            <strong> segunda-feira, dia 17</strong>.
                        </p>
                    </div>

                    <div className="countdown-container" style={{
                        marginTop: '30px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '10px'
                    }}>
                        {[
                            { label: 'Dias', value: timeLeft.days },
                            { label: 'Horas', value: timeLeft.hours },
                            { label: 'Min', value: timeLeft.minutes },
                            { label: 'Seg', value: timeLeft.seconds }
                        ].map((item, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.6 }}>
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="auth-footer" style={{ marginTop: '30px' }}>
                    <p style={{ fontSize: '12px', opacity: 0.7 }}>
                        Agradecemos a sua paciência.
                    </p>
                    <p style={{ marginTop: '24px', fontSize: '11px', opacity: 0.5 }}>
                        Desenvolvido por Mr Beto (basilio.infomidia.co.mz)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;