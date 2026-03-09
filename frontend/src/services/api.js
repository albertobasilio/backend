import axios from 'axios';

// Detecta se estamos rodando localmente ou se a URL da API foi fornecida
const API_URL = import.meta.env.VITE_API_URL || 'https://sabor-api-mz.duckdns.org/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updateDietaryProfile: (data) => api.put('/auth/dietary-profile', data),
};

// Ingredients
export const ingredientService = {
    getAll: (params) => api.get('/ingredients', { params }),
    getById: (id) => api.get(`/ingredients/${id}`),
    saveScan: (data) => api.post('/ingredients/scan', data),
    getScanHistory: () => api.get('/ingredients/history/scans'),
    getSubstitutions: (items) => api.post('/ingredients/substitutions', { items }),
};

// Recipes
export const recipeService = {
    getAll: (params) => api.get('/recipes', { params }),
    getById: (id) => api.get(`/recipes/${id}`),
    getPublic: (id) => api.get(`/recipes/public/${id}`),
    generate: (data) => api.post('/recipes/generate', data),
    match: (data) => api.post('/recipes/match', data),
    save: (data) => api.post('/recipes/save', data),
};

// Meal Plans
export const mealPlanService = {
    getAll: () => api.get('/meal-plans'),
    getById: (id) => api.get(`/meal-plans/${id}`),
    create: (data) => api.post('/meal-plans', data),
    delete: (id) => api.delete(`/meal-plans/${id}`),
};

// Shopping Lists
export const shoppingListService = {
    getAll: () => api.get('/shopping-lists'),
    create: (data) => api.post('/shopping-lists', data),
    toggleItem: (itemId) => api.put(`/shopping-lists/item/${itemId}/toggle`),
    delete: (id) => api.delete(`/shopping-lists/${id}`),
    generate: (data) => api.post('/shopping-lists/generate', data),
};

// Nutrition
export const nutritionService = {
    logMeal: (data) => api.post('/nutrition/log', data),
    getDaily: (date) => api.get('/nutrition/daily', { params: { date } }),
    getWeekly: () => api.get('/nutrition/weekly'),
    getTips: () => api.get('/nutrition/tips'),
};

// AI
export const aiService = {
    analyzeImage: (formData) => api.post('/ai/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    analyzeImageBase64: (image) => api.post('/ai/analyze-image', { image }),
    generateRecipes: (data) => api.post('/ai/generate-recipes', data),
    enrichInstructions: (data) => api.post('/ai/enrich-instructions', data),
};

// Favorites
export const favoriteService = {
    getAll: () => api.get('/favorites'),
    add: (recipeId) => api.post('/favorites', { recipe_id: recipeId }),
    remove: (recipeId) => api.delete(`/favorites/${recipeId}`),
    check: (recipeId) => api.get(`/favorites/check/${recipeId}`),
};

// Admin
export const adminService = {
    getUsers: () => api.get('/admin/users'),
    updateUserAccess: (id, data) => api.put(`/admin/users/${id}/access`, data),
    getMetrics: () => api.get('/admin/metrics'),
    getRecipes: (params) => api.get('/admin/recipes', { params }),
    createRecipe: (data) => api.post('/admin/recipes', data),
    updateRecipe: (id, data) => api.put(`/admin/recipes/${id}`, data),
    deleteRecipe: (id) => api.delete(`/admin/recipes/${id}`),
};

// Challenges
export const challengeService = {
    getActive: () => api.get('/challenges/active'),
    join: (id) => api.post(`/challenges/${id}/join`),
    getMine: () => api.get('/challenges/mine'),
};

export default api;