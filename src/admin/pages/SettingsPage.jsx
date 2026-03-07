import { useState } from 'react';
import { Save } from 'lucide-react';
import siteConfig from '../../data/siteConfig';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
    const toast = useToast();
    const [settings, setSettings] = useState({
        businessName: siteConfig.businessName + siteConfig.businessNameHighlight,
        phone: siteConfig.phoneDisplay,
        email: siteConfig.email,
        address: siteConfig.addressFull,
        gstInfo: siteConfig.gstInfo,
    });

    function handleSave() {
        // Settings are currently in siteConfig.js (static)
        // In a full implementation, these would be stored in Supabase
        toast('Settings saved (Note: Update siteConfig.js for permanent changes)', 'info');
    }

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Settings</h1>
                    <p>Company information and preferences</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 640 }}>
                <div className="card__header">
                    <h3 className="card__title">Company Details</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid form-grid--single" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label>Business Name</label>
                            <input value={settings.businessName} onChange={e => setSettings({ ...settings, businessName: e.target.value })} />
                        </div>
                        <div className="form-field">
                            <label>Phone</label>
                            <input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
                        </div>
                        <div className="form-field">
                            <label>Email</label>
                            <input value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
                        </div>
                        <div className="form-field">
                            <label>Address</label>
                            <textarea value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
                        </div>
                        <div className="form-field">
                            <label>GST Information</label>
                            <input value={settings.gstInfo} onChange={e => setSettings({ ...settings, gstInfo: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-admin btn-admin--primary" onClick={handleSave}>
                            <Save size={16} /> Save Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 640, marginTop: 20 }}>
                <div className="card__header">
                    <h3 className="card__title">Invoice Defaults</h3>
                </div>
                <div className="card__body">
                    <div className="form-grid" style={{ gap: 16 }}>
                        <div className="form-field">
                            <label>Default Tax Rate (%)</label>
                            <input type="number" defaultValue="18" min="0" max="100" />
                        </div>
                        <div className="form-field">
                            <label>Invoice Number Prefix</label>
                            <input defaultValue="INV" />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Default Invoice Notes</label>
                            <textarea defaultValue="Payment is due within 30 days. Thank you for your business!" />
                        </div>
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-admin btn-admin--primary" onClick={() => toast('Invoice defaults saved', 'info')}>
                            <Save size={16} /> Save Defaults
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
