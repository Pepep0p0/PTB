/**
 * Museum of Us - Interactive Memory Museum
 * A personalized journey through relationship milestones
 * Built with vanilla JavaScript
 */

'use strict';

// DOM Element References
const elements = {
  firstName: document.getElementById('firstName'),
  lastName: document.getElementById('lastName'),
  appearance: document.getElementById('appearance'),
  avatarForm: document.getElementById('avatarForm'),
  startTour: document.getElementById('startTour'),
  avatarScreen: document.getElementById('avatarScreen'),
  museumScreen: document.getElementById('museumScreen'),
  room: document.getElementById('room'),
  roomTitle: document.getElementById('roomTitle'),
  kissCounter: document.getElementById('kissCounter'),
  muteToggle: document.getElementById('muteToggle'),
  artifactModal: document.getElementById('artifactModal'),
  artifactQuestion: document.getElementById('artifactQuestion'),
  artifactAnswer: document.getElementById('artifactAnswer'),
  unlockArtifact: document.getElementById('unlockArtifact'),
  valentineScreen: document.getElementById('valentineScreen'),
  valentineCheck: document.getElementById('valentineCheck'),
  valentineContinue: document.getElementById('valentineContinue'),
  couponScreen: document.getElementById('couponScreen'),
  finalKisses: document.getElementById('finalKisses'),
  avatarPreview: document.getElementById('avatarPreview'),
  bgMusic: document.getElementById('bgMusic'),
  resetBtn: document.getElementById('resetBtn')
};

// Museum Data Structure
const ROOMS = [
  {
    title: "The Origin Wing",
    questions: [
      "Where did we first talk properly for hours?",
      "What was the first thing you noticed about me?",
      "What did you think this was going to be back then?"
    ]
  },
  {
    title: "The Chaos / Growth Wing",
    questions: [
      "What was the first fight we actually recovered from?",
      "What's something about us that surprised you?",
      "What's one thing we do that feels uniquely \"us\"?"
    ]
  },
  {
    title: "The Soft Moments Gallery",
    questions: [
      "Which small moment of ours do I secretly love the most?",
      "When do you feel most at home with me?",
      "What's the one word you'd use to describe us on our best day?"
    ]
  },
  {
    title: "The Future Wing",
    questions: [
      "What are you most excited to build together?",
      "What promise have I already kept without realizing it?",
      "What would you want us to remember this version of ourselves for?"
    ]
  }
];

// Application State
const state = JSON.parse(localStorage.getItem("museumState")) || {
  avatar: null,
  kisses: 0,
  rooms: {},
  currentRoom: 0,
  avatarPos: { x: 20, y: 20 },
  musicMuted: false,
  bonusGranted: false
};

// Utility Functions
const save = () => localStorage.setItem("museumState", JSON.stringify(state));

// Avatar Creation
elements.appearance.onchange = () => {
  const colors = {
    soft: "#e6cde6",
    warm: "#f2c4a5",
    classic: "#ccc"
  };
  elements.avatarPreview.style.background = colors[elements.appearance.value];
};

// Form Submission
elements.avatarForm.onsubmit = (e) => {
  e.preventDefault();
  
  if (!elements.firstName.value.trim() || !elements.lastName.value.trim()) {
    alert("Please enter your name to continue ❤️");
    return;
  }

  state.avatar = {
    first: elements.firstName.value.trim(),
    last: elements.lastName.value.trim(),
    appearance: elements.appearance.value
  };

  // Easter egg bonus
  if (
    state.avatar.first.toLowerCase() === "amena" &&
    state.avatar.last.toLowerCase() === "farooq" &&
    !state.bonusGranted
  ) {
    state.kisses += 10;
    state.bonusGranted = true;
  }

  // Audio setup with error handling
  try {
    elements.bgMusic.volume = 0.2;
    elements.bgMusic.muted = state.musicMuted;
    elements.bgMusic.play();
  } catch (error) {
    console.warn("Audio autoplay blocked:", error);
  }

  save();
  elements.avatarScreen.classList.add("hidden");
  elements.museumScreen.classList.remove("hidden");
  renderRoom();
};

