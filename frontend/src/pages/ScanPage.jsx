import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService, ingredientService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
    Camera, Image as ImageIcon, Sparkles, CheckCircle2, ChefHat,
    Lightbulb, Maximize, Eye, AlertCircle, RefreshCw, X, ArrowLeft,
    Search, Clock, Flame, Users, Cpu, BarChart3, Pencil, Trash2, Check
} from 'lucide-react';

const steps = [
    { key: 'upload', label: 'Foto', icon: Camera },
    { key: 'analyzing', label: 'IA', icon: Cpu },
    { key: 'confirm', label: 'Confirmar', icon: CheckCircle2 },
    { key: 'recipes', label: 'Receitas', icon: ChefHat },
];

const scanMessages = [
    'Analisando imagem...',
    'Identificando produtos...',
    'Procurando itens...',
    'Detectando embalagens...',
    'Verificando rótulos...',
    'Contando produtos...',
    'Quase pronto...',
];

const ConfidenceBar = ({ value }) => {
    const color = value >= 0.8 ? '#34d399' : value >= 0.6 ? '#fbbf24' : '#f87171';
    const label = value >= 0.8 ? 'Alta' : value >= 0.6 ? 'Média' : 'Baixa';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, width: '100%' }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ width: `${value * 100}%`, height: '100%', background: color, borderRadius: 2, transition: 'width .6s ease' }} />
            </div>
            <span style={{ fontSize: '.65rem', color, fontWeight: 600, minWidth: 32 }}>{label}</span>
        </div>
    );
};

