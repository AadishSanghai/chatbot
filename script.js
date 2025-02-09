// Select DOM elements
const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

// API Setup
const API_Key = "AIzaSyCFtiuEKxU3tvX8V6bBPIMBSnR_MBxUfhE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_Key}`;
let userMessage = "";

// Initialize chat history
const chatHistory = [];

// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Corrected scroll function (previously misspelled)
const scrollToBottom = () => {
    chatsContainer.scrollTo({ top: chatsContainer.scrollHeight, behavior: "smooth" });
};

// Typing effect function
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex];
            wordIndex++; // Increment wordIndex to continue typing
            botMsgDiv.classList.remove("loading");
            scrollToBottom(); // Ensure scroll happens as the bot types
        } else {
            clearInterval(typingInterval);
        }
    }, 40); // Adjust typing speed if needed
};

// Function to generate the bot's response
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");

    // Add the user message to the chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        // Send the chat history to the API to get a response
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error.message);
        }

        // Extract the response text and apply the typing effect
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        typingEffect(responseText, textElement, botMsgDiv);

        // Add the bot's response to the chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: responseText }]
        });

    } catch (error) {
        console.error(error);
    }
};

// Handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;

    // Clear the prompt input
    promptInput.value = "";

    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    // Generate user message HTML and add it to the container
    const userMsgHTML = `<p class="message-text">${userMessage}</p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    chatsContainer.appendChild(userMsgDiv);

    // Automatically scroll to the latest message
    chatsContainer.scrollTop = chatsContainer.scrollHeight;
    scrollToBottom();

    // Generate bot message HTML and add it to the chats container after a short delay
    setTimeout(() => {
        const botMsgHTML = `<img src="gemini.svg" alt="gemini" class="avatar"> <p class="message-text">Just a moment....</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);

        // Scroll to the latest message
        chatsContainer.scrollTop = chatsContainer.scrollHeight;
        scrollToBottom();

        // Generate the bot's response
        generateResponse(botMsgDiv);
    }, 600);
};

// Attach event listener to the form
promptForm.addEventListener("submit", handleFormSubmit);


// Adding the file to the add file
const fileInput = document.getElementById('file-input');
        const addFileBtn = document.getElementById('add-file-btn');
        const fileList = document.getElementById('file-list');
        const selectedFiles = new Set();

        addFileBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                if (!selectedFiles.has(file.name)) {
                    selectedFiles.add(file.name);
                    
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    
                    const fileName = document.createElement('span');
                    fileName.textContent = file.name;
                    
                    const removeBtn = document.createElement('span');
                    removeBtn.className = 'remove-file';
                    removeBtn.textContent = '×';
                    removeBtn.onclick = () => {
                        fileItem.remove();
                        selectedFiles.delete(file.name);
                        if (selectedFiles.size === 0) {
                            fileList.style.display = 'none';
                        }
                    };

                    fileItem.appendChild(fileName);
                    fileItem.appendChild(removeBtn);
                    fileList.appendChild(fileItem);
                }
            });

            if (selectedFiles.size > 0) {
                fileList.style.display = 'block';
            }
            
            // Reset file input to allow selecting the same file again
            fileInput.value = '';
        });