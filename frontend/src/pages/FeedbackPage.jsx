import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Send, MessageSquare } from 'lucide-react';
import { feedbackService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const FeedbackPage = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            showToast(t('feedback.ratingLabel'), 'error');
            return;
        }

        setLoading(true);
        try {
            await feedbackService.submit({ rating, suggestion });
            showToast(t('feedback.success'), 'success');
            setRating(0);
            setSuggestion('');
        } catch (error) {
            showToast(t('feedback.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="feedback-container p-6 max-w-2xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">{t('feedback.title')}</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-lg font-medium mb-4 text-center">
                                {t('feedback.ratingLabel')}
                            </label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star
                                            size={48}
                                            className={`${
                                                star <= (hover || rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="suggestion" className="block text-lg font-medium">
                                {t('feedback.suggestionLabel')}
                            </label>
                            <textarea
                                id="suggestion"
                                rows="5"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                placeholder={t('feedback.placeholder')}
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all ${
                                loading || rating === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20'
                            }`}
                        >
                            {loading ? t('common.loading') : (
                                <>
                                    <Send size={20} />
                                    {t('feedback.submit')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default FeedbackPage;
