import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabase';
import { 
  Search, User, LayoutDashboard, FileText, PlusCircle, Settings, 
  LogOut, ArrowLeft, Copy, Check, Filter, MoreVertical, Edit2, Trash2,
  Image as ImageIcon, UploadCloud, Lock, Bell, ShieldAlert, Globe, ChevronRight, Eye, Download
} from 'lucide-react';



const MOCK_PROMPTS = [
  {
    id: '1',
    title: 'Ethereal Glass Morphism UI',
    category: 'UI/UX',
    description: 'A prompt designed to generate stunning, high-fidelity glassmorphism interfaces with soft lighting and deep ambient shadows.',
    promptText: 'High fidelity UI design, glassmorphism, frosted glass panels, soft ambient lighting, deep shadows, pastel gradients, clean typography, Dribbble style, 8k resolution, highly detailed.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    author: 'Elena Rostova',
    date: 'Oct 24, 2023',
    views: 1240,
    downloads: 342,
    keywords: ['glassmorphism', 'ui', 'clean', 'pastel']
  },
  {
    id: '2',
    title: 'Cinematic Cyberpunk Cityscape',
    category: '3D Render',
    description: 'Generates hyper-realistic, neon-drenched cyberpunk city streets with volumetric fog and ray-traced reflections.',
    promptText: 'Cinematic wide shot, cyberpunk city street at night, neon lights reflecting in puddles, volumetric fog, towering skyscrapers, flying cars, highly detailed, Unreal Engine 5 render, octane render, 8k.',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2670&auto=format&fit=crop',
    author: 'Marcus Chen',
    date: 'Nov 02, 2023',
    views: 3420,
    downloads: 890,
    keywords: ['cyberpunk', 'neon', 'city', '3d']
  },
  {
    id: '3',
    title: 'Minimalist Botanical Illustration',
    category: 'Illustration',
    description: 'Creates delicate, minimalist line-art style botanical illustrations suitable for editorial design.',
    promptText: 'Minimalist botanical illustration, delicate line art, single monstera leaf, beige background, high contrast, elegant, editorial style, vector art.',
    image: 'https://images.unsplash.com/photo-1506804886640-398390938136?q=80&w=2574&auto=format&fit=crop',
    author: 'Sarah Jenkins',
    date: 'Nov 15, 2023',
    views: 850,
    downloads: 120,
    keywords: ['botanical', 'minimalist', 'line art']
  },
  {
    id: '4',
    title: 'Moody Portrait Photography',
    category: 'Photography',
    description: 'A prompt for generating highly realistic, moody portrait photography with dramatic chiaroscuro lighting.',
    promptText: 'Close up portrait photography, moody lighting, chiaroscuro, dramatic shadows, cinematic, 85mm lens, f/1.4, highly detailed face, textured skin, 8k.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop',
    author: 'David Alaba',
    date: 'Dec 05, 2023',
    views: 2100,
    downloads: 560,
    keywords: ['portrait', 'moody', 'photography']
  },
  {
    id: '5',
    title: 'Abstract Fluid Dynamics',
    category: 'Abstract',
    description: 'Generates mesmerizing, colorful abstract fluid simulations with high viscosity and metallic reflections.',
    promptText: 'Abstract fluid dynamics, macro photography, swirling colors, metallic reflections, high viscosity, iridescent, highly detailed, 8k resolution.',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
    author: 'Elena Rostova',
    date: 'Jan 12, 2024',
    views: 1560,
    downloads: 430,
    keywords: ['abstract', 'fluid', 'colorful']
  },
  {
    id: '6',
    title: 'Brutalist Typography Poster',
    category: 'Typography',
    description: 'Creates bold, brutalist typography posters with stark contrasts and Swiss design influences.',
    promptText: 'Brutalist typography poster, Swiss design, heavy sans-serif font, stark black and white contrast, grid layout, minimalist, graphic design.',
    image: 'https://images.unsplash.com/photo-1627398225258-6bd1a4799c8b?q=80&w=2574&auto=format&fit=crop',
    author: 'Marcus Chen',
    date: 'Feb 20, 2024',
    views: 920,
    downloads: 210,
    keywords: ['brutalist', 'typography', 'poster']
  }
];

// --- SHARED COMPONENTS ---

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
  const variants = {
    primary: "signature-gradient hover:shadow-ambient hover:scale-[1.02]",
    secondary: "bg-surface-lowest text-on-surface border border-outline-variant hover:bg-surface-low hover:border-outline",
    ghost: "bg-transparent text-on-surface hover:bg-surface-low",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, className = '', ...props }: any) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className="text-sm font-medium text-on-surface-variant">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />}
      <input 
        className={`w-full bg-surface-lowest border border-outline-variant rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${Icon ? 'pl-11' : ''}`}
        {...props}
      />
    </div>
  </div>
);

const Textarea = ({ label, className = '', ...props }: any) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className="text-sm font-medium text-on-surface-variant">{label}</label>}
    <textarea 
      className="w-full bg-surface-lowest border border-outline-variant rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
      {...props}
    />
  </div>
);

// --- VIEWS ---

