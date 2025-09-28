// Game data structure with updated content
const gameData = {
  "dimensions": [
    {
      "name": "Physical Dimension",
      "color": "#ff6b6b",
      "topics": [
        {
          "title": "Injuries",
          "subtopic": "bruises, cuts, burns, welts, scars, broken bones, head injuries, internal damage; repeated injuries → chronic pain, disabilities, long-term neurological issues"
        }
      ]
    },
    {
      "name": "Psychological Dimension", 
      "color": "#4ecdc4",
      "topics": [
        {
          "title": "Hypervigilance",
          "subtopic": "fearful and stressful of abusive damage → anxiety, insomnia, and nightmares"
        },
        {
          "title": "Chronic stress",
          "subtopic": "brain dysfunction → emotional outbursts, a lack of focus, poor memory and learning difficulties; sustained stress response → risk of heart disease, autoimmune disorders"
        }
      ]
    },
    {
      "name": "Social/Behavioural Dimension",
      "color": "#45b7d1", 
      "topics": [
        {
          "title": "Resistance to initiate relationships",
          "subtopic": "Dismantle of trust; formation of insecure attachment patterns → viewing their caregivers as unpredictable or even dangerous"
        },
        {
          "title": "Social withdrawal",
          "subtopic": "Negative models of self and others; feeling of 'I am not worthy of love' → low self-esteem; feeling that 'others are not trustworthy' → worthlessness → social withdrawal"
        },
        {
          "title": "Self-blaming for everything",
          "subtopic": "Reasoning for abused behaviours; the abuse is due to my 'fault'; self-blame → lower self-confidence and sense of value"
        },
        {
          "title": "Negatively rewired response",
          "subtopic": "repeated abuse in a confined space → classical conditioning → claustrophobia"
        }
      ]
    },
    {
      "name": "Spiritual Dimension",
      "color": "#96ceb4",
      "topics": [
        {
          "title": "Formation of a distorted value system",
          "subtopic": "Internalization of Violence; seeing violence as a way to resolution → witnessing the effectiveness and success of the use of violence to resolve conflicts; copying violent behaviour → abuser at school"
        },
        {
          "title": "Loss of hope and safety",
          "subtopic": "injuries, no trust, low self-esteem, self-blame, low confidence, low sense of value; existential crisis → despair → not worth existing"
        }
      ]
    }
  ]
};

let allTopics = [];
let correctMatches = 0;
let totalTopics = 9;
let draggedElement = null;
let touchOffset = { x: 0, y: 0 };

