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
    
    // All categories now use bullet points
    items[category] = lines
      .filter(line => line.includes('•'))
      .map(line => line.split('•')[1].trim());
    
    console.log(`Category ${category}: found ${items[category].length} items`);
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
const getRandomStratagems = (stratagems, count = 4) => {
  if (!stratagems || stratagems.length === 0) return [];
  
  const availableStratagems = [...stratagems];
  const selectedStratagems = [];
  
  for (let i = 0; i < count && availableStratagems.length > 0; i++) {
    const index = Math.floor(Math.random() * availableStratagems.length);
    selectedStratagems.push(availableStratagems[index]);
    availableStratagems.splice(index, 1);
  }
  
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
        result = { stratagems: getRandomStratagems(items.stratagems) };
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

// API endpoint to get random loadout
app.get('/api/random-loadout', (req, res) => {
  try {
    const items = parseItemsFile();
    
    const loadout = {
      primary: getRandomItem(items.primary),
      secondary: getRandomItem(items.secondary),
      grenade: getRandomItem(items.grenades),
      armor: getRandomItem(items.armor),
      booster: getRandomItem(items.boosters),
      stratagems: getRandomStratagems(items.stratagems)
    };
    
    res.json(loadout);
  } catch (error) {
    console.error('Error generating loadout:', error);
    res.status(500).json({ error: 'Failed to generate loadout' });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
}); 