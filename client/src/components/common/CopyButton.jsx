import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = '',
  iconOnly = false
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
        copied
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10 hover:border-white/20'
      } border rounded-lg text-xs font-medium px-2 py-1 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          {!iconOnly && <span>{copiedLabel}</span>}
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          {!iconOnly && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
