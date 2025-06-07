document.addEventListener('DOMContentLoaded', () => {
    const randomizeAllBtn = document.getElementById('randomize-all-btn');
    const rollButtons = document.querySelectorAll('.roll-btn');
    const primaryElement = document.getElementById('primary');
    const secondaryElement = document.getElementById('secondary');
    const grenadeElement = document.getElementById('grenade');
    const armorElement = document.getElementById('armor');
    const boosterElement = document.getElementById('booster');
    const stratagemsElement = document.getElementById('stratagems');
    
    // Modal elements
    const stratagemsOptionsBtn = document.getElementById('stratagem-options-btn');
    const stratagemsOptionsModal = document.getElementById('stratagem-options-modal');
    const closeModalBtn = document.querySelector('.close');
    const applyOptionsBtn = document.getElementById('apply-options-btn');
    
    // Stratagem category options - initialize with values from radio buttons
    let stratagemOptions = {
        defense: document.querySelector('input[name="defense"]:checked')?.value || 'Normal',
        eagles: document.querySelector('input[name="eagles"]:checked')?.value || 'Normal',
        orbitals: document.querySelector('input[name="orbitals"]:checked')?.value || 'Normal',
        support: document.querySelector('input[name="support"]:checked')?.value || 'Normal'
    };
    
    console.log("Initial stratagem options:", stratagemOptions);
    
    // Function to apply option constraints
    const applyOptionConstraints = () => {
        // Reset all radio buttons to enabled state
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.disabled = false;
        });
        
        // Reset all category styling
        document.querySelectorAll('.stratagem-category').forEach(category => {
            category.classList.remove('disabled-option');
        });
        
        // Check if any category has "Only" selected
        const onlyCategory = Object.entries(stratagemOptions).find(([_, value]) => value === 'Only');
        
        if (onlyCategory) {
            // Get the name of the category with "Only" selected
            const [onlyCategoryName] = onlyCategory;
            
            // Make sure the "Only" option is checked in the UI
            const onlyCategoryRadio = document.querySelector(`input[name="${onlyCategoryName}"][value="Only"]`);
            if (onlyCategoryRadio && !onlyCategoryRadio.checked) {
                onlyCategoryRadio.checked = true;
            }
            
            // Process each category
            document.querySelectorAll('.stratagem-category').forEach(category => {
                const categoryNameElement = category.querySelector('h3');
                const categoryName = categoryNameElement.textContent.toLowerCase();
                
                if (categoryName !== onlyCategoryName.toUpperCase()) {
                    // Set other categories to "No"
                    const noRadioInput = category.querySelector('input[value="No"]');
                    if (noRadioInput) {
                        noRadioInput.checked = true;
                        
                        // Update the options object
                        const lowerCaseCategoryName = categoryName.toLowerCase();
                        stratagemOptions[lowerCaseCategoryName] = 'No';
                    }
                    
                    // Disable all options except "No" for other categories
                    category.querySelectorAll('input[type="radio"]').forEach(input => {
                        if (input.value !== 'No') {
                            input.disabled = true;
                        }
                    });
                    
                    // Add visual styling to indicate the category is disabled
                    category.classList.add('disabled-option');
                }
            });
            return;
        }
        
        // Count how many categories are set to "Heavy"
        const heavyCategoryEntries = Object.entries(stratagemOptions)
            .filter(([_, value]) => value === 'Heavy');
        
        const heavyCategories = heavyCategoryEntries.map(([category]) => category);
        
        if (heavyCategories.length >= 2) {
            // If two categories are already "Heavy", set other categories to "No" and disable all options except "No"
            document.querySelectorAll('.stratagem-category').forEach(category => {
                const categoryNameElement = category.querySelector('h3');
                const categoryName = categoryNameElement.textContent.toLowerCase();
                
                if (!heavyCategories.includes(categoryName.toLowerCase())) {
                    // Set to "No"
                    const radioInput = category.querySelector('input[value="No"]');
                    if (radioInput && !radioInput.checked) {
                        radioInput.checked = true;
                        // Update the options object
                        stratagemOptions[categoryName.toLowerCase()] = 'No';
                    }
                    
                    // Disable all options except "No"
                    category.querySelectorAll('input[type="radio"]').forEach(input => {
                        if (input.value !== 'No') {
                            input.disabled = true;
                        }
                    });
                }
            });
        } else {
            // Enable all options for all categories
            document.querySelectorAll('input[type="radio"]').forEach(input => {
                input.disabled = false;
            });
        }
    };
    
    // Initialize option constraints
    applyOptionConstraints();
    
    // Function to handle stratagem option changes
    const handleStratagemOptionChange = () => {
        // Get the current values from the radio buttons
        const defenseOption = document.querySelector('input[name="defense"]:checked')?.value || 'Normal';
        const eaglesOption = document.querySelector('input[name="eagles"]:checked')?.value || 'Normal';
        const orbitalsOption = document.querySelector('input[name="orbitals"]:checked')?.value || 'Normal';
        const supportOption = document.querySelector('input[name="support"]:checked')?.value || 'Normal';
        
        // Store the current options
        stratagemOptions = {
            defense: defenseOption,
            eagles: eaglesOption,
            orbitals: orbitalsOption,
            support: supportOption
        };
        
        console.log("Stratagem options updated:", stratagemOptions);
        
        // Apply the constraints
        applyOptionConstraints();
    };
    
    // Function to get a complete random loadout from the API
    const getRandomLoadout = async () => {
        try {
            // Add spinning state to button
            randomizeAllBtn.classList.add('spinning');
            randomizeAllBtn.disabled = true;
            
            // Build query string with stratagem options
            const queryParams = new URLSearchParams();
            queryParams.append('defense', stratagemOptions.defense);
            queryParams.append('eagles', stratagemOptions.eagles);
            queryParams.append('orbitals', stratagemOptions.orbitals);
            queryParams.append('support', stratagemOptions.support);
            
            console.log("Sending stratagem options to server:", Object.fromEntries(queryParams));
            
            const response = await fetch(`/api/random-loadout?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch loadout');
            }
            
            const data = await response.json();
            
            // Update the UI with the random loadout
            updateUI(data);
            
        } catch (error) {
            console.error('Error fetching loadout:', error);
            alert('Failed to generate loadout. Please try again.');
        } finally {
            // Remove spinning state from button
            randomizeAllBtn.classList.remove('spinning');
            randomizeAllBtn.disabled = false;
        }
    };
    
    // Function to get a random item of a specific type
    const getRandomItem = async (type, button) => {
        try {
            // Add spinning state to button
            button.classList.add('spinning');
            button.disabled = true;
            
            let url = `/api/random/${type}`;
            
            // Add stratagem options if type is 'stratagems'
            if (type === 'stratagems') {
                const queryParams = new URLSearchParams();
                queryParams.append('defense', stratagemOptions.defense);
                queryParams.append('eagles', stratagemOptions.eagles);
                queryParams.append('orbitals', stratagemOptions.orbitals);
                queryParams.append('support', stratagemOptions.support);
                
                console.log(`Rolling stratagems with options: DEFENSE=${stratagemOptions.defense}, EAGLES=${stratagemOptions.eagles}, ORBITALS=${stratagemOptions.orbitals}, SUPPORT=${stratagemOptions.support}`);
                
                url += `?${queryParams.toString()}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch random ${type}`);
            }
            
            const data = await response.json();
            console.log(`Received ${type} data:`, data);
            
            // Update only the specific part of the UI
            updateUI(data);
            
        } catch (error) {
            console.error(`Error fetching random ${type}:`, error);
            alert(`Failed to generate random ${type}. Please try again.`);
        } finally {
            // Remove spinning state from button
            button.classList.remove('spinning');
            button.disabled = false;
        }
    };
    
    // Function to update the UI with the loadout data
    const updateUI = (data) => {
        // Update primary weapon if present in data
        if (data.primary) {
            primaryElement.innerHTML = '';
            const primaryItem = document.createElement('div');
            primaryItem.className = 'loadout-item-with-icon';
            
            // Add icon if available
            if (typeof data.primary === 'object' && data.primary.icon) {
                const iconElement = document.createElement('img');
                iconElement.src = data.primary.icon;
                iconElement.alt = data.primary.name;
                iconElement.className = 'item-icon';
                primaryItem.appendChild(iconElement);
                
                // Add name
                const nameElement = document.createElement('span');
                nameElement.className = 'item-name';
                nameElement.textContent = data.primary.name;
                primaryItem.appendChild(nameElement);
            } else {
                // Fallback for string data
                primaryItem.textContent = typeof data.primary === 'object' ? data.primary.name : data.primary;
            }
            
            primaryElement.appendChild(primaryItem);
        }
        
        // Update secondary weapon if present in data
        if (data.secondary) {
            secondaryElement.innerHTML = '';
            const secondaryItem = document.createElement('div');
            secondaryItem.className = 'loadout-item-with-icon';
            
            // Add icon if available
            if (typeof data.secondary === 'object' && data.secondary.icon) {
                const iconElement = document.createElement('img');
                iconElement.src = data.secondary.icon;
                iconElement.alt = data.secondary.name;
                iconElement.className = 'item-icon';
                secondaryItem.appendChild(iconElement);
                
                // Add name
                const nameElement = document.createElement('span');
                nameElement.className = 'item-name';
                nameElement.textContent = data.secondary.name;
                secondaryItem.appendChild(nameElement);
            } else {
                // Fallback for string data
                secondaryItem.textContent = typeof data.secondary === 'object' ? data.secondary.name : data.secondary;
            }
            
            secondaryElement.appendChild(secondaryItem);
        }
        
        // Update grenade if present in data
        if (data.grenade) {
            grenadeElement.innerHTML = '';
            const grenadeItem = document.createElement('div');
            grenadeItem.className = 'loadout-item-with-icon';
            
            // Add icon if available
            if (typeof data.grenade === 'object' && data.grenade.icon) {
                const iconElement = document.createElement('img');
                iconElement.src = data.grenade.icon;
                iconElement.alt = data.grenade.name;
                iconElement.className = 'item-icon';
                grenadeItem.appendChild(iconElement);
                
                // Add name
                const nameElement = document.createElement('span');
                nameElement.className = 'item-name';
                nameElement.textContent = data.grenade.name;
                grenadeItem.appendChild(nameElement);
            } else {
                // Fallback for string data
                grenadeItem.textContent = typeof data.grenade === 'object' ? data.grenade.name : data.grenade;
            }
            
            grenadeElement.appendChild(grenadeItem);
        }
        
        // Update armor if present in data
        if (data.armor) {
            armorElement.innerHTML = '';
            const armorItem = document.createElement('div');
            armorItem.className = 'loadout-item-with-icon';
            
            // Add icon if available
            if (typeof data.armor === 'object' && data.armor.icon) {
                const iconElement = document.createElement('img');
                iconElement.src = data.armor.icon;
                iconElement.alt = data.armor.name;
                iconElement.className = 'item-icon';
                armorItem.appendChild(iconElement);
            }
            
            // Create content container
            const contentContainer = document.createElement('div');
            contentContainer.className = 'item-content';
            
            // Add name
            const nameElement = document.createElement('span');
            nameElement.className = 'item-name';
            nameElement.textContent = typeof data.armor === 'object' ? data.armor.name : data.armor;
            contentContainer.appendChild(nameElement);
            
            // Add armor class if available
            if (typeof data.armor === 'object' && data.armor.class) {
                const classElement = document.createElement('span');
                classElement.className = `armor-class armor-class-${data.armor.class.toLowerCase()}`;
                classElement.textContent = data.armor.class;
                contentContainer.appendChild(classElement);
            }
            
            armorItem.appendChild(contentContainer);
            armorElement.appendChild(armorItem);
        }
        
        // Update booster if present in data
        if (data.booster) {
            boosterElement.innerHTML = '';
            const boosterItem = document.createElement('div');
            boosterItem.className = 'loadout-item-with-icon';
            
            // Add icon if available
            if (typeof data.booster === 'object' && data.booster.icon) {
                const iconElement = document.createElement('img');
                iconElement.src = data.booster.icon;
                iconElement.alt = data.booster.name;
                iconElement.className = 'item-icon';
                boosterItem.appendChild(iconElement);
                
                // Add name
                const nameElement = document.createElement('span');
                nameElement.className = 'item-name';
                nameElement.textContent = data.booster.name;
                boosterItem.appendChild(nameElement);
            } else {
                // Fallback for string data
                boosterItem.textContent = typeof data.booster === 'object' ? data.booster.name : data.booster;
            }
            
            boosterElement.appendChild(boosterItem);
        }
        
        // Update stratagems if present in data
        if (data.stratagems) {
            // Clear existing stratagems
            stratagemsElement.innerHTML = '';
            
            // Add each stratagem to the list
            if (data.stratagems.length > 0) {
                data.stratagems.forEach((stratagem, index) => {
                    const stratagemElement = document.createElement('div');
                    stratagemElement.className = 'loadout-item stratagem-item';
                    stratagemElement.dataset.index = index;
                    
                    // Create and add the icon if available
                    if (stratagem.icon) {
                        const iconElement = document.createElement('img');
                        iconElement.src = stratagem.icon;
                        iconElement.alt = stratagem.name;
                        iconElement.className = 'stratagem-icon';
                        stratagemElement.appendChild(iconElement);
                    }
                    
                    // Create and add the name
                    const nameElement = document.createElement('span');
                    nameElement.className = 'stratagem-name';
                    nameElement.textContent = stratagem.name;
                    stratagemElement.appendChild(nameElement);
                    
                    // Add individual roll button
                    const rollButton = document.createElement('button');
                    rollButton.className = 'stratagem-roll-btn';
                    rollButton.innerHTML = '<i class="fas fa-dice-one"></i> Roll';
                    rollButton.dataset.index = index;
                    rollButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        rollSingleStratagem(index, rollButton);
                    });
                    stratagemElement.appendChild(rollButton);
                    
                    stratagemsElement.appendChild(stratagemElement);
                });
            } else {
                const noStratagemsElement = document.createElement('div');
                noStratagemsElement.className = 'loadout-item';
                noStratagemsElement.textContent = 'No stratagems found';
                stratagemsElement.appendChild(noStratagemsElement);
            }
        }
    };
    
    // Function to roll a single stratagem
    const rollSingleStratagem = async (index, button) => {
        try {
            // Add spinning state to button
            button.classList.add('spinning');
            button.disabled = true;
            
            // Get the current stratagems to avoid duplicates
            const currentStratagems = Array.from(stratagemsElement.querySelectorAll('.stratagem-item'))
                .map(item => {
                    const nameElement = item.querySelector('.stratagem-name');
                    return nameElement ? nameElement.textContent : '';
                })
                .filter(name => name !== '');
            
            // Build query string with stratagem options and current stratagems
            const queryParams = new URLSearchParams();
            queryParams.append('defense', stratagemOptions.defense);
            queryParams.append('eagles', stratagemOptions.eagles);
            queryParams.append('orbitals', stratagemOptions.orbitals);
            queryParams.append('support', stratagemOptions.support);
            queryParams.append('index', index);
            
            // Add current stratagems as excluded items to avoid duplicates
            currentStratagems.forEach(name => {
                queryParams.append('exclude', name);
            });
            
            console.log(`Rolling single stratagem at index ${index}`);
            console.log(`Excluded stratagems: ${currentStratagems.join(', ')}`);
            
            const response = await fetch(`/api/random/stratagem?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch stratagem');
            }
            
            const data = await response.json();
            
            if (data.stratagem) {
                // Find the stratagem element at the given index
                const stratagemElement = stratagemsElement.querySelector(`.stratagem-item[data-index="${index}"]`);
                
                if (stratagemElement) {
                    // Update the icon
                    const iconElement = stratagemElement.querySelector('.stratagem-icon');
                    if (iconElement && data.stratagem.icon) {
                        iconElement.src = data.stratagem.icon;
                        iconElement.alt = data.stratagem.name;
                    }
                    
                    // Update the name
                    const nameElement = stratagemElement.querySelector('.stratagem-name');
                    if (nameElement) {
                        nameElement.textContent = data.stratagem.name;
                    }
                }
            }
            
        } catch (error) {
            console.error('Error fetching single stratagem:', error);
            alert('Failed to generate stratagem. Please try again.');
        } finally {
            // Remove spinning state from button
            button.classList.remove('spinning');
            button.disabled = false;
        }
    };
    
    // Add event listeners for stratagem option changes
    document.querySelectorAll('input[name="defense"], input[name="eagles"], input[name="orbitals"], input[name="support"]').forEach(input => {
        input.addEventListener('change', (event) => {
            // Explicitly set the checked state when "Only" is selected
            if (event.target.value === 'Only') {
                event.target.checked = true;
                
                // Set all other categories to "No"
                const targetName = event.target.name;
                const categories = ['defense', 'eagles', 'orbitals', 'support'];
                
                categories.forEach(category => {
                    if (category !== targetName) {
                        const noRadio = document.querySelector(`input[name="${category}"][value="No"]`);
                        if (noRadio) {
                            noRadio.checked = true;
                        }
                    }
                });
            }
            
            // Update the options object and apply constraints
            handleStratagemOptionChange();
        });
    });
    
    // Add click event listener to the randomize all button
    randomizeAllBtn.addEventListener('click', getRandomLoadout);
    
    // Add click event listeners to individual roll buttons
    rollButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            getRandomItem(type, button);
        });
    });
    
    // Modal event listeners
    stratagemsOptionsBtn.addEventListener('click', () => {
        // Update radio buttons to match current options before showing the modal
        document.querySelector(`input[name="defense"][value="${stratagemOptions.defense}"]`).checked = true;
        document.querySelector(`input[name="eagles"][value="${stratagemOptions.eagles}"]`).checked = true;
        document.querySelector(`input[name="orbitals"][value="${stratagemOptions.orbitals}"]`).checked = true;
        document.querySelector(`input[name="support"][value="${stratagemOptions.support}"]`).checked = true;
        
        // Apply constraints to ensure UI is consistent
        applyOptionConstraints();
        
        // Show the modal
        stratagemsOptionsModal.style.display = 'block';
    });
    
    closeModalBtn.addEventListener('click', () => {
        stratagemsOptionsModal.style.display = 'none';
    });
    
    applyOptionsBtn.addEventListener('click', () => {
        // Apply options (they're already updated via the change event listeners)
        console.log("Applied stratagem options:", stratagemOptions);
        
        // Close modal
        stratagemsOptionsModal.style.display = 'none';
        
        // Refresh stratagems with new options
        getRandomItem('stratagems', document.querySelector('.roll-btn[data-type="stratagems"]'));
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === stratagemsOptionsModal) {
            stratagemsOptionsModal.style.display = 'none';
        }
    });
    
    // Add CSS for disabled options
    const style = document.createElement('style');
    style.textContent = `
        .disabled-option {
            opacity: 0.6;
        }
        .disabled-option h3::after {
            content: " (Disabled)";
            font-size: 0.8em;
            font-style: italic;
            color: #888;
        }
    `;
    document.head.appendChild(style);
}); 