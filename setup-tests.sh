#!/bin/bash

# Set up the environment and run tests

echo "Setting up Playwright for acceptance testing..."

# Install Playwright browser dependencies
npx playwright install --with-deps

echo "Playwright setup complete!"
echo ""
echo "Available testing commands:"
echo "  npm run test        - Run tests in headless mode"
echo "  npm run test:ui     - Run tests with UI mode"
echo "  npm run test:debug  - Run tests in debug mode"
echo ""
echo "To run tests: npm run test" 