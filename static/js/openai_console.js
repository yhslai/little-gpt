function main() {
    restoreFields();
    startStoringFields();

    restoreTab();

    startForcingPlainTextCopy();

    let sliders = ['max_tokens', 'temperature', 'n',
                    'top_p', 'frequency_penalty', 'presence_penalty'];

    for (let i = 0; i < sliders.length; i++) {
        let slider = sliders[i];
        // Find all input with name=slider
        let sliderInputs = document.getElementsByName(slider);
        for (let j = 0; j < sliderInputs.length; j++) {
            let sliderInput = sliderInputs[j];
            // Find a sibling with data-slider=slider
            let sliderDisplay = sliderInput.parentElement.querySelector(`[data-slider="${slider}"]`);

            sliderDisplay.innerHTML = sliderInput.value;
            sliderInput.addEventListener("input", function () {
                sliderDisplay.innerHTML = sliderInput.value;
            });
        }
    }

    let submitButtons = document.getElementsByClassName("submit");

    for (let i = 0; i < submitButtons.length; i++) {
        let submitButton = submitButtons[i];

        submitButton.addEventListener("click", function (e) {
            e.preventDefault();

            // Find the cloest parent that is a form
            let form = submitButton.closest("form");
            let actionUrl = form.getAttribute("action");
            let data = new FormData(form);
            populateMesssagesData(data, form);

            let activeTab = activeTabContainer();

            fetch(actionUrl, {
                method: "POST",
                body: data
            }).then(response => {
                uiGotResponse(activeTab);
                return response.text();
            }).then(data => {
                try {
                    let jsonData = JSON.parse(data);
                    processResponse(jsonData, activeTab);
                }
                catch (e) {
                    // If the error is not a JSON object, it's a network error
                    processResponse({ 'errors': [data] }, activeTab);
                }
            }).catch(error => {
                console.error(error);
            });

            uiWaitForResponse(activeTab);
        });
    }

    let messagesDiv = document.getElementsByClassName("messages")[0];
    // On hover
    messagesDiv.addEventListener("mouseover", function (e) {
        let messageDivs = messagesDiv.getElementsByClassName("message");
        for (let i = 0; i < messageDivs.length; i++) {
            messageDivs[i].classList.remove("hover");
            let target = e.target;
            
            if (messageDivs[i] == target) {
                if (target.dataset.role == "system") return;
                if (target.dataset.role == "user" && i == messageDivs.length - 1
                    && messageDivs[i-1].dataset.role != "user") return;
                target.classList.add("hover");
                let deleteButton = messagesDiv.getElementsByClassName("delete-message")[0];
                deleteButton.classList.remove("hidden");
                // move deleteButton's position to the right of target
                let targetRect = target.getBoundingClientRect();
                let parentRect = messagesDiv.getBoundingClientRect();
                deleteButton.style.position = "absolute";
                deleteButton.style.left = (targetRect.left - parentRect.left + targetRect.width + 8) + "px";
                deleteButton.style.top = (targetRect.top - parentRect.top + 4) + "px";

                

                // Remove all click event listeners from deleteButton
                let clone = deleteButton.cloneNode(true);
                deleteButton.replaceWith(clone);
                deleteButton = clone;
                // Add a new click event listener to deleteButton
                deleteButton.addEventListener("click", function (e) {
                    e.preventDefault();
                    // append deleteButton to the messageDiv above target
                    messagesDiv.appendChild(deleteButton);
                    deleteButton.classList.add("hidden");
                    target.remove();
                });
            }
        }
    });

}

function startForcingPlainTextCopy() {
    document.addEventListener('copy', function(e) {
        const text_only = document.getSelection().toString().replace(/\n/g, '<br/>');
        const clipdata = e.clipboardData || window.clipboardData;  
        clipdata.setData('text/plain', text_only);
        clipdata.setData('text/html', text_only);
        e.preventDefault();
      });
}

function populateMesssagesData(data, form) {
    let messageDivs = form.getElementsByClassName("message");
    let messages = [];

    for (let i = 0; i < messageDivs.length; i++) {
        let messageDiv = messageDivs[i];
        let messageRole = messageDiv.dataset.role;
        let messageContent = messageDiv.innerHTML;

        if (messageContent.trim() == "") continue;
        
        messages.push({
            "role": messageRole,
            "content": messageContent,
        });
    }

    if (messages.length == 0) return;

    data.append("messages", JSON.stringify(messages));
}


function uiWaitForResponse(activeTab) {
    let submitButton = activeTab.querySelector(".main-form .submit");
    submitButton.disabled = true;
    submitButton.innerHTML = "Waiting...";

    let rightCol = activeTab.getElementsByClassName("right-column")[0];
    // Put a grey overlay on the right column
    let overlay = document.createElement("div");
    overlay.classList.add("waiting-overlay");
    rightCol.appendChild(overlay);
}

function uiGotResponse(activeTab) {
    let submitButton = activeTab.querySelector(".main-form .submit");
    submitButton.disabled = false;
    submitButton.innerHTML = "Submit";

    let rightCol = activeTab.getElementsByClassName("right-column")[0];
    let overlay = rightCol.getElementsByClassName("waiting-overlay")[0];
    rightCol.removeChild(overlay);
}


