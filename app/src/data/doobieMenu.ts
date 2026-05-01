export type DoobieMenuItem = {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    description?: string;
    recommended?: boolean;
  };
  
  export const doobieStore = {
    name: 'DOOBIE DOO BAR',
    subtitle: 'Disco Izakaya Bar',
    location: '118 Phạm Viết Chánh, Bình Thạnh, Ho Chi Minh City',
    currency: 'VND',
  };
  
  export const doobieMenu: DoobieMenuItem[] = [
    {
      id: 'cold-gakko-cheese',
      name: 'Gakko Cheese',
      price: 150000,
      category: 'Cold Tapas',
      imageUrl: '',
      description: 'Pickles and cheese, perfect with drinks.',
      recommended: true,
    },
    {
      id: 'cold-chicken-liver',
      name: 'Sous-vide Chicken Liver, Water Chive',
      price: 120000,
      category: 'Cold Tapas',
      imageUrl: '',
      description: 'Soft chicken liver with fresh greens.',
    },
    {
      id: 'cold-chicken-breast',
      name: 'Tender Chicken Breast, Watercress, Wasabi & Seaweed Sauce',
      price: 120000,
      category: 'Cold Tapas',
      imageUrl: '',
      description: 'Light and refreshing chicken dish with Japanese flavor.',
    },
  
    {
      id: 'warm-kombu-coconut-corn',
      name: 'Kombu Coconut Corn',
      price: 90000,
      category: 'Warm Tapas',
      imageUrl: '',
      description: 'Sweet corn with a unique kombu-coconut flavor.',
      recommended: true,
    },
    {
      id: 'warm-kitsune-banhmi',
      name: 'OTSUMAMI Kitsune Banh Mi',
      price: 150000,
      category: 'Warm Tapas',
      imageUrl: '',
      description: 'A playful bar snack inspired by banh mi.',
      recommended: true,
    },
    {
      id: 'warm-salmon-ikura',
      name: 'Koji-marinated Salmon Steak, Ikura Sauce',
      price: 150000,
      category: 'Warm Tapas',
      imageUrl: '',
      description: 'Rich salmon steak with ikura-style sauce.',
    },
    {
      id: 'warm-horse-mackerel',
      name: 'Deep-fried Breaded Horse Mackerel, Tartare Sauce',
      price: 150000,
      category: 'Warm Tapas',
      imageUrl: '',
      description: 'Crispy fried fish with tartare sauce.',
    },
  
    {
      id: 'oden-radish',
      name: 'Radish',
      price: 45000,
      category: 'Oden',
      imageUrl: '',
      description: 'Classic oden daikon.',
    },
    {
      id: 'oden-tomato',
      name: 'Tomato',
      price: 45000,
      category: 'Oden',
      imageUrl: '',
      description: 'Juicy tomato simmered in oden broth.',
    },
    {
      id: 'oden-atsuage',
      name: 'Atsuage Tofu',
      price: 85000,
      category: 'Oden',
      imageUrl: '',
      description: 'Fried tofu soaked with savory broth.',
      recommended: true,
    },
    {
      id: 'oden-half-boiled-egg',
      name: 'Half-boiled Egg',
      price: 85000,
      category: 'Oden',
      imageUrl: '',
      description: 'Soft egg with rich yolk.',
      recommended: true,
    },
    {
      id: 'oden-beef-tendon',
      name: 'Beef Tendon',
      price: 60000,
      category: 'Oden',
      imageUrl: '',
      description: 'Tender beef tendon simmered in broth.',
    },
    {
      id: 'oden-takoyaki',
      name: 'Takoyaki',
      price: 40000,
      category: 'Oden',
      imageUrl: '',
      description: 'Takoyaki-style oden item with a fun twist.',
    },
  
    {
      id: 'rice-oden-udon',
      name: 'Oden Soup Udon / Oden Soupy Rice',
      price: 150000,
      category: 'Rice / Noodle',
      imageUrl: '',
      description: 'Warm and comforting oden soup with udon or rice.',
      recommended: true,
    },
    {
      id: 'rice-napolitan',
      name: 'Sizzling Iron Plate Napolitan Pasta',
      price: 180000,
      category: 'Rice / Noodle',
      imageUrl: '',
      description: 'Japanese-style napolitan pasta served on a hot plate.',
      recommended: true,
    },
    {
      id: 'rice-oyster-sandwich',
      name: 'Deep-fried Hiroshima Oyster Sandwich',
      price: 220000,
      category: 'Rice / Noodle',
      imageUrl: '',
      description: 'Crunchy oyster sandwich with strong character.',
      recommended: true,
    },
  
    {
      id: 'sparkling-veuve',
      name: 'Veuve Clicquot Yellow',
      price: 4500000,
      category: 'Sparkling',
      imageUrl: '',
      description: 'Bottle',
    },
    {
      id: 'white-logan-apple-tree-flat',
      name: 'Logan Apple Tree Flat',
      price: 980000,
      category: 'White Wine',
      imageUrl: '',
      description: 'Bottle',
    },
    {
      id: 'red-matsu-el-picaro',
      name: 'Matsu, El Picaro',
      price: 980000,
      category: 'Red Wine',
      imageUrl: '',
      description: 'Bottle',
    },
    {
      id: 'rose-la-huppe',
      name: 'Domaine de la Cadenierre, La Huppe',
      price: 880000,
      category: 'Rose Wine',
      imageUrl: '',
      description: 'Bottle',
    },
  ];