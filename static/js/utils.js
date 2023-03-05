// Keep all form values in localStorage and restore them on page load.
function startStoringFields() {
    let forms = document.getElementsByClassName("main-form");
    for (let form of forms) {
        let fields = form.querySelectorAll("input, textarea, select");
        for (let field of fields) {
            let key = form.id + "/" + field.name;
            field.addEventListener("input", function () {
                localStorage.setItem(key, field.value);
            });
        }
    }
}

function restoreFields() {
    let forms = document.getElementsByClassName("main-form");
    for (let form of forms) {
        let fields = form.querySelectorAll("input, textarea, select");
        for (let field of fields) {
            if(field.type == 'submit') continue; // Skip submit buttons (they don't have a value
            let key = form.id + "/" + field.name;
            field.value = localStorage.getItem(key);
        }
    }
}