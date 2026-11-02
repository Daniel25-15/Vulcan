// import { Groq } from 'groq-sdk';
import Groq from 'https://esm.sh/groq-sdk';

let APIKey = ""



const sendMessageButton = document.getElementById('send-message-button')
const inputArea = document.getElementById('input-area')
const chatContainer = document.querySelector(".chat-container")
const modelDropdownButton = document.querySelector("#model-dropdown-button")
const modelDropdownMenu = document.getElementById("model-dropdown-menu")
const model1 = document.getElementById("model-main")
const model2 = document.getElementById("model-second")
const setupNameInputArea = document.getElementById("setup-name-input")
const setupKeyInputArea = document.getElementById("setup-key-input")
const submitSetupInformationButton = document.getElementById("setup-submit-button")
const setupContainer = document.getElementById("setup-container")
const setupForm = document.getElementById("setup-form")

// chatMemory = [{"role": "system", "content": memory}]
// chatMemory.append({"role": "user", "content": userInputValue})
// chatMemory.append({"role": "assistant", "content": content})

modelDropdownButton.addEventListener('click', (event) => {
    event.stopPropagation();
    modelDropdownMenu.classList.toggle('hidden');
    // modelDropdownButton.value = "Models ◄"
    const dropDownHidden = modelDropdownMenu.classList.contains("hidden")
    modelDropdownButton.textContent = dropDownHidden ? "Models ◄" : "Models ►";
});
window.addEventListener('click', () => {
    if (!modelDropdownMenu.classList.contains("hidden")) {
        modelDropdownButton.classList.add('hidden')
    }
});


let currentSelectedModel = "openai/gpt-oss-120b"

model1.addEventListener('click', (event) => {
    currentSelectedModel = "qwen/qwen3.8-27b"
});
model2.addEventListener('click', (event) => {
    currentSelectedModel = "openai/gpt-oss-safeguard-20b"
});
// model1.addEventListener('click', (event) => {
//     currentSelectedModel = "qwen/qwen3.8-27b"
// });
// openai/gpt-oss-safeguard-20b


const memory = `My name is Daniel.`

let chatMemory = []

async function getResponse(message) {
    if (message !== " " && message) {
        const groq = new Groq({
            apiKey: APIKey,
            dangerouslyAllowBrowser: true
        });
        try {
            chatMemory.push({"role": "user", "content": message})
            const chatCompletion = await groq.chat.completions.create({
                "messages": chatMemory,
                "model": currentSelectedModel,
                "temperature": 1,
                "max_completion_tokens": 2048,
                "top_p": 1,
                "stream": true,
                "reasoning_effort": "medium"
            });
            let finalResponse = " ";
            for await (const chunk of chatCompletion) {
                const content = chunk.choices[0]?.delta?.content || '';
                finalResponse += content;
            }
            chatMemory.push({"role": "assistant", "content": finalResponse})
            return finalResponse
        } catch (error) {
            console.log(`Error getting response: ${ error }`);
        }
    } else {
        return
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        sendMessageButton.click()
    }
});
setupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userName = setupNameInputArea.value
    APIKey = setupKeyInputArea.value.trim();
    if (!userName || !APIKey) return;
    const keyCheck = await getResponse("What is my name?")
    // console.log(`${ keyCheck }`)
    console.log(`Chat Memory: ${ chatMemory }`)
    if (userName && APIKey && keyCheck) {
        setupContainer.classList.add('hidden');
        chatMemory = ([{"role": "system", "content": memory}])
    } else return
})


sendMessageButton.addEventListener('click', async (event) => {
    let currentMessage = inputArea.value;
    inputArea.value = ""
    inputArea.focus()
    if (currentMessage.trim()) {
        const currentResponse = await getResponse(currentMessage)
        const newMessage = document.createElement('p')
        newMessage.innerText = currentMessage
        newMessage.style.padding = '10px 15px'
        newMessage.style.borderRadius = '5px'
        newMessage.style.width = 'fit-content'
        newMessage.style.backgroundColor = "#282727"
        newMessage.style.color = "white"
        newMessage.style.margin = '10px'
        newMessage.style.marginLeft = 'auto'
        chatContainer.appendChild(newMessage)

        const newResponse = document.createElement('p')
        newResponse.innerText = currentResponse
        newResponse.style.padding = '10px 15px'
        newResponse.style.borderRadius = '5px'
        newResponse.style.width = '85%'
        newResponse.style.backgroundColor = "#282727"
        newResponse.style.color = "white"
        newResponse.style.margin = '10px'
        chatContainer.appendChild(newResponse)
    }
});