const RecipeResultCard = ({ recipe, isOptional }) => {
    const [showSteps, setShowSteps] = useState(false);

    const parseSteps = (instructions) => {
        if (typeof instructions === 'string') {
            return instructions
                .split(/\n|(?=\d+\.\s)/)
                .filter(s => s.trim())
                .map(s => s.replace(/^\d+\.\s*/, '').trim())
                .filter(s => s.length > 0);
        }
        if (Array.isArray(instructions)) {
            return instructions.map(s => typeof s === 'string' ? s : s.description || s.step || JSON.stringify(s));
        }
        return [];
    };

    const getIngSourceStyle = (source) => {
        if (source === 'scan') return { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#6ee7b7' };
        if (source === 'comprar') return { background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fcd34d' };
        return { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };
    };

    const getIngSourceIcon = (source) => {
        if (source === 'scan') return '✅';
        if (source === 'comprar') return '🛒';
        if (source === 'despensa') return '🏠';
        return '';
    };

    const recipeSteps = parseSteps(recipe.instructions);

    // Parse missing_ingredients — supports both array of strings and array of objects
    const missingItems = (recipe.missing_ingredients || []).map(item => {
        if (typeof item === 'string') return { name: item, substitutions: [] };
        return {
            name: item.name,
            substitutions: Array.isArray(item.substitutions) ? item.substitutions : []
        };
    });

    return (
        <div className={`recipe-card ${isOptional ? 'difficulty-medio' : ''}`} style={{ marginBottom: 0 }}>
            {recipe.image_url && (
                <div style={{ width: '100%', height: 150, overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}
            <div className="recipe-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span className={`recipe-badge ${isOptional ? 'difficulty' : 'region'}`}>
                        {isOptional ? '🛒 Precisa de mais itens' : '✅ Pronto para cozinhar'}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {recipe.region && <span className="recipe-badge region">{recipe.region}</span>}
                    </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{recipe.title}</h3>
                {recipe.book_reference && (
                    <p style={{ fontSize: '.75rem', color: '#a78bfa', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        📖 <em>{recipe.book_reference}</em>
                    </p>
                )}
                <p style={{ fontSize: '.85rem', marginBottom: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{recipe.description}</p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span className="info-pill"><Clock size={12} /> {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)}min</span>
                    <span className="info-pill"><Flame size={12} /> {recipe.calories || 0}kcal</span>
                    <span className="info-pill"><Users size={12} /> {recipe.servings || 4} porções</span>
                    {recipe.difficulty && <span className="info-pill"><BarChart3 size={12} /> {recipe.difficulty}</span>}
                </div>

                {/* Missing ingredients section for suggestions */}
                {isOptional && missingItems.length > 0 && (
                    <div style={{ background: 'rgba(251,191,36,0.08)', padding: 12, borderRadius: 8, marginBottom: 12, border: '1px solid rgba(251,191,36,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#fcd34d', fontSize: '.8rem', fontWeight: 700 }}>
                            <AlertCircle size={14} /> PRODUTOS EM FALTA:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {missingItems.map((item, j) => (
                                <span key={j} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '4px 10px', borderRadius: 20, fontSize: '.8rem',
                                    background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fcd34d'
                                }}>
                                    🛒 {item.name}
                                    
                                </span>
                            ))}
                        </div>

                        {missingItems.some(i => i.substitutions?.length) && (
                            <div style={{ marginTop: 10, fontSize: '.78rem', color: 'var(--text-secondary)' }}>
                                {missingItems.map((item, j) => (
                                    item.substitutions?.length > 0 ? (
                                        <div key={`sub-${j}`} style={{ marginBottom: 6 }}>
                                            <strong>{item.name}:</strong> {item.substitutions.join(', ')}
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        )}
                        
                    </div>
                )}

                {/* Ingredients with source indicators */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
                    <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Ingredientes
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(recipe.ingredients || []).map((ing, j) => {
                            const source = typeof ing === 'object' ? ing.source : null;
                            const sourceStyle = getIngSourceStyle(source);
                            const sourceIcon = getIngSourceIcon(source);
                            const text = typeof ing === 'string' ? ing : `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim();
                            return (
                                <span key={j} className="info-pill" style={sourceStyle}>
                                    {sourceIcon && <span style={{ fontSize: '.7rem' }}>{sourceIcon}</span>} {text}
                                </span>
                            );
                        })}
                    </div>
                    {!isOptional && (
                        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '.7rem', color: 'var(--text-muted)' }}>
                            <span>✅ Do seu scan</span>
                            <span>🏠 Despensa básica</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {showSteps ? '▲ Ocultar Preparo' : `▼ Ver Preparo (${recipeSteps.length} passos)`}
                </button>

                {showSteps && (
                    <div style={{ marginTop: 12, animation: 'fadeIn .3s ease' }}>
                        <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase' }}>Modo de Preparo</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {recipeSteps.map((step, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: 12 }}>
                                        <div style={{
                                            background: 'var(--color-primary)', color: 'white',
                                            width: 20, height: 20, borderRadius: '50%', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: '.65rem',
                                            fontWeight: 700, flexShrink: 0, marginTop: 2
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {recipe.serving_suggestion && (
                            <div style={{ marginTop: 10, padding: 12, background: 'rgba(52,211,153,0.04)', borderRadius: 8, border: '1px solid rgba(52,211,153,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--color-primary-light)', fontSize: '.75rem', fontWeight: 700 }}>
                                    <Users size={14} /> SUGESTÃO DE SERVIR
                                </div>
                                <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{recipe.serving_suggestion}</p>
                            </div>
                        )}

                        {recipe.chef_tips && recipe.chef_tips.length > 0 && (
                            <div style={{ marginTop: 10, padding: 12, background: 'rgba(232,98,28,0.04)', borderRadius: 8, border: '1px solid rgba(232,98,28,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--color-accent)', fontSize: '.75rem', fontWeight: 700 }}>
                                    <ChefHat size={14} /> DICAS DO CHEF
                                </div>
                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                                    {recipe.chef_tips.map((tip, i) => <li key={i} style={{ marginBottom: 4 }}>{tip}</li>)}
                                </ul>
                            </div>
                        )}

                        {recipe.cultural_note && (
                            <div style={{ marginTop: 10, padding: 12, background: 'rgba(139,92,246,0.04)', borderRadius: 8, border: '1px solid rgba(139,92,246,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#a78bfa', fontSize: '.75rem', fontWeight: 700 }}>
                                    🇲🇿 NOTA CULTURAL
                                </div>
                                <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{recipe.cultural_note}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ScanPage = () => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [detected, setDetected] = useState([]);
    const [confirmed, setConfirmed] = useState([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('upload');
    const [error, setError] = useState('');
    const [generatedRecipes, setGeneratedRecipes] = useState(null);
    const [generatingRecipes, setGeneratingRecipes] = useState(false);
    const [scanMessage, setScanMessage] = useState(scanMessages[0]);
    const [imageQuality, setImageQuality] = useState(null);
    const [manualInput, setManualInput] = useState('');
    const [pantryInput, setPantryInput] = useState('');
    const [editingIdx, setEditingIdx] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [limitMessage, setLimitMessage] = useState('');
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const toast = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();

    const currentStepIdx = steps.findIndex(s =>
        s.key === step ||
        (step === 'no-food' && s.key === 'confirm') ||
        (step === 'analyzing' && s.key === 'analyzing')
    );

    const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob((blob) => {
                        const compressed = new File([blob], file.name, { type: 'image/jpeg' });
                        resolve({ file: compressed, dataUrl: canvas.toDataURL('image/jpeg', quality) });
                    }, 'image/jpeg', quality);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const processFile = async (file) => {
        if (!file) return;
        setError('');
        try {
            const { file: compressed, dataUrl } = await compressImage(file);
            setImage(compressed);
            setImagePreview(dataUrl);
            const sizeMB = (compressed.size / (1024 * 1024)).toFixed(1);
            toast.success(`Imagem pronta (${sizeMB}MB)`);
        } catch {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image && !imagePreview) return setError('Selecione uma imagem.');
        setLoading(true);
        setError('');
        setStep('analyzing');

        let msgIdx = 0;
        const interval = setInterval(() => {
            msgIdx = (msgIdx + 1) % scanMessages.length;
            setScanMessage(scanMessages[msgIdx]);
        }, 2000);

        try {
            let res;
            if (image) {
                const formData = new FormData();
                formData.append('image', image);
                res = await aiService.analyzeImage(formData);
            } else {
                res = await aiService.analyzeImageBase64(imagePreview);
            }

            clearInterval(interval);

            if (res.data.no_food || !res.data.detected || res.data.detected.length === 0) {
                setImageQuality(res.data.image_quality || null);
                setStep('no-food');
                return;
            }

            const items = res.data.detected || [];
            setDetected(items);
            setConfirmed(items.filter(i => i.confidence >= 0.5).map(i => i.name));
            setImageQuality(res.data.image_quality || 'boa');
            setStep('confirm');
            toast.success(`${items.length} produtos encontrados!`);
        } catch (err) {
            clearInterval(interval);
            if (err.response && err.response.status === 403 && err.response.data.limitReached) {
                setLimitMessage(err.response.data.message || 'Voce atingiu o limite diario de scans do seu plano atual. Faça upgrade para continuar escaneando hoje.');
                setShowLimitModal(true);
                setStep('upload'); // Go back to upload step visually but show modal
            } else {
                setError('Erro ao analisar. Tente novamente.');
                setStep('upload');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleIngredient = (name) => {
        setConfirmed(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const addManualIngredient = (goToConfirm = false) => {
        const name = manualInput.trim();
        if (!name) return;
        if (detected.some(d => d.name.toLowerCase() === name.toLowerCase())) {
            toast.warning('Produto já existe na lista.');
            return;
        }
        const newItem = { name, emoji: '📦', confidence: 1, category: 'manual' };
        setDetected(prev => [...prev, newItem]);
        setConfirmed(prev => [...prev, name]);
        setManualInput('');
        toast.success(`${name} adicionado!`);
        if (goToConfirm) {
            setStep('confirm');
        }
    };

    const startEdit = (idx) => {
        setEditingIdx(idx);
        setEditingName(detected[idx].name);
    };

    const saveEdit = () => {
        const newName = editingName.trim();
        if (!newName) return;
        const oldName = detected[editingIdx].name;
        setDetected(prev => prev.map((item, i) => i === editingIdx ? { ...item, name: newName } : item));
        setConfirmed(prev => prev.map(n => n === oldName ? newName : n));
        setEditingIdx(null);
        setEditingName('');
        toast.success(`Produto corrigido para "${newName}"`);
    };

    const cancelEdit = () => {
        setEditingIdx(null);
        setEditingName('');
    };

    const removeProduct = (idx) => {
        const name = detected[idx].name;
        setDetected(prev => prev.filter((_, i) => i !== idx));
        setConfirmed(prev => prev.filter(n => n !== name));
        toast.success(`"${name}" removido`);
    };

    const parsePantryItems = () => {
        return pantryInput
            .split(/\n|,/)
            .map(s => s.trim())
            .filter(Boolean);
    };

    const startPantryMode = () => {
        const items = parsePantryItems();
        if (items.length === 0) {
            setError('Digite pelo menos 1 produto da sua despensa.');
            return;
        }
        const newDetected = items.map(name => ({
            name,
            emoji: '🏠',
            confidence: 1,
            category: 'despensa'
        }));
        setDetected(newDetected);
        setConfirmed(items);
        setStep('confirm');
        setError('');
        toast.success(`${items.length} itens carregados da despensa!`);
    };

    const handleGenerateRecipes = async () => {
        if (confirmed.length === 0) return setError('Selecione pelo menos 1 produto.');
        setGeneratingRecipes(true);
        setError('');
        try {
            // Save scan (non-blocking — don't fail if save fails)
            try {
                const isPantryOnly = !image && !imagePreview;
                await ingredientService.saveScan({
                    scan_type: isPantryOnly ? 'Despensa' : 'IA Scan',
                    detected_ingredients: detected,
                    confirmed_ingredients: confirmed
                });
            } catch (saveErr) {
                console.warn('Falha ao salvar scan:', saveErr);
            }

            const res = await aiService.generateRecipes({
                ingredients: confirmed,
                dietary_profile: user?.dietary_preferences || {}
            });
            setGeneratedRecipes(res.data);
            setStep('recipes');
        } catch (err) {
            const msg = err.response?.data?.message || 'Erro ao gerar sugestões. Tente novamente.';
            setError(msg);
        } finally {
            setGeneratingRecipes(false);
        }
    };

    const goBackToConfirm = () => {
        setStep('confirm');
        setGeneratedRecipes(null);
    };

    const reset = () => {
        setImage(null);
        setImagePreview(null);
        setDetected([]);
        setConfirmed([]);
        setStep('upload');
        setGeneratedRecipes(null);
        setError('');
        setImageQuality(null);
        setManualInput('');
        setPantryInput('');
        setShowLimitModal(false);
        setLimitMessage('');
    };

    return (
        <div className="page-enter">
            {showLimitModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div className="auth-card" style={{ maxWidth: 400, textAlign: 'center', animation: 'scaleIn 0.3s' }}>
                        <div style={{
                            width: 60, height: 60, borderRadius: '50%', background: 'var(--color-accent)',
                            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Camera size={30} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Limite Atingido!</h2>
                                                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                            {limitMessage || 'Voce atingiu o limite diario de scans do seu plano atual. Faca upgrade para continuar escaneando hoje.'}
                        </p>
                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginBottom: 12 }}
                            onClick={() => navigate('/plans')}
                        >
                            Ver Planos
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%' }}
                            onClick={() => setShowLimitModal(false)}
                        >
                            Agora não
                        </button>
                    </div>
                </div>
            )}

            <div className="hero-card" style={{ padding: '20px 24px', marginBottom: 24 }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Camera size={24} color="var(--color-primary)" /> AI Product Scanner
                </h1>
                <p>Analise seus produtos e descubra o que cozinhar</p>
            </div>

            {/* Stepper */}
            <div className="scan-stepper" style={{ marginBottom: 24 }}>
                {steps.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = i <= currentStepIdx;
                    return (
                        <div key={s.key} className={`scan-step ${isActive ? 'active' : ''}`}>
                            <div className="scan-step-icon">
                                <Icon size={isActive ? 22 : 18} />
                            </div>
                            <span className="scan-step-label">{s.label}</span>
                            {i < steps.length - 1 && <div className="scan-step-line" />}
                        </div>
                    );
                })}
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* ===== UPLOAD ===== */}
            {step === 'upload' && (
                <div className="animate-scaleIn">
                    {imagePreview ? (
                        <div className="auth-card" style={{ maxWidth: '100%', padding: '20px' }}>
                            <div style={{ position: 'relative', width: '100%', marginBottom: 20 }}>
                                <img src={imagePreview} className="upload-preview" alt="Preview" style={{ width: '100%', maxHeight: 400, borderRadius: 16 }} />
                                <button
                                    className="btn btn-secondary"
                                    onClick={reset}
                                    style={{ position: 'absolute', top: 12, right: 12, padding: 8, minHeight: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleAnalyze} disabled={loading}>
                                <Sparkles size={18} /> {loading ? 'Analisando...' : 'Identificar Produtos'}
                            </button>
                        </div>
                    ) : (
                        <div className="auth-card" style={{ maxWidth: '100%', padding: '40px 24px', textAlign: 'center' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '24px', background: 'var(--bg-input)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                color: 'var(--color-primary)'
                            }}>
                                <Camera size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Como quer capturar?</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: 32 }}>
                                Tire uma foto dos produtos ou escolha um ficheiro da sua galeria
                            </p>

                            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => cameraInputRef.current?.click()}
                                    style={{ width: '100%' }}
                                >
                                    <Camera size={20} /> Tirar Foto
                                </button>
                                <button
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => galleryInputRef.current?.click()}
                                    style={{ width: '100%' }}
                                >
                                    <ImageIcon size={20} /> Abrir Galeria
                                </button>
                            </div>

                            {/* Hidden file inputs */}
                            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => processFile(e.target.files[0])} style={{ display: 'none' }} />
                            <input ref={galleryInputRef} type="file" accept="image/*" onChange={(e) => processFile(e.target.files[0])} style={{ display: 'none' }} />

                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem', marginBottom: 10 }}>
                                    Ou adicione produtos manualmente:
                                </p>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div className="input-with-icon" style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Adicionar produto manualmente..."
                                            value={manualInput}
                                            onChange={e => setManualInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addManualIngredient(true)}
                                        />
                                        <span className="input-icon"><Search size={16} /></span>
                                    </div>
                                    <button className="btn btn-secondary" onClick={() => addManualIngredient(true)}>+</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
                                <span className="info-pill"><Lightbulb size={12} /> Boa iluminação</span>
                                <span className="info-pill"><Maximize size={12} /> De cima para baixo</span>
                                <span className="info-pill"><Eye size={12} /> Itens bem visíveis</span>
                            </div>
                        </div>
                    )}

                    {/* Pantry Mode */}
                    <div className="card" style={{ marginTop: 20 }}>
                        <h3 style={{ marginBottom: 8 }}>🏠 Modo "O que tenho em casa"</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
                            Escreva os itens da sua despensa (separados por vírgula ou linha).
                        </p>
                        <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Ex: arroz, feijão, tomate, cebola..."
                            value={pantryInput}
                            onChange={e => setPantryInput(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                            <button className="btn btn-secondary" onClick={() => setPantryInput('')}>
                                Limpar
                            </button>
                            <button className="btn btn-primary" onClick={startPantryMode}>
                                Usar Itens
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* ===== ANALYZING ===== */}
            {step === 'analyzing' && (
                <div className="auth-card" style={{ maxWidth: '100%', padding: '60px 24px', textAlign: 'center' }}>
                    <div className="scan-radar" style={{ margin: '0 auto' }}>
                        <div className="scan-radar-ring" />
                        <div className="scan-radar-ring ring-2" />
                        <div className="scan-radar-center">
                            <Cpu size={32} className="animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 32, marginBottom: 8 }}>{scanMessage}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
                        Nossa IA está processando cada detalhe da imagem...
                    </p>
                </div>
            )}

            {/* ===== CONFIRM INGREDIENTS ===== */}
            {step === 'confirm' && (
                <div className="animate-fadeIn">
                    <div className="page-header" style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>🎯 {detected.length} Produtos Encontrados</h2>
                            <button className="btn btn-secondary btn-sm" onClick={reset}>
                                <RefreshCw size={14} /> Refazer Scan
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'rgba(18, 42, 36, 0.4)', backdropFilter: 'blur(10px)' }}>
                        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                            Confirme os itens detectados. Toque para seleccionar/desseleccionar.
                        </p>
                        <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                            ✏️ Use o lápis para <strong>corrigir um nome errado</strong> &nbsp;|&nbsp; 🗑️ Use o lixo para <strong>remover</strong>
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                            {detected.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 14px', borderRadius: 12,
                                        background: confirmed.includes(item.name) ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
                                        border: confirmed.includes(item.name) ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                        transition: 'all .2s ease'
                                    }}
                                >
                                    {/* Checkbox area */}
                                    <div
                                        onClick={() => toggleIngredient(item.name)}
                                        style={{
                                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: confirmed.includes(item.name) ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                                            border: confirmed.includes(item.name) ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                            cursor: 'pointer', transition: 'all .2s'
                                        }}
                                    >
                                        {confirmed.includes(item.name) && <Check size={16} color="#064e3b" strokeWidth={3} />}
                                    </div>

                                    {/* Emoji */}
                                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.emoji}</span>

                                    {/* Name — editable or static */}
                                    {editingIdx === idx ? (
                                        <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') saveEdit();
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                                autoFocus
                                                style={{
                                                    padding: '4px 10px', fontSize: '.88rem',
                                                    minHeight: 0, height: 32, flex: 1
                                                }}
                                            />
                                            <button
                                                onClick={saveEdit}
                                                style={{
                                                    background: 'var(--color-primary)', border: 'none',
                                                    borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center'
                                                }}
                                            >
                                                <Check size={16} color="#064e3b" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                style={{
                                                    background: 'rgba(248,113,113,0.15)', border: 'none',
                                                    borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center'
                                                }}
                                            >
                                                <X size={16} color="#f87171" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span
                                                onClick={() => toggleIngredient(item.name)}
                                                style={{
                                                    flex: 1, fontWeight: 600, fontSize: '.9rem',
                                                    color: confirmed.includes(item.name) ? '#6ee7b7' : 'var(--text-secondary)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {item.name}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                                <ConfidenceBar value={item.confidence} />
                                            </div>
                                        </>
                                    )}

                                    {/* Action buttons — edit & delete */}
                                    {editingIdx !== idx && (
                                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEdit(idx); }}
                                                title="Corrigir nome"
                                                style={{
                                                    background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)',
                                                    borderRadius: 6, padding: '5px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                <Pencil size={14} color="#a78bfa" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeProduct(idx); }}
                                                title="Remover produto"
                                                style={{
                                                    background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)',
                                                    borderRadius: 6, padding: '5px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={14} color="#f87171" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                            <div className="input-with-icon" style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Adicionar produto manualmente..."
                                    value={manualInput}
                                    onChange={e => setManualInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addManualIngredient()}
                                />
                                <span className="input-icon"><Search size={16} /></span>
                            </div>
                            <button className="btn btn-secondary" onClick={addManualIngredient}>+</button>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: 20 }}
                        onClick={handleGenerateRecipes}
                        disabled={generatingRecipes || confirmed.length === 0}
                    >
                        {generatingRecipes ? <><RefreshCw size={18} className="animate-spin" /> Gerando...</> : <><ChefHat size={18} /> Ver Receitas ({confirmed.length} produtos)</>}
                    </button>
                </div>
            )}

            {/* ===== RECIPES ===== */}
            {step === 'recipes' && generatedRecipes && (
                <div className="animate-fadeIn">
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <button className="btn btn-secondary btn-sm" onClick={goBackToConfirm}>
                            <ArrowLeft size={14} /> Editar Produtos
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={reset}>
                            <Camera size={14} /> Novo Scan
                        </button>
                    </div>

                    {/* Confirmed products summary */}
                    <div style={{
                        background: 'rgba(52,211,153,0.06)', padding: '12px 16px', borderRadius: 12,
                        marginBottom: 20, border: '1px solid rgba(52,211,153,0.12)',
                        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>📸 Seus produtos:</span>
                        {confirmed.map((name, i) => (
                            <span key={i} style={{
                                padding: '3px 10px', borderRadius: 20, fontSize: '.78rem',
                                background: 'rgba(52,211,153,0.15)', color: '#6ee7b7'
                            }}>{name}</span>
                        ))}
                    </div>

                    {/* SECTION 1: Recipes you can cook NOW */}
                    {(generatedRecipes.possible_recipes || []).length > 0 && (
                        <div style={{ marginBottom: 32 }}>
                            <div className="page-header" style={{ marginBottom: 8 }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <CheckCircle2 color="var(--color-primary)" size={20} /> Cozinhe Agora
                                </h2>
                            </div>
                            <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                                Receitas feitas <strong>apenas com os seus produtos</strong> — sem comprar nada!
                            </p>
                            <div className="card-grid">
                                {generatedRecipes.possible_recipes.map((recipe, i) => (
                                    <RecipeResultCard key={i} recipe={recipe} isOptional={false} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: Suggestions if you buy more */}
                    {((generatedRecipes.suggested_recipes || generatedRecipes.optional_recipes || []).length > 0) && (
                        <div style={{ marginBottom: 32 }}>
                            <div className="page-header" style={{ marginBottom: 8 }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Sparkles color="var(--color-accent)" size={20} /> Se Comprar Mais...
                                </h2>
                            </div>
                            <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                                Pratos ainda melhores se comprar <strong>poucos ingredientes extra</strong>.
                            </p>
                            <div className="card-grid">
                                {(generatedRecipes.suggested_recipes || generatedRecipes.optional_recipes).map((recipe, i) => (
                                    <RecipeResultCard key={i} recipe={recipe} isOptional={true} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Economy tip */}
                    {generatedRecipes.economy_tip && (
                        <div style={{
                            background: 'rgba(52,211,153,0.06)', padding: 16, borderRadius: 12,
                            marginBottom: 20, border: '1px solid rgba(52,211,153,0.12)'
                        }}>
                            <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                💡 <strong>Dica económica:</strong> {generatedRecipes.economy_tip}
                            </p>
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginBottom: 20 }}
                        onClick={handleGenerateRecipes}
                        disabled={generatingRecipes}
                    >
                        <RefreshCw size={18} className={generatingRecipes ? 'animate-spin' : ''} />
                        {generatingRecipes ? ' Gerando...' : ' Gerar Outras Receitas'}
                    </button>
                </div>
            )}

            {/* ===== NO FOOD ===== */}
            {step === 'no-food' && (
                <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{
                        width: 70, height: 70, borderRadius: '50%', background: 'rgba(248,113,113,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        color: 'var(--color-danger)'
                    }}>
                        <AlertCircle size={36} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Nenhum alimento detectado</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                        {imageQuality === 'fraca'
                            ? 'A imagem parece desfocada ou escura demais para ser analisada.'
                            : 'Certifique-se que o alimento está bem visível e centralizado.'
                        }
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
                        <span className="info-pill"><Lightbulb size={12} /> Iluminação</span>
                        <span className="info-pill"><Maximize size={12} /> Foco</span>
                        <span className="info-pill"><ArrowLeft size={12} /> Centralizado</span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={reset}>
                        <Camera size={18} /> Tentar Novamente
                    </button>
                </div>
            )}
        </div>
    );
};

export default ScanPage;


