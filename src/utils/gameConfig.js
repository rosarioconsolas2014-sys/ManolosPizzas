/**
 * Catalog of Pizza Ingredients with exact approved emojis
 */
export const INGREDIENTS = [
  {
    id: 'masa',
    name: 'Masa Fresca',
    category: 'base',
    icon: '🫓',
    color: '#F3E5CC',
    description: 'Masa artesanal estirada a mano'
  },
  {
    id: 'salsa_tomate',
    name: 'Salsa de Tomate',
    category: 'salsa',
    icon: '🍅',
    color: '#D93636',
    description: 'Salsa casera de tomates italianos'
  },
  {
    id: 'mozzarella',
    name: 'Mozzarella',
    category: 'queso',
    icon: '🧀',
    color: '#F8D978',
    description: 'Queso mozzarella hilado artesanal'
  },
  {
    id: 'jamon',
    name: 'Jamón',
    category: 'fiambre',
    icon: '🍖',
    color: '#F472B6',
    description: 'Jamón cocido de primera calidad'
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    category: 'fiambre',
    icon: '🍕',
    color: '#DC2626',
    description: 'Rodajas de salame especiado'
  },
  {
    id: 'aceitunas',
    name: 'Aceitunas',
    category: 'vegetal',
    icon: '🫒',
    color: '#65A30D',
    description: 'Aceitunas descarozadas seleccionadas'
  },
  {
    id: 'champinones',
    name: 'Champiñones',
    category: 'vegetal',
    icon: '🍄',
    color: '#D6D3D1',
    description: 'Champiñones frescos laminados'
  },
  {
    id: 'morron',
    name: 'Morrón',
    category: 'vegetal',
    icon: '🫑',
    color: '#EF4444',
    description: 'Tiras de morrón dulce asado'
  },
  {
    id: 'cebolla',
    name: 'Cebolla',
    category: 'vegetal',
    icon: '🧅',
    color: '#A855F7',
    description: 'Finos aros de cebolla caramelizada'
  },
  {
    id: 'albahaca',
    name: 'Albahaca',
    category: 'aromatica',
    icon: '🌿',
    color: '#27864B',
    description: 'Hojas frescas de albahaca napolitana'
  },
  {
    id: 'oregano',
    name: 'Orégano',
    category: 'aromatica',
    icon: '🌱',
    color: '#16A34A',
    description: 'Orégano seco perfumado'
  },
  {
    id: 'anana',
    name: 'Ananá',
    category: 'fruta',
    icon: '🍍',
    color: '#FACC15',
    description: 'Ananá jugoso en trozos'
  },
  {
    id: 'choclo',
    name: 'Choclo',
    category: 'vegetal',
    icon: '🌽',
    color: '#EAB308',
    description: 'Granos dorados de choclo tierno'
  },
  {
    id: 'panceta',
    name: 'Panceta',
    category: 'fiambre',
    icon: '🥓',
    color: '#991B1B',
    description: 'Panceta crocante dorada al horno'
  },
  {
    id: 'tomate',
    name: 'Tomate',
    category: 'vegetal',
    icon: '🍅',
    color: '#E11D48',
    description: 'Rodajas de tomate fresco'
  }
];

export const INGREDIENTS_BY_ID = INGREDIENTS.reduce((acc, ing) => {
  acc[ing.id] = ing;
  return acc;
}, {});

