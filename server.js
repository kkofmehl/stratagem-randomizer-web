const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse the items.md file to extract weapon and stratagem data
const parseItemsFile = () => {
  const content = fs.readFileSync(path.join(__dirname, 'items.md'), 'utf8');
  
  // Define categories and their patterns
  const categories = {
    primary: {
      start: '──────────────────────── PRIMARY WEAPONS ────────────────────────',
      end: '──────────────────────── SECONDARY WEAPONS ────────────────────────'
    },
    secondary: {
      start: '──────────────────────── SECONDARY WEAPONS ────────────────────────',
      end: '──────────────────────── HAND GRENADES ────────────────────────'
    },
    grenades: {
      start: '──────────────────────── HAND GRENADES ────────────────────────',
      end: '──────────────────────── STRATAGEMS ────────────────────────'
    },
    stratagems: {
      start: '──────────────────────── STRATAGEMS ────────────────────────',
      end: '──────────────────────── ARMOR SETS ────────────────────────'
    },
    armor: {
      start: '──────────────────────── ARMOR SETS ────────────────────────',
      end: '──────────────────────── BOOSTERS ────────────────────────'
    },
    boosters: {
      start: '──────────────────────── BOOSTERS ────────────────────────',
      end: null
    }
  };

  const items = {};

  // Extract items for each category
  for (const [category, { start, end }] of Object.entries(categories)) {
    const startIndex = content.indexOf(start);
    if (startIndex === -1) {
      console.log(`Category ${category} not found`);
      continue;
    }
    
    const startPos = startIndex + start.length;
    const endIndex = end ? content.indexOf(end, startPos) : content.length;
    const sectionText = content.substring(startPos, endIndex).trim();
    
    // Extract items from the section
    const lines = sectionText.split('\n').filter(line => line.trim() !== '');
    
    if (category === 'stratagems') {
      // Parse stratagem subcategories
      const stratagemCategories = {
        DEFENSE: [],
        EAGLES: [],
        ORBITALS: [],
        SUPPORT: []
      };
      
      let currentCategory = null;
      
      for (const line of lines) {
        if (line.includes('________________________ DEFENSE ___________________________')) {
          currentCategory = 'DEFENSE';
        } else if (line.includes('________________________ EAGLES ____________________________')) {
          currentCategory = 'EAGLES';
        } else if (line.includes('________________________ ORBITALS __________________________')) {
          currentCategory = 'ORBITALS';
        } else if (line.includes('________________________SUPPORT ____________________________')) {
          currentCategory = 'SUPPORT';
        } else if (line.includes('•') && currentCategory) {
          stratagemCategories[currentCategory].push(line.split('•')[1].trim());
        }
      }
      
      // Store both the flat list and categorized stratagems
      items[category] = Object.values(stratagemCategories).flat();
      items.stratagemCategories = stratagemCategories;
      
      console.log(`Category ${category}: found ${items[category].length} items (${stratagemCategories.DEFENSE.length} defense, ${stratagemCategories.EAGLES.length} eagles, ${stratagemCategories.ORBITALS.length} orbitals, ${stratagemCategories.SUPPORT.length} support)`);
    } else {
      // All other categories use bullet points
      items[category] = lines
        .filter(line => line.includes('•'))
        .map(line => line.split('•')[1].trim());
      
      console.log(`Category ${category}: found ${items[category].length} items`);
    }
  }

  console.log('Parsed items summary:', {
    primary: items.primary?.length || 0,
    secondary: items.secondary?.length || 0,
    grenades: items.grenades?.length || 0,
    stratagems: items.stratagems?.length || 0,
    armor: items.armor?.length || 0,
    boosters: items.boosters?.length || 0
  });

  return items;
};

// Function to get a random item from an array
const getRandomItem = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

