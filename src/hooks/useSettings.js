import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import siteConfig from '../data/siteConfig';

/**
 * Hook to fetch settings with automatic fallback
 * Priority: Database → Local siteConfig.js
 * 
 * This ensures the site works even if database is offline
 */
export function useSettings() {
    const [settings, setSettings] = useState(siteConfig);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState('local'); // 'db' or 'local'

    useEffect(() => {
        loadSettings();
        
        // Listen for custom refresh event from admin panel
        const handleRefresh = () => {
            loadSettings();
        };
        window.addEventListener('settingsUpdated', handleRefresh);
        
        // Also check for updates every 5 seconds (fallback)
        const interval = setInterval(loadSettings, 5000);
        
        return () => {
            window.removeEventListener('settingsUpdated', handleRefresh);
            clearInterval(interval);
        };
    }, []);

    async function loadSettings() {
        setLoading(true);
        try {
            // Try to fetch from database first
            const { data } = await supabase
                .from('settings')
                .select('config')
                .eq('id', 1)
                .maybeSingle();

            if (data && data.config && Object.keys(data.config).length > 0) {
                // Successfully loaded from database - merge with defaults
                const mergedSettings = { ...siteConfig, ...data.config };
                setSettings(mergedSettings);
                setSource('db');
            } else {
                // No data in database or empty config - use local file
                setSettings(siteConfig);
                setSource('local');
            }
        } catch (err) {
            // Database error - fallback to local file
            console.warn('⚠️ Database unavailable, using local siteConfig.js:', err.message);
            setSettings(siteConfig);
            setSource('local');
        } finally {
            setLoading(false);
        }
    }

    return { 
        settings, 
        loading, 
        source, // 'db' or 'local' - indicates where settings came from
        refresh: loadSettings 
    };
}

/**
 * Simple hook for components that just need settings values
 * (no loading state needed)
 */
export function useSettingsSync() {
    const { settings } = useSettings();
    return settings;
}
