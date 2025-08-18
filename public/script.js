// ElevenLabs Conversational AI Script
// Based on the tutorial requirements

// Note: This requires @elevenlabs/client to be installed
// For now, this will show how to implement the functionality

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const connectionStatus = document.getElementById('connectionStatus');
const agentStatus = document.getElementById('agentStatus');

let conversation;

async function startConversation() {
    try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // Import the Conversation class
        // Note: In a real implementation, this would be imported at the top
        // const { Conversation } = await import('@elevenlabs/client');

        // For demo purposes, we'll simulate the API
        console.log('Starting conversation...');
        
        // Start the conversation
        // conversation = await Conversation.startSession({
        //     agentId: 'YOUR_AGENT_ID', // Replace with your agent ID
        //     onConnect: () => {
        //         connectionStatus.textContent = 'Connected';
        //         startButton.disabled = true;
        //         stopButton.disabled = false;
        //     },
        //     onDisconnect: () => {
        //         connectionStatus.textContent = 'Disconnected';
        //         startButton.disabled = false;
        //         stopButton.disabled = true;
        //     },
        //     onError: (error) => {
        //         console.error('Error:', error);
        //     },
        //     onModeChange: (mode) => {
        //         agentStatus.textContent = mode.mode === 'speaking' ? 'speaking' : 'listening';
        //     },
        // });

        // Simulate connection for demo
        setTimeout(() => {
            connectionStatus.textContent = 'Connected';
            connectionStatus.className = 'connected';
            startButton.disabled = true;
            stopButton.disabled = false;
            
            // Simulate mode changes
            setInterval(() => {
                const isListening = agentStatus.textContent === 'listening';
                agentStatus.textContent = isListening ? 'speaking' : 'listening';
            }, 3000);
        }, 1000);
        
    } catch (error) {
        console.error('Failed to start conversation:', error);
        alert('Failed to start conversation. Please check console for details.');
    }
}

async function stopConversation() {
    // if (conversation) {
    //     await conversation.endSession();
    //     conversation = null;
    // }
    
    // Simulate disconnection for demo
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.className = 'disconnected';
    agentStatus.textContent = 'listening';
    startButton.disabled = false;
    stopButton.disabled = true;
}

startButton.addEventListener('click', startConversation);
stopButton.addEventListener('click', stopConversation);