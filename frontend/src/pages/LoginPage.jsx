import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Mail, Lock, LogIn, KeyRound } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showForgot, setShowForgot] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recoveryStep, setRecoveryStep] = useState(1);
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [recoveryMessage, setRecoveryMessage] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao fazer login.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRecoveryCode = async () => {
        if (!recoveryEmail) return;
        setRecoveryLoading(true);
        setRecoveryMessage('');
        setError('');
        try {
            const res = await authService.forgotPassword({ email: recoveryEmail });
            setRecoveryMessage(res.data?.message || 'Se o email existir, um codigo foi enviado.');
            setRecoveryStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Falha ao enviar codigo.');
        } finally {
            setRecoveryLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!recoveryEmail || !recoveryCode || !newPassword) return;
        if (newPassword !== confirmPassword) {
            setError('As senhas nao coincidem.');
            return;
        }

        setRecoveryLoading(true);
        setRecoveryMessage('');
        setError('');
        try {
            const res = await authService.resetPassword({
                email: recoveryEmail,
                code: recoveryCode,
                new_password: newPassword
            });
            setRecoveryMessage(res.data?.message || 'Senha redefinida com sucesso.');
            setShowForgot(false);
            setRecoveryStep(1);
            setRecoveryCode('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Falha ao redefinir senha.');
        } finally {
            setRecoveryLoading(false);
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

                {error && <div className="alert alert-error">{error}</div>}
                {recoveryMessage && <div className="alert alert-success">{recoveryMessage}</div>}

                {!showForgot ? (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <div className="input-with-icon">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
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
                                        placeholder="********"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <span className="input-icon"><Lock size={18} /></span>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="spinner" style={{ width: 18, height: 18 }} /> Entrando...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <LogIn size={18} /> Entrar
                                    </span>
                                )}
                            </button>
                        </form>

                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setShowForgot(true);
                                    setRecoveryEmail(email || '');
                                    setRecoveryStep(1);
                                    setError('');
                                    setRecoveryMessage('');
                                }}
                            >
                                <KeyRound size={16} /> Esqueci senha
                            </button>
                        </div>

                        <div className="auth-footer">
                            <p>Não tem conta? <Link to="/register">Criar conta grátis</Link></p>
                            <p style={{ marginTop: '24px', fontSize: '11px', opacity: 0.5 }}>
                                Desenvolvido por Mr Beto
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <label>Email de recuperacao</label>
                            <div className="input-with-icon">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="seu@email.com"
                                    value={recoveryEmail}
                                    onChange={e => setRecoveryEmail(e.target.value)}
                                />
                                <span className="input-icon"><Mail size={18} /></span>
                            </div>
                        </div>

                        {recoveryStep === 1 ? (
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                                onClick={handleSendRecoveryCode}
                                disabled={recoveryLoading || !recoveryEmail}
                            >
                                {recoveryLoading ? 'Enviando...' : 'Enviar codigo por email'}
                            </button>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Codigo recebido no email</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="6 digitos"
                                        value={recoveryCode}
                                        onChange={e => setRecoveryCode(e.target.value)}
                                        maxLength={6}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nova senha</label>
                                    <div className="input-with-icon">
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Nova senha"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                        />
                                        <span className="input-icon"><Lock size={18} /></span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Confirmar nova senha</label>
                                    <div className="input-with-icon">
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Repita a nova senha"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                        />
                                        <span className="input-icon"><Lock size={18} /></span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg"
                                    style={{ width: '100%' }}
                                    onClick={handleResetPassword}
                                    disabled={recoveryLoading || !recoveryCode || !newPassword || !confirmPassword}
                                >
                                    {recoveryLoading ? 'Redefinindo...' : 'Redefinir senha'}
                                </button>
                            </>
                        )}

                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setShowForgot(false);
                                    setRecoveryStep(1);
                                    setError('');
                                }}
                            >
                                Voltar ao login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
