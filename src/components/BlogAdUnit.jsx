import { useEffect } from 'react';

const ADSENSE_CLIENT = 'ca-pub-4010004205574660';
const ADSENSE_SCRIPT_ID = 'adsense-script-a3-blog';

function ensureAdSenseScript() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

export default function BlogAdUnit({ slot, className = '', style = {} }) {
  useEffect(() => {
    ensureAdSenseScript();
    if (typeof window === 'undefined') return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore duplicate push errors from fast route transitions.
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`.trim()}
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
