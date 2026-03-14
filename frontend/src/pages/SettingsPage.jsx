import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Bell, Shield, Smartphone, Globe, Moon, Sun, Ruler, Mail } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import './SettingsPage.css';

const SettingsPage = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [unit, setUnit] = useState('metric'); // metric or imperial

    const handleSave = () => {
        showToast(t('settings.saveSuccess'), 'success');
    };

    const SettingItem = ({ icon: Icon, title, description, children }) => (
        <div className="setting-card">
            <div className="setting-info">
                <div className="setting-icon">
                    <Icon size={20} />
                </div>
                <div className="setting-text">
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
            </div>
            {children}
        </div>
    );

    return (
        <div className="settings-container pb-24">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="settings-header">
                    <Settings className="w-8 h-8 text-primary" />
                    <h1>{t('settings.title')}</h1>
                </div>

                {/* Appearance */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Smartphone size={14} /> {t('settings.appearance') || 'Aparência'}
                    </h2>
                    <SettingItem 
                        icon={darkMode ? Moon : Sun} 
                        title={t('settings.darkMode') || 'Modo Escuro'} 
                        description={t('settings.darkModeDesc') || 'Ajustar as cores para reduzir o cansaço visual'}
                    >
                        <div 
                            onClick={() => setDarkMode(!darkMode)}
                            className={`toggle-switch ${darkMode ? 'active' : ''}`}
                        >
                            <div className="toggle-knob" />
                        </div>
                    </SettingItem>
                </section>

                {/* Preferences */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Globe size={14} /> {t('settings.preferences') || 'Preferências'}
                    </h2>
                    <SettingItem 
                        icon={Ruler} 
                        title={t('settings.units') || 'Unidades de Medida'} 
                        description={t('settings.unitsDesc') || 'Métrico (g, ml) ou Imperial (oz, lb)'}
                    >
                        <select 
                            value={unit} 
                            onChange={(e) => setUnit(e.target.value)}
                            className="setting-select"
                        >
                            <option value="metric">Métrico</option>
                            <option value="imperial">Imperial</option>
                        </select>
                    </SettingItem>
                </section>

                {/* Notifications */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Bell size={14} /> {t('settings.notifications') || 'Notificações'}
                    </h2>
                    <SettingItem 
                        icon={Bell} 
                        title={t('settings.pushNotifications') || 'Notificações Push'} 
                        description={t('settings.pushDesc') || 'Receber lembretes de refeições e desafios'}
                    >
                        <div 
                            onClick={() => setNotifications(!notifications)}
                            className={`toggle-switch ${notifications ? 'active' : ''}`}
                        >
                            <div className="toggle-knob" />
                        </div>
                    </SettingItem>
                </section>

                {/* Security */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Shield size={14} /> {t('settings.security') || 'Segurança'}
                    </h2>
                    <button className="btn-setting-action">
                        {t('settings.changePassword') || 'Alterar Senha'}
                    </button>
                </section>

                {/* Support */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Bell size={14} /> {t('settings.support') || 'Suporte'}
                    </h2>
                    <div className="support-card">
                        <p>{t('support.help')}</p>
                        <a 
                            href="mailto:basilio@infomidia.co.mz" 
                            className="support-link"
                        >
                            <Mail size={18} /> {t('support.email')}
                        </a>
                    </div>
                </section>

                <button 
                    onClick={handleSave}
                    className="btn-save-settings"
                >
                    {t('common.save')}
                </button>
            </motion.div>
        </div>
    );
};

export default SettingsPage;