function initializeGame() {
  console.log('Initializing game...');
  
  // Create topics array
  allTopics = [];
  let topicId = 0;
  
  gameData.dimensions.forEach(dimension => {
    dimension.topics.forEach(topic => {
      allTopics.push({
        id: `topic-${topicId}`,
        title: topic.title,
        subtopic: topic.subtopic,
        correctDimension: dimension.name,
        isPlaced: false
      });
      topicId++;
    });
  });
  
  console.log(`Total topics created: ${allTopics.length}`);
  
  correctMatches = 0;
  displayTopics();
  updateProgressDisplay();
  setupDropZones();
  setupEventListeners();
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function displayTopics() {
  const container = document.getElementById('topicsContainer');
  if (!container) {
    console.error('Topics container not found');
    return;
  }
  
  container.innerHTML = '';
  
  const availableTopics = allTopics.filter(topic => !topic.isPlaced);
  const shuffledTopics = shuffleArray(availableTopics);
  
  console.log(`Displaying ${shuffledTopics.length} topics`);
  
  shuffledTopics.forEach(topic => {
    const topicCard = document.createElement('div');
    topicCard.className = 'topic-card';
    topicCard.draggable = true;
    topicCard.dataset.topicId = topic.id;
    topicCard.dataset.correctDimension = topic.correctDimension;
    
    topicCard.innerHTML = `
      <div class="topic-title">${topic.title}</div>
      <div class="topic-subtopic">${topic.subtopic}</div>
    `;
    
    // Add drag event listeners
    topicCard.addEventListener('dragstart', handleDragStart);
    topicCard.addEventListener('dragend', handleDragEnd);
    
    // Add touch event listeners for mobile
    topicCard.addEventListener('touchstart', handleTouchStart, { passive: false });
    topicCard.addEventListener('touchmove', handleTouchMove, { passive: false });
    topicCard.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    container.appendChild(topicCard);
  });
}

function handleDragStart(e) {
  console.log('Drag started:', e.target.dataset.topicId);
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', e.target.dataset.topicId);
  e.dataTransfer.effectAllowed = 'move';
  draggedElement = e.target;
}

function handleDragEnd(e) {
  console.log('Drag ended');
  e.target.classList.remove('dragging');
  draggedElement = null;
}

// Touch event handlers for mobile drag and drop
function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const element = e.target.closest('.topic-card');
  
  if (!element) return;
  
  draggedElement = element;
  element.classList.add('dragging');
  
  const rect = element.getBoundingClientRect();
  touchOffset.x = touch.clientX - rect.left;
  touchOffset.y = touch.clientY - rect.top;
  
  // Create a visual clone for dragging
  const clone = element.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = '1000';
  clone.style.opacity = '0.8';
  clone.style.transform = 'rotate(2deg) scale(1.05)';
  clone.classList.add('touch-clone');
  
  updateClonePosition(clone, touch.clientX, touch.clientY);
  document.body.appendChild(clone);
}

function handleTouchMove(e) {
  e.preventDefault();
  
  if (!draggedElement) return;
  
  const touch = e.touches[0];
  const clone = document.querySelector('.touch-clone');
  
  if (clone) {
    updateClonePosition(clone, touch.clientX, touch.clientY);
  }
  
  // Highlight drop zones
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const dropZone = elementBelow?.closest('.drop-zone');
  
  // Remove previous highlights
  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.classList.remove('drag-over');
  });
  
  // Add highlight to current drop zone
  if (dropZone) {
    dropZone.classList.add('drag-over');
  }
}

function handleTouchEnd(e) {
  e.preventDefault();
  
  if (!draggedElement) return;
  
  const touch = e.changedTouches[0];
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const dropZoneContent = elementBelow?.closest('.drop-zone-content');
  
  // Clean up
  const clone = document.querySelector('.touch-clone');
  if (clone) {
    clone.remove();
  }
  
  // Remove all drag-over states
  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.classList.remove('drag-over');
  });
  
  if (dropZoneContent) {
    const correctDimension = draggedElement.dataset.correctDimension;
    const targetDimension = dropZoneContent.dataset.dimension;
    
    if (correctDimension === targetDimension) {
      handleCorrectMatch(draggedElement, dropZoneContent);
    } else {
      handleIncorrectMatch(draggedElement);
    }
  }
  
  draggedElement.classList.remove('dragging');
  draggedElement = null;
}

function updateClonePosition(clone, clientX, clientY) {
  clone.style.left = (clientX - touchOffset.x) + 'px';
  clone.style.top = (clientY - touchOffset.y) + 'px';
}

