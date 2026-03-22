# Admin Features

Complete guide to all admin-specific features and business management tools available to authenticated admins.

---

## Admin Access & Authentication

### Admin Login
- **Path**: `/admin/login`
- **Component**: `AdminLogin.jsx`
- **Authentication**: Supabase Auth integration
- **Features**:
  - Email/password login
  - Session management
  - Protected admin routes
  - Automatic redirect for logged-in users

### Admin Layout
- **Component**: `AdminLayout.jsx`
- **Features**:
  - Sidebar navigation
  - Top header with user menu
  - Responsive design (mobile hamburger menu)
  - Dark mode sidebar (`#0f172a` to `#1e293b`)
  - Light content area (`#f0f2f5`)

---

## Dashboard & Analytics

### Dashboard Page
- **Path**: `/admin/dashboard`
- **Component**: `DashboardPage.jsx`
- **Purpose**: High-level business overview
- **Features** (typical dashboard):
  - Key metrics/KPIs
  - Recent activity
  - Quick stats
  - Sales overview (implied from components)
  - Order summary

### Analytics Page
- **Path**: `/admin/analytics`
- **Component**: `AnalyticsPage.jsx`
- **Purpose**: Business insights and reporting
- **Features**:
  - Revenue trends
  - Order volume metrics
  - Customer acquisition data
  - Sales by category/product
  - Time-series charts
  - Exportable reports

---

## Order Management

### Orders Page
- **Path**: `/admin/orders`
- **Component**: `OrdersPage.jsx`
- **Purpose**: View and manage all customer orders
- **Features**:
  - Sortable table of orders
  - Filter by status (pending, completed, cancelled)
  - Search by order ID or customer name
  - Pagination
  - Bulk actions (mark complete, cancel)
  - Status indicators (color-coded)
  - Order date range filter
  - Export orders (CSV/XLSX)

### Order Form
- **Path**: `/admin/orders/new` or `/admin/orders/:id/edit`
- **Component**: `OrderForm.jsx`
- **Purpose**: Create or modify orders
- **Fields**:
  - Customer selection/search
  - Product selection
  - Quantity
  - Delivery date
  - Delivery address
  - Order notes
  - Special instructions
  - Pricing (auto-calculated or manual)
  - Discount application
- **Features**:
  - Form validation
  - Auto-populate from customer history
  - Save as draft
  - Submit for processing
  - Validation errors indicated
  - Quick product lookup

### Order View
- **Path**: `/admin/orders/:id`
- **Component**: `OrderView.jsx`
- **Purpose**: Detailed order inspection
- **Features**:
  - Complete order details
  - Customer information
  - Line items breakdown
  - Pricing summary
  - Delivery status timeline
  - Order history/notes
  - Edit button (link to OrderForm)
  - Generate invoice button
  - Print order
  - Order status change controls

---

## Invoice Management

### Invoices Page
- **Path**: `/admin/invoices`
- **Component**: `InvoicesPage.jsx`
- **Purpose**: Manage all invoices and payment records
- **Features**:
  - Sortable table of invoices
  - Filter by status (draft, sent, paid, overdue)
  - Search by invoice number or customer
  - Pagination
  - Date range filter
  - Invoice preview
  - Bulk email (send to multiple customers)
  - Export invoices (CSV/XLSX)
  - Print invoices

### Invoice Form
- **Path**: `/admin/invoices/new` or `/admin/invoices/:id/edit`
- **Component**: `InvoiceForm.jsx`
- **Purpose**: Create or edit invoices
- **Fields**:
  - Invoice number (auto-generated)
  - Customer selection
  - Order number (optional link)
  - Invoice date
  - Due date
  - Line items (product, quantity, rate, amount)
  - Subtotal, tax, discount, total
  - Payment terms
  - Notes/memo
  - Payment instructions
- **Features**:
  - Add/remove line items dynamically
  - Tax calculation (GST/VAT if applicable)
  - Discount line-item or percentage
  - Auto-calculation of totals
  - Save as draft
  - Mark as sent
  - Generate PDF (jsPDF)

### Invoice View
- **Path**: `/admin/invoices/:id`
- **Component**: `InvoiceView.jsx`
- **Purpose**: Preview and manage individual invoice
- **Features**:
  - Full invoice display
  - PDF download
  - Print invoice
  - Email to customer
  - Mark as paid
  - Change invoice status
  - Edit invoice link
  - Payment tracking

---

## Quotation Management

### Quotations Page
- **Path**: `/admin/quotations`
- **Component**: `QuotationsPage.jsx`
- **Purpose**: Track and manage customer quote requests (from public form)
- **Features**:
  - List of all quote requests
  - Filter by status (pending, quoted, accepted, rejected, expired)
  - Search by customer name or email
  - Sortable columns
  - Pagination
  - Submission date display
  - Customer contact info visible
  - Quick reply button
  - Export quotations (CSV/XLSX)
  - Bulk status update

