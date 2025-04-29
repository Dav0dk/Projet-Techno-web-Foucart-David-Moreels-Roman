<!doctype html>
<html class="no-js" lang="">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title></title>
  <link rel="stylesheet" href="style.css">
  <meta name="description" content="">

  <meta property="og:title" content="">
  <meta property="og:type" content="">
  <meta property="og:url" content="">
  <meta property="og:image" content="">
  <meta property="og:image:alt" content="">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">

  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#fafafa">
</head>

<body>
    <div class="container">
        <form id="loginForm">
            <label for="firstName">Prénom :</label>
            <input type="text" id="prenom" name="prenom" required>
            
            <label for="lastName">Nom :</label>
            <input type="text" id="nom" name="nom" required>
            
            <button type="submit">Jouer</button>
        </form>
		
        <div id="message"></div>
		
        <div id="game" style="display: none;">
			
			<header class="neon-border press-start-2p-regular"><h1>Bienvenue dans le jeu des couleurs</h1></header>
			<div id="status" class = "press-start-2p-regular">
			</div>

			<div id="simon-buttons">
				<button id="rouge" class="neon-border-red"></button>
				<button id="bleu" class="neon-border-blue"></button>
				<button id="vert" class="neon-border-green"></button>
				<button id="jaune" class="neon-border-yellow"></button>
				<audio id="idAudio" src="voice-message.mp3"></audio>
			</div>

			<button id="start" style="font-family: 'Press Start 2P';">Start</button>
			
			<button id="quitter" class = "press-start-2p-small">Quitter</button>

			<div id="niveau" class="neon-border-white press-start-2p-small">
				Niveau : 0
			</div>
			<div id = "timer" class="neon-border-white press-start-2p-small">
				00:00
			</div>
			<div id="score" class="neon-border-white press-start-2p-small">
				Score : 0
			</div>
		</div>	
    <script src="TP_jeu_simon.js"></script>
</body>


</html>

<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "jeu_simon";

// Connexion à MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = $conn->real_escape_string($_POST["nom"]);
    $prenom = $conn->real_escape_string($_POST["prenom"]);
    $niveau = intval($_POST["niveau"]);
    $score = intval($_POST["score"]);

    // Vérifier si l'utilisateur existe déjà
    $verif_sql = "SELECT * FROM utilisateur WHERE nom = '$nom' AND prenom = '$prenom'";
    $verif_result = $conn->query($verif_sql);

    if ($verif_result->num_rows > 0) {
        // Si l'utilisateur existe, mise à jour du niveau et du score
        $sql = "UPDATE utilisateur SET niveau = $niveau, score = $score WHERE nom = '$nom' AND prenom = '$prenom'";
        echo "✅ Mise à jour des scores pour $nom $prenom<br>";
    } else {
        // Sinon, on insère une nouvelle ligne
        $sql = "INSERT INTO utilisateur (nom, prenom, niveau, score) VALUES ('$nom', '$prenom', $niveau, $score)";
        echo "✅ Nouvel utilisateur enregistré : $nom $prenom<br>";
    }

    if ($conn->query($sql) === TRUE) {
        echo "✅ Données mises à jour avec succès !";
    } else {
        echo "❌ Erreur SQL : " . $conn->error;
    }
}

$conn->close();
?>
