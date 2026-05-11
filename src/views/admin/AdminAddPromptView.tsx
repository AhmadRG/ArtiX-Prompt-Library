import React, { useState, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase';
import { Button, Input, Textarea } from '../../components/Shared';

export const AdminAddPromptView = ({ categories = [] }: any) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [promptText, setPromptText] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  
  const [useCases, setUseCases] = useState('');
  const [varStyle, setVarStyle] = useState('');
  const [varLighting, setVarLighting] = useState('');
  const [varCamera, setVarCamera] = useState('');
  const [varMood, setVarMood] = useState('');
  const [varTexture, setVarTexture] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  const [message, setMessage] = useState({ type: '', text: '' });

  const analyzeWithGemini = async () => {
    if (!promptText.trim()) {
      setMessage({ type: 'error', text: 'يرجى كتابة نص البرومبت أولاً قبل التحليل!' });
      return;
    }

    setIsAnalyzing(true);
    setMessage({ type: '', text: '' });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

    if (!GEMINI_API_KEY) {
      setMessage({ type: 'error', text: 'يرجى وضع مفتاح Gemini API في الكود أولاً!' });
      setIsAnalyzing(false);
      return;
    }

    try {
      const promptForGemini = `
      قم بتحليل هذا البرومبت المخصص لتوليد الصور بالذكاء الاصطناعي:
      "${promptText}"

      استخرج المتغيرات القابلة للتعديل منه، وأرجع النتيجة بصيغة JSON فقط وبنفس هذه المفاتيح تماماً:
      {
        "useCases": "اقترح أفضل 3 استخدامات لهذا البرومبت باللغة العربية مفصولة بفاصلة (مثال: تصميم شعار، خلفية، الخ)",
        "varStyle": "الأسلوب الفني بالإنجليزية (مثل 3D Render) أو اتركه فارغاً",
        "varLighting": "الإضاءة بالإنجليزية (مثل Cinematic lighting) أو اتركه فارغاً",
        "varCamera": "زاوية الكاميرا بالإنجليزية (مثل Close-up) أو اتركه فارغاً",
        "varMood": "المزاج العام بالإنجليزية (مثل Cyberpunk) أو اتركه فارغاً",
        "varTexture": "الخامات بالإنجليزية (مثل Metallic) أو اتركه فارغاً"
      }
      لا تكتب أي نص آخر خارج كود الـ JSON.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptForGemini }] }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'تم رفض الطلب من جوجل بدون تفاصيل إضافية.');
      }

      const textResult = data.candidates[0].content.parts[0].text;

      const cleanJson = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      setUseCases(parsedData.useCases || '');
      setVarStyle(parsedData.varStyle || '');
      setVarLighting(parsedData.varLighting || '');
      setVarCamera(parsedData.varCamera || '');
      setVarMood(parsedData.varMood || '');
      setVarTexture(parsedData.varTexture || '');

      setMessage({ type: 'success', text: '✨ تم التحليل وتعبئة الخانات بنجاح!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);

    } catch (error: any) {
      console.error('Gemini Error:', error);
      setMessage({ type: 'error', text: `خطأ من جوجل: ${error.message}` });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
          canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('Canvas failed')); }, 'image/webp', 0.7);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
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
        const { error: uploadError } = await supabase.storage.from('prompts_images').upload(fileName, compressedBlob, { contentType: 'image/webp' });
        if (uploadError) throw new Error('فشل رفع الصورة: ' + uploadError.message);
        const { data: publicUrlData } = supabase.storage.from('prompts_images').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }

      const promptVariables = [
        { type: 'الأسلوب الفني', value: varStyle },
        { type: 'الإضاءة', value: varLighting },
        { type: 'اللقطة والكاميرا', value: varCamera },
        { type: 'المزاج العام', value: varMood },
        { type: 'الخامات', value: varTexture }
      ].filter(v => v.value.trim() !== '');

      const { error: dbError } = await supabase.from('prompt_library').insert([{ 
        title, category, ai_model: aiModel, prompt_text: promptText, image_url: finalImageUrl, description, keywords,
        use_cases: useCases, prompt_variables: promptVariables
      }]);

      if (dbError) throw dbError;

      setMessage({ type: 'success', text: 'تمت إضافة البرومبت بنجاح!' });
      setTitle(''); setCategory(''); setAiModel(''); setPromptText(''); setDescription(''); setKeywords('');
      setUseCases(''); setVarStyle(''); setVarLighting(''); setVarCamera(''); setVarMood(''); setVarTexture('');
      setImageFile(null); setImagePreview('');
      window.dispatchEvent(new Event('refresh-prompts'));

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء الإضافة.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm h-full">
            <h3 className="font-display font-semibold text-lg mb-4">صورة البرومبت</h3>
            <div className="flex flex-col gap-4">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-outline-variant rounded-2xl h-64 flex flex-col items-center justify-center text-center p-2 bg-surface-low hover:border-primary hover:bg-surface-low/50 transition-colors group relative overflow-hidden">
                {imagePreview ? (
                  <><img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-white text-sm font-medium">تغيير الصورة</span></div></>
                ) : (
                  <><ImageIcon className="w-10 h-10 text-outline mb-3 group-hover:text-primary transition-colors" /><p className="text-sm font-medium text-on-surface">اختر صورة من جهازك</p></>
                )}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-surface-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <h3 className="font-display font-semibold text-lg mb-6">تفاصيل البرومبت</h3>
            {message.text && <div className={`p-4 rounded-xl mb-6 text-sm text-center font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{message.text}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="عنوان البرومبت (Title)" value={title} onChange={(e: any) => setTitle(e.target.value)} required />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant">القسم (Category)</label>
                  <select className="w-full bg-surface-lowest border border-outline-variant rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary appearance-none" value={category} onChange={(e: any) => setCategory(e.target.value)} required>
                    <option value="" disabled>اختر القسم...</option>
                    {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant">الذكاء الاصطناعي المستخدم (AI Model)</label>
                  <select className="w-full bg-surface-lowest border border-outline-variant rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary appearance-none" value={aiModel} onChange={(e: any) => setAiModel(e.target.value)} required>
                    <option value="" disabled>اختر الذكاء الاصطناعي...</option>
                    <option value="ChatGPT">ChatGPT (DALL-E)</option>
                    <option value="Midjourney">Midjourney</option>
                    <option value="Stable Diffusion">Stable Diffusion</option>
                    <option value="Claude">Claude</option>
                    <option value="Gemini">Gemini</option>
                    <option value="Leonardo AI">Leonardo AI</option>
                    <option value="Adobe Firefly">Adobe Firefly</option>
                    <option value="أخرى">أخرى / Other</option>
                  </select>
              </div>
              
              <Input label="وصف قصير" value={description} onChange={(e: any) => setDescription(e.target.value)} />
              <Textarea label="نص البرومبت (The Prompt)" rows={5} className="font-mono text-sm text-left" dir="ltr" value={promptText} onChange={(e: any) => setPromptText(e.target.value)} required />
              <Input label="كلمات مفتاحية (مفصولة بفاصلة)" value={keywords} onChange={(e: any) => setKeywords(e.target.value)} />

              <div className="pt-6 border-t border-surface-container-high">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display font-semibold text-md text-primary flex items-center gap-2">💡 دليل الاستخدام الذكي</h4>
                  
                  <button 
                    type="button" 
                    onClick={analyzeWithGemini}
                    disabled={isAnalyzing || !promptText}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري التحليل...</>
                    ) : (
                      <>✨ استخراج تلقائي بالذكاء الاصطناعي</>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <Input label="أفضل الاستخدامات (Products/Use Cases)" placeholder="مثال: تصميم شعار، خلفية موقع (افصل بفاصلة)" value={useCases} onChange={(e: any) => setUseCases(e.target.value)} />
                  <div className="bg-surface-low/50 p-6 rounded-2xl border border-outline-variant/30">
                    <p className="text-sm font-medium text-on-surface-variant mb-4">الكلمات القابلة للتعديل في هذا البرومبت (Variables):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="الأسلوب الفني" placeholder="مثال: 3D Render" value={varStyle} onChange={(e:any) => setVarStyle(e.target.value)} />
                      <Input label="الإضاءة" placeholder="مثال: Cinematic lighting" value={varLighting} onChange={(e:any) => setVarLighting(e.target.value)} />
                      <Input label="اللقطة والكاميرا" placeholder="مثال: Close-up, Wide angle" value={varCamera} onChange={(e:any) => setVarCamera(e.target.value)} />
                      <Input label="المزاج العام" placeholder="مثال: Cyberpunk, Moody" value={varMood} onChange={(e:any) => setVarMood(e.target.value)} />
                      <Input label="الخامات" placeholder="مثال: Metallic, Matte" value={varTexture} onChange={(e:any) => setVarTexture(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-surface-container-high flex justify-end gap-4">
                <Button type="submit" disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ البرومبت'}</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
