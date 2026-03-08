# Settings Page Setup Guide

## What's Been Done ✅

The Settings page has been fully implemented with comprehensive editable settings for your business. All changes are now saved to Supabase database and persist across sessions.

## Settings Categories

### 1. **Company Details**
- Business Name (split into two parts for styling)
- Tagline
- Hero Subtitle
- Footer Description

### 2. **Contact Information**
- Phone (Full Format: +917039414924)
- Phone (Display Format: +91 70394 14924)
- WhatsApp Number
- Email Address
- Address (Short & Full versions)
- Business Hours
- Google Rating
- Google Maps Link & Embed URL

### 3. **GST & Legal**
- GST Information

### 4. **WhatsApp Messages**
- General Inquiry Default Message
- Quotation Request Default Message

### 5. **Product Display Settings**
- ☑️ Show Product Prices on Website
- ☑️ Show Product Stock Levels on Website

### 6. **Invoice Defaults**
- Default Tax Rate (%)
- Invoice Number Prefix
- Default Invoice Notes

## Setup Instructions

### Step 1: Create Settings Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase_settings_table.sql` (created in the project root)
4. Copy and paste the SQL code into the Supabase SQL Editor
5. Click **Run** to execute the SQL

This will create:
- `settings` table with JSONB config field
- Row Level Security policies
- Automatic timestamp updates
- A single default row (id = 1)

### Step 2: Access Settings Page

1. Log into your admin panel at `/admin`
2. Navigate to **Settings** in the sidebar
3. All settings will load with current values from `siteConfig.js` as defaults

### Step 3: Edit Settings

1. Modify any field you want to change
2. Click **Save All Settings** button (top-right or bottom)
3. Settings are saved to Supabase database
4. Changes persist across sessions

### Step 4: Reload Settings

- Click **Reload** button to refresh from database
- Click **Reset to Saved** to discard unsaved changes

## How It Works

### Data Flow
```
1. Page loads → Fetches from Supabase settings table
2. User edits fields → Updates local state
3. User clicks Save → Saves to Supabase as JSONB
4. Any page reload → Reads from database
```

### Fallback Behavior
- If settings table doesn't exist yet, uses `siteConfig.js` defaults
- First save creates the settings row in database
- Subsequent saves update existing row

### Database Structure
```json
{
  "id": 1,
  "config": {
    "businessName": "A3",
    "businessNameHighlight": "Distributors",
    "phone": "+917039414924",
    "email": "contact.a3distributor@gmail.com",
    // ... all other settings
  },
  "created_at": "2026-03-09T...",
  "updated_at": "2026-03-09T..."
}
```

## Features

✅ **Real-time editing** - All fields update instantly  
✅ **Batch save** - One button saves all settings  
✅ **Database persistence** - Settings saved to Supabase  
✅ **Loading states** - Shows loading/saving feedback  
✅ **Error handling** - Graceful fallback if table missing  
✅ **Reset functionality** - Reload from database anytime  
✅ **Validation** - Type-safe inputs (email, number, etc.)  
✅ **Organized sections** - Grouped by category  
✅ **Toast notifications** - Success/error feedback  

## Next Steps (Optional)

### Option 1: Use Settings Across Website
To use saved settings on the public website, create a settings context:

```javascript
// src/contexts/SettingsContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import siteConfig from '../data/siteConfig';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(siteConfig);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  async function loadSettings() {
    const { data } = await supabase
      .from('settings')
      .select('config')
      .eq('id', 1)
      .maybeSingle();
    
    if (data?.config) {
      setSettings({ ...siteConfig, ...data.config });
    }
  }
  
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
```

Then wrap your app with `<SettingsProvider>` and use `useSettings()` hook instead of importing `siteConfig` directly.

### Option 2: Keep Static Config
The current setup allows admin to edit settings via UI while the public site continues using `siteConfig.js`. This is simpler and works well for most use cases.

## Troubleshooting

### "Settings table not found" error
- Run the SQL migration in Supabase SQL Editor
- Check that table was created successfully
- Verify RLS policies are enabled

### Settings not saving
- Check Supabase authentication is working
- Verify RLS policies allow INSERT/UPDATE
- Check browser console for errors

### Settings not loading
- Clear browser cache
- Check Supabase connection
- Verify settings table exists with `SELECT * FROM settings;`

## Security

✅ Row Level Security (RLS) enabled  
✅ Only authenticated users can read/write  
✅ Single row constraint prevents duplicates  
✅ Automatic timestamp tracking  

---

**Need help?** Check the Supabase logs or browser console for detailed error messages.
