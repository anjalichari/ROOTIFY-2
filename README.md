# ROOTIFY — Hyperlocal Goan Artisanal Marketplace & Origin Passport System

**ROOTIFY** is a hyperlocal marketplace and heritage verification platform connecting verified local Goan village producers, Self-Help Groups (SHGs/Mahila Mandals), and artisanal craftsmen with conscious consumers across Goa.

---

## 🌟 Key Features

### 🛒 1. Customer Hyperlocal Marketplace
- **Taluka-Based Serviceability**: Real-time delivery radius checks across North & South Goa talukas (Tiswadi, Bardez, Salcete, Ponda, etc.).
- **Artisanal Catalogue**: Traditional Goan sweets (Bebinca, Dodol, Serradura), condiments (Kokum, Pao, Toddy Vinegar), and organic spices.
- **Cart & Seamless Checkout**: Multi-vendor order coordination, delivery slot selection, and transparent platform fee structures.

### 🛡️ 2. QR-Based Origin Passport & Product Authenticity System
- **Level A — Producer Profile QR**:
  - Stable, high-resolution QR code (1024px PNG & Vector SVG) for every approved Goan village producer.
  - Links permanently to the producer's verified ROOTIFY profile, heritage story, and workshop media.
- **Level B — Product Batch QR & Packaging Labels**:
  - Generates unpredictable batch identifiers (`RTF-<PROD>-<DATE><RAND>`) for verified production runs.
  - Downloadable packaging sticker layouts (PNG & Vector SVG) ready for physical jars, bottles, and boxes.
- **Customer-Facing Origin Passport** (`/passport/batch/:code`):
  - **Verification Status**: Displays real-time audited statuses (`Verified & Audited`, `Pending Review`, `Revoked`).
  - **Traditional Method Timeline**: Step-by-step ancestral preparation processes (e.g. wood-fired earthenware, copper uruli reduction).
  - **Ingredient Provenance**: Village-level harvest origin mapping across Goa.
  - **Audited Claims Register**: Corroboration of GI Tags, FSSAI certificates, and SHG registrations.
  - **Media Gallery**: High-definition photos and sound-muted production videos.
  - **Anti-Counterfeiting Advisory**: Clear disclaimer advising customers to inspect physical tamper-evident seals on containers.

### 🤖 3. AI-Powered Heritage Assistant ("Rooty")
- Floating conversational AI assistant specialized in Goan cuisine, artisanal products, traditional recipes, and marketplace navigation.
- Powered by Google Gemini with dual-mode fallback (in-memory Goan culinary knowledge base + server proxy).

### ⚙️ 4. Vendor & Admin Portals
- **Vendor Portal** (`/vendor/passports`): "My Story & QR Passports" to manage producer story, upload photo/video evidence, register new batches, and download label print files.
- **Admin Operations Suite** (`/admin/passports`): Batch verification approvals, origin claims corroboration, media moderation, and scan velocity monitoring (>50 repeat scans flagged for field review).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **QR Engine**: `qrcode` (high-resolution PNG generation & SVG vector output with Error Correction Level 'H')
- **Database & Storage**: Supabase (PostgreSQL with Row Level Security, Indexes, and Storage buckets) + `localStorage` dual-mode fallback
- **AI Integration**: Google Gemini API via official `@google/genai` SDK and secure Node.js proxy

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ installed

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/anjalichari/ROOTIFY-2.git
cd ROOTIFY-2

# Install dependencies in frontend
cd frontend
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Database Setup (Supabase)
To connect a live Supabase instance:
1. Run the migration script in `supabase/migrations/20261012000001_origin_passport_system.sql` in your Supabase SQL Editor.
2. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
*(Note: If Supabase credentials are not provided, the platform automatically runs in Dual-Mode using mock state and built-in Goan seed data).*

---

## 📂 Project Structure

```
ROOTIFY/
├── chatbot/                 # Rooty AI ChatBot standalone module & documentation
├── frontend/                # Vite + React + TypeScript web application
│   ├── src/
│   │   ├── chatbot/         # Integrated AI Assistant component & Gemini service
│   │   ├── components/      # Common, Marketplace, Portal, and QR components
│   │   ├── context/         # Auth, Cart, Location, Order, and Toast contexts
│   │   ├── data/            # Seed data (vendors, products, passports, reviews)
│   │   ├── lib/             # Supabase client initializer
│   │   ├── pages/
│   │   │   ├── admin/       # Operations & Passport Audit dashboards
│   │   │   ├── customer/    # Marketplace, Detail, and Origin Passport pages
│   │   │   └── vendor/      # Vendor dashboard & QR Passports management
│   │   ├── services/        # PassportService, VendorService, ProductService
│   │   └── types/           # TypeScript domain interfaces
├── server/                  # AI proxy server & knowledge endpoints
├── supabase/
│   └── migrations/          # PostgreSQL database schema & RLS policies
└── project_audit_report.md  # Comprehensive project architectural audit report
```

---

## 📄 License

This project is proprietary and developed for Rootify Goa.
