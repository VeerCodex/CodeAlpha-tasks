const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "AuraWave Pro Noise-Cancelling Headphones",
    category: "Audio & Sound",
    price: 199.99,
    originalPrice: 279.99,
    rating: 4.9,
    reviewCount: 128,
    stock: 24,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Immerse yourself in pure studio sound with state-of-the-art 45mm planar drivers and 40-hour battery life. Custom hybrid ANC keeps external distractions completely out.",
    specs: {
      "Driver Size": "45mm Neodymium",
      "Battery Life": "Up to 40 hours",
      "Connectivity": "Bluetooth 5.3 & 3.5mm Aux",
      "Noise Cancellation": "Active Hybrid ANC (45dB drop)",
      "Weight": "250 grams"
    },
    reviews: [
      { id: "rev-1", user: "Aarav Sharma", rating: 5, date: "2026-08-14", comment: "The noise cancellation is on par with the highest tier brands. Crystal clear bass!" },
      { id: "rev-2", user: "Sneha Patel", rating: 4.8, date: "2026-08-20", comment: "Extremely comfortable memory foam ear cushions. Battery lasts all week on one charge." }
    ]
  },
  {
    id: "prod-2",
    name: "Chronos Ultra AMOLED Smartwatch",
    category: "Wearables",
    price: 149.50,
    originalPrice: 199.00,
    rating: 4.8,
    reviewCount: 94,
    stock: 18,
    badge: "HOT",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Sleek aerospace-grade titanium frame with an ultra-bright 1.43-inch AMOLED display, 120+ sports modes, ECG monitoring, and waterproof 5ATM certification.",
    specs: {
      "Display": "1.43\" AMOLED 1000 nits",
      "Case Material": "Aerospace Titanium",
      "Water Resistance": "5 ATM (50m)",
      "Battery": "14-day typical usage",
      "Sensors": "Heart Rate, SpO2, Sleep, ECG"
    },
    reviews: [
      { id: "rev-3", user: "Rohan Verma", rating: 5, date: "2026-08-18", comment: "The display looks gorgeous under direct sunlight. Tracks my workouts with pinpoint GPS." }
    ]
  },
  {
    id: "prod-3",
    name: "Lumix Retro Instant Film Camera",
    category: "Photography",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.7,
    reviewCount: 65,
    stock: 12,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Capture vintage memories in vivid color prints instantly. Featuring automatic exposure, built-in selfie mirror, and rechargeable USB-C lithium battery.",
    specs: {
      "Film Format": "Instant Mini Color Film",
      "Lens": "60mm f/12.7 optical",
      "Shutter Speed": "1/2 to 1/250 sec",
      "Flash Range": "0.3m - 2.7m auto",
      "Power": "Rechargeable Li-ion (USB-C)"
    },
    reviews: [
      { id: "rev-4", user: "Priya Menon", rating: 5, date: "2026-08-25", comment: "Brought this to my friend's birthday and everyone loved taking physical pictures." }
    ]
  },
  {
    id: "prod-4",
    name: "Apex Mechanical Keyboard RGB",
    category: "Desk Essentials",
    price: 119.00,
    originalPrice: 159.00,
    rating: 4.9,
    reviewCount: 210,
    stock: 30,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Custom hot-swappable tactile switches, sound-dampening brass plate, per-key South-facing RGB lighting, and CNC anodized aluminum chassis.",
    specs: {
      "Layout": "75% Compact (82 Keys)",
      "Switches": "Gateron Pro Yellow (Hot-swap)",
      "Keycaps": "Double-shot PBT Cherry profile",
      "Connectivity": "Tri-mode (Type-C, 2.4G, BT 5.0)",
      "Battery": "4000 mAh"
    },
    reviews: [
      { id: "rev-5", user: "Vikram Gupta", rating: 5, date: "2026-08-29", comment: "Typing feel is buttery smooth. The sound profile is deep and creamy without loud clacks." }
    ]
  },
  {
    id: "prod-5",
    name: "SoundPulse Portable Waterproof Speaker",
    category: "Audio & Sound",
    price: 64.99,
    originalPrice: 89.99,
    rating: 4.6,
    reviewCount: 78,
    stock: 45,
    badge: "SALE",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80"
    ],
    description: "360-degree omnidirectional audio with rich punchy bass, IP67 waterproof/dustproof rating, and 24-hour non-stop battery. Perfect for outdoor adventures.",
    specs: {
      "Output Power": "30W Stereo RMS",
      "Waterproof": "IP67 Submersible",
      "Playtime": "24 Hours",
      "Bluetooth": "5.3 with TWS pairing",
      "Charging": "Fast USB-C 15W"
    },
    reviews: [
      { id: "rev-6", user: "Ananya Roy", rating: 4.6, date: "2026-08-30", comment: "Surprisingly loud for its compact size! Floats in water too." }
    ]
  },
  {
    id: "prod-6",
    name: "ErgoFlow Precision Wireless Mouse",
    category: "Desk Essentials",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviewCount: 88,
    stock: 22,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Ergonomically contoured for palm and wrist comfort. Features ultra-quiet magnetic scroll wheel, multi-device cross-computer control, and USB-C quick charge.",
    specs: {
      "Sensor": "Darkfield 4000 DPI",
      "Buttons": "7 customizable silent buttons",
      "Battery": "Up to 70 days on full charge",
      "Connectivity": "Bluetooth + 2.4GHz Unifying"
    },
    reviews: [
      { id: "rev-7", user: "Karan Johar", rating: 5, date: "2026-09-02", comment: "No more wrist pain after long coding sessions. The hyperfast scroll is addictive." }
    ]
  },
  {
    id: "prod-7",
    name: "SonicBuds Studio ANC Wireless Earbuds",
    category: "Audio & Sound",
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.9,
    reviewCount: 142,
    stock: 35,
    badge: "HOT",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Spatial audio with dynamic head tracking, adaptive transparency mode, wireless Qi charging case, and IPX5 sweat resistance.",
    specs: {
      "Noise Reduction": "40dB Smart Adaptive",
      "Microphones": "6 beamforming mic array",
      "Playtime": "8h earbuds + 32h case",
      "Water Resistance": "IPX5 Sweat & Water"
    },
    reviews: [
      { id: "rev-8", user: "Meera Nair", rating: 5, date: "2026-09-05", comment: "Fit securely even when running. Sound quality is studio grade." }
    ]
  },
  {
    id: "prod-8",
    name: "NeoGlow Smart RGB Desk Lightbar",
    category: "Smart Gadgets",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.7,
    reviewCount: 51,
    stock: 40,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Screen glare-free monitor lightbar with ambient rear RGB backlighting. Touch wireless desktop puck controls temperature and brightness smoothly.",
    specs: {
      "Color Temp": "2700K - 6500K Stepless",
      "Color Rendering": "Ra95 High CRI",
      "Controls": "Wireless 2.4G Rotary Controller",
      "Power": "USB Type-C 5V/2A"
    },
    reviews: [
      { id: "rev-9", user: "Devansh Singh", rating: 4.7, date: "2026-09-08", comment: "Massive difference for late night work. Eliminates monitor reflection totally." }
    ]
  },
  {
    id: "prod-9",
    name: "Orbit 4K Ultra HD Drone Gimbal",
    category: "Smart Gadgets",
    price: 349.00,
    originalPrice: 449.00,
    rating: 4.8,
    reviewCount: 37,
    stock: 8,
    badge: "SALE",
    image: "https://images.unsplash.com/photo-1507582020432-2a3bc418123f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1507582020432-2a3bc418123f?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Compact foldable drone featuring 3-axis mechanical gimbal, 4K/60fps HDR video, 10km transmission range, and obstacle sensing in 3 directions.",
    specs: {
      "Camera": "1/1.3\" CMOS 48MP 4K/60fps",
      "Flight Time": "38 Minutes Max",
      "Weight": "Under 249g (No registration needed)",
      "Wind Resistance": "Level 5 (38 km/h)"
    },
    reviews: [
      { id: "rev-10", user: "Arjun Reddy", rating: 5, date: "2026-09-10", comment: "Unbelievably steady video even in breezy mountain winds. Stunning 4K quality." }
    ]
  },
  {
    id: "prod-10",
    name: "AeroCharge 3-in-1 MagSafe Charging Station",
    category: "Desk Essentials",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.8,
    reviewCount: 66,
    stock: 28,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Charge your Phone, Smartwatch, and Earbuds concurrently at maximum wireless speeds. Crafted with weighted zinc alloy base and foldable magnetic arm.",
    specs: {
      "Phone Output": "15W MagSafe Fast Charge",
      "Watch Output": "5W Fast Module",
      "Earbuds Output": "5W Qi pad",
      "Safety": "Over-temp & foreign object detection"
    },
    reviews: [
      { id: "rev-11", user: "Ritu Saxena", rating: 5, date: "2026-09-12", comment: "Cleaned up all cables from my nightstand. Strong magnetic hold." }
    ]
  },
  {
    id: "prod-11",
    name: "UrbanExplorer Waterproof Tech Backpack",
    category: "Wearables",
    price: 85.00,
    originalPrice: 110.00,
    rating: 4.7,
    reviewCount: 44,
    stock: 19,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Weatherproof Cordura fabric, padded 16-inch laptop compartment, hidden RFID passport pocket, and luggage strap for smooth travel.",
    specs: {
      "Capacity": "24 Liters expandable to 30L",
      "Material": "1000D Ballistic Cordura",
      "Laptop Pocket": "Fits up to 16.2-inch laptops",
      "Zippers": "YKK Aquaguard weatherproof"
    },
    reviews: [
      { id: "rev-12", user: "Kabir Mathur", rating: 4.8, date: "2026-09-13", comment: "Tough build quality. Fits all my tech gear and camera comfortably." }
    ]
  },
  {
    id: "prod-12",
    name: "VisionPro 4K Ultra Wide USB Webcam",
    category: "Desk Essentials",
    price: 95.00,
    originalPrice: 130.00,
    rating: 4.6,
    reviewCount: 58,
    stock: 15,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Crystal clear 4K 30fps streaming with AI auto-framing, dual noise-cancelling mics, and physical privacy shutter slider.",
    specs: {
      "Resolution": "4K UHD (3840x2160) @ 30fps, 1080p @ 60fps",
      "Field of View": "65°, 78°, and 90° adjustable",
      "Focus": "Phase Detection Autofocus (PDAF)",
      "Mount": "Universal clip + 1/4\" tripod thread"
    },
    reviews: [
      { id: "rev-13", user: "Pooja Sharma", rating: 4.6, date: "2026-09-14", comment: "Auto-framing keeps me centered on client Zoom meetings. High quality picture." }
    ]
  }
];

