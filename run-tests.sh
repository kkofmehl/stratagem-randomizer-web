#!/bin/bash

# Script to run Helldivers 2 Loadout Randomizer tests

# Check if the browser dependencies are installed
if ! npx playwright --version &>/dev/null; then
  echo "Installing Playwright browser dependencies..."
  npx playwright install --with-deps chromium
fi

# Run the tests
echo "Running tests..."
npm test

# Show a message about viewing the report
echo ""
echo "Tests completed! A report should have opened in your browser."
echo "If not, you can manually open the HTML report from the playwright-report directory."
echo ""
echo "For UI mode tests, run: npm run test:ui"
echo "For debug mode tests, run: npm run test:debug" 