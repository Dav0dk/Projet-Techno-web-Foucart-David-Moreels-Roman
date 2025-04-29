let sequence = []; // La séquence générée par le jeu
let playerSequence = []; // La séquence entrée par le joueur
let isPlayerTurn = false; // Indique si c'est au joueur de jouer
let niveau = 0; // niveau actuel
let gameActive = false; // Indique si le jeu est en cours
let activeTimers = []; // Stocke les timers actifs pour éviter les conflits
let score = 0; // Initialisation du score
*

let sequenceTimerStart = 0; // Début du timer pour la séquence
let sequenceTimerEnd = 0;   // Fin du timer
let gameTimerInterval = null; // ID de l'intervalle pour le timer


const statusElement = document.getElementById("status");
const niveauElement = document.getElementById("niveau");
const timerElement = document.getElementById("timer");
const startButton = document.getElementById("start");
const quitterButton = document.getElementById("quitter");
const buttons = {
    rouge: document.getElementById("rouge"),
    bleu: document.getElementById("bleu"),
    vert: document.getElementById("vert"),
    jaune: document.getElementById("jaune"),
};


document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche le rechargement de la page
    
    document.getElementById("loginForm").style.display = "none"; // Cache le formulaire
    document.getElementById("game").style.display = "block"; // Affiche le jeu
});

function jouerSon(idAudio) {
    // Arrêter tous les sons en cours
    const sons = document.querySelectorAll('audio');
    sons.forEach(function(son) {
        son.pause();
        son.currentTime = 0; // Remet au début
    });
    const sonActuel = document.getElementById(idAudio);
    if (sonActuel) {
        sonActuel.play();
    } else {
        console.error("Aucun son trouvé avec l'id :", idAudio);
    }
}


function saveUserData() {
	console.log("✅ La fonction saveUserData() est bien appelée !");
    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;

    const data = new FormData();
    data.append("nom", nom);
    data.append("prenom", prenom);
    data.append("niveau", niveau);
    data.append("score", score);
	
	fetch("Jeu.php", {
		method: "POST",
		body: data,
	})
	.then(response => response.text())
	.then(result => console.log("✅ Réponse du serveur :", result))
	.catch(error => console.error("❌ Erreur fetch :", error));
}


function updateStatus(message) {
    statusElement.innerText = message; // Mets à jour le texte au-dessus du Simon
}

function updateniveau(niveau) {
    niveauElement.innerText = `Niveau : ${niveau}`; // Mets à jour le niveau en bas de la page
}

quitterButton.addEventListener("click", () => {
    resetGame();
});

function startTimer() {
    sequenceTimerStart = performance.now(); // Démarre le timer pour la séquence
    gameTimerInterval = setInterval(() => {
        const now = performance.now();
        const elapsed = ((now - sequenceTimerStart) / 1000).toFixed(2); // Temps écoulé en secondes
        if (gameActive){
            timerElement.innerText = `${elapsed}s`;// Met à jour le texte du timer
        }
    }, 100); // Met à jour toutes les 100 ms
}

function stopTimer() {
    clearInterval(gameTimerInterval); // Arrête l'intervalle
    gameTimerInterval = null; // Réinitialise l'intervalle
}

function flashTimer() {
    timerElement.classList.add("flash"); // Ajoute la classe CSS pour clignoter
    setTimeout(() => {
        timerElement.classList.remove("flash"); // Retire la classe après 1 seconde
    }, 1000);
}

startButton.addEventListener("click", () => {
    gameActive = true; // Active le jeu
    const startRect = startButton.getBoundingClientRect(); // Coordonnées exactes du bouton "start"

    const centerX = startRect.left + startRect.width / 2;
    const centerY = startRect.top + startRect.height / 2;

    const moves = [
        {
            element: buttons.rouge,
            translateX: centerX - buttons.rouge.getBoundingClientRect().right,
            translateY: centerY - buttons.rouge.getBoundingClientRect().bottom,
        },
        {
            element: buttons.bleu,
            translateX: centerX - buttons.bleu.getBoundingClientRect().left,
            translateY: centerY - buttons.bleu.getBoundingClientRect().bottom,
        },
        {
            element: buttons.vert,
            translateX: centerX - buttons.vert.getBoundingClientRect().right,
            translateY: centerY - buttons.vert.getBoundingClientRect().top,
        },
        {
            element: buttons.jaune,
            translateX: centerX - buttons.jaune.getBoundingClientRect().left,
            translateY: centerY - buttons.jaune.getBoundingClientRect().top,
        },
    ];

    moves.forEach(({ element, translateX, translateY }) => {
        element.style.transition = "transform 1.5s ease-in-out"; // Transition fluide
        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    });

    startButton.style.display = "none";

    buttons.rouge.addEventListener("transitionend", () => {
        quitterButton.style.display = "block"; // Affiche le bouton "Quitter"
        startSimonGame(); // Lance le jeu
    });
});

const scoreElement = document.getElementById("score");

function updateScore() {
    scoreElement.innerText = `Score : ${score}`; // Met à jour le score affiché
}

["rouge", "bleu", "vert", "jaune"].forEach(color => {
    const button = document.getElementById(color);
    button.addEventListener("click", () => {
        if (!isPlayerTurn || !gameActive) return; // Vérifie si le jeu est actif

        score++;
        updateScore();		// Met à jour le score affiché
		jouerSon("idAudio");
    });
});

