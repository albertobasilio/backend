import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, UserCircle, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    
    const { login, guestLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou senha incorretos.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError('');
        setGuestLoading(true);
        try {
            await guestLogin();
            navigate('/');
        } catch (err) {
            setError('Erro ao entrar como visitante.');
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <span className="logo-emoji">MZ</span>
                    <h1>Sabor Inteligente</h1>
                    <p>Nutricionista de Geladeira Inteligente</p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <input 
                                type="email" 
                                className="form-control" 
                                placeholder="seu@email.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                            <span className="input-icon"><Mail size={18} /></span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <div className="input-with-icon">
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Sua senha" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <span className="input-icon"><Lock size={18} /></span>
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading || guestLoading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner" style={{ width: '18px', height: '18px' }}></span> Entrando...
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <LogIn size={18} /> Entrar
                            </span>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>ou</span>
                </div>

                <button 
                    onClick={handleGuestLogin} 
                    className="btn btn-outline" 
                    style={{ width: '100%', marginBottom: '20px' }}
                    disabled={loading || guestLoading}
                >
                    {guestLoading ? (
                        <span className="spinner" style={{ width: '18px', height: '18px' }}></span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <UserCircle size={18} /> Entrar como Visitante
                        </span>
                    )}
                </button>

                <div className="auth-footer">
                    Ainda não tem conta? <Link to="/register">Criar conta</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
