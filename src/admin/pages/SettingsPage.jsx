import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import siteConfig from '../../data/siteConfig';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSetupInstructions, setShowSetupInstructions] = useState(false);
    const [settings, setSettings] = useState({
        // Company Details
        businessName: siteConfig.businessName,
        businessNameHighlight: siteConfig.businessNameHighlight,
        tagline: siteConfig.tagline,
        phone: siteConfig.phone,
        phoneDisplay: siteConfig.phoneDisplay,
        whatsappNumber: siteConfig.whatsappNumber,
        email: siteConfig.email,
        addressShort: siteConfig.addressShort,
        addressFull: siteConfig.addressFull,
        googleMapsLink: siteConfig.googleMapsLink,
        googleMapsEmbed: siteConfig.googleMapsEmbed,
        googleRating: siteConfig.googleRating,
        gstInfo: siteConfig.gstInfo,
        footerDescription: siteConfig.footerDescription,
        heroSubtitle: siteConfig.heroSubtitle,
        businessHours: siteConfig.hours.allDays,
        
        // Product Display Settings
        showProductPrice: siteConfig.showProductPrice,
        showProductStock: siteConfig.showProductStock,
        
        // Blog Settings
        showBlog: siteConfig.showBlog,
        
        // Invoice Defaults
        defaultTaxRate: 18,
        invoicePrefix: 'INV',
        invoiceNotes: 'Payment is due within 30 days. Thank you for your business!',
        
        // WhatsApp Messages
        whatsappGeneral: siteConfig.whatsappMessages.general,
        whatsappQuotation: siteConfig.whatsappMessages.quotation,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setLoading(true);
        try {
            // Try to get settings from database
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle();

            if (data) {
                // Merge database settings with defaults
                setSettings(prev => ({ ...prev, ...data.config }));
            } else if (error && error.code === '42P01') {
                // Table doesn't exist
                await createSettingsTable();
                setShowSetupInstructions(true);
            }
        } catch (err) {
            console.error('Error loading settings:', err);
            if (err.message && (err.message.includes('table') || err.message.includes('settings'))) {
                setShowSetupInstructions(true);
            }
        }
        setLoading(false);
    }

    async function createSettingsTable() {
        // Table will be created via Supabase SQL editor
        console.log('Settings table needs to be created in Supabase');
        toast('Settings table not found! Please run the SQL script below in Supabase.', 'error');
    }

    async function handleSave() {
        setSaving(true);
        try {
            console.log('📤 Saving settings:', settings);
            
            // Check if settings row exists
            const { data: existing } = await supabase
                .from('settings')
                .select('id')
                .eq('id', 1)
                .maybeSingle();

            if (existing) {
                // Update existing
                const { data, error } = await supabase
                    .from('settings')
                    .update({ 
                        config: settings,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', 1);

                if (error) {
                    console.error('❌ Save error:', error);
                    throw error;
                }
                console.log('✅ Settings updated successfully:', data);
            } else {
                // Insert new
                const { data, error } = await supabase
                    .from('settings')
                    .insert({ 
                        id: 1,
                        config: settings,
                    });

                if (error) {
                    console.error('❌ Insert error:', error);
                    throw error;
                }
                console.log('✅ Settings inserted successfully:', data);
            }

            // Trigger refresh on all components listening to settings
            window.dispatchEvent(new Event('settingsUpdated'));
            console.log('📡 Broadcasted settings update to all components');

            toast('✅ Settings saved! Website will refresh automatically within 5 seconds.', 'success');
        } catch (err) {
            console.error('Error saving settings:', err);
            if (err.code === '42P01' || err.message.includes('table') || err.message.includes('settings')) {
                toast('⚠️ Settings table missing! Scroll down for setup instructions.', 'error');
                setShowSetupInstructions(true);
            } else {
                toast('Error saving settings: ' + err.message, 'error');
            }
        }
        setSaving(false);
    }

    function updateSetting(key, value) {
        setSettings(prev => ({ ...prev, [key]: value }));
    }

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading settings...</div>;
    }

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Settings</h1>
                    <p>Configure business information and preferences</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn-admin btn-admin--secondary" onClick={loadSettings}>
                        <RefreshCw size={16} /> Reload
                    </button>
                    <button 
                        className="btn-admin btn-admin--primary" 
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={16} /> {saving ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </div>

            {/* Info Box - How Settings Work */}
            <div style={{ 
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', 
                border: '2px solid #3B82F6', 
                borderRadius: 12, 
                padding: 20,
                marginBottom: 24,
                display: 'flex',
                gap: 16,
                alignItems: 'start'
            }}>
                <div style={{ fontSize: '28px' }}>💡</div>
                <div>
                    <h3 style={{ margin: 0, marginBottom: 8, fontSize: '1rem', fontWeight: 700, color: '#1E40AF' }}>
                        Smart Settings System with Offline Fallback
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1E3A8A', lineHeight: 1.6 }}>
                        Your website automatically tries to load settings from the <strong>database first</strong>. 
                        If the database is offline or unavailable, it seamlessly falls back to the local <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, color: '#DC2626' }}>siteConfig.js</code> file. 
                        This ensures your website <strong>works perfectly even during database outages</strong>. 
                        Changes saved here update the database immediately and are reflected on your website within seconds.
                    </p>
                </div>
            </div>

            {/* Company Details */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card__header">
                    <h3 className="card__title">Company Details</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label>Business Name (First Part)</label>
                            <input 
                                value={settings.businessName} 
                                onChange={e => updateSetting('businessName', e.target.value)} 
                                placeholder="A3"
                            />
                        </div>
                        <div className="form-field">
                            <label>Business Name (Highlight)</label>
                            <input 
                                value={settings.businessNameHighlight} 
                                onChange={e => updateSetting('businessNameHighlight', e.target.value)} 
                                placeholder="Distributors"
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Tagline</label>
                            <input 
                                value={settings.tagline || ''} 
                                onChange={e => updateSetting('tagline', e.target.value)}
                                placeholder="Your Trusted Water & Beverage Distribution Partner"
                                type="text"
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Hero Subtitle</label>
                            <textarea 
                                value={settings.heroSubtitle} 
                                onChange={e => updateSetting('heroSubtitle', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Footer Description</label>
                            <textarea 
                                value={settings.footerDescription} 
                                onChange={e => updateSetting('footerDescription', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card__header">
                    <h3 className="card__title">Contact Information</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label>Phone (Full Format)</label>
                            <input 
                                value={settings.phone} 
                                onChange={e => updateSetting('phone', e.target.value)}
                                placeholder="+917039414924"
                            />
                        </div>
                        <div className="form-field">
                            <label>Phone (Display Format)</label>
                            <input 
                                value={settings.phoneDisplay} 
                                onChange={e => updateSetting('phoneDisplay', e.target.value)}
                                placeholder="+91 70394 14924"
                            />
                        </div>
                        <div className="form-field">
                            <label>WhatsApp Number</label>
                            <input 
                                value={settings.whatsappNumber} 
                                onChange={e => updateSetting('whatsappNumber', e.target.value)}
                                placeholder="917039414924"
                            />
                        </div>
                        <div className="form-field">
                            <label>Email</label>
                            <input 
                                type="email"
                                value={settings.email} 
                                onChange={e => updateSetting('email', e.target.value)}
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Address (Short)</label>
                            <input 
                                value={settings.addressShort} 
                                onChange={e => updateSetting('addressShort', e.target.value)}
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Address (Full)</label>
                            <textarea 
                                value={settings.addressFull} 
                                onChange={e => updateSetting('addressFull', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="form-field">
                            <label>Business Hours</label>
                            <input 
                                value={settings.businessHours} 
                                onChange={e => updateSetting('businessHours', e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label>Google Rating</label>
                            <input 
                                value={settings.googleRating} 
                                onChange={e => updateSetting('googleRating', e.target.value)}
                                placeholder="5.0"
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Google Maps Link</label>
                            <input 
                                value={settings.googleMapsLink} 
                                onChange={e => updateSetting('googleMapsLink', e.target.value)}
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Google Maps Embed URL</label>
                            <input 
                                value={settings.googleMapsEmbed} 
                                onChange={e => updateSetting('googleMapsEmbed', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* GST & Legal */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card__header">
                    <h3 className="card__title">GST & Legal Information</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid form-grid--single" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label>GST Information</label>
                            <input 
                                value={settings.gstInfo} 
                                onChange={e => updateSetting('gstInfo', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp Messages */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card__header">
                    <h3 className="card__title">WhatsApp Default Messages</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid form-grid--single" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label>General Inquiry Message</label>
                            <textarea 
                                value={settings.whatsappGeneral} 
                                onChange={e => updateSetting('whatsappGeneral', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="form-field">
                            <label>Quotation Request Message</label>
                            <textarea 
                                value={settings.whatsappQuotation} 
                                onChange={e => updateSetting('whatsappQuotation', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Display Settings */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card__header">
                    <h3 className="card__title">Product Display Settings</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input 
                                    type="checkbox"
                                    checked={settings.showProductPrice}
                                    onChange={e => updateSetting('showProductPrice', e.target.checked)}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                Show Product Prices on Website
                            </label>
                            <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                Display product prices to customers on the public website
                            </small>
                        </div>
                        <div className="form-field">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input 
                                    type="checkbox"
                                    checked={settings.showProductStock}
                                    onChange={e => updateSetting('showProductStock', e.target.checked)}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                Show Product Stock Levels on Website
                            </label>
                            <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                Display current stock availability to customers
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Settings */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card__header">
                    <h3 className="card__title">Content Settings</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input 
                                    type="checkbox"
                                    checked={settings.showBlog}
                                    onChange={e => updateSetting('showBlog', e.target.checked)}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                Enable Blog Section
                            </label>
                            <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                Display blog posts on the public website. Disable to hide the blog section.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Defaults */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card__header">
                    <h3 className="card__title">Invoice Defaults</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label>Default Tax Rate (%)</label>
                            <input 
                                type="number" 
                                value={settings.defaultTaxRate}
                                onChange={e => updateSetting('defaultTaxRate', parseFloat(e.target.value) || 0)}
                                min="0" 
                                max="100"
                                step="0.01"
                            />
                        </div>
                        <div className="form-field">
                            <label>Invoice Number Prefix</label>
                            <input 
                                value={settings.invoicePrefix}
                                onChange={e => updateSetting('invoicePrefix', e.target.value)}
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Default Invoice Notes</label>
                            <textarea 
                                value={settings.invoiceNotes}
                                onChange={e => updateSetting('invoiceNotes', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button at Bottom */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 24 }}>
                <button className="btn-admin btn-admin--secondary" onClick={loadSettings}>
                    <RefreshCw size={16} /> Reset to Saved
                </button>
                <button 
                    className="btn-admin btn-admin--primary" 
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            {/* Setup Instructions (shown when table is missing) */}
            {showSetupInstructions && (
                <div style={{ 
                    background: '#fef2f2', 
                    border: '2px solid #ef4444', 
                    borderRadius: 12, 
                    padding: 24,
                    marginTop: 24
                }}>
                    <h2 style={{ color: '#dc2626', fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ⚠️ Settings Table Not Found
                    </h2>
                    <p style={{ color: '#991b1b', marginBottom: 16, fontSize: '0.95rem' }}>
                        The settings table doesn't exist in your Supabase database yet. Follow these steps to create it:
                    </p>
                    
                    <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                            📋 Step-by-Step Instructions:
                        </h3>
                        <ol style={{ paddingLeft: 20, color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.8 }}>
                            <li>Open your <strong>Supabase Dashboard</strong></li>
                            <li>Navigate to <strong>SQL Editor</strong> (in the left sidebar)</li>
                            <li>Click <strong>"New query"</strong></li>
                            <li>Copy the SQL code below and paste it into the editor</li>
                            <li>Click <strong>"Run"</strong> to execute the SQL</li>
                            <li>Come back here and click <strong>"Reload"</strong></li>
                        </ol>
                    </div>

                    <div style={{ background: '#1f2937', borderRadius: 8, padding: 16, marginBottom: 16, position: 'relative' }}>
                        <button
                            onClick={() => {
                                const sql = document.getElementById('settings-sql').textContent;
                                navigator.clipboard.writeText(sql);
                                toast('SQL copied to clipboard!', 'success');
                            }}
                            style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 6,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            📋 Copy SQL
                        </button>
                        <pre id="settings-sql" style={{ 
                            color: '#e5e7eb', 
                            fontSize: '0.8rem', 
                            overflow: 'auto',
                            margin: 0,
                            fontFamily: 'Monaco, Consolas, monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            paddingRight: 100
                        }}>{`-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_settings CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated full access"
    ON settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert default row
INSERT INTO settings (id, config) 
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS settings_timestamp ON settings;
CREATE TRIGGER settings_timestamp
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_timestamp();`}</pre>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button 
                            className="btn-admin btn-admin--primary"
                            onClick={() => {
                                setShowSetupInstructions(false);
                                loadSettings();
                            }}
                        >
                            <RefreshCw size={16} /> I've Run the SQL - Reload Now
                        </button>
                        <button 
                            className="btn-admin btn-admin--secondary"
                            onClick={() => setShowSetupInstructions(false)}
                        >
                            Hide Instructions
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
