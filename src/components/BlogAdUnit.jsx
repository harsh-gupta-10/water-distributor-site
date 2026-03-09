import { useEffect, useState } from 'react';

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

export default function BlogAdUnit({ 
  slot, 
  containerClassName = '', 
  containerStyle = {},
  insClassName = '',
  insStyle = {}
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ensureAdSenseScript();
    if (typeof window === 'undefined') return;

    // Set ready after a small delay to ensure script is loaded
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsReady(true);
      } catch {
        // Ignore errors from fast route transitions
        setIsReady(true);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until ads are ready
  if (!isReady) {
    return null;
  }

  return (
    <div className={containerClassName} style={containerStyle}>
      <ins
        className={`adsbygoogle ${insClassName}`.trim()}
        style={{ display: 'block', ...insStyle }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