### Quote Response Workflow
- **Purpose**: Convert quotation requests to orders
- **Process**:
  1. View quotation details
  2. Create associated order/invoice
  3. Send quote response to customer
  4. Track response status (waiting, accepted, rejected)

---

## Customer Management

### Customers Page
- **Path**: `/admin/customers`
- **Component**: `CustomersPage.jsx`
- **Purpose**: View and manage customer database
- **Features**:
  - Sortable customer table
  - Filter by customer type (retail, wholesale, corporate)
  - Search by name, email, phone, company
  - Pagination
  - Customer status (active, inactive)
  - Total lifetime value (if tracked)
  - Last order date
  - Contact information visible
  - Add new customer button
  - Bulk operations (email, export, segmentation)

### Customer Profile
- **Path**: `/admin/customers/:id`
- **Component**: `CustomerProfile.jsx`
- **Purpose**: Detailed customer information and history
- **Features**:
  - Customer name, email, phone
  - Billing/shipping addresses
  - Company/business info
  - Customer classification
  - Credit limit (if applicable)
  - Payment history
  - Order history (linked)
  - Quote history
  - Communication log/notes
  - Edit customer link
  - View all customer orders

---

## Product Management

### Products Page
- **Path**: `/admin/products`
- **Component**: `ProductsPage.jsx`
- **Purpose**: Manage product catalog
- **Features**:
  - Product table/grid view
  - Filter by category/brand
  - Search by product name/SKU
  - Sortable columns
  - Pagination
  - Product image thumbnail
  - Stock status
  - Price display
  - Category/brand tag
  - Add new product button
  - Bulk operations (edit, delete, export)
  - Stock level indicators

### Product Form
- **Purpose**: Create or edit product details
- **Fields**:
  - Product name
  - Brand/category
  - Description
  - SKU/product code
  - Sizes/variants
  - Base price
  - Bulk pricing tiers
  - Stock quantity
  - Reorder level
  - Product images/gallery
  - Category color
  - Tags/keywords
  - Active/inactive status
- **Features**:
  - Form validation
  - Image upload integration
  - Price tier management
  - Variant management

### Product Images Page
- **Path**: `/admin/product-images`
- **Component**: `ProductImagesPage.jsx`
- **Purpose**: Manage product image uploads and gallery
- **Features**:
  - Image upload interface
  - Drag-and-drop upload
  - Multi-image support
  - Image preview
  - Set primary/featured image
  - Image alt text management
  - Delete images
  - Bulk image upload
  - Image crop/resize (optional)
  - Image compression

---

## Inventory Management

### Stock Tracking (Implicit in Products)
- **Features**:
  - Current stock levels
  - Reorder point alerts
  - Low stock warnings
  - Stock adjustments
  - Historical stock tracking
  - Stock movement log

### Inventory Reports
- **Available via Analytics or Uploads page**:
  - Stock valuation
  - Fast-moving vs slow-moving items
  - Stock aging analysis

---

## Financial Operations

### Price Management
- **Features**:
  - Base pricing per product
  - Bulk discount tiers
  - Seasonal pricing (optional)
  - Customer-specific pricing (optional)
  - Price history/audit log

### Payment Tracking
- **Via Invoice management**:
  - Mark invoices as paid
  - Record payment method
  - Payment date
  - Payment tracking by customer
  - Overdue payment alerts

---

## Content Management

### Blogs Page
- **Path**: `/admin/blogs`
- **Component**: `BlogsPage.jsx`
- **Purpose**: Create and publish blog content
- **Features**:
  - List of blog posts
  - Filter by status (draft, published, archived)
  - Search by title
  - Sortable columns (date, title, author)
  - Pagination
  - Add new post button
  - Edit existing post
  - Delete post
  - Publish/unpublish toggle
  - Schedule post (optional)
  - Bulk operations

### Blog Editor
- **Purpose**: Create/edit individual blog post
- **Fields**:
  - Post title
  - Slug (URL-friendly)
  - Featured image/thumbnail
  - Author
  - Category/tags
  - Excerpt/summary
  - Full content (rich text editor)
  - Meta description (SEO)
  - Meta keywords
  - Publish date
  - Status (draft/published)
- **Features**:
  - WYSIWYG editor
  - Image upload in editor
  - Preview before publishing
  - Save as draft
  - Scheduled publishing
  - SEO optimization hints
  - Markdown support (optional)

---

## Settings & Configuration

