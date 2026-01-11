
import { Product } from './types';

export const PRODUCTS: Product[] = [
  // --- IPHONE SPECIALIZED REPAIRS (Quote Required) ---
  {
    id: 'iph-screen',
    name: 'iPhone Screen Fix',
    category: 'ScreenGuards',
    isQuoteRequired: true,
    description: 'Premium OLED and Original display replacements for all iPhone models from 6 to 16 Pro Max. TrueTone restoration included.',
    image: 'https://images.unsplash.com/photo-1544725121-be3b5d02e9b1?auto=format&fit=crop&q=80&w=1000',
    size: 'large',
    isPopular: true
  },
  {
    id: 'iph-battery',
    name: 'iPhone Battery Pro',
    category: 'Chargers',
    isQuoteRequired: true,
    description: 'High-capacity battery cells for iPhone. Restore 100% battery health and peak performance capability.',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3bf919b26d?auto=format&fit=crop&q=80&w=1000',
    size: 'small'
  },

  // --- AIRPODS (1st COPY) ---
  {
    id: 'ap-pro-2',
    name: 'AirPods Pro 2 (Copy)',
    category: 'AirPods',
    price: 1899,
    description: '1:1 Master Copy with Active Noise Cancellation, Spatial Audio, and Valid Serial Number. MagSafe case included.',
    image: 'https://images.unsplash.com/photo-1588423770674-f285514a4c58?auto=format&fit=crop&q=80&w=1000',
    size: 'large',
    isPopular: true
  },
  {
    id: 'ap-3',
    name: 'AirPods 3rd Gen',
    category: 'AirPods',
    price: 1499,
    description: 'Premium 1st Copy. Contoured design with force sensor controls and sweat resistance. Excellent bass performance.',
    image: 'https://images.unsplash.com/photo-1610492314604-30799f8134cd?auto=format&fit=crop&q=80&w=1000',
    size: 'small'
  },

  // --- CHARGERS ---
  {
    id: 'pwr-gan-65',
    name: 'Samsung 65W GaN',
    category: 'Chargers',
    price: 1699,
    description: 'Super Fast Charging 2.0. Compatible with S24 Ultra, Laptops, and iPhones. Compact Gallium Nitride build.',
    image: 'https://images.unsplash.com/photo-1614112399252-bc5199691230?auto=format&fit=crop&q=80&w=1000',
    size: 'large',
    isPopular: true
  },
  {
    id: 'pwr-apple-20',
    name: 'Apple 20W Adapter',
    category: 'Chargers',
    price: 899,
    description: 'High-quality 1st Copy PD Adapter for all iPhones. Guaranteed fast charging without heating issues.',
    image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=1000',
    size: 'small'
  },

  // --- CABLES ---
  {
    id: 'cab-c-lightning',
    name: 'Braided C to Light',
    category: 'Cables',
    price: 499,
    description: 'Tough nylon braided cable. MFi certified chips for stable data sync and 27W fast charging.',
    image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&q=80&w=1000',
    size: 'small'
  },
  {
    id: 'cab-c-c',
    name: '100W PD Type-C',
    category: 'Cables',
    price: 599,
    description: 'Ultra-durable 2 meter cable. Supports Laptop charging and 480Mbps data transfer.',
    image: 'https://images.unsplash.com/photo-1605648916319-cf082f7524a1?auto=format&fit=crop&q=80&w=1000',
    size: 'small'
  },

  // --- SPEAKERS & AUDIO ---
  {
    id: 'spk-boom',
    name: 'JBL Style Boombox',
    category: 'Speakers',
    price: 1,
    description: 'Portable Bluetooth Speaker with massive bass and 12-hour battery life. IPX7 Waterproof build.',
    image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=1000',
    size: 'large'
  },
  {
    id: 'nb-v5',
    name: 'OnePlus Style Z2',
    category: 'Neckbands',
    price: 1299,
    description: 'Premium magnetic neckband. 30 hours playback, fast charging, and low latency gaming mode.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1000',
    size: 'small'
  },
  {
    id: 'wired-bass',
    name: 'Sony Style Wired',
    category: 'WiredAudio',
    price: 399,
    description: 'Extra Bass earphones with in-line microphone. Gold plated 3.5mm jack for lossless audio.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1000',
    size: 'small'
  },

  // --- SKINS & PROTECTION (Contact Required with Model Selection) ---
  {
    id: 'prot-uv',
    name: 'Tempered Glass',
    category: 'ScreenGuards',
    isUniversalModel: true,
    isContactOnly: true,
    description: 'Available for ALL curved screen models like S24 Ultra, Pixel 8 Pro. Perfect fit liquid adhesive tech.',
    image: 'https://images.unsplash.com/photo-1609334767375-7ef6bc897818?auto=format&fit=crop&q=80&w=1000',
    size: 'small',
    isPopular: true
  },
  {
    id: 'skin-3m',
    name: 'Skins',
    category: 'Skins',
    isUniversalModel: true,
    isContactOnly: true,
    description: 'Full body wraps for 500+ models. Choose from Carbon, Leather, or Stone finishes.',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=1000',
    size: 'large'
  }
];

export const IPHONE_MODELS = [
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
  'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
  'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
  'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 Mini', 'iPhone 13',
  'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 Mini', 'iPhone 12',
  'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11'
];