function setupDropZones() {
  console.log('Setting up drop zones...');
  
  const dropZones = document.querySelectorAll('.drop-zone-content');
  
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('dragenter', handleDragEnter);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('drop', handleDrop);
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  const dropZone = e.target.closest('.drop-zone');
  if (dropZone) {
    dropZone.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  const dropZone = e.target.closest('.drop-zone');
  if (dropZone && !dropZone.contains(e.relatedTarget)) {
    dropZone.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const dropZone = e.target.closest('.drop-zone');
  if (dropZone) {
    dropZone.classList.remove('drag-over');
  }

  // --- BUG FIX STARTS HERE ---
  // Reliably find the drop zone content area, not just the event target
  const targetDropZoneContent = e.target.closest('.drop-zone-content');
  
  const topicId = e.dataTransfer.getData('text/plain');
  const draggedCard = document.querySelector(`[data-topic-id="${topicId}"]`);

  if (!draggedCard) {
    console.error('Dragged card not found');
    return;
  }
  
  // Check if the drop was on a valid content area
  if (targetDropZoneContent) {
    const correctDimension = draggedCard.dataset.correctDimension;
    const targetDimension = targetDropZoneContent.dataset.dimension; // Get dimension from the container

    if (correctDimension === targetDimension) {
      // Pass the correct container to the match function
      handleCorrectMatch(draggedCard, targetDropZoneContent);
    } else {
      handleIncorrectMatch(draggedCard);
    }
  } else {
    // If not dropped in a valid content area, treat as incorrect
    handleIncorrectMatch(draggedCard);
  }
  // --- BUG FIX ENDS HERE ---
}


function handleCorrectMatch(topicCard, dropZoneContent) {
  console.log('Correct match!');
  
  // Style as correct and mark as placed
  topicCard.classList.add('correct', 'placed');
  topicCard.draggable = false;
  
  // Remove touch event listeners
  topicCard.removeEventListener('touchstart', handleTouchStart);
  topicCard.removeEventListener('touchmove', handleTouchMove);
  topicCard.removeEventListener('touchend', handleTouchEnd);
  
  // Move to drop zone
  dropZoneContent.appendChild(topicCard);
  
  // Update game state
  const topicId = topicCard.dataset.topicId;
  const topic = allTopics.find(t => t.id === topicId);
  if (topic) {
    topic.isPlaced = true;
  }
  
  correctMatches++;
  updateProgressDisplay();
  
  // Check for completion
  if (correctMatches === totalTopics) {
    setTimeout(() => {
      showSuccessModal();
    }, 500);
  }
}

function handleIncorrectMatch(topicCard) {
  console.log('Incorrect match');
  
  // Add error styling
  topicCard.classList.add('incorrect');
  
  // Remove error styling after animation
  setTimeout(() => {
    topicCard.classList.remove('incorrect');
  }, 600);
}

function updateProgressDisplay() {
  const progressSpan = document.getElementById('progress');
  const totalSpan = document.getElementById('total');
  
  if (progressSpan) progressSpan.textContent = correctMatches;
  if (totalSpan) totalSpan.textContent = totalTopics;
  
  console.log(`Progress: ${correctMatches}/${totalTopics}`);
}

function showSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function hideSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function resetGame() {
  console.log('Resetting game...');
  
  // Hide success modal
  hideSuccessModal();
  
  // Clean up any touch clones
  document.querySelectorAll('.touch-clone').forEach(clone => {
    clone.remove();
  });
  
  // Reset state
  correctMatches = 0;
  draggedElement = null;
  allTopics.forEach(topic => {
    topic.isPlaced = false;
  });
  
  // Clear drop zones
  document.querySelectorAll('.drop-zone-content').forEach(zone => {
    zone.innerHTML = '';
  });
  
  // Clear drag-over states
  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.classList.remove('drag-over');
  });
  
  // Redisplay topics
  displayTopics();
  updateProgressDisplay();
}

function setupEventListeners() {
  const resetBtn = document.getElementById('resetBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }
  
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', resetGame);
  }
  
  // Close modal when clicking outside
  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        hideSuccessModal();
      }
    });
  }
  
  // Prevent default touch behaviors that might interfere with drag and drop
  document.addEventListener('touchmove', (e) => {
    if (draggedElement && e.target.closest('.topic-card')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Handle orientation changes on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      // Clean up any stray clones after orientation change
      document.querySelectorAll('.touch-clone').forEach(clone => {
        clone.remove();
      });
      draggedElement = null;
    }, 100);
  });
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, starting game...');
  initializeGame();
});