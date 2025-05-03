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
        const enhancement = document.querySelector('input[name="enhancement"]:checked');
        if (enhancement && enhancement.value === 'equivocal') {
            document.getElementById('ancillaryFeaturesSection').classList.remove('hidden');
        } else {
            document.getElementById('ancillaryFeaturesSection').classList.add('hidden');
        }
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

// Get references to new elements
const modalitySelect = document.getElementById('latestTherapyModality');
const lrtDateInput = document.getElementById('latestLrtDate');
const timeSinceLrtSpan = document.getElementById('timeSinceLrt');
const formElementsToDisable = document.querySelectorAll('#liRadsForm fieldset:not(:nth-of-type(2)) input, #liRadsForm fieldset:not(:nth-of-type(2)) select, #liRadsForm fieldset:not(:nth-of-type(2)) textarea, #liRadsForm .button-group button');
const allFormElements = document.querySelectorAll('#liRadsForm input, #liRadsForm select, #liRadsForm textarea, #liRadsForm button'); // All elements for re-enabling

// --- Modality Change Listener ---
modalitySelect.addEventListener('change', function() {
    if (this.value === 'systemic') {
        alert('This app is applicable only for non-radiation based LRT.');
        formElementsToDisable.forEach(el => el.disabled = true);
        document.getElementById('category').textContent = 'N/A (Systemic Therapy Selected)';
        document.getElementById('result').classList.remove('hidden'); // Ensure result area is visible
        document.getElementById('reportPreview').classList.add('hidden'); // Hide preview
    } else {
        // Re-enable all elements first, then let other logic handle specific disabling
        allFormElements.forEach(el => el.disabled = false);
        // Re-apply initial disabling logic if needed (e.g., measurements, ancillary)
        handleEnhancementChange(); // Call existing handler to set correct state
        handleImageQualityChange(); // Call existing handler
        // Clear the specific message if previously set
        if (document.getElementById('category').textContent.includes('(Systemic Therapy Selected)')) {
             document.getElementById('category').textContent = 'N/A';
        }
    }
});

// --- Date Change Listener ---
lrtDateInput.addEventListener('change', function() {
    if (this.value) {
        const lrtDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for consistent comparison

        if (lrtDate > today) {
            timeSinceLrtSpan.textContent = 'Date cannot be in the future.';
            return;
        }

        const diffTime = Math.abs(today - lrtDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Approximate years, months, days
        const years = Math.floor(diffDays / 365.25);
        const remainingDaysAfterYears = diffDays % 365.25;
        const months = Math.floor(remainingDaysAfterYears / 30.44); // Average month length
        const days = Math.floor(remainingDaysAfterYears % 30.44);

        let timeString = '';
        if (years > 0) timeString += `${years} year${years > 1 ? 's' : ''}, `;
        if (months > 0) timeString += `${months} month${months > 1 ? 's' : ''}, `;
        timeString += `${days} day${days !== 1 ? 's' : ''}`;
        
        // Handle edge case where diffDays is 0
        if (diffDays === 0) {
             timeString = "0 days";
        }


        timeSinceLrtSpan.textContent = timeString;
    } else {
        timeSinceLrtSpan.textContent = 'N/A';
    }
});


// Helper function to re-apply enhancement visibility logic
function handleEnhancementChange() {
    const enhancementChecked = document.querySelector('input[name="enhancement"]:checked');
    if (!enhancementChecked) return; // Exit if nothing is checked

    const ancillarySection = document.getElementById('ancillaryFeaturesSection');
    const measurementsSection = document.getElementById('measurements');
    const imageQualityChecked = document.querySelector('input[name="imageQuality"]:checked');

    // Check if imageQuality is checked and adequate before showing ancillary
    const showAncillary = enhancementChecked.value === 'equivocal' && imageQualityChecked && imageQualityChecked.value === 'adequate';
    ancillarySection.classList.toggle('hidden', !showAncillary);

    measurementsSection.classList.toggle('hidden', enhancementChecked.value !== 'viable');
}

// Helper function to re-apply image quality visibility logic
function handleImageQualityChange() {
     const imageQualityChecked = document.querySelector('input[name="imageQuality"]:checked');
     if (!imageQualityChecked) return;

     const ancillarySection = document.getElementById('ancillaryFeaturesSection');
     if (imageQualityChecked.value === 'adequate') {
         const enhancementChecked = document.querySelector('input[name="enhancement"]:checked');
         // Only show ancillary if enhancement is equivocal
         ancillarySection.classList.toggle('hidden', !(enhancementChecked && enhancementChecked.value === 'equivocal'));
     } else {
         ancillarySection.classList.add('hidden'); // Hide if not adequate
         // Also hide measurements if image quality becomes non-evaluable
         document.getElementById('measurements').classList.add('hidden');
         // Reset enhancement selection if image quality is non-evaluable? Optional, depends on desired UX.
     }
}


// Add event listener to imageQuality radios to control ancillary features visibility
document.querySelectorAll('input[name="imageQuality"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const ancillarySection = document.getElementById('ancillaryFeaturesSection');
        if (this.value === 'adequate') {
            const enhancement = document.querySelector('input[name="enhancement"]:checked');
            if (enhancement && enhancement.value === 'equivocal') {
                ancillarySection.classList.remove('hidden');
            }
        } else {
            ancillarySection.classList.add('hidden');
        }
    });
});

