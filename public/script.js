let localStream;
let peer;
let socket;
let roomId;
const peers = {}; // Store peer connections

// Initialize the application
async function init() {
    socket = io('/');
    
    peer = new Peer(undefined, {
        host: 'be76-103-152-199-178.ngrok-free.app', // Use your ngrok URL
        port: 443,
        path: '/peerjs',
        secure: true,
        debug: 3,
    });

    setupEventListeners();
}

function setupEventListeners() {
    // Join room button click
    document.getElementById('joinButton').addEventListener('click', joinRoom);

    // PeerJS connection open
    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
    });

    // Handle incoming calls
    peer.on('call', async (call) => {
        call.answer(localStream); // Answer with local stream

        const remoteVideo = createVideoElement(call.peer);
        call.on('stream', (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });

        call.on('close', () => {
            removeVideoElement(call.peer);
        });

        peers[call.peer] = call;
    });

    // Socket.IO event handlers
    socket.on('user-connected', (userId) => {
        console.log('User connected:', userId);
        connectToNewUser(userId, localStream);
    });

    socket.on('user-disconnected', (userId) => {
        if (peers[userId]) {
            peers[userId].close();
        }
        removeVideoElement(userId);
    });

    // Control button handlers
    document.getElementById('toggleVideo').addEventListener('click', toggleVideo);
    document.getElementById('toggleAudio').addEventListener('click', toggleAudio);
    document.getElementById('endCall').addEventListener('click', endCall);
}

async function joinRoom() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = localStream;
        localVideo.addEventListener('loadedmetadata', () => {
            localVideo.play();
        });

        roomId = document.getElementById('roomInput').value || generateRoomId();
        document.getElementById('roomDisplay').textContent = roomId;

        socket.emit('join-room', roomId, peer.id);
        document.getElementById('joinForm').style.display = 'none';

    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Error accessing camera/microphone');
    }
}

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);

    const remoteVideo = createVideoElement(userId);
    call.on('stream', (remoteStream) => {
        remoteVideo.srcObject = remoteStream;
    });

    call.on('close', () => {
        removeVideoElement(userId);
    });

    peers[userId] = call;
}

function createVideoElement(id) {
    const videoGrid = document.querySelector('.video-grid');
    const videoElement = document.createElement('video');
    videoElement.id = `video-${id}`;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoGrid.appendChild(videoElement);
    return videoElement;
}

function removeVideoElement(id) {
    const videoElement = document.getElementById(`video-${id}`);
    if (videoElement) {
        videoElement.remove();
    }
}

function generateRoomId() {
    return Math.random().toString(36).substring(2, 7);
}

function toggleVideo() {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    document.getElementById('toggleVideo').classList.toggle('disabled');
}

function toggleAudio() {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    document.getElementById('toggleAudio').classList.toggle('disabled');
}

function endCall() {
    Object.values(peers).forEach((call) => call.close());
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    window.location.reload();
}

// Initialize when page loads
init();