// Function to get 4 random stratagems without duplicates
const getRandomStratagems = (stratagems, stratagemCategories, options = {}, count = 4) => {
  if (!stratagems || stratagems.length === 0) return [];
  
  // Default options for all categories
  const defaultOptions = {
    DEFENSE: 'Normal',
    EAGLES: 'Normal',
    ORBITALS: 'Normal',
    SUPPORT: 'Normal'
  };

  // Merge with provided options
  const categoryOptions = { ...defaultOptions, ...options };
  
  console.log("Stratagem options applied:", categoryOptions);
  
  // Check if any category has "Only" selected
  const onlyCategory = Object.entries(categoryOptions).find(([_, value]) => value === 'Only')?.[0];
  
  if (onlyCategory) {
    console.log(`Only using stratagems from category: ${onlyCategory}`);
    // Use only stratagems from the selected category
    const availableStratagems = [...stratagemCategories[onlyCategory]];
    const selectedStratagems = [];
    
    for (let i = 0; i < count && availableStratagems.length > 0; i++) {
      const index = Math.floor(Math.random() * availableStratagems.length);
      selectedStratagems.push(availableStratagems[index]);
      availableStratagems.splice(index, 1);
    }
    
    console.log(`Selected ${selectedStratagems.length} stratagems from ${onlyCategory}`);
    return selectedStratagems;
  }
  
  // Get the categories marked as "Heavy" (at least 2 stratagems)
  const heavyCategories = Object.entries(categoryOptions)
    .filter(([_, value]) => value === 'Heavy')
    .map(([category]) => category);
  
  // Get the categories marked as "Light" (at most 1 stratagem)
  const lightCategories = Object.entries(categoryOptions)
    .filter(([_, value]) => value === 'Light')
    .map(([category]) => category);
  
  // Get the categories marked as "No" (excluded)
  const excludedCategories = Object.entries(categoryOptions)
    .filter(([_, value]) => value === 'No')
    .map(([category]) => category);
  
  console.log(`Heavy categories: ${heavyCategories.join(', ') || 'none'}`);
  console.log(`Light categories: ${lightCategories.join(', ') || 'none'}`);
  console.log(`Excluded categories: ${excludedCategories.join(', ') || 'none'}`);
  
  // Create pools of stratagems from each active category
  let availableStratagems = [];
  
  for (const [category, categoryStratagems] of Object.entries(stratagemCategories)) {
    if (!excludedCategories.includes(category)) {
      availableStratagems = [...availableStratagems, ...categoryStratagems];
    }
  }
  
  if (availableStratagems.length === 0) {
    console.log("No stratagems available with current options");
    return [];
  }
  
  const selectedStratagems = [];
  
  // First, ensure we get at least 2 stratagems from each heavy category
  for (const category of heavyCategories) {
    const categoryStratagems = [...stratagemCategories[category]];
    console.log(`Adding at least 2 stratagems from heavy category ${category}`);
    
    // Get at least 2 stratagems from this category if possible
    let heavyStratagemCount = 0;
    while (heavyStratagemCount < 2 && categoryStratagems.length > 0 && selectedStratagems.length < count) {
      const index = Math.floor(Math.random() * categoryStratagems.length);
      const selectedStratagem = categoryStratagems[index];
      selectedStratagems.push(selectedStratagem);
      heavyStratagemCount++;
      
      // Remove the selected stratagem from the category and available pools
      categoryStratagems.splice(index, 1);
      const availableIndex = availableStratagems.findIndex(s => s === selectedStratagem);
      if (availableIndex !== -1) {
        availableStratagems.splice(availableIndex, 1);
      }
    }
  }
  
  // Then, ensure we have at most 1 stratagem from each light category
  const lightCategoryItems = {};
  
  // Process light categories
  for (const category of lightCategories) {
    if (selectedStratagems.length >= count) break;
    
    const categoryStratagems = [...stratagemCategories[category]];
    if (categoryStratagems.length > 0) {
      console.log(`Adding at most 1 stratagem from light category ${category}`);
      const index = Math.floor(Math.random() * categoryStratagems.length);
      const selectedStratagem = categoryStratagems[index];
      selectedStratagems.push(selectedStratagem);
      lightCategoryItems[category] = true;
      
      // Remove from available pool
      const availableIndex = availableStratagems.findIndex(s => s === selectedStratagem);
      if (availableIndex !== -1) {
        availableStratagems.splice(availableIndex, 1);
      }
    }
  }
  
  // For remaining slots, randomly select from available stratagems
  // But exclude additional stratagems from light categories
  while (selectedStratagems.length < count && availableStratagems.length > 0) {
    const index = Math.floor(Math.random() * availableStratagems.length);
    const selectedStratagem = availableStratagems[index];
    
    // Check if this stratagem belongs to a light category
    let isFromLightCategory = false;
    let lightCategory = null;
    
    for (const category of lightCategories) {
      if (stratagemCategories[category].includes(selectedStratagem)) {
        isFromLightCategory = true;
        lightCategory = category;
        break;
      }
    }
    
    // If from a light category, check if we already have one from this category
    if (isFromLightCategory && lightCategoryItems[lightCategory]) {
      // Already have one from this category, skip
      availableStratagems.splice(index, 1);
      continue;
    } else if (isFromLightCategory) {
      lightCategoryItems[lightCategory] = true;
    }
    
    selectedStratagems.push(selectedStratagem);
    availableStratagems.splice(index, 1);
  }
  
  console.log(`Selected ${selectedStratagems.length} stratagems with options`);
  return selectedStratagems;
};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints for individual item types
app.get('/api/debug', (req, res) => {
  try {
    const items = parseItemsFile();
    res.json({
      primaryCount: items.primary?.length || 0,
      secondaryCount: items.secondary?.length || 0,
      grenadesCount: items.grenades?.length || 0,
      stratagemsCount: items.stratagems?.length || 0,
      armorCount: items.armor?.length || 0,
      boostersCount: items.boosters?.length || 0,
      firstArmor: items.armor?.[0] || 'None',
      firstBooster: items.boosters?.[0] || 'None'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/random/:type', (req, res) => {
  try {
    const { type } = req.params;
    const items = parseItemsFile();
    
    console.log("Endpoint called with type:", type);

    let result;
    
    switch (type) {
      case 'primary':
        result = { primary: getRandomItem(items.primary) };
        break;
      case 'secondary':
        result = { secondary: getRandomItem(items.secondary) };
        break;
      case 'grenade':
        result = { grenade: getRandomItem(items.grenades) };
        break;
      case 'stratagems':
        result = { stratagems: getRandomStratagems(items.stratagems, items.stratagemCategories) };
        break;
      case 'armor':
        result = { armor: getRandomItem(items.armor) };
        break;
      case 'booster':
        result = { booster: getRandomItem(items.boosters) };
        break;
      default:
        return res.status(400).json({ error: 'Invalid item type' });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error generating random ${req.params.type}:`, error);
    res.status(500).json({ error: `Failed to generate random ${req.params.type}` });
  }
});

// API endpoint for stratagems with options
app.get('/api/random/stratagems', (req, res) => {
  try {
    const items = parseItemsFile();
    
    // Get the options from the query parameters and map to the correct case
    const options = {
      DEFENSE: req.query.defense || 'Normal',
      EAGLES: req.query.eagles || 'Normal',
      ORBITALS: req.query.orbitals || 'Normal',
      SUPPORT: req.query.support || 'Normal'
    };
    
    console.log("Stratagem options received:", options);
    
    // Get random stratagems with the specified options
    const stratagems = getRandomStratagems(items.stratagems, items.stratagemCategories, options);
    
    res.json({ stratagems });
  } catch (error) {
    console.error('Error generating random stratagems:', error);
    res.status(500).json({ error: 'Failed to generate random stratagems' });
  }
});

// API endpoint to get random loadout with stratagem options
app.get('/api/random-loadout', (req, res) => {
  try {
    const items = parseItemsFile();
    
    // Get the stratagem options from the query parameters and map to the correct case
    const stratagemOptions = {
      DEFENSE: req.query.defense || 'Normal',
      EAGLES: req.query.eagles || 'Normal',
      ORBITALS: req.query.orbitals || 'Normal',
      SUPPORT: req.query.support || 'Normal'
    };
    
    console.log("Loadout - stratagem options received:", stratagemOptions);
    
    const loadout = {
      primary: getRandomItem(items.primary),
      secondary: getRandomItem(items.secondary),
      grenade: getRandomItem(items.grenades),
      armor: getRandomItem(items.armor),
      booster: getRandomItem(items.boosters),
      stratagems: getRandomStratagems(items.stratagems, items.stratagemCategories, stratagemOptions)
    };
    
    res.json(loadout);
  } catch (error) {
    console.error('Error generating loadout:', error);
    res.status(500).json({ error: 'Failed to generate loadout' });
  }
});

// API endpoint to get stratagem categories
app.get('/api/stratagem-categories', (req, res) => {
  try {
    const items = parseItemsFile();
    res.json(items.stratagemCategories);
  } catch (error) {
    console.error('Error fetching stratagem categories:', error);
    res.status(500).json({ error: 'Failed to fetch stratagem categories' });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
}); 