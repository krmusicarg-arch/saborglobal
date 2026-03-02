import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  ExternalLink, 
  Trash2, 
  Edit2, 
  Globe, 
  ChevronDown,
  X,
  Save,
  RefreshCw,
  ChefHat,
  Download,
  Share
} from 'lucide-react';
import { db, Recipe } from './db/localDb';
import { recipeService } from './recipeService';
import { syncRecipes } from './services/syncService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [filterOrigin, setFilterOrigin] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'title'>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosInstallModal, setShowIosInstallModal] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(ios);

    // Detect standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(standalone);

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (isIos) {
      setShowIosInstallModal(true);
      return;
    }

  const handleInstallClick = () => {
    if (!installPrompt) return;
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const loadRecipes = async () => {
    const data = await recipeService.getAll();
    setRecipes(data);
  };

  useEffect(() => {
    loadRecipes();
    // Simple polling for "live" updates since we removed dexie-react-hook
    const interval = setInterval(loadRecipes, 3000);
    return () => clearInterval(interval);
  }, []);

  const origins = useMemo(() => {
    const set = new Set(recipes.map(r => r.origin));
    return Array.from(set).sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => {
        const matchesOrigin = filterOrigin ? r.origin === filterOrigin : true;
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             r.observations.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesOrigin && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        return a.title.localeCompare(b.title);
      });
  }, [recipes, filterOrigin, sortBy, searchQuery]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncRecipes();
    await loadRecipes();
    setIsSyncing(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const recipeData = {
      title: formData.get('title') as string,
      origin: formData.get('origin') as string,
      link: formData.get('link') as string,
      rating: Number(formData.get('rating')),
      observations: formData.get('observations') as string,
      id: editingRecipe?.id
    };

    await recipeService.save(recipeData);
    await loadRecipes();
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  const handleDelete = async (id: number) => {
    await rec/* Show install button if installable (Android/Desktop) OR if iOS and not installed */}
            {(installPrompt || (isIos && !isStandalone))lete(id);
    await loadRecipes();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-xl text-white">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Sabores Ruiz</h1>
          </div>
          <div className="flex items-center gap-2">
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors md:hidden text-emerald-600"
                title="Instalar aplicación"
              >
                <Download size={20} />
              </button>
            )}
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={cn(
                "p-2 rounded-full hover:bg-stone-100 transition-colors",
                isSyncing && "animate-spin"
              )}
            >
              <RefreshCw size={20} className="text-stone-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar recetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <select 
                value={filterOrigin}
                onChange={(e) => setFilterOrigin(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl appearance-none focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">Todos los orígenes</option>
                {origins.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
            </div>
            
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl appearance-none focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="rating">Por Puntaje</option>
                <option value="title">Por Nombre</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {recipe.origin}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={14} 
                          className={cn(s <= recipe.rating ? "fill-amber-400 text-amber-400" : "text-stone-200")} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-stone-800 leading-tight group-hover:text-emerald-600 transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500 line-clamp-2 italic">
                      "{recipe.observations}"
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-stone-100">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingRecipe(recipe);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(recipe.id!)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {recipe.link && (
                      <a 
                        href={recipe.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                      >
                        Ver fuente <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="inline-flex p-6 bg-stone-100 rounded-full text-stone-400">
              <ChefHat size={48} />
            </div>
            <p className="text-stone-500 font-medium">No se encontraron recetas. ¡Crea la primera!</p>
         showIosInstallModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIosInstallModal(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-sm mx-auto bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden p-6 pb-12 sm:pb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-800">Instalar en iPhone</h3>
                <button onClick={() => setShowIosInstallModal(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4 text-stone-600">
                <p>Para instalar esta aplicación en tu dispositivo iOS:</p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-stone-100 rounded-full font-bold text-stone-900">1</span>
                  <span>Toca el botón <span className="font-semibold">Compartir</span> <Share className="inline w-4 h-4 ml-1" /></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-stone-100 rounded-full font-bold text-stone-900">2</span>
                  <span>Desliza y selecciona <span className="font-semibold">Agregar a Inicio</span> <Plus className="inline w-4 h-4 border border-stone-800 rounded-[3px] ml-1 p-[1px]" /></span>
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-stone-200 rounded-full sm:hidden"></div>
            </motion.div>
          </div>
        )}

        { </div>
        )}
      </main>

      {/* FAB */}
      <button 
        onClick={() => {
          setEditingRecipe(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-stone-800">
                    {editingRecipe ? 'Editar Receta' : 'Nueva Receta'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-600 ml-1">Título de la comida</label>
                    <input 
                      name="title" 
                      required 
                      defaultValue={editingRecipe?.title}
                      placeholder="Ej: Bibimbap"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-stone-600 ml-1">Origen</label>
                      <input 
                        name="origin" 
                        required 
                        defaultValue={editingRecipe?.origin}
                        placeholder="Ej: Coreana"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-stone-600 ml-1">Puntaje (1-5)</label>
                      <select 
                        name="rating" 
                        defaultValue={editingRecipe?.rating || 5}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      >
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Estrellas</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-600 ml-1">Link de referencia</label>
                    <input 
                      name="link" 
                      type="url"
                      defaultValue={editingRecipe?.link}
                      placeholder="https://ejemplo.com/receta"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-600 ml-1">Observaciones</label>
                    <textarea 
                      name="observations" 
                      rows={3}
                      defaultValue={editingRecipe?.observations}
                      placeholder="Comentarios personales..."
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                  >
                    <Save size={20} />
                    Guardar Receta
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
