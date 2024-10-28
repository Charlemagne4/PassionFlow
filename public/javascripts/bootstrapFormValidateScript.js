// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'

    function toggleCheckbox(index) {
        const checkbox = document.getElementById(`checkbox-${index}`);
        checkbox.checked = !checkbox.checked;  // Toggle the checkbox state
    }

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.myForm')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()