function openTab(e, tabName) {
    e.preventDefault();

    let tabContainers = document.getElementsByClassName("tab-container");
    for (let i = 0; i < tabContainers.length; i++) {
        tabContainers[i].classList.remove("active");
    }

    let tabLinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }

    // Find the div with data-tab = tabName
    let tabDiv = document.querySelector(`div[data-tab="${tabName}"]`);
    tabDiv.classList.add("active");

    // Set the event button to active
    e.target.classList.add("active");

    localStorage.setItem("activeTab", tabName);
}

function restoreTab() {
    let activeTab = localStorage.getItem("activeTab");
    if (activeTab) {
        let tabLink = document.querySelector(`.tablink[data-tab="${activeTab}"]`);
        tabLink.click();
    }
}

function activeTabContainer() {
    let tabContainers = document.getElementsByClassName("tab-container");
    for (let i = 0; i < tabContainers.length; i++) {
        if (tabContainers[i].classList.contains("active")) {
            return tabContainers[i];
        }
    }
}


function processResponse(data, activeTab) {
    let responsesDiv = activeTab.getElementsByClassName("response-body-choices")[0];
    let responseMetaDataDiv = activeTab.getElementsByClassName("response-metadata")[0];
    let errorsDiv = activeTab.getElementsByClassName("errors")[0];

    // Check if data["errors"] is empty
    if (data["errors"].length > 0) {
        let errors = data["errors"];
        errorsDiv.innerHTML = "";
        for (let i = 0; i < errors.length; i++) {
            let error = errors[i];
            let div = document.createElement("div");
            div.classList.add("error");
            div.innerHTML = error;
            errorsDiv.appendChild(div);
        }
        errorsDiv.classList.add("active");
    }
    else {
        let result = data["result"];
        let choices = result["choices"];

        errorsDiv.classList.remove("active");

        // For each choice, create a div with the text under responsesDiv
        responsesDiv.innerHTML = "";
        for (let i = 0; i < choices.length; i++) {
            let choiceDiv = document.createElement("div");
            choiceDiv.classList.add("response-choice");

            let choice = choices[i];
            // if choice has 'message' key, take choice["message"]["content"]
            // else take choice["text"]
            let text = choice["text"];
            let isMessage = false;
            if (choice["message"]) {
                isMessage = true;
                text = choice["message"]["content"];
            }
            
            let div = document.createElement("div");
            div.classList.add("response-text");
            div.innerHTML = text.replace(/\n/g, "<br>");
            choiceDiv.appendChild(div);

            let footer = document.createElement("div");
            footer.classList.add("response-footer");
            choiceDiv.appendChild(footer);

            let finishReasonDiv = document.createElement("div");
            finishReasonDiv.classList.add("response-finish-reason");
            finishReasonDiv.innerHTML = "Finish Reason: " + choice["finish_reason"];
            footer.appendChild(finishReasonDiv);

            if (isMessage) {
                let messageAddButton = document.createElement("button");
                messageAddButton.classList.add("response-chat-add");
                messageAddButton.innerHTML = "<<- " + "(" + (i+1) + ")";
                messageAddButton.dataset.index = i;
                // Prepend it to footer
                footer.prepend(messageAddButton);

                messageAddButton.addEventListener("click", function (e) {
                    e.preventDefault();
                    addMessageToChat(choice["message"], activeTab);
                });
            }


            responsesDiv.appendChild(choiceDiv);
        }

        let metadata = {};
        metadata["model"] = result["model"];
        metadata["object"] = result["object"];
        metadata["created"] = result["created"];
        metadata["used_tokens"] = result["usage"]["total_tokens"];

        // Make a table with the metadata under responseMetaDataDiv
        responseMetaDataDiv.innerHTML = "";
        let table = document.createElement("table");
        table.classList.add("response-metadata-table");
        for (let key in metadata) {
            let value = metadata[key];
            let row = document.createElement("tr");
            let keyCell = document.createElement("td");
            keyCell.innerHTML = key;
            let valueCell = document.createElement("td");
            valueCell.innerHTML = value;
            row.appendChild(keyCell);
            row.appendChild(valueCell);
            table.appendChild(row);
        }
        responseMetaDataDiv.appendChild(table);
    }

}

function addMessageToChat(message, activeTab) {
    let role = message["role"];
    let content = message["content"];

    // Get the last one messsage div with data-role = user
    let userMessageDivs = activeTab.querySelectorAll(".messages .message[data-role='user']");
    let lastUserMessageDiv = userMessageDivs[userMessageDivs.length - 1];
    // if it's empty
    if (lastUserMessageDiv.innerHTML == "") {
        // replace the last assisstant message with the new message
        let assistantMessageDivs = activeTab.querySelectorAll(".messages .message[data-role='assistant']");
        let lastAssistantMessageDiv = assistantMessageDivs[assistantMessageDivs.length - 1];
        lastAssistantMessageDiv.innerHTML = content;
    }
    else {
        let messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.dataset.role = role;
        messageDiv.innerHTML = content.replace(/\n/g, "<br>");
        messageDiv.contentEditable = true;
        let messagesDiv = activeTab.getElementsByClassName("messages")[0];
        messagesDiv.appendChild(messageDiv);
        let userMessageDiv = document.createElement("div");
        userMessageDiv.classList.add("message");
        userMessageDiv.dataset.role = "user";
        userMessageDiv.dataset.placeholder = "Next message..."
        userMessageDiv.contentEditable = true;
        messagesDiv.appendChild(userMessageDiv);
        // Put the cursor in the userMessageDiv
        userMessageDiv.focus();
    }
}

document.addEventListener("DOMContentLoaded", main);