function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);

    const initialData = {
      categories: [
        "All",
        "Audio & Sound",
        "Wearables",
        "Photography",
        "Desk Essentials",
        "Smart Gadgets"
      ],
      products: INITIAL_PRODUCTS,
      users: [
        {
          id: "usr-demo",
          name: "Veernarayan",
          email: "demo@codealpha.com",
          passwordHash: demoPasswordHash,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          createdAt: "2026-09-01T08:00:00.000Z",
          role: "user"
        }
      ],
      orders: [
        {
          id: "ORD-92817",
          userId: "usr-demo",
          date: "2026-09-10T14:32:00.000Z",
          status: "Delivered",
          items: [
            {
              id: "prod-1",
              name: "AuraWave Pro Noise-Cancelling Headphones",
              price: 199.99,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
            }
          ],
          shippingAddress: {
            fullName: "Veernarayan",
            email: "demo@codealpha.com",
            phone: "+91 98765 43210",
            street: "42 Innovation Boulevard, Tech Park",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560100"
          },
          paymentMethod: "Credit Card",
          subtotal: 199.99,
          discount: 20.00,
          shipping: 0.00,
          total: 179.99
        }
      ]
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDb() {
  initDb();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

const db = {
  getProducts(filters = {}) {
    const data = readDb();
    let result = [...data.products];

    // Category filter
    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Price range
    if (filters.minPrice) {
      result = result.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    // In-stock only
    if (filters.inStock === 'true' || filters.inStock === true) {
      result = result.filter(p => p.stock > 0);
    }

    // Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating-desc':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0));
          break;
        default:
          // featured/default
          break;
      }
    }

    return result;
  },

  getCategories() {
    const data = readDb();
    return data.categories;
  },

  getProductById(id) {
    const data = readDb();
    return data.products.find(p => p.id === id) || null;
  },

  addProductReview(productId, reviewData) {
    const data = readDb();
    const product = data.products.find(p => p.id === productId);
    if (!product) return null;

    if (!product.reviews) product.reviews = [];
    
    const newReview = {
      id: `rev-${Date.now()}`,
      user: reviewData.user || 'Anonymous Customer',
      rating: parseFloat(reviewData.rating) || 5,
      date: new Date().toISOString().split('T')[0],
      comment: reviewData.comment || 'Great quality!'
    };

    product.reviews.unshift(newReview);
    product.reviewCount = product.reviews.length;
    
    // Recalculate average rating
    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));

    writeDb(data);
    return product;
  },

  getUserByEmail(email) {
    const data = readDb();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  getUserById(id) {
    const data = readDb();
    return data.users.find(u => u.id === id) || null;
  },

  createUser(userData) {
    const data = readDb();
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      createdAt: new Date().toISOString(),
      role: 'user'
    };
    data.users.push(newUser);
    writeDb(data);
    return newUser;
  },

  createOrder(orderData) {
    const data = readDb();
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      id: orderId,
      userId: orderData.userId || 'guest',
      date: new Date().toISOString(),
      status: 'Confirmed',
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      subtotal: parseFloat(orderData.subtotal),
      discount: parseFloat(orderData.discount || 0),
      shipping: parseFloat(orderData.shipping || 0),
      total: parseFloat(orderData.total)
    };

    // Update product stock counts
    orderData.items.forEach(item => {
      const prod = data.products.find(p => p.id === item.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    data.orders.unshift(newOrder);
    writeDb(data);
    return newOrder;
  },

  getOrdersByUserId(userId) {
    const data = readDb();
    return data.orders.filter(o => o.userId === userId);
  },

  getOrderById(id) {
    const data = readDb();
    return data.orders.find(o => o.id === id) || null;
  }
};

initDb();

module.exports = db;
