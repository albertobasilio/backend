import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    Home, ScanLine, ChefHat, Heart, History, Zap,
    CalendarDays, BarChart3, User, LogOut, ChevronDown, ChevronUp, Menu, X, CreditCard, Shield, Settings, MessageSquare
} from 'lucide-react';
import './Navbar.css';

const PLAN_ORDER = ['free', 'basic', 'pro', 'premium'];

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const baseNavItems = [
        { path: '/', icon: Home, label: t('common.dashboard'), minPlan: 'free' },
        { path: '/scan', icon: ScanLine, label: t('common.scan'), minPlan: 'free' },
        { path: '/recipes', icon: ChefHat, label: t('common.recipes'), minPlan: 'free' },
        { path: '/fast-recipes', icon: Zap, label: t('common.fastRecipes'), minPlan: 'free' },
        { path: '/favorites', icon: Heart, label: t('common.favorites'), minPlan: 'basic' },
        { path: '/history', icon: History, label: t('common.history'), minPlan: 'basic' },
        { path: '/meal-plan', icon: CalendarDays, label: t('common.mealPlan'), minPlan: 'basic' },
        { path: '/nutrition', icon: BarChart3, label: t('common.nutrition'), minPlan: 'pro' },
        { path: '/challenges', icon: Shield, label: t('common.challenges'), minPlan: 'free' },
        { path: '/plans', icon: CreditCard, label: t('common.plans'), minPlan: 'free' },
        { path: '/settings', icon: Settings, label: t('common.settings'), minPlan: 'free' },
    ];

    const hasPlan = (minPlan) => {
        if (user?.role === 'admin') return true;
        const currentIdx = PLAN_ORDER.indexOf(user?.plan || 'free');
        const minIdx = PLAN_ORDER.indexOf(minPlan || 'free');
        return currentIdx >= minIdx;
    };

    const guestNavItems = [
        { path: '/recipes', icon: ChefHat, label: t('common.recipes'), minPlan: 'free' },
        { path: '/fast-recipes', icon: Zap, label: t('common.fastRecipes'), minPlan: 'free' },
        { path: '/scan', icon: ScanLine, label: t('common.scan'), minPlan: 'free' },
        { path: '/challenges', icon: Shield, label: t('common.challenges'), minPlan: 'free' },
        { path: '/plans', icon: CreditCard, label: t('common.plans'), minPlan: 'free' },
    ];

    const navItems = !user 
        ? guestNavItems
        : user?.role === 'admin'
            ? [
                ...baseNavItems,
                { path: '/admin', icon: Shield, label: 'Admin', minPlan: 'free' },
                { path: '/admin/users', icon: User, label: t('common.users') || 'Utilizadores', minPlan: 'free' },
                { path: '/admin/recipes', icon: ChefHat, label: t('common.recipes'), minPlan: 'free' }
            ]
            : baseNavItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPageTitle = () => {
        const item = navItems.find(n => n.path === location.pathname);
        return item ? item.label : 'Sabor Inteligente';
    };

    const getPlanName = (plan) => {
        if (!user) return t('common.guest') || 'Visitante';
        if (user?.role === 'admin') return 'Admin';
        switch (plan) {
            case 'premium': return 'Premium';
            case 'pro': return 'Pro';
            case 'basic': return t('common.basic') || 'Basico';
            case 'free': default: return t('common.free') || 'Gratuito';
        }
    };

    return (
        <>
            <div className="topbar hide-mobile">
                <div className="topbar-left">
                    <h2 className="topbar-title">{getPageTitle()}</h2>
                </div>
                <div className="topbar-right">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 mr-4 bg-white/5 p-1 rounded-full border border-white/10">
                        <button 
                            onClick={() => i18n.changeLanguage('pt')}
                            className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${i18n.language.startsWith('pt') ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            PT
                        </button>
                        <button 
                            onClick={() => i18n.changeLanguage('en')}
                            className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${i18n.language.startsWith('en') ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            EN
                        </button>
                    </div>

                    {user ? (
                        <>
                            <div className="topbar-profile" onClick={() => setProfileOpen(!profileOpen)}>
                                <div className="topbar-avatar">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="topbar-name">{user?.name?.split(' ')[0] || 'User'}</span>
                                {profileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            {profileOpen && (
                                <>
                                    <div className="dropdown-overlay" onClick={() => setProfileOpen(false)} />
                                    <div className="profile-dropdown animate-dropdown">
                                        <div className="dropdown-header">
                                            <div className="dropdown-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                                            <div>
                                                <div className="dropdown-name">{user?.name || 'Utilizador'}</div>
                                                <div className="dropdown-email">{user?.email || ''}</div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider" />
                                        <NavLink to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                            <User size={16} /> {t('common.profile')}
                                        </NavLink>
                                        <NavLink to="/settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                            <Settings size={16} /> {t('common.settings')}
                                        </NavLink>
                                        <NavLink to="/feedback" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                            <MessageSquare size={16} /> {t('feedback.title')}
                                        </NavLink>
                                        <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                                            <LogOut size={16} /> {t('common.logout')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                            {t('common.login') || 'Entrar'}
                        </button>
                    )}
                </div>
            </div>

            <div className="mobile-topbar show-mobile">
                <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <span className="mobile-logo">Sabor Inteligente</span>
                {user ? (
                    <NavLink to="/profile" className="mobile-avatar-link">
                        <div className="mobile-avatar">{user?.name?.[0] || 'U'}</div>
                    </NavLink>
                ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')} style={{ padding: '4px 12px', fontSize: '12px' }}>
                        {t('common.login') || 'Entrar'}
                    </button>
                )}
            </div>

            <nav className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <span className="logo-flag">MZ</span>
                        <div>
                            <h2 className="logo-text">Sabor</h2>
                            <h2 className="logo-text accent">Inteligente</h2>
                        </div>
                    </div>
                </div>

                <div className="sidebar-nav">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isProtected = item.path === '/scan' || item.minPlan !== 'free';
                        const targetPath = (!user && isProtected) ? '/login' : (hasPlan(item.minPlan) ? item.path : '/plans');
                        
                        return (
                            <NavLink
                                key={item.path}
                                to={targetPath}
                                end={item.path === '/'}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span className="nav-icon"><Icon size={20} /></span>
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{user?.name?.[0] || 'G'}</div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || t('common.guest') || 'Visitante'}</span>
                            <span className="user-plan">{getPlanName(user?.plan)}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        {user ? (
                            <button className="btn-logout" onClick={handleLogout} title={t('common.logout')}>
                                <LogOut size={18} />
                            </button>
                        ) : (
                            <button className="btn-logout" onClick={() => navigate('/login')} title={t('common.login')}>
                                <User size={18} />
                            </button>
                        )}
                        <span style={{ 
                            fontSize: '10px', 
                            color: 'var(--text-muted)', 
                            opacity: 0.6,
                            whiteSpace: 'nowrap',
                            marginRight: '4px'
                        }}>
                            By Mr Beto (basilio.infomidia.co.mz)
                        </span>
                    </div>
                </div>
            </nav>

            {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

            <div className="mobile-bottom-nav show-mobile">
                {(user ? navItems.filter(item => item.path !== '/settings' && !item.path.startsWith('/admin')) : guestNavItems).slice(0, 5).map(item => {
                    const Icon = item.icon;
                    const isProtected = item.path === '/scan' || item.minPlan !== 'free';
                    const targetPath = (!user && isProtected) ? '/login' : (hasPlan(item.minPlan) ? item.path : '/plans');
                    
                    return (
                        <NavLink
                            key={item.path}
                            to={targetPath}
                            end={item.path === '/'}
                            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <small>{item.label}</small>
                        </NavLink>
                    );
                })}
            </div>
        </>
    );
};

export default Navbar;
