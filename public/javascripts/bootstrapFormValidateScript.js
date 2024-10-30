(() => {
    'use strict';

    // Toggle checkbox state by index
    function toggleCheckbox(index) {
        const checkbox = document.getElementById(`checkbox-${index}`);
        if (checkbox) {
            checkbox.checked = !checkbox.checked;  // Toggle the checkbox state
        }
    }

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.myForm');

    // Loop over each form to apply validation
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            // Get all input fields within the form
            const inputs = form.querySelectorAll('input, textarea');

            let isValid = true;

            inputs.forEach(input => {
                const trimmedValue = input.value.trim();

                // Check if input is empty after trimming whitespace
                if (trimmedValue === '') {
                    input.setCustomValidity('This field cannot be empty or whitespace only');
                    isValid = false;
                } else {
                    input.setCustomValidity(''); // Clear any custom validity messages
                }
            });

            // Prevent form submission if any input is invalid
            if (!isValid || !form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);
    });
})();
