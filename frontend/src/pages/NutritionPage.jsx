import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Flame, Wheat, Droplets, Fish, PieChart, Info, Lightbulb } from 'lucide-react';
import { nutritionService } from '../services/api';
import { motion } from 'framer-motion';

const NutritionPage = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        calories: 1250,
        goal: 2200,
        protein: 45,
        carbs: 180,
        fat: 32,
        water: 1.5
    });
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // In a real app, fetch from API
        setTips([
            { id: 1, text: "Beba 500ml de água antes de cada refeição principal." },
            { id: 2, text: "O amendoim é uma excelente fonte de gorduras saudáveis e proteínas." },
            { id: 3, text: "Substitua o arroz branco por arroz integral ou mandioca cozida para mais fibra." }
        ]);
    }, []);

    const MacroCircle = ({ label, value, color, max, icon: Icon }) => (
        <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        className="text-white/10 stroke-current"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <motion.path
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${(value / max) * 100}, 100` }}
                        transition={{ duration: 1 }}
                        className={`${color} stroke-current`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon size={16} className="text-white/50" />
                </div>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
            <span className="text-sm font-bold text-white">{value}g</span>
        </div>
    );

    return (
        <div className="nutrition-container p-6 max-w-4xl mx-auto pb-24">
            <header className="mb-10 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <BarChart3 size={32} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white">{t('nutrition.title')}</h1>
                    <p className="text-gray-400">Acompanhe seu consumo e atinja suas metas</p>
                </div>
            </header>

            {/* Calories Hero */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                    <Flame size={120} className="text-primary" />
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-400 mb-6 flex items-center gap-2">
                            <Flame size={20} className="text-orange-500" /> {t('nutrition.calories')}
                        </h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-white">{stats.calories}</span>
                            <span className="text-xl text-gray-500">/ {stats.goal} kcal</span>
                        </div>
                        <div className="mt-6 h-4 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.calories / stats.goal) * 100}%` }}
                                className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                            />
                        </div>
                        <p className="mt-3 text-sm text-gray-400">
                            {t('nutrition.remaining')}: <span className="text-white font-bold">{stats.goal - stats.calories} kcal</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <MacroCircle label={t('nutrition.protein')} value={stats.protein} max={150} color="text-blue-500" icon={Fish} />
                        <MacroCircle label={t('nutrition.carbs')} value={stats.carbs} max={300} color="text-yellow-500" icon={Wheat} />
                        <MacroCircle label={t('nutrition.fat')} value={stats.fat} max={80} color="text-red-500" icon={Droplets} />
                    </div>
                </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Daily Tips */}
                <motion.section 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Lightbulb size={24} className="text-yellow-400" /> {t('nutrition.tips')}
                    </h2>
                    <div className="space-y-4">
                        {tips.map(tip => (
                            <div key={tip.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
                                <Info size={20} className="text-primary flex-shrink-0" />
                                <p className="text-sm text-gray-300">{tip.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Water Tracking */}
                <motion.section 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center"
                >
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                        <Droplets size={32} className="text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('nutrition.water')}</h3>
                    <div className="text-4xl font-black text-blue-400 mb-4">{stats.water}L <span className="text-lg text-blue-400/50">/ 2.5L</span></div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className={`w-3 h-8 rounded-full ${i <= 4 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
                        ))}
                    </div>
                    <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-400 transition-all">
                        + 250ml
                    </button>
                </motion.section>
            </div>
        </div>
    );
};

export default NutritionPage;
