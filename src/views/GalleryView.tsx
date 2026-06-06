import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { 
  Search, LayoutDashboard, LogOut, Copy, Check, Heart, Eye, Moon, Sun
} from 'lucide-react';

export const GalleryView = ({ promptsData = [], categories = [], isAdmin, theme, toggleTheme, onAdminClick, onViewPrompt, onLogout }: any) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'viewed' | 'copied'>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('artix_favorites') || '[]');
    setFavoriteIds(savedFavorites);
  }, []);

  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, searchQuery]);

  const displayCategories = ['All', 'المفضلة', ...categories];

  const filteredPrompts = promptsData.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.keywords && p.keywords.some((kw: string) => kw.toLowerCase().includes(searchQuery.toLowerCase())));
    
    let matchesCategory = false;
    if (activeCategory === 'All') {
      matchesCategory = true;
    } else if (activeCategory === 'المفضلة') {
      matchesCategory = favoriteIds.includes(p.id);
    } else {
      matchesCategory = p.category === activeCategory;
    }

    return matchesSearch && matchesCategory;
  }).sort((a: any, b: any) => {
    if (sortOption === 'viewed') return (b.views || 0) - (a.views || 0);
    if (sortOption === 'copied') return (b.downloads || 0) - (a.downloads || 0);
    return 0; // fallback to original sorted-by-date order
  });

  const displayedPrompts = filteredPrompts.slice(0, visibleCount);

  const handleQuickCopy = async (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);

    try {
      const promptToUpdate = promptsData.find((p: any) => p.id === id);
      if (promptToUpdate) {
        const newDownloads = (promptToUpdate.downloads || 0) + 1;
        await supabase.from('prompt_library').update({ downloads: newDownloads }).eq('id', id);
        window.dispatchEvent(new Event('refresh-prompts'));
      }
    } catch (error) {
      console.error('Error updating copy count:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-gray-900 dark:text-surface-lowest selection:bg-primary/30 overflow-x-hidden" dir="rtl">
      
      {/* شريط التنقل العلوي */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between transition-all duration-300 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-display font-bold text-xl leading-none">A</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-gray-900 dark:text-white">ArtiX</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative group hidden sm:block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="ابحث في البرومبتات..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full pr-11 pl-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-white/10 w-64 transition-all duration-300 shadow-sm dark:shadow-none"
            />
          </div>

          <button onClick={toggleTheme} className="p-2 rounded-full bg-white/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 border border-gray-200 dark:border-white/5 transition-all duration-300" title="تغيير المظهر">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAdmin && (
            <button onClick={onAdminClick} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-all duration-300 text-sm font-medium" title="لوحة التحكم">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">الإدارة</span>
            </button>
          )}

          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/20 text-gray-700 dark:text-white/70 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-white/5 transition-all duration-300 text-sm font-medium" title="تسجيل الخروج">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </nav>

      {/* القسم البطل (Hero Section) */}
      <header className="relative pt-40 pb-20 px-6 max-w-5xl mx-auto text-center z-10">
        <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80 text-xs font-semibold uppercase tracking-widest mb-8 backdrop-blur-md shadow-sm dark:shadow-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            برومبتات ذكاء اصطناعي احترافية
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-6 text-gray-900 dark:text-white leading-tight">
            أطلق العنان لقوة <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 dark:from-blue-400 via-primary to-purple-600 dark:to-purple-500">
              الذكاء الاصطناعي التوليدي.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-white/50 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            اكتشف، انسخ، وابتكر لوحات فنية مذهلة مع مكتبتنا الفاخرة في ArtiX.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }} className="flex flex-wrap justify-center gap-2 md:gap-3 relative z-20">
          {displayCategories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-md ${
                activeCategory === cat 
                  ? (cat === 'المفضلة' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105 border-red-500' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105')
                  : 'bg-white/50 dark:bg-white/5 text-gray-600 dark:text-white/70 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {cat === 'All' ? 'الكل' : cat === 'المفضلة' ? '❤️ المفضلة' : cat}
            </button>
          ))}
        </motion.div>
      </header>

      {/* شبكة البرومبتات */}
      <main className="flex-1 px-6 pb-32 max-w-[1400px] mx-auto w-full relative z-10">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="block sm:hidden w-full relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
            <input type="text" placeholder="ابحث في البرومبتات..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pr-12 pl-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-primary/50 shadow-sm dark:shadow-none" />
          </div>

          <div className="w-full max-w-full sm:w-auto flex items-center gap-1 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 rounded-full overflow-x-auto no-scrollbar mr-auto pl-2 shadow-sm dark:shadow-none">
            <button 
              onClick={() => setSortOption('recent')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${sortOption === 'recent' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`}
            >
              الأحدث
            </button>
            <button 
              onClick={() => setSortOption('viewed')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${sortOption === 'viewed' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`}
            >
              الأكثر مشاهدة
            </button>
            <button 
              onClick={() => setSortOption('copied')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${sortOption === 'copied' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`}
            >
              الأكثر نسخاً
            </button>
          </div>
        </div>

        {filteredPrompts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-white/50 dark:bg-white/5 shadow-sm dark:shadow-none rounded-full flex items-center justify-center mx-auto mb-6">
              {activeCategory === 'المفضلة' ? <Heart className="w-8 h-8 text-gray-400 dark:text-white/20" /> : <Search className="w-8 h-8 text-gray-400 dark:text-white/20" />}
            </div>
            <h3 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-2">
              {activeCategory === 'المفضلة' ? 'لا يوجد برومبتات مفضلة' : 'لا توجد نتائج'}
            </h3>
            <p className="text-gray-500 dark:text-white/50">
              {activeCategory === 'المفضلة' ? 'اضغط على زر القلب داخل أي برومبت لحفظه هنا.' : 'حاول تعديل كلمات البحث أو فلتر الأقسام.'}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {displayedPrompts.map((prompt: any) => (
                  <motion.div
                    layout initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.15, type: "spring", bounce: 0.2 }}
                    key={prompt.id} className="group cursor-pointer" onClick={() => onViewPrompt(prompt.id)}
                  >
                    <div className="bg-white dark:bg-[#121212] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 h-full flex flex-col relative shadow-sm hover:shadow-md dark:shadow-none">
                      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-black">
                        <img src={prompt.image} alt={prompt.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:opacity-80 dark:group-hover:opacity-60" loading="lazy" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <button onClick={(e) => handleQuickCopy(e, prompt.promptText, prompt.id)} className="bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-200 shadow-lg dark:shadow-none">
                            {copiedId === prompt.id ? <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-5 h-5" />}
                            {copiedId === prompt.id ? 'تم النسخ!' : 'نسخ البرومبت'}
                          </button>
                        </div>
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                          <div className="bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-gray-800 dark:text-white/90 uppercase border border-gray-200 dark:border-white/10 w-fit shadow-sm dark:shadow-none">
                            {prompt.category}
                          </div>
                          {prompt.aiModel && (
                            <div className="bg-primary/10 dark:bg-primary/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-primary dark:text-white/90 uppercase border border-primary/20 w-fit shrink-0 truncate max-w-[150px] shadow-sm dark:shadow-none">
                              🤖 {prompt.aiModel}
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/5 dark:bg-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors text-right">{prompt.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-white/40 line-clamp-2 mb-4 flex-1 leading-relaxed text-right">{prompt.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm dark:shadow-none">{prompt.author?.charAt(0) || 'A'}</div>
                            <span className="text-xs font-medium text-gray-600 dark:text-white/60">{prompt.author}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400 dark:text-white/30 text-xs">
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {prompt.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {visibleCount < filteredPrompts.length && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-12"
              >
                <button 
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-3.5 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:bg-white dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-300 font-medium flex items-center gap-2 shadow-sm dark:shadow-lg"
                >
                  عرض المزيد ⬇️
                </button>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
