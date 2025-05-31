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
      end: null
    }
  };

  const items = {};

  // Extract items for each category
  for (const [category, { start, end }] of Object.entries(categories)) {
    const startIndex = content.indexOf(start);
    if (startIndex === -1) continue;
    
    const startPos = startIndex + start.length;
    const endIndex = end ? content.indexOf(end, startPos) : content.length;
    const sectionText = content.substring(startPos, endIndex).trim();
    
    // Extract items from the section
    const lines = sectionText.split('\n').filter(line => line.trim() !== '');
    
    // Special handling for stratagems which have bullet points
    if (category === 'stratagems') {
      items[category] = lines
        .filter(line => line.includes('•'))
        .map(line => line.split('•')[1].trim());
    } else {
      items[category] = lines.filter(line => !line.startsWith('──') && line.trim() !== '');
    }
  }

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
app.get('/api/random/:type', (req, res) => {
  try {
    const { type } = req.params;
    const items = parseItemsFile();
    
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