function startSimonGame() {
    sequence = []; // Réinitialise la séquence
    playerSequence = []; // Réinitialise la séquence du joueur
    niveau = 0; // Réinitialise le niveau
    updateniveau(niveau); // Met à jour le niveau au démarrage
    nextTurn(); // Commence le premier tour
}

function getRandomButton() {
    const colors = ["rouge", "bleu", "vert", "jaune"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function resetButtons() {
    Object.values(buttons).forEach(button => {
        button.classList.remove("active"); // Supprime la classe "active"
    });
}

function nextTurn() {
    const newColor = getRandomButton();
    sequence.push(newColor); // Ajoute un nouvel élément à la séquence
    showSequence(); // Montre la séquence au joueur
}

function showSequence() {
    if (!gameActive) return; // Empêche l'animation si le jeu est arrêté

    isPlayerTurn = false; // Désactive les clics du joueur pendant l'affichage
    updateStatus("Regarde la séquence !");

    sequence.forEach((color, index) => {
        const timerId = setTimeout(() => {
            resetButtons(); // Désactive tous les boutons
            const button = document.getElementById(color);
            button.classList.add("active"); // Active le bouton dans la séquence

            setTimeout(() => {
                button.classList.remove("active"); // Retire l'effet après 500 ms
            }, 500);
        }, index * 1000);
        activeTimers.push(timerId);
    });

    const endSequenceTimer = setTimeout(() => {
        if (gameActive) {
            isPlayerTurn = true; // Active les clics du joueur
            updateStatus("À toi de jouer !");
            startTimer(); // Démarre le timer pour le joueur
        }
    }, sequence.length * 1000);
    activeTimers.push(endSequenceTimer);
}

function checkPlayerSequence() {
    const currentStep = playerSequence.length - 1;

    if (playerSequence[currentStep] !== sequence[currentStep]) {
        alert(`Erreur ! Vous avez fait une erreur. Niveau final : ${niveau}, Score final: ${score - 1}`);
        resetGame();
        return;
    }

    if (playerSequence.length === sequence.length) {
        stopTimer(); // Arrête le timer
        sequenceTimerEnd = performance.now(); // Fin du timer
        const elapsed = ((sequenceTimerEnd - sequenceTimerStart) / 1000).toFixed(2); // Temps écoulé
        timerElement.innerText = `${elapsed}s`; // Met à jour l'affichage
        flashTimer(); // Fait clignoter le timer

        niveau++;
        updateniveau(niveau); // Mets à jour le niveau
        playerSequence = []; // Réinitialise la séquence du joueur

		saveUserData(); // Enregistre les données
		setTimeout(() => {
			console.log("appel de nextTurn");
			nextTurn();
		}, 500);
	}
}



function resetGame() {
    activeTimers.forEach(timerId => clearTimeout(timerId));
    activeTimers = []; // Réinitialise la liste des timers

    stopTimer();
    const timerElement = document.getElementById("timer");
    timerElement.innerText = "00:00"; // Réinitialise l'affichage

    sequence = [];
    playerSequence = [];
    score = 0; // Réinitialise le score
    updateScore(); // Met à jour l'affichage du score
    niveau = 0;
    updateniveau(niveau); // Réinitialise le niveau
    updateStatus(""); // Cache le statut
    isPlayerTurn = false;
    gameActive = false; // Désactive le jeu

    Object.values(buttons).forEach(button => {
        button.classList.remove("active"); // Assure que tous les boutons sont désactivés
    });

    quitterButton.style.display = "none"; // Cache "Quitter"
    startButton.style.display = "none"; // Cache "Start"

    const startRect = startButton.getBoundingClientRect();
    const centerX = startRect.left + startRect.width / 2;
    const centerY = startRect.top + startRect.height / 2;

    const moves = [
        {
            element: buttons.rouge,
            translateX: centerX - buttons.rouge.getBoundingClientRect().right,
            translateY: centerY - buttons.rouge.getBoundingClientRect().bottom,
        },
        {
            element: buttons.bleu,
            translateX: centerX - buttons.bleu.getBoundingClientRect().left,
            translateY: centerY - buttons.bleu.getBoundingClientRect().bottom,
        },
        {
            element: buttons.vert,
            translateX: centerX - buttons.vert.getBoundingClientRect().right,
            translateY: centerY - buttons.vert.getBoundingClientRect().top,
        },
        {
            element: buttons.jaune,
            translateX: centerX - buttons.jaune.getBoundingClientRect().left,
            translateY: centerY - buttons.jaune.getBoundingClientRect().top,
        },
    ];

    moves.forEach(({ element }) => {
        element.style.transition = "transform 1.5s ease-in-out";
        element.style.transform = "none";
    });

    buttons.rouge.addEventListener("transitionend", () => {
        if (!gameActive) {
            startButton.style.display = "block";
            quitterButton.style.display = "none"; // Cache "Quitter"
        }
    });
}

["rouge", "bleu", "vert", "jaune"].forEach(color => {
    const button = document.getElementById(color);
    button.addEventListener("click", () => {
        if (!isPlayerTurn || !gameActive) return; // Vérifie si le joueur peut cliquer

        button.classList.add("active"); // Ajoute un effet visuel
        setTimeout(() => {
            button.classList.remove("active"); // Supprime l'effet après 350ms
        }, 350);

        playerSequence.push(color); // Ajoute la couleur cliquée dans la séquence du joueur
        checkPlayerSequence(); // Vérifie si le joueur a suivi la séquence correctement
    });
});