// Robust aliases to ensure morron, aceituna, etc. never return undefined
INGREDIENTS_BY_ID['morrones'] = INGREDIENTS_BY_ID['morron'];
INGREDIENTS_BY_ID['pimiento'] = INGREDIENTS_BY_ID['morron'];
INGREDIENTS_BY_ID['aceituna'] = INGREDIENTS_BY_ID['aceitunas'];
INGREDIENTS_BY_ID['aceitunas_verdes'] = INGREDIENTS_BY_ID['aceitunas'];
INGREDIENTS_BY_ID['aceitunas_negras'] = INGREDIENTS_BY_ID['aceitunas'];
INGREDIENTS_BY_ID['champiñones'] = INGREDIENTS_BY_ID['champinones'];
INGREDIENTS_BY_ID['champinon'] = INGREDIENTS_BY_ID['champinones'];
INGREDIENTS_BY_ID['ananá'] = INGREDIENTS_BY_ID['anana'];
INGREDIENTS_BY_ID['piña'] = INGREDIENTS_BY_ID['anana'];
INGREDIENTS_BY_ID['orégano'] = INGREDIENTS_BY_ID['oregano'];
INGREDIENTS_BY_ID['salsa'] = INGREDIENTS_BY_ID['salsa_tomate'];
INGREDIENTS_BY_ID['queso'] = INGREDIENTS_BY_ID['mozzarella'];
INGREDIENTS_BY_ID['cuatro_quesos'] = INGREDIENTS_BY_ID['mozzarella'];
INGREDIENTS_BY_ID['peperoni'] = INGREDIENTS_BY_ID['pepperoni'];

/**
 * 3-Level Progression with simple, fun minigames:
 * - Level 1: 3 required ingredients, 4 tray options, 45 seconds (Easy & generous)
 * - Level 2: 4 required ingredients, 6 tray options, 35 seconds (Medium & varied)
 * - Level 3: 5 required ingredients, 8 tray options, 25 seconds (Fast & engaging)
 */
