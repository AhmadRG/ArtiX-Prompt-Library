import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Button, Input, Textarea } from '../../components/Shared';

export const AdminEditPromptView = ({ prompt, categories, onCancel, onSuccess }: any) => {
  const [title, setTitle] = useState(prompt?.title || '');
  const [category, setCategory] = useState(prompt?.category || '');
  const [aiModel, setAiModel] = useState(prompt?.aiModel || '');
  const [promptText, setPromptText] = useState(prompt?.promptText || '');
  const [description, setDescription] = useState(prompt?.description || '');
  const [keywords, setKeywords] = useState(prompt?.keywords?.join(', ') || '');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(prompt?.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      let finalImageUrl = prompt.image;

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

      const { error: dbError } = await supabase
        .from('prompt_library')
        .update({ 
            title: title, 
            category: category, 
            ai_model: aiModel,
            prompt_text: promptText, 
            image_url: finalImageUrl,
            description: description,
            keywords: keywords
        })
        .eq('id', prompt.id);

      if (dbError) throw dbError;

      setMessage({ type: 'success', text: 'تم تعديل البرومبت بنجاح! جاري العودة...' });
      
      window.dispatchEvent(new Event('refresh-prompts'));
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء التعديل.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto" dir="rtl">
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
