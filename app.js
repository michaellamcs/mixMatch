// Game data structure - Updated based on user's content
const gameData = {
    "dimensions": [
        {
            "name": "Physical Dimension",
            "color": "#ff6b6b",
            "topics": [{"title": "Injuries", "subtopic": "bruises, cuts, burns, welts, scars, broken bones, head injuries, internal damage; repeated injuries → chronic pain, disabilities, long-term neurological issues"}]
        },
        {
            "name": "Psychological Dimension",
            "color": "#4ecdc4",
            "topics": [
                {"title": "Hypervigilance", "subtopic": "fearful and stressful of abusive damage → anxiety, insomnia, and nightmares"},
                {"title": "Chronic stress", "subtopic": "brain dysfunction → emotional outbursts, a lack of focus, poor memory and learning difficulties; sustained stress response → risk of heart disease, autoimmune disorders"}
            ]
        },
        {
            "name": "Social/Behavioural Dimension",
            "color": "#45b7d1",
            "topics": [
                {"title": "Resistance to initiate relationships", "subtopic": "Dismantle of trust; formation of insecure attachment patterns → viewing their caregivers as unpredictable or even dangerous"},
                {"title": "Social withdrawal", "subtopic": "Negative models of self and others; feeling of 'I am not worthy of love' → low self-esteem; feeling that 'others are not trustworthy' → worthlessness → social withdrawal"},
                {"title": "Self-blaming for everything", "subtopic": "Reasoning for abused behaviours; the abuse is due to my 'fault'; self-blame → lower self-confidence and sense of value"},
                {"title": "Negatively rewired response", "subtopic": "repeated abuse in a confined space → classical conditioning → claustrophobia"}
            ]
        },
        {
            "name": "Spiritual Dimension",
            "color": "#96ceb4",
            "topics": [
                {"title": "Formation of a distorted value system", "subtopic": "Internalization of Violence; seeing violence as a way to resolution → witnessing the effectiveness and success of the use of violence to resolve conflicts; copying violent behaviour → abuser at school"},
                {"title": "Loss of hope and safety", "subtopic": "injuries, no trust, low self-esteem, self-blame, low confidence, low sense of value; existential crisis → despair → not worth existing"}
            ]
        }
    ]
};

let allTopics = [];
let correctMatches = 0;
let totalTopics = 0;
let sortableInstances = [];

function initializeGame() {
    console.log('Initializing game with SortableJS...');
    allTopics = [];
    let topicId = 0;
    
    gameData.dimensions.forEach(dimension => {
        dimension.topics.forEach(topic => {
            allTopics.push({
                id: `topic-${topicId}`,
                title: topic.title,
                subtopic: topic.subtopic,
                correctDimension: dimension.name
            });
            topicId++;
        });
    });

    totalTopics = allTopics.length;
    console.log(`Total topics created: ${totalTopics}`);
    
    correctMatches = 0;
    displayTopics();
    updateProgressDisplay();
    setupSortable();
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
    
    const shuffledTopics = shuffleArray(allTopics);
    console.log(`Displaying ${shuffledTopics.length} topics`);
    
    shuffledTopics.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        topicCard.dataset.topicId = topic.id;
        topicCard.dataset.correctDimension = topic.correctDimension;
        
        topicCard.innerHTML = `
            <div class="topic-title">${topic.title}</div>
            <div class="topic-subtopic">${topic.subtopic}</div>
        `;
        
        setupLongPress(topicCard, topic);
        container.appendChild(topicCard);
    });
}

function setupLongPress(element, topic) {
    let pressTimer = null;
    let isDragging = false;

    const startPress = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        
        isDragging = false;
        pressTimer = setTimeout(() => {
            if (!isDragging) {
                showPopup(topic.title, topic.subtopic);
            }
        }, 1000);
    };

    const endPress = () => {
        clearTimeout(pressTimer);
    };

    const onMove = () => {
        isDragging = true;
        clearTimeout(pressTimer);
    };

    element.addEventListener('mousedown', startPress);
    element.addEventListener('mouseup', endPress);
    element.addEventListener('mouseleave', endPress);
    element.addEventListener('mousemove', onMove);

    element.addEventListener('touchstart', startPress, { passive: true });
    element.addEventListener('touchend', endPress);
    element.addEventListener('touchcancel', endPress);
    element.addEventListener('touchmove', onMove);
}

function showPopup(title, subtopic) {
    const overlay = document.getElementById('popupOverlay');
    const titleEl = document.getElementById('popupTitle');
    const subtopicEl = document.getElementById('popupSubtopic');
    
    if (overlay && titleEl && subtopicEl) {
        titleEl.textContent = title;
        subtopicEl.textContent = subtopic;
        overlay.classList.remove('hidden');
    }
}

