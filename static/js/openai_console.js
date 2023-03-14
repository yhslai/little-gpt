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
                gotFromAPI(data, activeTab, processResponse);
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

                if (!deleteButton) continue;

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

    SetupExpandButton();
    SetupConversationList();
    SetupConversationActions();
}

function gotFromAPI(data, activeTab, notErrorCallback) {
    try {
        let jsonData = JSON.parse(data);
        notErrorCallback(jsonData, activeTab);
    }
    catch (e) {
        // Catch JSON parse error only
        if (e instanceof SyntaxError) {
            // If the error is not a JSON object, it's a network error
            // remove <head> tag from data because it's a literal html
            data = data.replace(/<head>[\s\S]*<\/head>/, "");
            // combine consecutive <pre> tags into one
            processResponse({ 'errors': [data] }, activeTab);
        }
        else {
            throw e;
        }
    }
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

function SetupExpandButton() {
    let expandBtns = document.getElementsByClassName("expand-btn");
    for (let i = 0; i < expandBtns.length; i++) {
        let expandBtn = expandBtns[i];
        expandBtn.addEventListener("click", function (e) {
            e.preventDefault();
            // Find the cloest parent that is a .right-float-panel
            const panel = expandBtn.closest(".right-float-panel");
            panel.classList.toggle('collapsed');
        });
    }
}

function SetupConversationList() {
    let conversationList = document.getElementsByClassName("conversations")[0];
    conversationList.addEventListener("click", function (e) {
        e.preventDefault();

        let target = e.target;

        let clickedItem = target.closest(".conversation-item");
        if (target.classList.contains("conversation-delete-btn")) {
            let id = clickedItem.dataset.id;
            let activeTab = activeTabContainer();

            fetch(`/conversations/${id}`, {
                method: "DELETE"
            }).then(response => {
                return response.text();
            }).then(data => {
                gotFromAPI(data, activeTab, jsonData =>
                { });
                clickedItem.remove();
            }).catch(error => {
                console.error(error);
            });
        }
        else if (clickedItem) {
            let id = clickedItem.dataset.id;
            
            let activeTab = activeTabContainer();

            fetch(`/conversations/${id}`, {
                method: "GET"
            }).then(response => {
                return response.text();
            }).then(data => {
                gotFromAPI(data, activeTab, LoadConversation);
            }).catch(error => {
                console.error(error);
            });
        }
    });
}

function LoadConversation(data, activeTab) {
    let conversation = data.conversation;
    let messages = data.messages;
    allowUpdateSaveButton(conversation.id, activeTab);

    let messagesDiv = activeTab.getElementsByClassName("messages")[0];
    // clear all div children
    for (let i = messagesDiv.children.length - 1; i >= 0; i--) {
        let child = messagesDiv.children[i];
        if (child.classList.contains("delete-message")) continue;
        child.remove();
    }
    let lastDIv;
    let lastRole = "";
    for (let i = 0; i < messages.length; i++) {
        let message = messages[i];
        let messageDiv = createMessageDiv(message.role, message.content);
        messagesDiv.appendChild(messageDiv);
        lastDIv = messageDiv;
        lastRole = message.role;
    }
    if (lastRole != "user") {
        let messageDiv = createMessageDiv("user", "");
        messagesDiv.appendChild(messageDiv);
        lastDIv = messageDiv;
    }
    lastDIv.focus();
}

function allowUpdateSaveButton(conversationId, activeTab) {
    let form = activeTab.getElementsByClassName("main-form")[0];
    form.dataset.conversationId = conversationId;
    let saveBtn = activeTab.getElementsByClassName("save-btn")[0];
    saveBtn.hidden = false;
}

function SetupConversationActions() {
    let conversationActionDiv = document.getElementsByClassName("current-conversation-actions")[0];
    conversationActionDiv.addEventListener("click", function (e) {
        e.preventDefault();
        let target = e.target;
        if (target.classList.contains("save-as-new-btn")) {
            let title = '';
            let brief = ''; // Backend will call ChatGPT to generate title and brief for us
            let form = target.closest("form");
            let actionUrl = '/conversations'
            let data = new FormData(form);
            populateMesssagesData(data, form);
            data.append("title", title);
            data.append("brief", brief);


            let activeTab = activeTabContainer();

            fetch(actionUrl, {
                method: "POST",
                body: data
            }).then(response => {
                target.innerHTML = "Save as New";
                target.disabled = false;
                return response.text();
            }).then(data => {
                gotFromAPI(data, activeTab, jsonData => {
                    console.log("Saved: ")
                    console.log(jsonData);
                    AddToRightFloatPanel(jsonData);
                    allowUpdateSaveButton(jsonData.conversation.id, activeTab);
                });
            }).catch(error => {
                console.error(error);
            });

            target.disabled = true;
            target.innerHTML = "Saving...";
        }
        else if (target.classList.contains('save-btn')) {
            let title = '';
            let brief = ''; // Backend will call ChatGPT to generate title and brief for us

            let form = target.closest("form");
            let actionUrl = `/conversations/${form.dataset.conversationId}`
            let data = new FormData(form);
            populateMesssagesData(data, form);
            data.append("title", title);
            data.append("brief", brief);

            let activeTab = activeTabContainer();

            fetch(actionUrl, {
                method: "PUT",
                body: data
            }).then(response => {
                target.innerHTML = "Save";
                target.disabled = false;
                return response.text();
            }).then(data => {
                gotFromAPI(data, activeTab, jsonData => {
                    console.log("Saved (updated): ")
                    console.log(jsonData);
                    AddToRightFloatPanel(jsonData);
                });
            }).catch(error => {
                console.error(error);
            });
            
            target.disabled = true;
            target.innerHTML = "Saving...";
        }
    });
}

function AddToRightFloatPanel(jsonData) {
    let conversation = jsonData.conversation;
    let conversationId = conversation.id;
    let conversationTitle = conversation.title;
    let conversationBrief = conversation.brief;
    let addToRightFloatPanel = document.getElementsByClassName("right-float-panel")[0];
    let conversationsUl = addToRightFloatPanel.getElementsByClassName("conversations")[0];
    let conversationLi = document.createElement("li");
    conversationLi.classList.add("conversation-item");
    conversationLi.dataset.id = conversationId;
    let titleDiv = document.createElement("div");
    titleDiv.classList.add("conversation-title");
    titleDiv.innerHTML = conversationTitle;
    let briefDiv = document.createElement("div");
    briefDiv.classList.add("conversation-brief");
    briefDiv.innerHTML = conversationBrief;
    conversationLi.appendChild(titleDiv);
    conversationLi.appendChild(briefDiv);
    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("conversation-delete-btn");
    deleteBtn.innerHTML = "X";
    conversationLi.appendChild(deleteBtn);

    // If already exists, remove it
    let existingConversation = conversationsUl.querySelector(`[data-id="${conversationId}"]`);
    if (existingConversation) {
        conversationsUl.removeChild(existingConversation);
    }
    conversationsUl.prepend(conversationLi);
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
        let messagesDiv = activeTab.getElementsByClassName("messages")[0];
        let messageDiv = createMessageDiv(role, content);
        messagesDiv.appendChild(messageDiv);
        let userMessageDiv = createLastUserMessageDiv();
        messagesDiv.appendChild(userMessageDiv);
        // Put the cursor in the userMessageDiv
        userMessageDiv.focus();
    }
}

function createMessageDiv(role, content) {
    let div = document.createElement("div");
    div.classList.add("message");
    div.dataset.role = role;
    div.innerHTML = content.replace(/\n/g, "<br>");
    div.contentEditable = true;
    return div;
}

function createLastUserMessageDiv() {
    let div = document.createElement("div");
    div.classList.add("message");
    div.dataset.role = "user";
    div.dataset.placeholder = "Next message..."
    div.contentEditable = true;
    return div;
}

document.addEventListener("DOMContentLoaded", main);
