import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { 
  Search, LayoutDashboard, LogOut, Copy, Check, Heart, Eye
} from 'lucide-react';

export const GalleryView = ({ promptsData = [], categories = [], isAdmin, onAdminClick, onViewPrompt, onLogout }: any) => {
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
    <div className="min-h-screen flex flex-col bg-transparent text-surface-lowest selection:bg-primary/30" dir="rtl">
      
      {/* شريط التنقل العلوي */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-display font-bold text-xl leading-none">A</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">ArtiX</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative group hidden sm:block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="ابحث في البرومبتات..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pr-11 pl-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 w-64 transition-all duration-300"
            />
          </div>

          {isAdmin && (
            <button onClick={onAdminClick} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-all duration-300 text-sm font-medium" title="لوحة التحكم">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">الإدارة</span>
            </button>
          )}

          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all duration-300 text-sm font-medium" title="تسجيل الخروج">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </nav>

      {/* القسم البطل (Hero Section) */}
      <header className="relative pt-40 pb-20 px-6 max-w-5xl mx-auto text-center z-10">
        <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            برومبتات ذكاء اصطناعي احترافية
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-6 text-white leading-tight">
            أطلق العنان لقوة <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 via-primary to-purple-500">
              الذكاء الاصطناعي التوليدي.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            اكتشف، انسخ، وابتكر لوحات فنية مذهلة مع مكتبتنا الفاخرة في ArtiX.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="flex flex-wrap justify-center gap-2 md:gap-3 relative z-20">
          {displayCategories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-md ${
                activeCategory === cat 
                  ? (cat === 'المفضلة' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105 border-red-500' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105')
                  : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
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
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input type="text" placeholder="ابحث في البرومبتات..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pr-12 pl-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-primary/50" />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full overflow-x-auto hide-scrollbar mr-auto">
            <button 
              onClick={() => setSortOption('recent')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${sortOption === 'recent' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              الأحدث
            </button>
            <button 
              onClick={() => setSortOption('viewed')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${sortOption === 'viewed' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              الأكثر مشاهدة
            </button>
            <button 
              onClick={() => setSortOption('copied')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${sortOption === 'copied' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              الأكثر نسخاً
            </button>
          </div>
        </div>

        {filteredPrompts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              {activeCategory === 'المفضلة' ? <Heart className="w-8 h-8 text-white/20" /> : <Search className="w-8 h-8 text-white/20" />}
            </div>
            <h3 className="text-2xl font-display font-semibold text-white mb-2">
              {activeCategory === 'المفضلة' ? 'لا يوجد برومبتات مفضلة' : 'لا توجد نتائج'}
            </h3>
            <p className="text-white/50">
              {activeCategory === 'المفضلة' ? 'اضغط على زر القلب داخل أي برومبت لحفظه هنا.' : 'حاول تعديل كلمات البحث أو فلتر الأقسام.'}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {displayedPrompts.map((prompt: any) => (
                  <motion.div
                    layout initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                    key={prompt.id} className="group cursor-pointer" onClick={() => onViewPrompt(prompt.id)}
                  >
                    <div className="bg-[#121212] rounded-[2rem] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 h-full flex flex-col relative">
                      <div className="relative aspect-square overflow-hidden bg-black">
                        <img src={prompt.image} alt={prompt.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60" loading="lazy" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={(e) => handleQuickCopy(e, prompt.promptText, prompt.id)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            {copiedId === prompt.id ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                            {copiedId === prompt.id ? 'تم النسخ!' : 'نسخ البرومبت'}
                          </button>
                        </div>
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-white/90 uppercase border border-white/10 w-fit">
                            {prompt.category}
                          </div>
                          {prompt.aiModel && (
                            <div className="bg-primary/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-white/90 uppercase border border-primary/20 w-fit shrink-0 truncate max-w-[150px]">
                              🤖 {prompt.aiModel}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-display font-semibold text-lg text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors text-right">{prompt.title}</h3>
                        <p className="text-sm text-white/40 line-clamp-2 mb-4 flex-1 leading-relaxed text-right">{prompt.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-primary flex items-center justify-center text-[10px] font-bold text-white">{prompt.author?.charAt(0) || 'A'}</div>
                            <span className="text-xs font-medium text-white/60">{prompt.author}</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/30 text-xs">
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
                  className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 font-medium flex items-center gap-2 shadow-lg"
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