export const LEVELS = [
  {
    level: 1,
    title: 'NIVEL 1 – AYUDANTE DE COCINA',
    subtitle: 'Comandas sencillas de 3 ingredientes',
    badge: 'AYUDANTE',
    color: 'bg-[#DCEFE1] text-[#27864B] border-[#27864B]',
    timeSeconds: 45,
    requiredCount: 3,
    optionsCount: 4,
    challenges: [
      {
        type: 'match',
        pizzaName: 'Pizza Clásica',
        clientName: 'Don Luigi',
        greeting: '¡Ciao chef! Quiero mi pizza con:',
        requiredIngredients: ['salsa_tomate', 'mozzarella', 'jamon'],
        trayOptions: ['salsa_tomate', 'mozzarella', 'jamon', 'anana']
      },
      {
        type: 'match',
        pizzaName: 'Pizza Margarita',
        clientName: 'Doña Sofía',
        greeting: '¡Buenas maestro! Sencilla y rica por favor:',
        requiredIngredients: ['salsa_tomate', 'mozzarella', 'albahaca'],
        trayOptions: ['salsa_tomate', 'mozzarella', 'albahaca', 'cebolla']
      },
      {
        type: 'match',
        pizzaName: 'Pizza Napolitana',
        clientName: 'Nico el Vecino',
        greeting: '¡Hola! Bien crujiente con tomate y aceitunas:',
        requiredIngredients: ['mozzarella', 'tomate', 'aceitunas'],
        trayOptions: ['mozzarella', 'tomate', 'aceitunas', 'choclo']
      },
      {
        type: 'find',
        pizzaName: '¡Pedido Rápido!',
        clientName: 'Chef Manolo',
        greeting: '¡Rápido ayudante! ¡Pásame la Mozzarella fresca!',
        targetIngredient: 'mozzarella',
        requiredIngredients: ['mozzarella'],
        trayOptions: ['mozzarella', 'cebolla', 'anana', 'champinones']
      }
    ]
  },
  {
    level: 2,
    title: 'NIVEL 2 – MAESTRO PIZZERO',
    subtitle: 'Comandas de 4 ingredientes y reflejos rápidos',
    badge: 'MAESTRO',
    color: 'bg-[#F8D978]/30 text-[#92400E] border-[#D97706]',
    timeSeconds: 35,
    requiredCount: 4,
    optionsCount: 6,
    challenges: [
      {
        type: 'match',
        pizzaName: 'Pizza Especial Manolo',
        clientName: 'Familia Rossi',
        greeting: '¡Buenas noches! Cuatro porciones bien cargadas:',
        requiredIngredients: ['salsa_tomate', 'mozzarella', 'jamon', 'morron'],
        trayOptions: ['salsa_tomate', 'mozzarella', 'jamon', 'morron', 'cebolla', 'choclo']
      },
      {
        type: 'match',
        pizzaName: 'Pizza Pepperoni & Champiñones',
        clientName: 'Mateo & Valentina',
        greeting: '¡Hola chef! Picantita y con hongos:',
        requiredIngredients: ['salsa_tomate', 'mozzarella', 'pepperoni', 'champinones'],
        trayOptions: ['salsa_tomate', 'mozzarella', 'pepperoni', 'champinones', 'anana', 'aceitunas']
      },
      {
        type: 'match',
        pizzaName: 'Pizza Fugazzeta Especial',
        clientName: 'Capitán Sandro',
        greeting: '¡Hola maestro! Con mucha cebolla y aceitunas:',
        requiredIngredients: ['mozzarella', 'cebolla', 'aceitunas', 'oregano'],
        trayOptions: ['mozzarella', 'cebolla', 'aceitunas', 'oregano', 'panceta', 'salsa_tomate']
      },
      {
        type: 'choose',
        pizzaName: '¿Cuál es la Pizza Correcta?',
        clientName: 'Inspectora Lucía',
        greeting: '¿Cuál de estas dos pizzas tiene: Salsa, Mozzarella, Jamón y Aceitunas?',
        requiredIngredients: ['salsa_tomate', 'mozzarella', 'jamon', 'aceitunas'],
        optionA: {
          name: 'Opción A',
          ingredients: ['salsa_tomate', 'mozzarella', 'jamon', 'aceitunas'],
          isCorrect: true
        },
        optionB: {
          name: 'Opción B',
          ingredients: ['salsa_tomate', 'mozzarella', 'cebolla', 'anana'],
          isCorrect: false
        }
      }
    ]
  },
  {
    level: 3,
    title: 'NIVEL 3 – CHEF PROFESIONAL',
    subtitle: 'Comandas gourmet de 5 ingredientes y alta velocidad',
    badge: 'GRAN CHEF',
    color: 'bg-[#FBE4DF] text-[#D93636] border-[#D93636]',
    timeSeconds: 25,
    requiredCount: 5,
    optionsCount: 8,
    challenges: [
      {
        type: 'match',
        pizzaName: 'Gran Manolo Suprema',
        clientName: 'Crítico Vivaldi',
        greeting: '¡Exijo esta combinación de autor en tiempo récord!',
        requiredIngredients: ['salsa_tomate', 'mozzarella', 'panceta', 'champinones', 'albahaca'],
        trayOptions: ['salsa_tomate', 'mozzarella', 'panceta', 'champinones', 'albahaca', 'anana', 'choclo', 'cebolla']
      },
      {
        type: 'match',
        pizzaName: 'Pizza Carnívora Deluxe',
        clientName: 'Embajador Romano',
        greeting: '¡Con todo el fiambre crocante y orégano!',
        requiredIngredients: ['salsa_tomate', 'mozzarella', 'jamon', 'pepperoni', 'panceta'],
        trayOptions: ['salsa_tomate', 'mozzarella', 'jamon', 'pepperoni', 'panceta', 'morron', 'aceitunas', 'tomate']
      },
      {
        type: 'match',
        pizzaName: 'Pizza Huerto Italiano',
        clientName: 'Chef Estrella Marco',
        greeting: '¡Demostrá tu talento de Gran Chef con la huerta fresca!',
        requiredIngredients: ['mozzarella', 'morron', 'cebolla', 'champinones', 'albahaca'],
        trayOptions: ['mozzarella', 'morron', 'cebolla', 'champinones', 'albahaca', 'anana', 'salsa_tomate', 'choclo']
      }
    ]
  }
];

export const DEFAULT_CONFIG = {
  monthlyPrizeName: 'CENA COMPLETA PARA 4 PERSONAS ',
  monthlyPrizeDescription: 'El mejor pizzero del mes ganará una cena gourmet para 4 personas en Manolo\'s Pizzas, el delantal oficial bordado y 1 pizza grande gratis por mes durante un año.',
  maxAttemptsPerPlayer: 3,
  gameActive: true,
  currentMonth: getCurrentMonthString(),
  adminSecretPin: 'manolo123'
};

export function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthName(monthStr) {
  if (!monthStr || typeof monthStr !== 'string') return 'Mes Actual';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  return `${monthNames[monthIdx] || parts[1]} ${year}`;
}
