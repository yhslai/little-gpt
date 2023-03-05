// Detect if the user press Ctrl + Enter
document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key == "Enter") {
        e.preventDefault();
        // Find the submit button of the current active field
        let activeTab = activeTabContainer();
        let submitButton = activeTab.querySelector(".main-form .submit");
        submitButton.click();

        document.activeElement.blur()
    }

    // If the user press a number key
    let number = parseInt(e.key);
    if (!isNaN(number) && number > 0 && number < 10) {
        // Check if the user has a focus on a input field or editable div
        let activeElement = document.activeElement;
        if (activeElement.tagName == "INPUT" || activeElement.tagName == "TEXTAREA" || activeElement.isContentEditable) {
            return;
        }
        e.preventDefault();
        // Check if there is a `response-chat-add` button in the active tab
        // If there is, click it
        let index = number - 1;
        let activeTab = activeTabContainer();

        let responseChatAddButton = activeTab.querySelector(".response-chat-add[data-index='" + index + "']");
        if (responseChatAddButton) {
            responseChatAddButton.click();
        }
    }
});