const GalleryView = ({ promptsData = [], categories = [], isAdmin, onAdminClick, onViewPrompt, onLogout }: any) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // تجهيز الأقسام الديناميكية
  const displayCategories = ['All', ...categories];

  // فلترة البرومبتات حسب البحث والقسم والكلمات المفتاحية
  const filteredPrompts = promptsData.filter((p: any) =>
    (activeCategory === 'All' || p.category === activeCategory) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (p.keywords && p.keywords.some((kw: string) => kw.toLowerCase().includes(searchQuery.toLowerCase()))))
  );

  // دالة النسخ المباشر من المعرض
  const handleQuickCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation(); // لمنع فتح صفحة التفاصيل عند الضغط على زر النسخ
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-surface-lowest selection:bg-primary/30" dir="rtl">
      
      {/* شريط التنقل العلوي (Navbar) بتأثير زجاجي */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-display font-bold text-xl leading-none">A</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">ArtiX</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* شريط البحث المدمج */}
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

          {/* زر الإدارة (يظهر فقط للأدمن) */}
          {isAdmin && (
            <button 
              onClick={onAdminClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-all duration-300 text-sm font-medium"
              title="لوحة التحكم"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">الإدارة</span>
            </button>
          )}

          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all duration-300 text-sm font-medium"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </nav>

      {/* القسم البطل (Hero Section) */}
      <header className="relative pt-40 pb-20 px-6 max-w-5xl mx-auto text-center z-10">
        {/* إضاءات خلفية محيطية */}
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
            اكتشف، انسخ، وابتكر لوحات فنية مذهلة مع مكتبتنا الفاخرة لبرومبتات Midjourney و DALL-E.
          </p>
        </motion.div>
        
        {/* أزرار الفلترة (Filter Chips) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-2 md:gap-3 relative z-20"
        >
          {displayCategories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-md ${
                activeCategory === cat 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
                  : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'الكل' : cat}
            </button>
          ))}
        </motion.div>
      </header>

      {/* شبكة البرومبتات (Grid) */}
      <main className="flex-1 px-6 pb-32 max-w-[1400px] mx-auto w-full relative z-10">
        
        {/* شريط البحث للموبايل */}
        <div className="block sm:hidden mb-8 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="ابحث في البرومبتات..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pr-12 pl-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
          />
        </div>

        {filteredPrompts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-2xl font-display font-semibold text-white mb-2">لا توجد نتائج</h3>
            <p className="text-white/50">حاول تعديل كلمات البحث أو فلتر الأقسام.</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredPrompts.map((prompt: any) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  key={prompt.id}
                  className="group cursor-pointer"
                  onClick={() => onViewPrompt(prompt.id)}
                >
                  <div className="bg-[#121212] rounded-[2rem] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 h-full flex flex-col relative">
                    
                    {/* الصورة مع تأثير الـ Hover */}
                    <div className="relative aspect-square overflow-hidden bg-black">
                      <img 
                        src={prompt.image} 
                        alt={prompt.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
                        loading="lazy"
                      />
                      
                      {/* الزر السري للنسخ المباشر فوق الصورة */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => handleQuickCopy(e, prompt.promptText, prompt.id)}
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                        >
                          {copiedId === prompt.id ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                          {copiedId === prompt.id ? 'تم النسخ!' : 'نسخ البرومبت'}
                        </button>
                      </div>

                      {/* شارة القسم */}
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-white/90 uppercase border border-white/10">
                        {prompt.category}
                      </div>
                    </div>

                    {/* تفاصيل الكرت السفلية */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-display font-semibold text-lg text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors text-right">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-white/40 line-clamp-2 mb-4 flex-1 leading-relaxed text-right">
                        {prompt.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-primary flex items-center justify-center text-[10px] font-bold text-white">
                            {prompt.author?.charAt(0) || 'A'}
                          </div>
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
        )}
      </main>
    </div>
  );
};

const PromptDetailView = ({ promptsData, promptId, onBack }: any) => {
  const prompt = promptsData.find((p: any) => p.id === promptId) || promptsData[0];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-surface-lowest selection:bg-primary/30" dir="rtl">
      
      {/* شريط التنقل العلوي (Navbar) */}
      <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-display font-bold text-xl leading-none">A</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white hidden sm:block">ArtiX</span>
        </div>
        
        {/* زر العودة المخصص لـ RTL */}
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all duration-300 text-sm font-medium group"
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> العودة للمعرض 
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* إضاءات خلفية خافتة (Ambient Glow) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* قسم الصورة (يأخذ 7 أعمدة - سيظهر على اليمين) */}
          <div className="lg:col-span-7 relative group">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] bg-[#121212] relative"
            >
              {/* تدرج لوني خفيف فوق الصورة لزيادة الفخامة */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
              
              <img 
                src={prompt.image} 
                alt={prompt.title} 
                className="w-full h-auto object-cover aspect-[4/3] lg:aspect-auto" 
              />
              
              {/* شارة القسم فوق الصورة */}
              <div className="absolute top-6 right-6 z-20 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider text-white/90 uppercase border border-white/10 shadow-lg">
                {prompt.category}
              </div>
            </motion.div>
          </div>

          {/* قسم التفاصيل والنسخ (يأخذ 5 أعمدة - سيظهر على اليسار ويبقى ثابتاً عند النزول) */}
          <div className="lg:col-span-5 flex flex-col justify-center lg:sticky lg:top-32">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 text-white leading-tight">
                {prompt.title}
              </h1>
              <p className="text-lg text-white/50 mb-10 leading-relaxed font-light">
                {prompt.description}
              </p>

              {/* صندوق نص البرومبت الاحترافي بالإطار الملون المتحرك (النسخة النهائية) */}
              <div className="p-[2px] rounded-[1.6rem] relative overflow-hidden group mb-8 shadow-2xl shadow-primary/10">
                
                {/* 1. طبقة البوردر الملون المتحرك (قوس قزح) */}
                <div 
                  className="absolute inset-[-1000%] opacity-100 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: 'conic-gradient(from 90deg at 50% 50%, #003b93 0%, #6b38d4 25%, #003b93 50%, #6b38d4 75%, #003b93 100%)',
                    animation: 'spin 4s linear infinite',
                  }}
                />

                {/* 2. طبقة المحتوى الداخلي (بتغطي الألوان وتترك حافة 2 بكسل) */}
                <div className="bg-[#0c0c0c] backdrop-blur-3xl rounded-[1.5rem] p-6 md:p-8 relative z-10">
                  
                  {/* عنوان نص البرومبت (الأبيض) */}
                  <div className="absolute -top-3 right-8 bg-[#0c0c0c] px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/10 z-20">
                    نص البرومبت
                  </div>
                  
                  {/* النص نفسه يبقى من اليسار لليمين */}
                  <p className="text-white/90 font-mono text-sm sm:text-base leading-relaxed text-left selection:bg-primary/40 pt-2" dir="ltr">
                    {prompt.promptText}
                  </p>
                  
                  <div className="mt-8 flex justify-start">
                    <button 
                      onClick={handleCopy} 
                      className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-medium transition-all duration-300 shadow-lg hover:-translate-y-1 relative z-20 ${
                        copied 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
                          : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                      }`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {copied ? 'تم النسخ بنجاح!' : 'نسخ البرومبت'}
                    </button>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية (الناشر، التاريخ، الكلمات المفتاحية) */}
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
                      <span key={kw} className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl text-xs font-medium text-white/70">
                        {kw}
                      </span>
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
      </main>
    </div>
  );
};

const LoginView = ({ onLoginSuccess, onBack }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. الاتصال بسوبابيز لتسجيل الدخول عن طريق الإيميل وكلمة المرور
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // 2. إذا نجح تسجيل الدخول، منروح لجدول profiles لنتأكد من نوع الباقة
      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan_type')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        // 3. فحص الصلاحيات والباقة
        // ضع إيميلك أو إيميلات الإدارة هنا بدلاً من الايميل الوهمي
        const adminEmails = ['vb.ip.gt@gmail.com']; 

        if (authData.user && adminEmails.includes(authData.user.email)) {
          // إذا كان الإيميل هو إيميل الأدمن، يتم توجيهه للوحة التحكم
          onLoginSuccess('admin'); 
        } else if (profile && profile.plan_type !== 'free') {
          // إذا كان مستخدم عادي وباقته مدفوعة، يتم توجيهه للمكتبة
          onLoginSuccess('user'); 
        } else {
          // إذا كانت الباقة مجانية، يتم تسجيل الخروج الفوري وإظهار رسالة خطأ
          await supabase.auth.signOut();
          setError('عذراً، هذه المكتبة متاحة فقط لمشتركي باقة Pro فأعلى.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ، يرجى التأكد من الإيميل وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* عناصر تصميم الخلفية */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-lowest rounded-3xl shadow-ambient p-10 border border-outline-variant/30 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-full signature-gradient flex items-center justify-center">
            <span className="text-white font-display font-bold text-2xl leading-none">L</span>
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-center mb-2">تسجيل الدخول</h2>
        <p className="text-sm text-on-surface-variant text-center mb-8">سجل دخولك باستخدام حسابك في ArtiX.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}
          <Input 
            label="البريد الإلكتروني" 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            required 
            disabled={loading}
          />
          <Input 
            label="كلمة المرور" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required 
            disabled={loading}
          />
          
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'جاري التحقق...' : 'دخول'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

// --- ADMIN COMPONENTS ---

const AdminLayout = ({ children, currentView, onViewChange, onLogout }: any) => {
  const navItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-prompts', label: 'Prompts', icon: FileText },
    { id: 'admin-add', label: 'Add Prompt', icon: PlusCircle },
    { id: 'admin-settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-lowest border-r border-surface-container-high flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full signature-gradient flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg leading-none">L</span>
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">Curator</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-primary' : 'text-outline'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-container-high">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Header */}
        <header className="h-20 px-8 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-40">
          <h2 className="text-xl font-display font-semibold capitalize">
            {currentView.replace('admin-', '')}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-low text-on-surface-variant relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-dim overflow-hidden border border-outline-variant">
              <img src="https://i.pravatar.cc/150?img=32" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const AdminDashboardView = ({ promptsData = [] }: any) => {
  // 1. حساب الإحصائيات الحقيقية
  const totalPrompts = promptsData.length;
  const totalViews = promptsData.reduce((sum: number, prompt: any) => sum + (prompt.views || 0), 0);
  const totalDownloads = promptsData.reduce((sum: number, prompt: any) => sum + (prompt.downloads || 0), 0);
  
  const kpis = [
    { label: 'إجمالي البرومبتات', value: totalPrompts.toString(), trend: 'مباشر', positive: true },
    { label: 'إجمالي المشاهدات', value: totalViews.toString(), trend: 'مباشر', positive: true },
    { label: 'عمليات النسخ', value: totalDownloads.toString(), trend: 'مباشر', positive: true },
    { label: 'حالة المكتبة', value: totalPrompts > 0 ? 'نشط' : 'فارغ', trend: '', positive: true },
  ];

  // 2. حساب توزيع الأقسام
  const categoryCounts = promptsData.reduce((acc: any, prompt: any) => {
    const cat = prompt.category || 'غير مصنف';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const topCategories = Object.entries(categoryCounts)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 4);

  // 3. تجهيز بيانات المخطط البياني التفاعلي (أعلى 7 أقسام)
  const chartData = Object.entries(categoryCounts)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 7)
    .map(([cat, count]: any) => ({
      label: cat,
      value: count
    }));
  
  // معرفة أعلى قيمة لضبط ارتفاع الأعمدة بشكل متناسق
  const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 1;

  // 4. جلب أحدث الإضافات
  const recentPrompts = promptsData.slice(0, 3);

  return (
    <div className="space-y-8" dir="rtl">
      {/* قسم البطاقات الرقمية (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm text-right">
            <p className="text-sm font-medium text-on-surface-variant mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between flex-row-reverse">
              <h3 className="text-3xl font-display font-bold text-left">{kpi.value}</h3>
              <span className={`text-sm font-medium ${kpi.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* قسم المخطط البياني التفاعلي */}
        <div className="lg:col-span-2 bg-surface-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-semibold text-lg">كثافة البرومبتات حسب القسم</h3>
          </div>
          
          {chartData.length > 0 ? (
            <div className="flex-1 flex items-end gap-2 sm:gap-4 h-64 mt-4 relative pt-10">
              {chartData.map((data, i) => {
                // حساب النسبة المئوية للارتفاع (بحد أدنى 5% ليبقى العمود ظاهراً)
                const heightPercent = Math.max((data.value / maxChartValue) * 100, 5); 
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end cursor-pointer">
                    
                    {/* التلميح التفاعلي (Tooltip) عند تمرير الماوس */}
                    <div className="absolute -top-12 bg-on-surface text-surface-lowest px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 whitespace-nowrap z-10 shadow-ambient pointer-events-none">
                      {data.value} برومبت
                      {/* مثلث التلميح الصغير */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-on-surface"></div>
                    </div>
                    
                    {/* عمود المخطط البياني */}
                    <div className="w-full bg-surface-container-high rounded-t-xl relative overflow-hidden flex items-end h-full">
                      <div 
                        className="w-full bg-primary rounded-t-xl transition-all duration-1000 ease-out group-hover:bg-primary/80"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    
                    {/* اسم القسم تحت العمود */}
                    <span className="text-xs text-on-surface-variant font-medium truncate w-full text-center px-1">
                      {data.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[200px] border-2 border-dashed border-outline-variant rounded-2xl bg-surface-low/50">
              <p className="text-on-surface-variant text-sm font-medium">قم بإضافة برومبتات ليظهر المخطط البياني</p>
            </div>
          )}
        </div>

        {/* قسم الأقسام والنشاطات */}
        <div className="space-y-8">
          
          {/* توزيع الأقسام */}
          <div className="bg-surface-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-display font-semibold text-lg w-full mb-6 text-right">المجموع الكلي</h3>
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f0eded" strokeWidth="15" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#003b93" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="60" className="transition-all duration-1000" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6b38d4" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="190" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-on-surface">{totalPrompts}</span>
                <span className="text-xs text-on-surface-variant mt-1">برومبت</span>
              </div>
            </div>
          </div>

          {/* أحدث النشاطات */}
          <div className="bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
            <h3 className="font-display font-semibold text-lg mb-4 text-right">أحدث الإضافات</h3>
            <div className="space-y-4">
              {recentPrompts.length > 0 ? recentPrompts.map((prompt: any) => (
                <div key={prompt.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="text-sm text-on-surface">
                      تمت إضافة <span className="font-medium text-primary">{prompt.title}</span>
                    </p>
                    <p className="text-xs text-outline mt-0.5">{prompt.category}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-on-surface-variant text-center py-4">لا يوجد نشاطات حديثة</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const AdminManagePromptsView = ({ promptsData, onEditPrompt }: any) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' }); // نظام رسائل جديد بدل الـ alert

  const handleDelete = async (id: string) => {
    // شلنا window.confirm لأن بيئة المعاينة بتمنعه
    setDeletingId(id);
    setActionMessage({ type: '', text: '' });
    
    try {
      const { data, error } = await supabase
        .from('prompt_library')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setActionMessage({ type: 'error', text: 'تم رفض الحذف. يرجى التأكد من صلاحيات قاعدة البيانات.' });
        return;
      }
      
      // إذا نجح الحذف
      setActionMessage({ type: 'success', text: 'تم حذف البرومبت بنجاح!' });
      window.dispatchEvent(new Event('refresh-prompts'));
      
      // إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
      
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'تنبيه: ' + err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* شريط البحث والفلترة العلوي */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant" />
          <input 
            type="text" 
            placeholder="البحث في البرومبتات..." 
            className="w-full bg-surface-lowest border border-outline-variant rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-left"
            dir="rtl"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="!py-2 gap-2"><Filter className="w-4 h-4" /> فلترة</Button>
        </div>
      </div>

      {/* رسالة الإشعار بالحذف */}
      {actionMessage.text && (
        <div className={`p-4 rounded-xl text-sm font-medium text-center ${actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {actionMessage.text}
        </div>
      )}

      {/* جدول عرض البرومبتات */}
      <div className="bg-surface-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" dir="ltr">
            <thead>
              <tr className="border-b border-surface-container-high text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4">Prompt Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {promptsData.map((prompt: any) => (
                <tr key={prompt.id} className="hover:bg-surface-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={prompt.image} alt={prompt.title} className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20" />
                      <div>
                        <h4 className="font-display font-medium text-on-surface line-clamp-1">{prompt.title}</h4>
                        <p className="text-xs text-on-surface-variant line-clamp-1 max-w-[200px]">{prompt.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-xs font-medium text-on-surface-variant">
                      {prompt.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {prompt.views}</span>
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {prompt.downloads}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {prompt.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      <button 
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="تعديل"
                        onClick={() => onEditPrompt(prompt)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button 
                        className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                        onClick={() => handleDelete(prompt.id)}
                        disabled={deletingId === prompt.id}
                      >
                        {deletingId === prompt.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {promptsData.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              لا يوجد برومبتات حالياً. ابدأ بإضافة البعض!
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-surface-container-high flex items-center justify-between text-sm text-on-surface-variant">
          <span>إجمالي البرومبتات: {promptsData.length}</span>
        </div>
      </div>
    </div>
  );
};

const AdminAddPromptView = ({ categories = [] }: any) => {
  // متغيرات لتخزين البيانات
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [promptText, setPromptText] = useState('');
  const [description, setDescription] = useState(''); // جديد: الوصف
  const [keywords, setKeywords] = useState(''); // جديد: الكلمات المفتاحية
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // دالة ضغط الصورة (بقييت كما هي)
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200; const MAX_HEIGHT = 1200;
          let width = img.width; let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob); else reject(new Error('Canvas failed'));
          }, 'image/webp', 0.7);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let finalImageUrl = 'https://via.placeholder.com/800x600?text=No+Image';

      if (imageFile) {
        const compressedBlob = await compressImage(imageFile);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('prompts_images')
          .upload(fileName, compressedBlob, { contentType: 'image/webp' });
        if (uploadError) throw new Error('فشل رفع الصورة: ' + uploadError.message);
        const { data: publicUrlData } = supabase.storage.from('prompts_images').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }

      // إدخال كل البيانات بما فيها الوصف والكلمات المفتاحية
      const { error: dbError } = await supabase
        .from('prompt_library')
        .insert([{ 
            title: title, 
            category: category, 
            prompt_text: promptText, 
            image_url: finalImageUrl,
            description: description,
            keywords: keywords
        }]);

      if (dbError) throw dbError;

      setMessage({ type: 'success', text: 'تمت إضافة البرومبت بنجاح!' });
      
      // 1. تفريغ الحقول لبرومبت جديد
      setTitle('');
      setCategory('');
      setPromptText('');
      setDescription('');
      setKeywords('');
      setImageFile(null);
      setImagePreview('');

      // 2. إرسال إشارة صامتة لتحديث البيانات بدون ريفريش
      window.dispatchEvent(new Event('refresh-prompts'));

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء الإضافة.' });
      setLoading(false); // نوقف التحميل فقط في حال الخطأ
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* قسم الصورة */}
        <div className="lg:col-span-1">
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm h-full">
            <h3 className="font-display font-semibold text-lg mb-4">صورة البرومبت</h3>
            <div className="flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant rounded-2xl h-64 flex flex-col items-center justify-center text-center p-2 bg-surface-low overflow-hidden hover:border-primary hover:bg-surface-low/50 transition-colors group relative"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <span className="text-white text-sm font-medium">تغيير الصورة</span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-outline mb-3 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-on-surface">اختر صورة من جهازك</p>
                  </>
                )}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        {/* قسم التفاصيل */}
        <div className="lg:col-span-2">
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <h3 className="font-display font-semibold text-lg mb-6">تفاصيل البرومبت</h3>
            
            {message.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm text-center font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="عنوان البرومبت (Title)" value={title} onChange={(e: any) => setTitle(e.target.value)} required />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant">القسم (Category)</label>
                  <select 
                    className="w-full bg-surface-lowest border border-outline-variant rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                    value={category} onChange={(e: any) => setCategory(e.target.value)} required
                  >
                    <option value="" disabled>اختر القسم...</option>
                    {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              {/* الحقول الجديدة */}
              <Input 
                label="وصف قصير (Short Description)" 
                placeholder="اشرح باختصار ماذا يفعل هذا البرومبت..." 
                value={description} 
                onChange={(e: any) => setDescription(e.target.value)} 
              />
              
              <Textarea label="نص البرومبت (The Prompt)" rows={5} className="font-mono text-sm text-left" dir="ltr" value={promptText} onChange={(e: any) => setPromptText(e.target.value)} required />
              
              <Input 
                label="كلمات مفتاحية (Keywords)" 
                placeholder="مثال: ui, glass, dark mode (افصل بينها بفاصلة)" 
                value={keywords} 
                onChange={(e: any) => setKeywords(e.target.value)} 
              />

              <div className="pt-6 border-t border-surface-container-high flex justify-end gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'جاري الحفظ والرفع...' : 'حفظ البرومبت'}
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

const AdminSettingsView = () => {
  // --- حالات معلومات الحساب ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // --- حالات الإعدادات الاحترافية للمنصة ---
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  
  const [requireLoginToCopy, setRequireLoginToCopy] = useState(true);
  const [addWatermark, setAddWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('');
  
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. جلب بيانات البروفايل + الإعدادات من قاعدة البيانات عند فتح الصفحة
  useEffect(() => {
    const loadData = async () => {
      try {
        // جلب الإيميل والاسم
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
          if (profile) setFullName(profile.full_name || '');
        }

        // جلب الإعدادات من جدول site_settings
        const { data: settings, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (settings) {
          if (settings.categories) setCategories(settings.categories);
          setRequireLoginToCopy(settings.require_login_to_copy ?? true);
          setAddWatermark(settings.add_watermark ?? true);
          setWatermarkText(settings.watermark_text || '');
          setSeoTitle(settings.seo_title || '');
          setSeoDesc(settings.seo_desc || '');
          setSeoKeywords(settings.seo_keywords || '');
          setMaintenanceMode(settings.maintenance_mode ?? false);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    
    loadData();
  }, []);

  // دوال إدارة الأقسام
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setCategories(categories.filter(c => c !== catToRemove));
  };

  // 2. دالة الحفظ الشاملة (لترسل البيانات لقاعدة البيانات)
  const handleSaveAllSettings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // حفظ الاسم
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
      }

      // حفظ الإعدادات في جدول site_settings
      const { error: settingsError } = await supabase
        .from('site_settings')
        .update({
          categories: categories,
          require_login_to_copy: requireLoginToCopy,
          add_watermark: addWatermark,
          watermark_text: watermarkText,
          seo_title: seoTitle,
          seo_desc: seoDesc,
          seo_keywords: seoKeywords,
          maintenance_mode: maintenanceMode,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (settingsError) throw settingsError;
      
      setMessage({ type: 'success', text: 'تم حفظ جميع الإعدادات بنجاح!' });
      
      // إخفاء الرسالة بعد 4 ثواني
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);

      // (جديد) إرسال إشارة للتطبيق الأساسي لحتى يحدث حالة الصيانة فوراً
      window.dispatchEvent(new Event('refresh-settings'));
      
    } catch (error: any) {
      setMessage({ type: 'error', text: 'حدث خطأ: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12" dir="rtl">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold">إعدادات المنصة</h2>
          <p className="text-on-surface-variant mt-1">إدارة حسابك، الأقسام، الصلاحيات، ومحركات البحث.</p>
        </div>
        <Button onClick={handleSaveAllSettings} disabled={loading} className="gap-2 px-8">
          <Check className="w-5 h-5" />
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium text-center shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* العمود الأيمن (يأخذ 7 أعمدة) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. إدارة الأقسام */}
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <h3 className="font-display font-semibold text-lg border-b border-surface-container-high pb-4 mb-6 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" /> إدارة الأقسام
            </h3>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="اسم القسم الجديد..." 
                className="flex-1 bg-surface-low border border-outline-variant rounded-xl px-4 py-2 focus:border-primary focus:outline-none"
              />
              <Button onClick={handleAddCategory} variant="secondary" className="!py-2 !px-4"><PlusCircle className="w-5 h-5" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg text-sm font-medium">
                  {cat}
                  <button onClick={() => handleRemoveCategory(cat)} className="text-outline hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. إعدادات SEO محركات البحث */}
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <h3 className="font-display font-semibold text-lg border-b border-surface-container-high pb-4 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> إعدادات محركات البحث (SEO)
            </h3>
            <div className="space-y-4">
              <Input label="عنوان الموقع (Meta Title)" value={seoTitle} onChange={(e:any) => setSeoTitle(e.target.value)} />
              <Textarea label="وصف الموقع (Meta Description)" rows={2} value={seoDesc} onChange={(e:any) => setSeoDesc(e.target.value)} />
              <Input label="كلمات مفتاحية (مفصولة بفاصلة)" value={seoKeywords} onChange={(e:any) => setSeoKeywords(e.target.value)} />
            </div>
          </div>

        </div>

        {/* العمود الأيسر (يأخذ 5 أعمدة) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* 3. الحساب الشخصي */}
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <h3 className="font-display font-semibold text-lg border-b border-surface-container-high pb-4 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> حساب الإدارة
            </h3>
            <div className="space-y-4">
              <Input label="الاسم الكامل" value={fullName} onChange={(e:any) => setFullName(e.target.value)} />
              <Input label="البريد الإلكتروني" value={email} disabled className="opacity-70" />
            </div>
          </div>

          {/* 4. صلاحيات النسخ والمعرض */}
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <h3 className="font-display font-semibold text-lg border-b border-surface-container-high pb-4 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> صلاحيات النسخ والعرض
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">فرض تسجيل الدخول للنسخ</p>
                  <p className="text-xs text-on-surface-variant">منع الزوار من نسخ البرومبت بدون حساب.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={requireLoginToCopy} onChange={(e) => setRequireLoginToCopy(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">إضافة حقوق (Watermark)</p>
                  <p className="text-xs text-on-surface-variant">إضافة توقيعك نهاية كل برومبت منسوخ.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={addWatermark} onChange={(e) => setAddWatermark(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              {addWatermark && (
                <Input value={watermarkText} onChange={(e:any) => setWatermarkText(e.target.value)} placeholder="مثال: تم النسخ من منصة..." className="mt-2" />
              )}
            </div>
          </div>

          {/* 5. وضع الصيانة */}
          <div className={`rounded-3xl border p-8 shadow-sm transition-colors ${maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-surface-lowest border-outline-variant/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className={`p-2 rounded-full ${maintenanceMode ? 'bg-red-100 text-red-600' : 'bg-surface-low text-outline'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-display font-semibold ${maintenanceMode ? 'text-red-700' : ''}`}>وضع الصيانة</h3>
                  <p className={`text-xs ${maintenanceMode ? 'text-red-600/80' : 'text-on-surface-variant'}`}>إغلاق المنصة عن الزوار مؤقتاً.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


const AdminEditPromptView = ({ prompt, categories = [], onCancel, onSuccess }: any) => {
  // تعبئة الحقول بالبيانات القديمة للبرومبت المختار
  const [title, setTitle] = useState(prompt?.title || '');
  const [category, setCategory] = useState(prompt?.category || '');
  const [promptText, setPromptText] = useState(prompt?.promptText || '');
  const [description, setDescription] = useState(prompt?.description || '');
  const [keywords, setKeywords] = useState(prompt?.keywords ? prompt.keywords.join(', ') : '');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(prompt?.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // دالة ضغط الصورة (نفسها تماماً)
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200; const MAX_HEIGHT = 1200;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob); else reject(new Error('Canvas failed'));
          }, 'image/webp', 0.7);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // افتراضياً، نحتفظ برابط الصورة القديمة
      let finalImageUrl = prompt.image;

      // إذا اختار الأدمن صورة جديدة، نضغطها ونرفعها
      if (imageFile) {
        const compressedBlob = await compressImage(imageFile);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('prompts_images')
          .upload(fileName, compressedBlob, { contentType: 'image/webp' });
        if (uploadError) throw new Error('فشل رفع الصورة: ' + uploadError.message);
        const { data: publicUrlData } = supabase.storage.from('prompts_images').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }

      // إرسال أمر التحديث لقاعدة البيانات (بدل الإضافة)
      const { error: dbError } = await supabase
        .from('prompt_library')
        .update({ 
            title: title, 
            category: category, 
            prompt_text: promptText, 
            image_url: finalImageUrl,
            description: description,
            keywords: keywords
        })
        .eq('id', prompt.id); // نحدد البرومبت عن طريق الـ ID تبعه

      if (dbError) throw dbError;

      setMessage({ type: 'success', text: 'تم تعديل البرومبت بنجاح! جاري العودة...' });
      
      // تحديث الجدول الصامت والعودة بعد ثانية ونصف
      window.dispatchEvent(new Event('refresh-prompts'));
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء التعديل.' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* رأس الصفحة مع زر التراجع */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 bg-surface-lowest border border-outline-variant rounded-full hover:bg-surface-low transition-colors">
          <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-bold">تعديل البرومبت</h2>
          <p className="text-sm text-on-surface-variant">أنت الآن تقوم بتعديل: {prompt?.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* قسم الصورة */}
        <div className="lg:col-span-1">
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm h-full">
            <h3 className="font-display font-semibold text-lg mb-4">صورة البرومبت</h3>
            <div className="flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant rounded-2xl h-64 flex flex-col items-center justify-center text-center p-2 bg-surface-low overflow-hidden hover:border-primary hover:bg-surface-low/50 transition-colors group relative"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <span className="text-white text-sm font-medium">تغيير الصورة</span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-outline mb-3 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-on-surface">اختر صورة جديدة</p>
                  </>
                )}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <p className="text-xs text-center text-on-surface-variant">اترك الصورة كما هي إذا لم ترغب بتغييرها.</p>
            </div>
          </div>
        </div>

        {/* قسم التفاصيل */}
        <div className="lg:col-span-2">
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <h3 className="font-display font-semibold text-lg mb-6">تفاصيل البرومبت</h3>
            
            {message.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm text-center font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="عنوان البرومبت (Title)" value={title} onChange={(e: any) => setTitle(e.target.value)} required />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant">القسم (Category)</label>
                  <select 
                    className="w-full bg-surface-lowest border border-outline-variant rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                    value={category} onChange={(e: any) => setCategory(e.target.value)} required
                  >
                    {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <Input label="وصف قصير (Short Description)" value={description} onChange={(e: any) => setDescription(e.target.value)} />
              <Textarea label="نص البرومبت (The Prompt)" rows={5} className="font-mono text-sm text-left" dir="ltr" value={promptText} onChange={(e: any) => setPromptText(e.target.value)} required />
              <Input label="كلمات مفتاحية (Keywords)" value={keywords} onChange={(e: any) => setKeywords(e.target.value)} />

              <div className="pt-6 border-t border-surface-container-high flex justify-end gap-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>إلغاء</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- MAIN APP COMPONENT ---
const MaintenanceView = ({ onLoginClick }: any) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface relative">
    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <ShieldAlert className="w-10 h-10 text-primary animate-pulse" />
    </div>
    <h1 className="text-3xl font-display font-bold mb-4">منصة ArtiX في أعمال صيانة</h1>
    <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
      نحن الآن نقوم بتحديث المكتبة وتطوير بعض الميزات الجديدة لنقدم لكم تجربة أفضل. سنعود للعمل قريباً جداً!
    </p>
    <div className="mt-10 text-xs text-outline flex flex-col items-center gap-4">
      <span>شكراً لصبركم وثقتكم بنا.</span>
      
      {/* زر سري للأدمن للوصول لصفحة تسجيل الدخول */}
      <button 
        onClick={onLoginClick} 
        className="text-primary/10 hover:text-primary transition-colors duration-300 p-2"
        title="دخول الإدارة"
      >
        <Lock className="w-4 h-4" />
      </button>
    </div>
  </div>
);
export default function App() {
  const [currentView, setCurrentView] = useState('login'); // gallery, prompt-detail, login, admin-dashboard, admin-prompts, admin-add, admin-settings
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
// --- متغيرات لتخزين البرومبتات وحالة التحميل ---
  const [promptsData, setPromptsData] = useState<any[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // --- دالة جلب البيانات من سوبابيز ---
  // --- دالة جلب البيانات والإعدادات من سوبابيز ---
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // تأكد من وضع إيميل الإدارة الخاص بك هنا
        setIsAdmin(user.email === 'vb.ip.gt@gmail.com');
      } else {
        setIsAdmin(false);
      }
    };
    checkUserRole();
    const fetchSettings = async () => {
      try {
        // ضفنا كلمة categories لنجلبها من القاعدة
        const { data } = await supabase.from('site_settings').select('maintenance_mode, categories').eq('id', 1).single();
        if (data) {
          setMaintenanceMode(data.maintenance_mode);
          if (data.categories) setCategories(data.categories); // حفظ الأقسام الحقيقية
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    const fetchPrompts = async () => {
      try {
        const { data, error } = await supabase
          .from('prompt_library')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedData = data.map((item: any) => ({
            id: item.id,
            title: item.title || 'بدون عنوان',
            category: item.category || 'All',
            description: item.description || 'لا يوجد وصف حالياً',
            promptText: item.prompt_text || '',
            image: item.image_url || 'https://via.placeholder.com/800x600?text=No+Image',
            author: 'إدارة ArtiX',
            date: new Date(item.created_at).toLocaleDateString('ar-EG'),
            views: item.views || 0,
            downloads: item.downloads || 0,
            keywords: item.keywords ? item.keywords.split(',') : [] 
          }));
          setPromptsData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching prompts:', err);
      } finally {
        setLoadingPrompts(false);
      }
    };

    // جلب البيانات والإعدادات أول مرة بيشتغل فيها التطبيق
    fetchPrompts();
    fetchSettings(); 

    // الاستماع لأي إشارة تحديث قادمة من لوحة التحكم (الرادارات)
    window.addEventListener('refresh-prompts', fetchPrompts);
    window.addEventListener('refresh-settings', fetchSettings); // <-- هذا السطر كان ناقص عندك
    
    // تنظيف الرادار
    return () => {
      window.removeEventListener('refresh-prompts', fetchPrompts);
      window.removeEventListener('refresh-settings', fetchSettings); // <-- وهذا كمان
    };
  }, []);

  const handleViewPrompt = (id: string) => {
    setSelectedPromptId(id);
    setCurrentView('prompt-detail');
  };

  const renderView = () => {
    // 1. نظام حماية وضع الصيانة (شغال 100%)
    if (maintenanceMode && currentView !== 'login' && !currentView.startsWith('admin')) {
      return <MaintenanceView onLoginClick={() => setCurrentView('login')} />;
    }

    switch (currentView) {
      // --- واجهة المعرض الرئيسية ---
      case 'gallery':
        return <GalleryView 
                 promptsData={promptsData} 
                 categories={categories}
                 isAdmin={isAdmin} 
                 onAdminClick={() => setCurrentView('admin-dashboard')} 
                 onViewPrompt={handleViewPrompt}
                 onLogout={async () => {
                   await supabase.auth.signOut(); 
                   setIsAdmin(false);
                   setCurrentView('login'); 
                 }} 
               />;

      // --- صفحة تفاصيل البرومبت ---
      case 'prompt-detail':
        return <PromptDetailView 
                 promptsData={promptsData} 
                 promptId={selectedPromptId} 
                 onBack={() => setCurrentView('gallery')} 
               />;
    
      // --- صفحة تسجيل الدخول (معدلة لتوجهك دائماً للمعرض) ---
      case 'login':
        return (
          <LoginView 
            onLoginSuccess={(role: string) => {
              setIsAdmin(role === 'admin'); // التعرف على رتبتك فوراً
              setCurrentView('gallery');    // التوجه دائماً للمعرض بدلاً من لوحة التحكم
            }} 
            onBack={() => setCurrentView('gallery')} 
          />
        );

      // --- صفحات لوحة التحكم للأدمن (منظمة وبدون تكرار) ---
      case 'admin-dashboard':
      case 'admin-prompts':
      case 'admin-add':
      case 'admin-settings':
      case 'admin-edit':
        return (
          <AdminLayout 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            onLogout={async () => {
              await supabase.auth.signOut();
              setIsAdmin(false);
              setCurrentView('login');
            }}
          >
            {currentView === 'admin-dashboard' && <AdminDashboardView promptsData={promptsData} />}
            
            {currentView === 'admin-prompts' && (
              <AdminManagePromptsView 
                promptsData={promptsData} 
                onEditPrompt={(prompt: any) => {
                  setEditingPrompt(prompt);
                  setCurrentView('admin-edit');
                }} 
              />
            )}
            
            {currentView === 'admin-add' && <AdminAddPromptView categories={categories} />}
            
            {currentView === 'admin-edit' && (
              <AdminEditPromptView 
                prompt={editingPrompt} 
                categories={categories} 
                onCancel={() => setCurrentView('admin-prompts')}
                onSuccess={() => setCurrentView('admin-prompts')}
              />
            )}
            
            {currentView === 'admin-settings' && <AdminSettingsView />}
          </AdminLayout>
        );

      // الحالة الافتراضية
      default:
        return <GalleryView 
                 promptsData={promptsData} 
                 categories={categories}
                 isAdmin={isAdmin} 
                 onAdminClick={() => setCurrentView('admin-dashboard')} 
                 onViewPrompt={handleViewPrompt}
                 onLogout={async () => {
                   await supabase.auth.signOut(); 
                   setIsAdmin(false);
                   setCurrentView('login'); 
                 }} 
               />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView.startsWith('admin') ? 'admin' : currentView}
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="min-h-screen bg-surface"
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}
