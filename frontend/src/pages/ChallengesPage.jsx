import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Target, Star, ChevronRight, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { challengeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const ChallengesPage = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        try {
            const res = await challengeService.getActive();
            setChallenges(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (id) => {
        try {
            await challengeService.join(id);
            showToast(t('challenges.success_join') || 'Desafio aceito!', 'success');
            loadChallenges();
        } catch (err) {
            showToast(err.response?.data?.message || 'Erro ao entrar no desafio', 'error');
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'scan_count': return <Target className="text-blue-400" />;
            case 'meal_plan_created': return <Clock className="text-purple-400" />;
            case 'favorites_added': return <Star className="text-yellow-400" />;
            default: return <Trophy className="text-primary" />;
        }
    };

    return (
        <div className="challenges-container p-6 max-w-4xl mx-auto pb-24">
            <header className="mb-10 text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block p-3 bg-primary/10 rounded-2xl mb-4"
                >
                    <Trophy size={40} className="text-primary" />
                </motion.div>
                <h1 className="text-4xl font-black text-white mb-2">{t('challenges.title')}</h1>
                <p className="text-gray-400">{t('challenges.subtitle')}</p>
            </header>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="grid gap-6">
                    {challenges.map((challenge, idx) => (
                        <motion.div 
                            key={challenge.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative overflow-hidden bg-white/5 border rounded-2xl p-6 transition-all hover:border-primary/50 ${challenge.is_joined ? 'border-primary/30' : 'border-white/10'}`}
                        >
                            {challenge.is_completed && (
                                <div className="absolute top-0 right-0 p-2 bg-green-500 text-white rounded-bl-xl">
                                    <CheckCircle2 size={16} />
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="p-4 bg-white/5 rounded-2xl">
                                    {getIcon(challenge.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {challenge.min_plan}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">{challenge.description}</p>
                                    
                                    {challenge.is_joined ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-primary">{t('challenges.progress')}</span>
                                                <span className="text-white">{challenge.progress || 0} / {challenge.target_value}</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, ((challenge.progress || 0) / challenge.target_value) * 100)}%` }}
                                                    className="h-full bg-gradient-to-r from-primary to-emerald-400"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                                            <ShieldCheck size={14} />
                                            <span>{t('challenges.reward')}: {challenge.reward_text}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-auto">
                                    {challenge.is_joined ? (
                                        <button disabled className="w-full md:w-auto px-6 py-3 bg-white/10 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2">
                                            <CheckCircle2 size={18} /> {t('challenges.joined')}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleJoin(challenge.id)}
                                            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                                        >
                                            {t('challenges.join')} <ChevronRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-emerald-500/5 rounded-3xl border border-primary/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">💡 Dica de Mestre</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                    Complete desafios para desbloquear emblemas exclusivos e descontos em planos Premium! Novos desafios toda segunda-feira.
                </p>
            </div>
        </div>
    );
};

export default ChallengesPage;
