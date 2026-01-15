# Fix-It Kurnool 📱🛠️

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Fix-It Kurnool** is a modern, comprehensive web application designed for a premium mobile repair and accessories store. It bridges the gap between online presence and physical service, offering customers a seamless way to book repairs, buy accessories, and interact with technicians. It also powers the business operations with a robust Admin Dashboard and POS system.

---

## 🚀 Features

### 🛍️ Client-Facing Store & Services
*   **Dynamic Landing Page:** A visually stunning entry point with animated backgrounds and clear navigation to Repairs or Store.
*   **Service Booking:** 
    *   Specialized **iPhone Pro Service** section.
    *   Multi-brand support (Samsung, OnePlus, etc.).
    *   **WhatsApp Integration** for custom model inquiries and remote diagnostics.
*   **E-Commerce Store:**
    *   **Bento Grid Layout** for a modern shopping experience.
    *   Categorized products (AirPods, Chargers, Skins, Audio, etc.).
    *   Real-time search and filtering.
    *   Cart management and secure checkout flow.
*   **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop.

### ⚡ Admin Dashboard & Operations
*   **Order Management:**
    *   Real-time order tracking (Pending, Shipped, Completed).
    *   **Invoice Generation:** Auto-generate and print professional thermal-style invoices.
    *   **Real-time Alerts:** Browser notifications and audio alerts for new orders.
*   **Inventory Management:**
    *   Add, Edit, and Delete products.
    *   **Image Upload:** Direct integration with Supabase Storage for product images.
    *   Manage stock status (Sold Out, Hidden).
*   **Point of Sale (POS):**
    *   Built-in interface for handling in-shop walk-in customers.
    *   Quick cart addition and manual order creation.
    *   Supports multiple payment modes (Cash, UPI, Card).
*   **Coupon System:** generate and manage discount codes with usage limits.
*   **Financial Overview:** Live dashboard for Total Revenue and Order Counts.

---

## 🛠️ Tech Stack

*   **Frontend Framework:** [React 19](https://react.dev/) via [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/) & Material Symbols
*   **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Storage:** Supabase Storage (for product images)
*   **State Management:** React Hooks & Local Component State
*   **Routing:** React Router v7

---

## 🏃‍♂️ Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   A Supabase account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SaiDheeraj-19/fix-it.git
    cd fix-it
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    *   The project uses Supabase. Ensure you have the `supabase.ts` file configured with your project URL and Anon Key.
    *   *Note: In the current codebase, keys might be directly in `supabase.ts`. For production, it is recommended to move these to a `.env` file.*

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app will start at `http://localhost:5173`.

---

## 🗄️ Database & Storage Setup

To fully function, this app requires specific tables and policies in your Supabase project.

1.  **Run SQL Scripts:**
    Navigate to the SQL Editor in your Supabase dashboard and run the contents of the following files included in the project:
    *   `update_schema.sql` (Creates base tables like `orders`, `products`)
    *   `create_coupons_table.sql` (Sets up the coupon system)
    *   `setup_storage.sql` (Configures storage buckets and policies)
    *   `update_payment_constraint.sql` (Adjusts data integrity rules)

2.  **Verify Storage:**
    Ensure a public bucket named **`product-images`** exists if the SQL script didn't creating it automatically.

---

## 📂 Project Structure

```
fix-it-kurnool/
├── components/          # Reusable UI components & Pages
│   ├── AdminDashboard.tsx   # Main Admin Interface
│   ├── HomePage.tsx         # Landing Page
│   ├── StorePage.tsx        # E-commerce Interface
│   ├── ServicesPage.tsx     # Repair Services Interface
│   ├── CartDrawer.tsx       # Shopping Cart Slider
│   └── ...
├── public/              # Static assets (images, logos)
├── supabase.ts          # Supabase client configuration & API functions
├── types.ts             # TypeScript interfaces (Product, Order, etc.)
├── App.tsx              # Main Application Component & Routing
├── main.tsx            # Entry point
└── index.css           # Global Tailwind styles
```

---

## 🛡️ Admin Access

*   Access the dashboard via `/admin` (or the specific configured route).
*   **Note:** Ensure you implement or configure Authentication policies in Supabase to restrict write access to the `products` and `orders` tables to authorized users only in a production environment.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for <b>Fix-It Kurnool</b>
</p>
