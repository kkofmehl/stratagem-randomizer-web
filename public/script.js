document.addEventListener('DOMContentLoaded', () => {
    const randomizeAllBtn = document.getElementById('randomize-all-btn');
    const rollButtons = document.querySelectorAll('.roll-btn');
    const primaryElement = document.getElementById('primary');
    const secondaryElement = document.getElementById('secondary');
    const grenadeElement = document.getElementById('grenade');
    const armorElement = document.getElementById('armor');
    const boosterElement = document.getElementById('booster');
    const stratagemsElement = document.getElementById('stratagems');
    
    // Function to get a complete random loadout from the API
    const getRandomLoadout = async () => {
        try {
            // Add spinning state to button
            randomizeAllBtn.classList.add('spinning');
            randomizeAllBtn.disabled = true;
            
            const response = await fetch('/api/random-loadout');
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
            
            const response = await fetch(`/api/random/${type}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch random ${type}`);
            }
            
            const data = await response.json();
            
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
            primaryElement.textContent = data.primary;
        }
        
        // Update secondary weapon if present in data
        if (data.secondary) {
            secondaryElement.textContent = data.secondary;
        }
        
        // Update grenade if present in data
        if (data.grenade) {
            grenadeElement.textContent = data.grenade;
        }
        
        // Update armor if present in data
        if (data.armor) {
            armorElement.textContent = data.armor;
        }
        
        // Update booster if present in data
        if (data.booster) {
            boosterElement.textContent = data.booster;
        }
        
        // Update stratagems if present in data
        if (data.stratagems) {
            // Clear existing stratagems
            stratagemsElement.innerHTML = '';
            
            // Add each stratagem to the list
            if (data.stratagems.length > 0) {
                data.stratagems.forEach(stratagem => {
                    const stratagemElement = document.createElement('div');
                    stratagemElement.className = 'loadout-item';
                    stratagemElement.textContent = stratagem;
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
    
    // Add click event listener to the randomize all button
    randomizeAllBtn.addEventListener('click', getRandomLoadout);
    
    // Add click event listeners to individual roll buttons
    rollButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            getRandomItem(type, button);
        });
    });
}); 