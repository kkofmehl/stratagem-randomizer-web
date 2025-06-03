const { test, expect } = require('@playwright/test');

test.describe('Helldivers 2 Loadout Randomizer', () => {
  test('page loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle('Helldivers 2 Loadout Randomizer');
    
    // Check initial state
    await expect(page.locator('#primary')).toContainText('Press the button to randomize');
    await expect(page.locator('#secondary')).toContainText('Press the button to randomize');
    await expect(page.locator('#grenade')).toContainText('Press the button to randomize');
    await expect(page.locator('#armor')).toContainText('Press the button to randomize');
    await expect(page.locator('#booster')).toContainText('Press the button to randomize');
    await expect(page.locator('#stratagems .loadout-item').first()).toContainText('Press the button to randomize');
  });

  test('randomize all button works', async ({ page }) => {
    await page.goto('/');
    
    // Click the randomize all button
    await page.locator('#randomize-all-btn').click();
    
    // Check that all sections are populated
    await expect(page.locator('#primary')).not.toContainText('Press the button to randomize');
    await expect(page.locator('#secondary')).not.toContainText('Press the button to randomize');
    await expect(page.locator('#grenade')).not.toContainText('Press the button to randomize');
    await expect(page.locator('#armor')).not.toContainText('Press the button to randomize');
    await expect(page.locator('#booster')).not.toContainText('Press the button to randomize');
    
    // Check stratagems section is populated with 4 items
    const stratagemItems = page.locator('#stratagems .loadout-item');
    await expect(stratagemItems).toHaveCount(4);
    // Since we have 4 items after randomization, there's no need to check for the placeholder text
  });

  test('individual roll buttons work', async ({ page }) => {
    await page.goto('/');
    
    // Click the primary weapon roll button
    await page.locator('button[data-type="primary"]').click();
    await expect(page.locator('#primary')).not.toContainText('Press the button to randomize');
    
    // Click the secondary weapon roll button
    await page.locator('button[data-type="secondary"]').click();
    await expect(page.locator('#secondary')).not.toContainText('Press the button to randomize');
    
    // Click the grenade roll button
    await page.locator('button[data-type="grenade"]').click();
    await expect(page.locator('#grenade')).not.toContainText('Press the button to randomize');
    
    // Click the armor roll button
    await page.locator('button[data-type="armor"]').click();
    await expect(page.locator('#armor')).not.toContainText('Press the button to randomize');
    
    // Click the booster roll button
    await page.locator('button[data-type="booster"]').click();
    await expect(page.locator('#booster')).not.toContainText('Press the button to randomize');
    
    // Click the stratagems roll button
    await page.locator('button[data-type="stratagems"]').click();
    
    // Verify we have 4 stratagem items instead of checking text content
    await expect(page.locator('#stratagems .loadout-item')).toHaveCount(4);
  });

  test('stratagem options modal can be opened and closed', async ({ page }) => {
    await page.goto('/');
    
    // Open stratagem options modal
    await page.locator('#stratagem-options-btn').click();
    await expect(page.locator('#stratagem-options-modal')).toBeVisible();
    
    // Close using X button
    await page.locator('#stratagem-options-modal .close').click();
    await expect(page.locator('#stratagem-options-modal')).not.toBeVisible();
  });

  test('stratagem options can be applied', async ({ page }) => {
    await page.goto('/');
    
    // Open stratagem options modal
    await page.locator('#stratagem-options-btn').click();
    
    // For radio buttons, we need to click them rather than check them
    await page.locator('input[name="defense"][value="Only"]').click();
    
    // Apply options
    await page.locator('#apply-options-btn').click();
    
    // Modal should close
    await expect(page.locator('#stratagem-options-modal')).not.toBeVisible();
    
    // Click randomize stratagems
    await page.locator('button[data-type="stratagems"]').click();
    
    // Check that stratagems are populated
    const stratagemElements = page.locator('#stratagems .loadout-item');
    const count = await stratagemElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('selecting "Only" for one category disables other categories', async ({ page }) => {
    await page.goto('/');
    
    // Open stratagem options modal
    await page.locator('#stratagem-options-btn').click();
    
    // Initially all categories should be active with "Normal" selected
    await expect(page.locator('input[name="defense"][value="Normal"]')).toBeChecked();
    await expect(page.locator('input[name="eagles"][value="Normal"]')).toBeChecked();
    await expect(page.locator('input[name="orbitals"][value="Normal"]')).toBeChecked();
    await expect(page.locator('input[name="support"][value="Normal"]')).toBeChecked();
    
    // All radio buttons should be enabled initially
    const eaglesInitialOptions = page.locator('input[name="eagles"]');
    const eaglesInitialCount = await eaglesInitialOptions.count();
    for (let i = 0; i < eaglesInitialCount; i++) {
      await expect(eaglesInitialOptions.nth(i)).not.toBeDisabled();
    }
    
    // Apply "Only" option to DEFENSE using the Apply button
    // First select "Only" for defense
    await page.evaluate(() => {
      // Directly set the defense to "Only" in the options object
      const defenseOnlyRadio = document.querySelector('input[name="defense"][value="Only"]');
      defenseOnlyRadio.checked = true;
      
      // Trigger the change event
      const event = new Event('change');
      defenseOnlyRadio.dispatchEvent(event);
    });
    
    // Wait for the UI to update and apply the options
    await page.locator('#apply-options-btn').click();
    
    // Reopen the modal to check the state
    await page.locator('#stratagem-options-btn').click();
    await page.waitForTimeout(500);
    
    // Check that other categories are set to "No" and their options are disabled
    // First verify eagles non-No options are disabled
    const eaglesDisabledOptions = page.locator('input[name="eagles"]:not([value="No"])');
    const eaglesDisabledCount = await eaglesDisabledOptions.count();
    for (let i = 0; i < eaglesDisabledCount; i++) {
      await expect(eaglesDisabledOptions.nth(i)).toBeDisabled();
    }
    
    // Check if eagles "No" option is checked
    await expect(page.locator('input[name="eagles"][value="No"]')).toBeChecked();
    
    // Verify that orbitals and support follow the same pattern
    await expect(page.locator('input[name="orbitals"][value="No"]')).toBeChecked();
    await expect(page.locator('input[name="support"][value="No"]')).toBeChecked();
    
    // Test the same behavior for EAGLES
    // First reset the options
    await page.evaluate(() => {
      document.querySelector('input[name="defense"][value="Normal"]').checked = true;
      document.querySelector('input[name="eagles"][value="Normal"]').checked = true;
      document.querySelector('input[name="orbitals"][value="Normal"]').checked = true;
      document.querySelector('input[name="support"][value="Normal"]').checked = true;
      
      // Trigger change events for each
      ['defense', 'eagles', 'orbitals', 'support'].forEach(name => {
        const normalRadio = document.querySelector(`input[name="${name}"][value="Normal"]`);
        const event = new Event('change');
        normalRadio.dispatchEvent(event);
      });
    });
    
    // Apply the reset options
    await page.locator('#apply-options-btn').click();
    
    // Reopen the modal
    await page.locator('#stratagem-options-btn').click();
    await page.waitForTimeout(500);
    
    // Verify all options were reset to normal
    await expect(page.locator('input[name="defense"][value="Normal"]')).toBeChecked();
    await expect(page.locator('input[name="eagles"][value="Normal"]')).toBeChecked();
    await expect(page.locator('input[name="orbitals"][value="Normal"]')).toBeChecked();
    await expect(page.locator('input[name="support"][value="Normal"]')).toBeChecked();
    
    // Now set Eagles to "Only"
    await page.evaluate(() => {
      const eaglesOnlyRadio = document.querySelector('input[name="eagles"][value="Only"]');
      eaglesOnlyRadio.checked = true;
      
      // Trigger the change event
      const event = new Event('change');
      eaglesOnlyRadio.dispatchEvent(event);
    });
    
    // Apply the options
    await page.locator('#apply-options-btn').click();
    
    // Reopen the modal to check the state
    await page.locator('#stratagem-options-btn').click();
    await page.waitForTimeout(500);
    
    // Check that other categories are set to "No" and their options are disabled
    // Verify defense non-No options are disabled
    const defenseDisabledOptions = page.locator('input[name="defense"]:not([value="No"])');
    const defenseDisabledCount = await defenseDisabledOptions.count();
    for (let i = 0; i < defenseDisabledCount; i++) {
      await expect(defenseDisabledOptions.nth(i)).toBeDisabled();
    }
    
    // Check if defense "No" option is checked
    await expect(page.locator('input[name="defense"][value="No"]')).toBeChecked();
  });
}); 