// Music Control
elements.muteToggle.onclick = () => {
  elements.bgMusic.muted = !elements.bgMusic.muted;
  state.musicMuted = elements.bgMusic.muted;
  elements.muteToggle.textContent = elements.bgMusic.muted ? "Unmute" : "Mute";
  save();
};

// Reset Function
elements.resetBtn.onclick = () => {
  if (confirm("This will erase all your progress. Continue?")) {
    localStorage.removeItem("museumState");
    location.reload();
  }
};

// Room Rendering
function renderRoom() {
  elements.room.innerHTML = "";
  elements.roomTitle.textContent = ROOMS[state.currentRoom].title;

  // Render Avatar
  const avatar = document.createElement("div");
  avatar.id = "avatar";
  avatar.style.left = state.avatarPos.x + "px";
  avatar.style.top = state.avatarPos.y + "px";
  
  const colors = {
    soft: "#e6cde6",
    warm: "#f2c4a5",
    classic: "#ccc"
  };
  avatar.style.background = colors[state.avatar.appearance];
  
  elements.room.appendChild(avatar);

  // Render Artifacts
  const positions = [
    { left: 50, top: 100 },
    { left: 250, top: 180 },
    { left: 80, top: 300 }
  ];

  ROOMS[state.currentRoom].questions.forEach((q, i) => {
    const art = document.createElement("div");
    const unlocked = state.rooms[state.currentRoom]?.[i];
    
    art.className = "artifact" + (unlocked ? "" : " locked");
    art.textContent = "🖼️";
    art.style.left = positions[i].left + "px";
    art.style.top = positions[i].top + "px";
    art.setAttribute("role", "button");
    art.setAttribute("aria-label", unlocked ? "Unlocked artifact" : "Locked artifact");

    art.onclick = () => {
      if (unlocked) return;
      
      state.avatarPos = { 
        x: parseInt(art.style.left), 
        y: parseInt(art.style.top) 
      };
      save();
      avatar.style.left = art.style.left;
      avatar.style.top = art.style.top;
      openArtifact(i, q);
    };

    elements.room.appendChild(art);
  });

  elements.kissCounter.textContent = "💋 " + state.kisses;
}

// Artifact Modal Management
let activeArtifact = null;

function openArtifact(index, question) {
  activeArtifact = index;
  elements.artifactQuestion.textContent = question;
  elements.artifactAnswer.value = "";
  elements.artifactModal.classList.remove("hidden");
  elements.artifactAnswer.focus();
}

// Unlock Artifact
elements.unlockArtifact.onclick = () => {
  if (!elements.artifactAnswer.value.trim()) {
    alert("Please share a memory to unlock this artifact ❤️");
    return;
  }

  state.rooms[state.currentRoom] = state.rooms[state.currentRoom] || {};
  state.rooms[state.currentRoom][activeArtifact] = {
    answer: elements.artifactAnswer.value.trim(),
    timestamp: new Date().toISOString()
  };

  state.kisses += 1;
  save();
  elements.artifactModal.classList.add("hidden");

  // Check if room is complete
  if (Object.keys(state.rooms[state.currentRoom]).length === 3) {
    if (state.currentRoom < ROOMS.length - 1) {
      state.currentRoom += 1;
      state.avatarPos = { x: 20, y: 20 }; // Reset avatar position
      save();
    } else {
      // Museum complete - show valentine screen
      elements.museumScreen.classList.add("hidden");
      elements.valentineScreen.classList.remove("hidden");
      return;
    }
  }

  renderRoom();
};

// Valentine Gate
elements.valentineCheck.onchange = e => {
  elements.valentineContinue.disabled = !e.target.checked;
};

elements.valentineContinue.onclick = () => {
  elements.valentineScreen.classList.add("hidden");
  elements.couponScreen.classList.remove("hidden");
  elements.finalKisses.textContent = state.kisses;
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved session
  if (state.avatar) {
    elements.bgMusic.muted = state.musicMuted;
    elements.muteToggle.textContent = state.musicMuted ? "Unmute" : "Mute";
    
    if (state.currentRoom >= ROOMS.length) state.currentRoom = 0;
    
    elements.avatarScreen.classList.add("hidden");
    if (state.currentRoom < ROOMS.length) {
      elements.museumScreen.classList.remove("hidden");
      renderRoom();
    }
  }
});
