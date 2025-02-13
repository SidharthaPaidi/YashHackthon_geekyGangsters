const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let peerConnection;

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Get user media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        localStream = stream;
    })
    .catch(error => console.error('Error accessing media devices:', error));

// Handle signaling
socket.on('offer', async (offer) => {
    peerConnection = new RTCPeerConnection(configuration);
    peerConnection.addTrack(localStream.getTracks()[0], localStream);
    peerConnection.addTrack(localStream.getTracks()[1], localStream);

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', async (candidate) => {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// const processVideo = async () => {
//     const video = document.getElementById('localVideo');
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     setInterval(() => {
//         context.drawImage(video, 0, 0, canvas.width, canvas.height);
//         // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

//         // Run AI models on imageData
//         detectFaces(imageData);
//         detectNumberPlates(imageData);
//     }, 1000 / 30); // 30 FPS
// };

// const detectFaces = (imageData) => {
//     // Use TensorFlow.js or OpenCV.js for face detection
//     console.log('Running face detection...');
// };

// const detectNumberPlates = (imageData) => {
//     // Use TensorFlow.js or OpenCV.js for number plate detection
//     console.log('Running number plate detection...');
// };

// processVideo();

const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized speech:', transcript);
        analyzeSentiment(transcript);
    };
};

const analyzeSentiment = (text) => {
    // Use OpenAI or NLP libraries for sentiment analysis
    console.log('Analyzing sentiment...');
};

startVoiceRecognition();
const updateDashboard = (faces, plates, sentiment) => {
    document.getElementById('face-recognition-result').innerText = `Faces Detected: ${faces}`;
    document.getElementById('number-plate-result').innerText = `Number Plates Detected: ${plates}`;
    document.getElementById('sentiment-result').innerText = `Sentiment: ${sentiment}`;
};