### Settings Page
- **Path**: `/admin/settings`
- **Component**: `SettingsPage.jsx`
- **Purpose**: System configuration and business settings
- **Sections**:

#### Business Information
- Company name
- Business registration number
- Tax ID / GST number
- Email
- Phone number
- Address

#### Service Configuration
- Service areas/regions
- Operating hours
- Delivery schedule
- Payment methods accepted
- Shipping costs/rules

#### Branding
- Logo upload
- Primary color
- Accent color
- Brand name variations

#### Communication
- Default email sender
- Customer support email
- Support phone
- WhatsApp business number
- Contact form recipient email

#### Notification Settings
- Email notifications for orders
- Email notifications for quotes
- SMS notifications (optional)
- Alert thresholds (low stock, etc.)

#### Integration Settings
- Supabase connection (read-only)
- API keys for third-party services
- Payment gateway settings
- Google Analytics ID
- WhatsApp Business Account linking

#### User Management
- Admin user list
- Add new admin user
- Edit user roles/permissions
- Deactivate users
- Change password

---

## File & Document Management

### Uploads Page
- **Path**: `/admin/uploads`
- **Component**: `UploadsPage.jsx`
- **Purpose**: Manage files and document storage
- **Features**:
  - File/document list viewing
  - Upload new files
  - Drag-and-drop upload
  - File type filters
  - Search by filename
  - Folder/category organization
  - File size display
  - Upload date tracking
  - Download file
  - Delete file
  - Share file (optional)
  - Bulk operations

### Media Library
- **Storage**: Supabase storage or similar
- **Supported types**: Images, PDFs, Documents
- **Organization**: By category or date

---

## Admin Components & Tools

### Modal Component
- **Purpose**: Generic dialog/overlay
- **Used for**:
  - Confirmation dialogs
  - Inline forms
  - Information displays
  - QuotationModal, InvoiceModal

### Toast Notifications
- **Component**: `Toast.jsx`
- **Notifications**:
  - Success (green)
  - Error (red)
  - Warning (amber)
  - Info (blue)
- **Auto-dismiss**: After 3-5 seconds

### Export Buttons
- **Component**: `ExportButtons.jsx`
- **Export Formats**:
  - CSV (comma-separated values)
  - XLSX (Excel spreadsheet)
  - PDF (for invoices, orders)
- **Available on**:
  - Orders page
  - Invoices page
  - Customers page
  - Products page
  - Quotations page
  - Analytics page

### Sidebar Navigation
- **Component**: `Sidebar.jsx`
- **Features**:
  - Collapsible menu (icon-only when collapsed)
  - All major admin pages linked
  - Icon + label for each section
  - Active page highlight
  - Mobile responsive (hamburger menu)
  - Quick toggle to collapse/expand

### Top Header
- **Component**: `TopHeader.jsx`
- **Features**:
  - Search bar (optional, search across pages)
  - Notification bell (for alerts)
  - User profile menu
  - Logout button
  - Theme toggle (if dark mode available)

---

## Reports & Analytics

### Available Reports
- **Sales Report**: Orders by date, customer, product
- **Revenue Report**: Total revenue, by category
- **Customer Report**: New customers, repeat customers, spending
- **Inventory Report**: Stock levels, movement
- **Financial Report**: Invoices issued, paid, overdue

### Report Features
- **Date Range Selection**: Custom or preset ranges
- **Export Options**: CSV, XLSX, PDF
- **Visualizations**: Charts and graphs
- **Drill-down**: Click to see details
- **Scheduling**: Email reports on schedule (optional)

---

## Mobile Admin Access

### Responsive Design
- Admin pages work on mobile/tablet
- Sidebar becomes hamburger menu on small screens
- Forms stack vertically
- Tables become card view or horizontal scroll

### Mobile-Specific Features
- Touch-friendly buttons (44px minimum)
- Optimized form inputs for mobile
- Mobile-optimized layouts

---

## Security & Permissions

### Authentication
- Admin login required
- Session management
- Auto-logout after inactivity
- Password security requirements

### Authorization
- Role-based access (if multi-admin)
- Admin role vs limited roles (optional)
- Audit log of admin actions (optional)

### Data Security
- HTTPS only
- Supabase encryption
- Secure session tokens

---

## Performance & Optimization

### Data Pagination
- Large lists paginated (20-50 items per page)
- Prevents slow page loads

### Lazy Loading
- Images loaded on demand
- Components loaded on route change

### Search & Filter Optimization
- Server-side filtering recommended
- Index on common search fields

---

## Admin Resources

### Quick Links
- Settings access
- Help/documentation
- Feedback form
- Logout

### System Status
- Database connection status
- API status (if external APIs used)
- Last sync/update time

