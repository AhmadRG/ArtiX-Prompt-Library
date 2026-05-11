import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
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

export const Input = ({ label, icon: Icon, className = '', ...props }: any) => (
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

export const Textarea = ({ label, className = '', ...props }: any) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className="text-sm font-medium text-on-surface-variant">{label}</label>}
    <textarea 
      className="w-full bg-surface-lowest border border-outline-variant rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
      {...props}
    />
  </div>
);