// Update event listener for imageQuality to use the helper function
document.querySelectorAll('input[name="imageQuality"]').forEach(radio => {
    radio.addEventListener('change', handleImageQualityChange);
});


// Update event listener for enhancement radios to use the helper function
document.querySelectorAll('input[name="enhancement"]').forEach(radio => {
    radio.addEventListener('change', handleEnhancementChange);
});


// --- Function to gather report data ---
function getReportData() {
    const categoryText = document.getElementById('category').textContent;
    const liverLocation = document.getElementById('liverLocation').value.trim();
    const imageQualityRadio = document.querySelector('input[name="imageQuality"]:checked');
    const enhancementRadio = document.querySelector('input[name="enhancement"]:checked');
    const diffusion = document.querySelector('input[name="diffusionRestriction"]').checked;
    const t2Hyper = document.querySelector('input[name="t2Hyperintensity"]').checked;
    const modalitySelect = document.getElementById('latestTherapyModality');
    const lrtDate = document.getElementById('latestLrtDate').value;
    const timeSince = document.getElementById('timeSinceLrt').textContent;

    const modalityText = modalitySelect.options[modalitySelect.selectedIndex]?.text || 'Not Selected';
    const imageQuality = imageQualityRadio ? (imageQualityRadio.value === 'nonEvaluable' ? 'Non-evaluable' : 'Adequate') : 'Not Selected';
    
    let enhancementText = 'Not Selected';
    if (enhancementRadio) {
        if (enhancementRadio.value === 'nonViable') {
            enhancementText = 'No mass-like enhancement (Non-viable)';
        } else if (enhancementRadio.value === 'equivocal') {
            enhancementText = 'Mass-like enhancement uncertain (Equivocal)';
        } else if (enhancementRadio.value === 'viable') {
            const pre = document.querySelector('input[name="preTreatment"]').value || 'N/A';
            const post = document.querySelector('input[name="postTreatment"]').value || 'N/A';
            enhancementText = `Mass-like enhancement present (Viable - Pre: ${pre}mm, Post: ${post}mm)`;
        }
    }

    let reportContent = `LI-RADS Treatment Response Categorization Report\n\n`;
    reportContent += `Image Quality: ${imageQuality}\n`;
    if (liverLocation) {
        reportContent += `Location of observation: ${liverLocation}\n`;
    }
    reportContent += `Latest Therapy Modality: ${modalityText}\n`;
    if (lrtDate) {
        reportContent += `Date of Latest LRT: ${lrtDate}\n`;
        reportContent += `Time Since Latest LRT: ${timeSince}\n`;
    }
    reportContent += `Mass-like Enhancement: ${enhancementText}\n`;
    
    // Only include ancillary features if enhancement was equivocal and image quality adequate
    if (enhancementRadio && enhancementRadio.value === 'equivocal' && imageQualityRadio && imageQualityRadio.value === 'adequate') {
        reportContent += `Ancillary Features:\n`;
        reportContent += `  • Diffusion restriction: ${diffusion ? 'Present' : 'Absent'}\n`;
        reportContent += `  • T2-hyperintensity: ${t2Hyper ? 'Present' : 'Absent'}\n`;
    }
    
    reportContent += `\nCategory: ${categoryText}`;

    return { reportContent, categoryText }; // Return object for flexibility
}


// Add event listener for report preview
document.getElementById('previewReport').addEventListener('click', function() {
    // Check if systemic therapy is selected
    if (modalitySelect.value === 'systemic') {
        alert('Cannot generate report when Systemic Therapy is selected.');
        return;
    }
    // Check if essential fields are filled
     const imageQualityRadio = document.querySelector('input[name="imageQuality"]:checked');
     const enhancementRadio = document.querySelector('input[name="enhancement"]:checked');
     if (!imageQualityRadio || !enhancementRadio) {
         alert('Please fill in Image Quality and Mass-like Enhancement fields before previewing.');
         return;
     }


    const { reportContent } = getReportData(); // Use the helper function

    const previewSection = document.getElementById('reportPreview');
    const contentDiv = document.getElementById('reportContent');
    contentDiv.textContent = reportContent; // Use textContent for plain text display
    previewSection.classList.remove('hidden'); // Explicitly remove hidden class
});

// Add event listener for export to Word
document.getElementById('exportReport').addEventListener('click', function() {
     // Check if systemic therapy is selected
    if (modalitySelect.value === 'systemic') {
        alert('Cannot generate report when Systemic Therapy is selected.');
        return;
    }
     // Check if essential fields are filled
     const imageQualityRadio = document.querySelector('input[name="imageQuality"]:checked');
     const enhancementRadio = document.querySelector('input[name="enhancement"]:checked');
     if (!imageQualityRadio || !enhancementRadio) {
         alert('Please fill in Image Quality and Mass-like Enhancement fields before exporting.');
         return;
     }

    const { reportContent } = getReportData(); // Use the helper function

    // Export as a plain text (.txt) file instead of .docx
    try {
        // Create a Blob from the plain text report content
        const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
        // Use FileSaver.js (already included) to save the blob as a .txt file
        saveAs(blob, "LIRADS_Report.txt");
    } catch (error) {
        console.error("Error generating text file:", error);
        alert("Error generating report file.");
    }
});
