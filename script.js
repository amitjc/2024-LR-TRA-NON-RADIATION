document.getElementById('liRadsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get image quality selection
    const imageQuality = document.querySelector('input[name="imageQuality"]:checked');
    if (!imageQuality) return; // Ensure a selection is made
    
    // Handle non-evaluable case first
    if (imageQuality.value === 'nonEvaluable') {
        document.getElementById('category').textContent = 'LR-TR Non-evaluable';
        document.getElementById('measurements').classList.add('hidden');
        document.getElementById('ancillaryFeaturesSection').classList.add('hidden');
        return;
    } else {
        document.getElementById('ancillaryFeaturesSection').classList.remove('hidden');
    }
    
    // Get enhancement selection
    const enhancement = document.querySelector('input[name="enhancement"]:checked');
    if (!enhancement) return; // Ensure a selection is made
    
    let category = '';
    let showMeasurements = false;
    
    // Handle enhancement-based categorization
    if (enhancement.value === 'nonViable') {
        category = 'LR-TR Non-viable';
    } else if (enhancement.value === 'equivocal') {
        // Check ancillary features for potential upgrade
        const diffusion = document.querySelector('input[name="diffusionRestriction"]').checked;
        const t2Hyper = document.querySelector('input[name="t2Hyperintensity"]').checked;
        
        if (diffusion || t2Hyper) {
            category = 'LR-TR Viable';
        } else {
            category = 'LR-TR Equivocal';
        }
    } else if (enhancement.value === 'viable') {
        category = 'LR-TR Viable';
        showMeasurements = true;
    }
    
    // Update UI based on results
    const categoryElement = document.getElementById('category');
    const liverLocation = document.getElementById('liverLocation').value.trim();
    
    if (showMeasurements) {
        const pre = document.querySelector('input[name="preTreatment"]').value;
        const post = document.querySelector('input[name="postTreatment"]').value;
        let displayText = `${category} (Pre: ${pre}mm, Post: ${post}mm)`;
        if (liverLocation) {
            displayText += ` - Location: ${liverLocation}`;
        }
        categoryElement.textContent = displayText;
    } else {
        let displayText = category;
        if (liverLocation) {
            displayText += ` - Location: ${liverLocation}`;
        }
        categoryElement.textContent = displayText;
    }
    document.getElementById('measurements').classList.toggle('hidden', !showMeasurements);
});
