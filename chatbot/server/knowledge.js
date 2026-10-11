// Rootify Knowledge Base & Goan Cultural Domain Context
export const ROOTIFY_KNOWLEDGE = {
  name: "ROOTIFY",
  tagline: "Authentic Goan Regional Marketplace",
  mission: "Connecting conscious consumers and Goan households with authentic regional Goan producers, self-help groups (SHGs / Mahila Mandals), traditional bakers (poder), spice artisans, and organic growers across North & South Goa.",
  
  roles: {
    guest: "Unauthenticated visitor exploring Goan authentic products and vendors.",
    customer: "Shopper browsing products, managing single-vendor artisan cart, placing orders with UPI or COD, and tracking delivery.",
    vendor: "Artisanal producers, home bakers, and SHGs managing catalog, order fulfillment stages, and earnings.",
    delivery: "Local Goan delivery partners handling pickups from village artisans and delivering to customers across talukas.",
    admin: "Platform operators reviewing vendor documentation (FSSAI, Panchayat NOC, SHG registration), catalog moderation, and settlements."
  },

  talukas: [
    { name: "Tiswadi", district: "North Goa", hubs: ["Panaji", "Divar Island", "Old Goa", "Santa Cruz"], estDelivery: "25-35 mins" },
    { name: "Bardez", district: "North Goa", hubs: ["Mapusa", "Guirim", "Calangute", "Porvorim", "Candolim"], estDelivery: "30-40 mins" },
    { name: "Salcete", district: "South Goa", hubs: ["Margao", "Raia", "Curtorim", "Benaulim", "Colva"], estDelivery: "35-45 mins" },
    { name: "Ponda", district: "South Goa", hubs: ["Ponda Town", "Priol", "Bandora"], estDelivery: "35-50 mins" },
    { name: "Mormugao", district: "South Goa", hubs: ["Vasco da Gama", "Chicalim"], estDelivery: "30-45 mins" },
    { name: "Pernem", district: "North Goa", hubs: ["Pernem Town", "Arambol", "Mandrem"], estDelivery: "45-60 mins" },
    { name: "Bicholim", district: "North Goa", hubs: ["Bicholim", "Mayem"], estDelivery: "40-55 mins" },
    { name: "Sattari", district: "North Goa", hubs: ["Valpoi", "Honda"], estDelivery: "50-70 mins" },
    { name: "Quepem", district: "South Goa", hubs: ["Quepem", "Curchorem"], estDelivery: "45-60 mins" },
    { name: "Canacona", district: "South Goa", hubs: ["Chaudi", "Palolem"], estDelivery: "60-90 mins" },
    { name: "Sanguem", district: "South Goa", hubs: ["Sanguem Town"], estDelivery: "55-75 mins" },
    { name: "Dharbandora", district: "South Goa", hubs: ["Dharbandora Town"], estDelivery: "50-70 mins" }
  ],

  categories: [
    { id: "sweets", name: "Goan Sweets", highlights: "Royal 7-layer Bebinca, Dodol made with pyramid coconut jaggery (maddachem godd), Bolinhas coconut cookies, Doce de Grão" },
    { id: "traditional", name: "Traditional Foods", highlights: "Heritage smoked Goan Choriz sausages, fresh wood-fired Poee, Undo, Kakon" },
    { id: "spices", name: "Spices & Masalas", highlights: "Stone-ground Xacuti masala, fiery Recheado paste, Fish curry masala, Cafreal marinade" },
    { id: "pickles", name: "Pickles & Preserves", highlights: "Prawn Balchão, dry mackerel preserve, tender mango Chepnim, brined amla" },
    { id: "cashews", name: "Cashew Products", highlights: "Goan W240 slow-roasted whole cashews, spiced cashew nuts, organic cashew syrup" },
    { id: "bakery", name: "Artisanal Bakery", highlights: "Traditional village wood-fired Poee, crusty Kakon, Bolinhas, Batica coconut cake" },
    { id: "beverages", name: "Beverages & Syrups", highlights: "Pure Kokum Agal / concentrate, spiced Sol Kadhi mix, Cashew Apple nectar" },
    { id: "festive", name: "Festive Specials", highlights: "Christmas & Diwali specials: Kulkuls, Nevris (Karanji), Pinag, Channa Doce" }
  ],

  featuredVendors: [
    {
      name: "Maria's Traditional Foods",
      location: "Guirim, Mapusa (Bardez, North Goa)",
      specialty: "Heirloom Goan Sweets since 1954. Clay-oven slow baked 7-layer Bebinca, Dodol made from dark coconut palm jaggery.",
      verified: true,
      certifications: ["FSSAI Registered", "Panchayat Trade NOC", "Traditional Recipe Heritage Stamp"]
    },
    {
      name: "Divar Island Mahila Mandal SHG",
      location: "Piedade, Divar Island (Tiswadi, North Goa)",
      specialty: "18 village women cooperative. Stone-ground (rogddo) spice pastes, heirloom Prawn Balchão, and Xacuti masala.",
      verified: true,
      certifications: ["Govt SHG Certified", "FSSAI License", "100% Preservative Free"]
    },
    {
      name: "Salcete Heritage Confectioners",
      location: "Raia (Salcete, South Goa)",
      specialty: "Old-world Catholic Goan festive treats, crunchy coconut Bolinhas, Serradura dessert mixes, caramel Dodol.",
      verified: true,
      certifications: ["Salcete Municipality License", "FSSAI Registered"]
    },
    {
      name: "Valpoi Cashew & Spice Collective",
      location: "Valpoi (Sattari, North Goa)",
      specialty: "Single-origin W240 wood-roasted cashews, wild forest honey, black pepper.",
      verified: true,
      certifications: ["Organic Spice Growers Board", "FSSAI Registered"]
    }
  ],

  keyRules: [
    "Single-Vendor Fresh Cart: To ensure freshly prepared artisanal quality, each order is prepared and packed by one verified Goan vendor at a time.",
    "Order Tracking: 7 live stages: PLACED -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED.",
    "Payment Options: UPI and Cash on Delivery (COD) available for all serviceable talukas.",
    "Vendor Onboarding: Requires local Panchayat NOC, trade license, or registered Self-Help Group (SHG) certificate, plus FSSAI compliance. Rootify takes a modest 5% platform commission to support logistics.",
    "Authenticity Stamp: Every product features 'Verified Origin' with village name, taluka, ingredients list, and traditional preparation method."
  ]
};
