import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, LogIn } from 'lucide-react';

const GuestLock = ({ featureName }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '20px'
        }} className="animate-fadeInUp">
            
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(251, 191, 36, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                color: 'var(--color-accent)'
            }}>
                <Lock size={40} />
            </div>

            <h2 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '12px', 
                fontWeight: '700' 
            }}>
                Acesso Restrito
            </h2>
            
            <p style={{ 
                color: 'var(--text-secondary)', 
                maxWidth: '400px', 
                marginBottom: '32px',
                lineHeight: '1.6'
            }}>
                A funcionalidade <strong>{featureName}</strong> é exclusiva para utilizadores registados. 
                Crie uma conta para desbloquear todas as ferramentas do Sabor Inteligente!
            </p>

            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                width: '100%', 
                maxWidth: '300px' 
            }}>
                <button 
                    className="btn btn-primary" 
                    onClick={() => navigate('/register')}
                    style={{ width: '100%' }}
                >
                    <UserPlus size={18} /> Criar Conta Grátis
                </button>
                
                <button 
                    className="btn btn-secondary" 
                    onClick={() => navigate('/login')}
                    style={{ width: '100%' }}
                >
                    <LogIn size={18} /> Já tenho conta
                </button>
            </div>
            
        </div>
    );
};

export default GuestLock;