function hidePopup() {
    const overlay = document.getElementById('popupOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function setupSortable() {
    console.log('Setting up SortableJS...');
    
    sortableInstances.forEach(instance => instance.destroy());
    sortableInstances = [];
    
    const topicsContainer = document.getElementById('topicsContainer');
    if (topicsContainer) {
        const topicsSortable = new Sortable(topicsContainer, {
            group: {
                name: 'shared',
                pull: 'clone',
                put: false
            },
            animation: 150,
            sort: false,
            forceFallback: true,
            scroll: true,
            scrollSensitivity: 70,
            scrollSpeed: 15,
            // CHANGE: Add a delay on touch devices to distinguish scrolling from dragging
            delay: 100, // 100ms delay
            delayOnTouchOnly: true, // Only applies to touch
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
        });
        sortableInstances.push(topicsSortable);
    }
    
    const dropZoneConfigs = [
        { id: 'physical-dimension', dimension: 'Physical Dimension' },
        { id: 'psychological-dimension', dimension: 'Psychological Dimension' },
        { id: 'social-dimension', dimension: 'Social/Behavioural Dimension' },
        { id: 'spiritual-dimension', dimension: 'Spiritual Dimension' }
    ];
    
    dropZoneConfigs.forEach(config => {
        const zone = document.getElementById(config.id);
        if (zone) {
            const zoneSortable = new Sortable(zone, {
                group: {
                    name: 'shared',
                    pull: false,
                    put: true
                },
                animation: 150,
                forceFallback: true,
                delay: 100, // 100ms delay
                delayOnTouchOnly: true, // Only applies to touch
                ghostClass: 'sortable-ghost',
                onAdd: function(evt) {
                    const item = evt.item;
                    const fromList = evt.from;
                    const targetDimension = config.dimension;
                    const correctDimension = item.dataset.correctDimension;
                    
                    if (correctDimension === targetDimension) {
                        handleCorrectMatch(item, fromList);
                    } else {
                        handleIncorrectMatch(item);
                    }
                }
            });
            sortableInstances.push(zoneSortable);
        }
    });
    
    console.log('SortableJS setup complete.');
}


function handleCorrectMatch(placedItem, sourceList) {
    console.log('Correct match!');
    placedItem.classList.add('correct');
    placedItem.classList.remove('topic-card');
    
    const originalItem = sourceList.querySelector(`[data-topic-id="${placedItem.dataset.topicId}"]`);
    if (originalItem) {
        originalItem.remove();
    }
    
    correctMatches++;
    updateProgressDisplay();
    
    if (correctMatches === totalTopics) {
        setTimeout(() => showSuccessModal(), 300);
    }
}

function handleIncorrectMatch(item) {
    console.log('Incorrect match');
    item.classList.add('incorrect');
    
    setTimeout(() => {
        item.remove();
    }, 600);
}

function updateProgressDisplay() {
    const progressSpan = document.getElementById('progress');
    const totalSpan = document.getElementById('total');
    if (progressSpan) progressSpan.textContent = correctMatches;
    if (totalSpan) totalSpan.textContent = totalTopics;
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('hidden');
}

function hideSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.add('hidden');
}

function resetGame() {
    console.log('Resetting game...');
    hideSuccessModal();
    hidePopup();
    
    document.querySelectorAll('.drop-zone-content').forEach(zone => {
        zone.innerHTML = '';
    });
    
    initializeGame();
}

function setupEventListeners() {
    const resetBtn = document.getElementById('resetBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const popupClose = document.getElementById('popupClose');
    const popupOverlay = document.getElementById('popupOverlay');

    if (resetBtn) {
        resetBtn.removeEventListener('click', resetGame);
        resetBtn.addEventListener('click', resetGame);
    }
    if (playAgainBtn) {
        playAgainBtn.removeEventListener('click', resetGame);
        playAgainBtn.addEventListener('click', resetGame);
    }
    if (popupClose) {
        popupClose.removeEventListener('click', hidePopup);
        popupClose.addEventListener('click', hidePopup);
    }
    if (popupOverlay) {
        const overlayHandler = (e) => {
            if (e.target === popupOverlay) hidePopup();
        };
        popupOverlay.removeEventListener('click', overlayHandler);
        popupOverlay.addEventListener('click', overlayHandler);
    }

    const successModal = document.getElementById('successModal');
    if (successModal) {
        const successModalHandler = (e) => {
            if (e.target === successModal) hideSuccessModal();
        };
        successModal.removeEventListener('click', successModalHandler);
        successModal.addEventListener('click', successModalHandler);
    }
    
    const keydownHandler = (e) => {
        if (e.key === 'Escape') {
            hidePopup();
            hideSuccessModal();
        }
    };
    document.removeEventListener('keydown', keydownHandler);
    document.addEventListener('keydown', keydownHandler);
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Sortable === 'undefined') {
        console.error('SortableJS not loaded!');
        return;
    }
    initializeGame();
});
