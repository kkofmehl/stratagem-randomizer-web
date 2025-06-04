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
    
    // All categories use bullet points
    items[category] = lines
      .filter(line => line.includes('•'))
      .map(line => line.split('•')[1].trim());
    
    console.log(`Category ${category}: found ${items[category].length} items`);
  }

  // Load stratagems from JSON file
  try {
    const stratagemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'stratagems.json'), 'utf8'));
    
    // Create a flat list of all stratagems
    const allStratagems = [];
    const stratagemCategories = {};
    
    for (const [category, stratagems] of Object.entries(stratagemsData)) {
      stratagemCategories[category] = stratagems.map(stratagem => stratagem.name);
      allStratagems.push(...stratagems.map(stratagem => stratagem.name));
    }
    
    items.stratagems = allStratagems;
    items.stratagemCategories = stratagemCategories;
    items.stratagemsData = stratagemsData; // Store the full data with icons
    
    console.log(`Loaded stratagems from JSON: ${allStratagems.length} stratagems (${Object.keys(stratagemCategories).join(', ')})`);
  } catch (error) {
    console.error('Error loading stratagems.json:', error);
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
// Modified to return full stratagem objects with icons
const getRandomStratagems = (stratagems, stratagemCategories, stratagemsData, options = {}, count = 4) => {
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
    const availableStratagemNames = [...stratagemCategories[onlyCategory]];
    const selectedStratagems = [];
    
    for (let i = 0; i < count && availableStratagemNames.length > 0; i++) {
      const index = Math.floor(Math.random() * availableStratagemNames.length);
      const selectedName = availableStratagemNames[index];
      
      // Find the full stratagem object with icon
      const selectedStratagem = stratagemsData[onlyCategory].find(s => s.name === selectedName);
      selectedStratagems.push(selectedStratagem);
      availableStratagemNames.splice(index, 1);
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
  
  // Create a map to look up full stratagem objects
  const stratagemMap = {};
  for (const [category, stratagems] of Object.entries(stratagemsData)) {
    for (const stratagem of stratagems) {
      stratagemMap[stratagem.name] = { ...stratagem, category };
    }
  }
  
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
    const categoryStratagemNames = [...stratagemCategories[category]];
    console.log(`Adding at least 2 stratagems from heavy category ${category}`);
    
    // Get at least 2 stratagems from this category if possible
    let heavyStratagemCount = 0;
    while (heavyStratagemCount < 2 && categoryStratagemNames.length > 0 && selectedStratagems.length < count) {
      const index = Math.floor(Math.random() * categoryStratagemNames.length);
      const selectedName = categoryStratagemNames[index];
      const selectedStratagem = stratagemMap[selectedName];
      selectedStratagems.push(selectedStratagem);
      heavyStratagemCount++;
      
      // Remove the selected stratagem from the category and available pools
      categoryStratagemNames.splice(index, 1);
      const availableIndex = availableStratagems.findIndex(s => s === selectedName);
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
    
    const categoryStratagemNames = [...stratagemCategories[category]];
    if (categoryStratagemNames.length > 0) {
      console.log(`Adding at most 1 stratagem from light category ${category}`);
      const index = Math.floor(Math.random() * categoryStratagemNames.length);
      const selectedName = categoryStratagemNames[index];
      const selectedStratagem = stratagemMap[selectedName];
      selectedStratagems.push(selectedStratagem);
      lightCategoryItems[category] = true;
      
      // Remove from available pool
      const availableIndex = availableStratagems.findIndex(s => s === selectedName);
      if (availableIndex !== -1) {
        availableStratagems.splice(availableIndex, 1);
      }
    }
  }
  
  // For remaining slots, randomly select from available stratagems
  // But exclude additional stratagems from light categories
  while (selectedStratagems.length < count && availableStratagems.length > 0) {
    const index = Math.floor(Math.random() * availableStratagems.length);
    const selectedName = availableStratagems[index];
    const selectedStratagem = stratagemMap[selectedName];
    
    // Check if this stratagem belongs to a light category
    let isFromLightCategory = false;
    let lightCategory = null;
    
    for (const category of lightCategories) {
      if (stratagemCategories[category].includes(selectedName)) {
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
        // Get the options from the query parameters and map to the correct case
        const options = {
          DEFENSE: req.query.defense || 'Normal',
          EAGLES: req.query.eagles || 'Normal',
          ORBITALS: req.query.orbitals || 'Normal',
          SUPPORT: req.query.support || 'Normal'
        };
        
        console.log("Stratagem options received:", options);
        
        // Get random stratagems with the specified options and include icons
        result = { stratagems: getRandomStratagems(items.stratagems, items.stratagemCategories, items.stratagemsData, options) };
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
    const stratagems = getRandomStratagems(items.stratagems, items.stratagemCategories, items.stratagemsData, options);
    
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
      stratagems: getRandomStratagems(items.stratagems, items.stratagemCategories, items.stratagemsData, stratagemOptions)
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
  console.log(`Server running on port ${PORT}`);
  
  // Parse items on startup to check if everything is working
  try {
    const items = parseItemsFile();
    console.log(`Server initialized with ${items.stratagems?.length || 0} stratagems`);
  } catch (error) {
    console.error('Error parsing items on startup:', error);
  }
}); 