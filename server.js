const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to prevent API caching
app.use('/api', (req, res, next) => {
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Load items and stratagems from JSON files
const loadItemsData = () => {
  try {
    // Load items from JSON file
    const itemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'items.json'), 'utf8'));
    
    // Create a simplified items object with just names for backwards compatibility
    const items = {
      primary: itemsData.PRIMARY.map(item => item.name),
      secondary: itemsData.SECONDARY.map(item => item.name),
      grenades: itemsData.GRENADES.map(item => item.name),
      armor: itemsData.ARMOR.map(item => item.name),
      boosters: itemsData.BOOSTERS.map(item => item.name),
      sideMissions: itemsData["SIDE MISSIONS"].map(item => item.name),
      itemsData: itemsData // Store the full data with icons
    };

    // Load stratagems from JSON file
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
    
    console.log(`Loaded items from JSON: primary=${items.primary.length}, secondary=${items.secondary.length}, grenades=${items.grenades.length}, armor=${items.armor.length}, boosters=${items.boosters.length}, sideMissions=${items.sideMissions.length}`);
    console.log(`Loaded stratagems from JSON: ${allStratagems.length} stratagems (${Object.keys(stratagemCategories).join(', ')})`);

    return items;
  } catch (error) {
    console.error('Error loading items or stratagems JSON:', error);
    return {};
  }
};

// Function to get all unique warbonds from items and stratagems
const getAllWarbonds = () => {
  const itemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'items.json'), 'utf8'));
  const stratagemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'stratagems.json'), 'utf8'));
  
  const warbonds = new Set();
  
  // Collect warbonds from items
  Object.values(itemsData).forEach(category => {
    if (Array.isArray(category)) {
      category.forEach(item => {
        if (item.warbond) {
          warbonds.add(item.warbond);
        }
      });
    }
  });
  
  // Collect warbonds from stratagems
  Object.values(stratagemsData).forEach(category => {
    if (Array.isArray(category)) {
      category.forEach(stratagem => {
        if (stratagem.warbond) {
          warbonds.add(stratagem.warbond);
        }
      });
    }
  });
  
  return Array.from(warbonds).sort();
};

// Function to filter items by selected warbonds
const filterItemsByWarbonds = (items, selectedWarbonds) => {
  if (!selectedWarbonds || selectedWarbonds.length === 0) {
    return items;
  }
  
  const selectedWarbandsSet = new Set(selectedWarbonds);
  return items.filter(item => {
    // If item doesn't have a warbond property, include it (backwards compatibility)
    if (!item.warbond) return true;
    return selectedWarbandsSet.has(item.warbond);
  });
};

// Function to get a random item from an array
const getRandomItem = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

