import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../supabase';
import { ChevronRight, Check, Copy, Heart, Sparkles } from 'lucide-react';

export const PromptDetailView = ({ promptsData, promptId, onBack, onViewPrompt }: any) => {
  const prompt = promptsData.find((p: any) => p.id === promptId) || promptsData[0];
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('artix_favorites') || '[]');
    setIsFavorite(savedFavorites.includes(prompt.id));
  }, [prompt.id]);

  const toggleFavorite = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('artix_favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = savedFavorites.filter((id: string) => id !== prompt.id);
    } else {
      newFavorites = [...savedFavorites, prompt.id];
    }
    
    localStorage.setItem('artix_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const similarPrompts = promptsData
    .filter((p: any) => p.category === prompt.category && p.id !== prompt.id)
    .slice(0, 3);

  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const isLongPrompt = prompt.promptText && prompt.promptText.length > 150;

  const handleCopy = async () => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    try {
      const newDownloads = (prompt.downloads || 0) + 1;
      await supabase.from('prompt_library').update({ downloads: newDownloads }).eq('id', prompt.id);
      window.dispatchEvent(new Event('refresh-prompts'));
    } catch (error) {
      console.error('Error updating copy count:', error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-surface-lowest selection:bg-primary/30" dir="rtl">
      
      <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-display font-bold text-xl leading-none">A</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white hidden sm:block">ArtiX</span>
        </div>
        
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all duration-300 text-sm font-medium group">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> العودة للمعرض 
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 relative group">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] bg-[#121212] relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
              <img src={prompt.image} alt={prompt.title} className="w-full h-auto object-cover aspect-[4/3] lg:aspect-auto" />
              <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 items-end">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider text-white/90 uppercase border border-white/10 shadow-lg">
                  {prompt.category}
                </div>
                {prompt.aiModel && (
                  <div className="bg-primary/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider text-white uppercase border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] flex items-center gap-2">
                    🤖 {prompt.aiModel}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center lg:sticky lg:top-32">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 text-white leading-tight">
                {prompt.title}
              </h1>
              <p className="text-lg text-white/50 mb-10 leading-relaxed font-light">
                {prompt.description}
              </p>

              <div className="p-[2px] rounded-[1.6rem] relative overflow-hidden group mb-8 shadow-2xl shadow-primary/10">
                <div className="absolute inset-0 opacity-100 group-hover:opacity-100 transition-opacity duration-700 blur-[2px]" style={{ background: 'linear-gradient(90deg, #4285f4 0%, #ea4335 20%, #fbbc05 40%, #34a853 60%, #4285f4 80%, #ea4335 100%)', backgroundSize: '200% 100%', animation: 'drift 8s linear infinite' }} />
                <div className="absolute inset-[-10px] opacity-10 blur-3xl scale-110 pointer-events-none transition-opacity duration-1000 group-hover:opacity-20" style={{ background: 'linear-gradient(90deg, #4285f4, #ea4335, #fbbc05, #34a853, #4285f4)', backgroundSize: '200% 100%', animation: 'drift 12s linear infinite' }} />

                <div className="bg-[#0c0c0c] backdrop-blur-3xl rounded-[1.5rem] p-6 md:p-8 relative z-10">
                  <div className="absolute -top-3 right-8 bg-[#0c0c0c] px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/10 z-20">
                    نص البرومبت
                    <style>{`@keyframes drift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
                  </div>
                  
                  <div className="relative pt-2">
                    <p className={`text-white/90 font-mono text-sm sm:text-base leading-relaxed text-left selection:bg-primary/40 transition-all duration-300 ${!isPromptExpanded && isLongPrompt ? 'line-clamp-3' : ''}`} dir="ltr">
                      {prompt.promptText}
                    </p>
                    {!isPromptExpanded && isLongPrompt && (
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#0c0c0c] to-transparent pointer-events-none" />
                    )}
                  </div>

                  {isLongPrompt && (
                    <button onClick={() => setIsPromptExpanded(!isPromptExpanded)} className="text-[#02b2cb] text-xs mt-3 font-bold hover:text-[#02b2cb]/80 transition-colors flex items-center gap-1">
                      {isPromptExpanded ? 'عرض أقل ⬆️' : 'عرض البرومبت كاملاً ⬇️'}
                    </button>
                  )}
                  
                  <div className="mt-8 flex items-center justify-start gap-4">
                    <button 
                      onClick={handleCopy} 
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-medium transition-all duration-300 shadow-lg hover:-translate-y-1 relative z-20 ${
                        copied ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                      }`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {copied ? 'تم النسخ!' : 'نسخ البرومبت'}
                    </button>

                    <button 
                      onClick={toggleFavorite}
                      className={`flex items-center justify-center w-[52px] h-[52px] shrink-0 rounded-full transition-all duration-300 border relative group hover:-translate-y-1 ${
                        isFavorite 
                          ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                      title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                    >
                      <Heart className={`w-6 h-6 transition-all duration-300 ${isFavorite ? 'fill-red-500 scale-110' : 'group-hover:scale-110'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {(prompt.useCases || (prompt.promptVariables && prompt.promptVariables.length > 0)) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 bg-surface-lowest/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-ambient">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2"><span className="text-2xl">💡</span> دليل الاستخدام الذكي</h3>
                    
                    {prompt.useCases && (
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">🎯 أفضل الاستخدامات الممكنة</h4>
                        <div className="flex flex-wrap gap-2">
                          {prompt.useCases.split(',').map((useCase: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-white/90 rounded-xl text-sm font-medium shadow-sm">{useCase.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {prompt.promptVariables && prompt.promptVariables.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">✨ كلمات يمكنك تغييرها بالبرومبت</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {prompt.promptVariables.map((v: any, i: number) => {
                            let suggestions = '';
                            if (v.type.includes('الأسلوب')) suggestions = 'بدائل: رسم زيتي، 3D، أنمي';
                            else if (v.type.includes('الإضاءة')) suggestions = 'بدائل: سينمائية، نهارية ساطعة';
                            else if (v.type.includes('اللقطة') || v.type.includes('الكاميرا')) suggestions = 'بدائل: قريبة، واسعة، درون';
                            else if (v.type.includes('المزاج')) suggestions = 'بدائل: درامي، هادئ، مرعب';
                            else if (v.type.includes('الخامات')) suggestions = 'بدائل: معدني، خشب، زجاج';
                            else suggestions = 'جرب كلمات مشابهة';

                            return (
                              <div key={i} className="bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col gap-3 group hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-white/50">{v.type}</span>
                                  <span className="text-sm text-[#02b2cb] font-mono bg-[#02b2cb]/10 px-2 py-1 rounded-lg select-all" dir="ltr">{v.value}</span>
                                </div>
                                <div className="text-[10px] text-white/40 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 w-fit flex items-center gap-1.5">
                                  <span className="text-[10px]">💡</span> {suggestions}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
                <div>
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">الناشر</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-primary flex items-center justify-center text-sm font-bold text-white shadow-sm">
                      {prompt.author?.charAt(0) || 'A'}
                    </div>
                    <p className="text-sm font-semibold text-white/90">{prompt.author}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">تاريخ الإضافة</p>
                  <p className="text-sm font-semibold text-white/90 mt-2">{prompt.date}</p>
                </div>
                
                <div className="col-span-2 mt-4">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">الكلمات المفتاحية</p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.keywords && prompt.keywords.map((kw: string) => (
                      <span key={kw} className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl text-xs font-medium text-white/70">{kw}</span>
                    ))}
                    {(!prompt.keywords || prompt.keywords.length === 0) && (
                      <span className="text-xs text-white/40">لا توجد كلمات مفتاحية</span>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>

        {similarPrompts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/5 relative z-10">
            <h3 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" /> برومبتات مشابهة قد تعجبك
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarPrompts.map((p: any) => (
                <div key={p.id} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); onViewPrompt(p.id); }} className="bg-[#121212] rounded-[2rem] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-primary/10">
                  <div className="aspect-[4/3] overflow-hidden relative">
                     <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80" />
                     <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white/90 border border-white/10 uppercase tracking-wider">{p.category}</div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-display font-semibold text-lg text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">{p.title}</h4>
                    <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
