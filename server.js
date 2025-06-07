const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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
    
    console.log("Generating random loadout with stratagem options:", stratagemOptions);
    
    // Get random items
    const randomPrimary = getRandomItemWithData(items.primary, items.itemsData, 'PRIMARY');
    const randomSecondary = getRandomItemWithData(items.secondary, items.itemsData, 'SECONDARY');
    const randomGrenade = getRandomItemWithData(items.grenades, items.itemsData, 'GRENADES');
    const randomArmor = getRandomItemWithData(items.armor, items.itemsData, 'ARMOR');
    const randomBooster = getRandomItemWithData(items.boosters, items.itemsData, 'BOOSTERS');
    const randomSideMission = getRandomItemWithData(items.sideMissions, items.itemsData, 'SIDE MISSIONS');
    
    // Get 4 random stratagems
    const randomStratagems = getRandomStratagems(
      items.stratagems,
      items.stratagemCategories,
      items.stratagemsData,
      stratagemOptions
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
    const randomPrimary = getRandomItemWithData(items.primary, items.itemsData, 'PRIMARY');
    res.json({ primary: randomPrimary });
  } catch (error) {
    console.error('Error getting random primary weapon:', error);
    res.status(500).json({ error: 'Failed to get random primary weapon' });
  }
});

app.get('/api/random/secondary', (req, res) => {
  try {
    const randomSecondary = getRandomItemWithData(items.secondary, items.itemsData, 'SECONDARY');
    res.json({ secondary: randomSecondary });
  } catch (error) {
    console.error('Error getting random secondary weapon:', error);
    res.status(500).json({ error: 'Failed to get random secondary weapon' });
  }
});

app.get('/api/random/grenade', (req, res) => {
  try {
    const randomGrenade = getRandomItemWithData(items.grenades, items.itemsData, 'GRENADES');
    res.json({ grenade: randomGrenade });
  } catch (error) {
    console.error('Error getting random grenade:', error);
    res.status(500).json({ error: 'Failed to get random grenade' });
  }
});

app.get('/api/random/booster', (req, res) => {
  try {
    const randomBooster = getRandomItemWithData(items.boosters, items.itemsData, 'BOOSTERS');
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
    
    console.log("Getting random stratagems with options:", stratagemOptions);
    
    const randomStratagems = getRandomStratagems(
      items.stratagems,
      items.stratagemCategories,
      items.stratagemsData,
      stratagemOptions
    );
    
    res.json({ stratagems: randomStratagems });
  } catch (error) {
    console.error('Error getting random stratagems:', error);
    res.status(500).json({ error: 'Failed to get random stratagems' });
  }
});

app.get('/api/random/armor', (req, res) => {
  try {
    // Use getRandomItemWithData to get armor with potential icons
    const randomArmor = getRandomItemWithData(items.armor, items.itemsData, 'ARMOR');
    res.json({ armor: randomArmor });
  } catch (error) {
    console.error('Error getting random armor:', error);
    res.status(500).json({ error: 'Failed to get random armor' });
  }
});

app.get('/api/random/side-mission', (req, res) => {
  try {
    const randomSideMission = getRandomItemWithData(items.sideMissions, items.itemsData, 'SIDE MISSIONS');
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
    
    console.log(`Getting random stratagem with options: ${JSON.stringify(stratagemOptions)}`);
    console.log(`Excluded stratagems: ${excludedStratagems.join(', ')}`);
    
    // Create a map to look up full stratagem objects
    const stratagemMap = {};
    for (const [category, stratagems] of Object.entries(items.stratagemsData)) {
      for (const stratagem of stratagems) {
        stratagemMap[stratagem.name] = { ...stratagem, category };
      }
    }
    
    // Create an array of available stratagems based on the options
    let availableStratagemNames = [];
    
    // Check if any category has "Only" selected
    const onlyCategory = Object.entries(stratagemOptions).find(([_, value]) => value === 'Only')?.[0];
    
    if (onlyCategory) {
      console.log(`Only using stratagems from category: ${onlyCategory}`);
      availableStratagemNames = [...items.stratagemCategories[onlyCategory]];
    } else {
      // Get the categories marked as "No" (excluded)
      const excludedCategories = Object.entries(stratagemOptions)
        .filter(([_, value]) => value === 'No')
        .map(([category]) => category);
      
      // Add stratagems from all categories except excluded ones
      for (const [category, categoryStratagems] of Object.entries(items.stratagemCategories)) {
        if (!excludedCategories.includes(category)) {
          availableStratagemNames = [...availableStratagemNames, ...categoryStratagems];
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 