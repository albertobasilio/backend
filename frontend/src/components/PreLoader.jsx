import React from 'react';
import { ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PreLoader = () => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="relative">
                <motion.div
                    animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="p-4 bg-primary/10 rounded-full"
                >
                    <ChefHat size={48} className="text-primary" />
                </motion.div>
                
                {/* Pulse ring */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-primary rounded-full"
                />
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-col items-center"
            >
                <span className="text-lg font-bold text-white tracking-wider">
                    {t('common.processing') || 'Sabor Inteligente'}
                </span>
                <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 bg-primary rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default PreLoader;