// Function to get 4 random stratagems without duplicates
// Modified to return full stratagem objects with icons
const getRandomStratagems = (stratagems, stratagemCategories, stratagemsData, options = {}, count = 4, selectedWarbonds = []) => {
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
    // Use only stratagems from the selected category, filtered by warbonds
    const categoryStratagems = stratagemsData[onlyCategory] || [];
    const availableStratagemNames = categoryStratagems
      .filter(stratagem => selectedWarbonds.length === 0 || !stratagem.warbond || selectedWarbonds.includes(stratagem.warbond))
      .map(stratagem => stratagem.name);
    
    const selectedStratagems = [];
    
    for (let i = 0; i < count && availableStratagemNames.length > 0; i++) {
      const index = Math.floor(Math.random() * availableStratagemNames.length);
      const selectedName = availableStratagemNames[index];
      
      // Find the full stratagem object with icon
      const selectedStratagem = categoryStratagems.find(s => s.name === selectedName);
      if (selectedStratagem) {
        selectedStratagems.push(selectedStratagem);
      }
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
  
  // Create a map to look up full stratagem objects with warbond filtering
  const stratagemMap = {};
  for (const [category, stratagems] of Object.entries(stratagemsData)) {
    for (const stratagem of stratagems) {
      // Apply warbond filtering
      if (selectedWarbonds.length === 0 || !stratagem.warbond || selectedWarbonds.includes(stratagem.warbond)) {
        stratagemMap[stratagem.name] = { ...stratagem, category };
      }
    }
  }
  
  // Create pools of stratagems from each active category with warbond filtering
  let availableStratagems = [];
  
  for (const [category, categoryStratagems] of Object.entries(stratagemCategories)) {
    if (!excludedCategories.includes(category)) {
      // Filter by warbonds - only include stratagems that exist in stratagemMap (passed warbond filter)
      const filteredCategoryStratagems = categoryStratagems.filter(name => stratagemMap[name]);
      availableStratagems = [...availableStratagems, ...filteredCategoryStratagems];
    }
  }
  
  if (availableStratagems.length === 0) {
    console.log("No stratagems available with current options");
    return [];
  }
  
  const selectedStratagems = [];
  
  // First, ensure we get at least 2 stratagems from each heavy category
  for (const category of heavyCategories) {
    // Filter category stratagems by warbond
    const categoryStratagemNames = stratagemCategories[category].filter(name => stratagemMap[name]);
    console.log(`Adding at least 2 stratagems from heavy category ${category}`);
    
    // Get at least 2 stratagems from this category if possible
    let heavyStratagemCount = 0;
    while (heavyStratagemCount < 2 && categoryStratagemNames.length > 0 && selectedStratagems.length < count) {
      const index = Math.floor(Math.random() * categoryStratagemNames.length);
      const selectedName = categoryStratagemNames[index];
      const selectedStratagem = stratagemMap[selectedName];
      if (selectedStratagem) {
        selectedStratagems.push(selectedStratagem);
        heavyStratagemCount++;
      }
      
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
    
    // Filter category stratagems by warbond
    const categoryStratagemNames = stratagemCategories[category].filter(name => stratagemMap[name]);
    if (categoryStratagemNames.length > 0) {
      console.log(`Adding at most 1 stratagem from light category ${category}`);
      const index = Math.floor(Math.random() * categoryStratagemNames.length);
      const selectedName = categoryStratagemNames[index];
      const selectedStratagem = stratagemMap[selectedName];
      if (selectedStratagem) {
        selectedStratagems.push(selectedStratagem);
        lightCategoryItems[category] = true;
        
        // Remove from available pool
        const availableIndex = availableStratagems.findIndex(s => s === selectedName);
        if (availableIndex !== -1) {
          availableStratagems.splice(availableIndex, 1);
        }
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
    
    if (isFromLightCategory && lightCategoryItems[lightCategory]) {
      // Skip this stratagem if we already have one from this light category
      availableStratagems.splice(index, 1);
      continue;
    }
    
    selectedStratagems.push(selectedStratagem);
    
    // If this was from a light category, mark it
    if (isFromLightCategory) {
      lightCategoryItems[lightCategory] = true;
    }
    
    // Remove from available pool
    availableStratagems.splice(index, 1);
  }
  
  console.log(`Selected ${selectedStratagems.length} stratagems`);
  return selectedStratagems;
};

// Function to get a random item with full data including icon
const getRandomItemWithData = (itemsArray, itemsData, category) => {
  if (!itemsArray || itemsArray.length === 0) return null;
  const randomName = itemsArray[Math.floor(Math.random() * itemsArray.length)];
  return itemsData[category].find(item => item.name === randomName);
};

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Load item data on startup
const items = loadItemsData();

// Route for getting a complete random loadout
app.get('/api/random-loadout', (req, res) => {
  try {
    const stratagemOptions = {
      DEFENSE: req.query.defense || 'Normal',
      EAGLES: req.query.eagles || 'Normal',
      ORBITALS: req.query.orbitals || 'Normal',
      SUPPORT: req.query.support || 'Normal'
    };
    
    // Handle warbond filtering
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    
    console.log("Generating random loadout with stratagem options:", stratagemOptions);
    console.log("Selected warbonds:", selectedWarbonds);
    
    // Get random items with warbond filtering
    const filteredPrimary = filterItemsByWarbonds(items.itemsData.PRIMARY, selectedWarbonds);
    const filteredSecondary = filterItemsByWarbonds(items.itemsData.SECONDARY, selectedWarbonds);
    const filteredGrenades = filterItemsByWarbonds(items.itemsData.GRENADES, selectedWarbonds);
    const filteredArmor = filterItemsByWarbonds(items.itemsData.ARMOR, selectedWarbonds);
    const filteredBoosters = filterItemsByWarbonds(items.itemsData.BOOSTERS, selectedWarbonds);
    const filteredSideMissions = filterItemsByWarbonds(items.itemsData["SIDE MISSIONS"], selectedWarbonds);
    
    const randomPrimary = getRandomItemWithData(filteredPrimary.map(item => item.name), items.itemsData, 'PRIMARY');
    const randomSecondary = getRandomItemWithData(filteredSecondary.map(item => item.name), items.itemsData, 'SECONDARY');
    const randomGrenade = getRandomItemWithData(filteredGrenades.map(item => item.name), items.itemsData, 'GRENADES');
    const randomArmor = getRandomItemWithData(filteredArmor.map(item => item.name), items.itemsData, 'ARMOR');
    const randomBooster = getRandomItemWithData(filteredBoosters.map(item => item.name), items.itemsData, 'BOOSTERS');
    const randomSideMission = getRandomItemWithData(filteredSideMissions.map(item => item.name), items.itemsData, 'SIDE MISSIONS');
    
    // Get 4 random stratagems with warbond filtering
    const randomStratagems = getRandomStratagems(
      items.stratagems,
      items.stratagemCategories,
      items.stratagemsData,
      stratagemOptions,
      4,
      selectedWarbonds
    );
    
    const loadout = {
      primary: randomPrimary,
      secondary: randomSecondary,
      grenade: randomGrenade,
      armor: randomArmor,
      booster: randomBooster,
      sideMission: randomSideMission,
      stratagems: randomStratagems
    };
    
    console.log("Generated random loadout");
    res.json(loadout);
  } catch (error) {
    console.error('Error generating random loadout:', error);
    res.status(500).json({ error: 'Failed to generate random loadout' });
  }
});

// Routes for getting random items of each type
app.get('/api/random/primary', (req, res) => {
  try {
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    const filteredPrimary = filterItemsByWarbonds(items.itemsData.PRIMARY, selectedWarbonds);
    const randomPrimary = getRandomItemWithData(filteredPrimary.map(item => item.name), items.itemsData, 'PRIMARY');
    res.json({ primary: randomPrimary });
  } catch (error) {
    console.error('Error getting random primary weapon:', error);
    res.status(500).json({ error: 'Failed to get random primary weapon' });
  }
});

app.get('/api/random/secondary', (req, res) => {
  try {
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    const filteredSecondary = filterItemsByWarbonds(items.itemsData.SECONDARY, selectedWarbonds);
    const randomSecondary = getRandomItemWithData(filteredSecondary.map(item => item.name), items.itemsData, 'SECONDARY');
    res.json({ secondary: randomSecondary });
  } catch (error) {
    console.error('Error getting random secondary weapon:', error);
    res.status(500).json({ error: 'Failed to get random secondary weapon' });
  }
});

app.get('/api/random/grenade', (req, res) => {
  try {
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    const filteredGrenades = filterItemsByWarbonds(items.itemsData.GRENADES, selectedWarbonds);
    const randomGrenade = getRandomItemWithData(filteredGrenades.map(item => item.name), items.itemsData, 'GRENADES');
    res.json({ grenade: randomGrenade });
  } catch (error) {
    console.error('Error getting random grenade:', error);
    res.status(500).json({ error: 'Failed to get random grenade' });
  }
});

app.get('/api/random/booster', (req, res) => {
  try {
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    const filteredBoosters = filterItemsByWarbonds(items.itemsData.BOOSTERS, selectedWarbonds);
    const randomBooster = getRandomItemWithData(filteredBoosters.map(item => item.name), items.itemsData, 'BOOSTERS');
    res.json({ booster: randomBooster });
  } catch (error) {
    console.error('Error getting random booster:', error);
    res.status(500).json({ error: 'Failed to get random booster' });
  }
});

app.get('/api/random/stratagems', (req, res) => {
  try {
    const stratagemOptions = {
      DEFENSE: req.query.defense || 'Normal',
      EAGLES: req.query.eagles || 'Normal',
      ORBITALS: req.query.orbitals || 'Normal',
      SUPPORT: req.query.support || 'Normal'
    };
    
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    
    console.log("Getting random stratagems with options:", stratagemOptions);
    console.log("Selected warbonds for stratagems:", selectedWarbonds);
    
    const randomStratagems = getRandomStratagems(
      items.stratagems,
      items.stratagemCategories,
      items.stratagemsData,
      stratagemOptions,
      4,
      selectedWarbonds
    );
    
    res.json({ stratagems: randomStratagems });
  } catch (error) {
    console.error('Error getting random stratagems:', error);
    res.status(500).json({ error: 'Failed to get random stratagems' });
  }
});

app.get('/api/random/armor', (req, res) => {
  try {
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    const filteredArmor = filterItemsByWarbonds(items.itemsData.ARMOR, selectedWarbonds);
    const randomArmor = getRandomItemWithData(filteredArmor.map(item => item.name), items.itemsData, 'ARMOR');
    res.json({ armor: randomArmor });
  } catch (error) {
    console.error('Error getting random armor:', error);
    res.status(500).json({ error: 'Failed to get random armor' });
  }
});

app.get('/api/random/side-mission', (req, res) => {
  try {
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    const filteredSideMissions = filterItemsByWarbonds(items.itemsData["SIDE MISSIONS"], selectedWarbonds);
    const randomSideMission = getRandomItemWithData(filteredSideMissions.map(item => item.name), items.itemsData, 'SIDE MISSIONS');
    res.json({ sideMission: randomSideMission });
  } catch (error) {
    console.error('Error getting random side mission:', error);
    res.status(500).json({ error: 'Failed to get random side mission' });
  }
});

// New endpoint for getting a single random stratagem without duplicates
app.get('/api/random/stratagem', (req, res) => {
  try {
    const stratagemOptions = {
      DEFENSE: req.query.defense || 'Normal',
      EAGLES: req.query.eagles || 'Normal',
      ORBITALS: req.query.orbitals || 'Normal',
      SUPPORT: req.query.support || 'Normal'
    };
    
    const excludedStratagems = req.query.exclude ? 
      Array.isArray(req.query.exclude) ? req.query.exclude : [req.query.exclude] : 
      [];
    
    const index = parseInt(req.query.index) || 0;
    
    const selectedWarbonds = req.query.warbonds ? req.query.warbonds.split(',') : [];
    
    console.log(`Getting random stratagem with options: ${JSON.stringify(stratagemOptions)}`);
    console.log(`Excluded stratagems: ${excludedStratagems.join(', ')}`);
    console.log(`Selected warbonds: ${selectedWarbonds.join(', ')}`);
    
    // Create a map to look up full stratagem objects with warbond filtering
    const stratagemMap = {};
    for (const [category, stratagems] of Object.entries(items.stratagemsData)) {
      for (const stratagem of stratagems) {
        // Apply warbond filtering
        if (selectedWarbonds.length === 0 || !stratagem.warbond || selectedWarbonds.includes(stratagem.warbond)) {
          stratagemMap[stratagem.name] = { ...stratagem, category };
        }
      }
    }
    
    // Create an array of available stratagems based on the options
    let availableStratagemNames = [];
    
    // Check if any category has "Only" selected
    const onlyCategory = Object.entries(stratagemOptions).find(([_, value]) => value === 'Only')?.[0];
    
    if (onlyCategory) {
      console.log(`Only using stratagems from category: ${onlyCategory}`);
      // Filter by warbonds - only include stratagems that exist in stratagemMap (passed warbond filter)
      availableStratagemNames = items.stratagemCategories[onlyCategory].filter(name => stratagemMap[name]);
    } else {
      // Get the categories marked as "No" (excluded)
      const excludedCategories = Object.entries(stratagemOptions)
        .filter(([_, value]) => value === 'No')
        .map(([category]) => category);
      
      // Add stratagems from all categories except excluded ones
      for (const [category, categoryStratagems] of Object.entries(items.stratagemCategories)) {
        if (!excludedCategories.includes(category)) {
          // Filter by warbonds - only include stratagems that exist in stratagemMap (passed warbond filter)
          const filteredCategoryStratagems = categoryStratagems.filter(name => stratagemMap[name]);
          availableStratagemNames = [...availableStratagemNames, ...filteredCategoryStratagems];
        }
      }
      
      // Filter out any stratagems that are in the excluded list
      availableStratagemNames = availableStratagemNames.filter(name => !excludedStratagems.includes(name));
    }
    
    if (availableStratagemNames.length === 0) {
      console.log("No stratagems available with current options and exclusions");
      return res.status(404).json({ error: 'No stratagems available with current options' });
    }
    
    // Get a random stratagem from the available ones
    const randomIndex = Math.floor(Math.random() * availableStratagemNames.length);
    const selectedName = availableStratagemNames[randomIndex];
    const selectedStratagem = stratagemMap[selectedName];
    
    console.log(`Selected stratagem: ${selectedName}`);
    res.json({ stratagem: selectedStratagem });
  } catch (error) {
    console.error('Error getting random stratagem:', error);
    res.status(500).json({ error: 'Failed to get random stratagem' });
  }
});

// Get all available warbonds
app.get('/api/warbonds', (req, res) => {
  try {
    const warbonds = getAllWarbonds();
    console.log(`Returning ${warbonds.length} warbonds:`, warbonds);
    res.json(warbonds);
  } catch (error) {
    console.error('Error getting warbonds:', error);
    res.status(500).json({ error: 'Failed to get warbonds' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 