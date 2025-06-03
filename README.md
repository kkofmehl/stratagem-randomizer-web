# Helldivers 2 Loadout Randomizer

A simple web application that generates random loadouts for Helldivers 2, including primary weapons, secondary weapons, grenades, and stratagems.

## Features

- Generates a random loadout with one click
- Includes 1 primary weapon, 1 secondary weapon, 1 grenade, and 4 stratagems
- Modern, responsive UI

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/helldivers2-loadout-randomizer.git
   cd helldivers2-loadout-randomizer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development

To run the application in development mode with automatic reloading:
```
npm run dev
```

## Automated Testing

This project includes acceptance tests using Playwright to verify that the application works correctly.

### Setup Testing Environment

Run the setup script to install browser dependencies:
```
./setup-tests.sh
```

### Running Tests

Run all tests in headless mode:
```
npm test
```

Run tests with UI mode for debugging:
```
npm run test:ui
```

Run tests in debug mode:
```
npm run test:debug
```

### Test Coverage

The acceptance tests verify:
- Basic page loading and UI elements
- Randomization functionality for all loadout items
- Individual roll buttons for specific loadout sections
- Stratagem options modal functionality
- Consistency across randomizations
- Proper application of stratagem filters

## Technologies Used

- Node.js
- Express
- Vanilla JavaScript
- HTML5
- CSS3
- Playwright (testing)

## License

MIT 