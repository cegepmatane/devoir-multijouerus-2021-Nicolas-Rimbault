class Attaque {
  constructor() {
    this.multiNode = new MultiNode();
    this.multiNode.confirmerConnexion = () => this.confirmerConnexion();
    this.multiNode.confirmerAuthentification = (autresParticipants) => this.confirmerAuthentification(autresParticipants);
    this.multiNode.apprendreAuthentification = (pseudonyme) => this.apprendreAuthentification(pseudonyme);
    this.multiNode.recevoirVariable = (variable) => this.recevoirVariable(variable);
    this.listeJoueur = {};
    this.pseudonymeJoueur = "";
    this.pseudonymeAutreJoueur = "";
    this.formulaireAuthentification = document.getElementById("formulaire-authentification");
    this.formulaireAuthentification.addEventListener("submit", (evenementsubmit) => this.soumettreAuthentificationJoueur(evenementsubmit))
    this.champPseudonyme = document.getElementById("champ-pseudonyme");
    this.boutonAuthentification = document.getElementById("bouton-authentification");
    this.formulaireJeu = document.getElementById("formulaire-jeu");
    this.formulaireJeu.addEventListener("submit", (evenementsubmit) => this.soumettreAttaque(evenementsubmit))
    this.formulaireJeu.style.display = "none";
    this.champPoint = document.getElementById("champ-point-de-vie");
    this.champAttaque = document.getElementById("champ-attaque");
    this.informationAutreJoueur = document.getElementById("information-autre-joueur");
    this.champPointAutreJoueur = document.getElementById("champ-point-de-vie-autre-joueur");
  }

  confirmerConnexion() {
    console.log("Je suis connecté.");
    //Le serveur nous confirme que nous sommes bien connecté, nous pouvons faire une demande d'authentification
    this.pseudonymeJoueur = this.champPseudonyme.value;
    this.multiNode.demanderAuthentification(this.pseudonymeJoueur);
  }

  confirmerAuthentification(autresParticipants) {
    console.log("Je suis authentifié.");
    console.log("Les autres participants sont " + JSON.stringify(autresParticipants));
    this.formulaireAuthentification.querySelector("fieldset").disabled = true;
    this.ajouterJoueur(this.pseudonymeJoueur);
    if (autresParticipants.length > 0) {
      this.pseudonymeAutreJoueur = autresParticipants[0];
      this.ajouterJoueur(autresParticipants[0]);
      for (let index = 0; index < 2; index++) {
        console.log("autre boucle");
        if (this.listeJoueur[this.pseudonymeJoueur].place != 0) {
          if (this.listeJoueur[this.pseudonymeJoueur].place == 1) {
            this.listeJoueur[this.pseudonymeAutreJoueur].place = 2;

            let message = {
              pseudonyme: this.pseudonymeAutreJoueur,
              valeur: 2
            };
            this.multiNode.posterVariableTextuelle(Attaque.MESSAGE.PLACE, JSON.stringify(message));

          } else if (this.listeJoueur[this.pseudonymeJoueur].place == 2) {
            this.listeJoueur[this.pseudonymeAutreJoueur].place = 1;

            let message = {
              pseudonyme: this.pseudonymeAutreJoueur,
              valeur: 1
            };
            this.multiNode.posterVariableTextuelle(Attaque.MESSAGE.PLACE, JSON.stringify(message));
          }
        } else {
          this.listeJoueur[this.pseudonymeJoueur].place = this.gererPremier();
        }
      }
      //console.log("place :" + this.listeJoueur[this.pseudonymeJoueur].place + "|||||||| place : " + this.listeJoueur[this.pseudonymeAutreJoueur].place)
      this.afficherPartie();
    }
  }

  apprendreAuthentification(pseudonyme) {
    console.log("Nouvel ami " + pseudonyme);
    this.ajouterJoueur(pseudonyme);
    this.pseudonymeAutreJoueur = pseudonyme;
    this.afficherPartie();
  }

  ajouterJoueur(pseudonyme) {
    console.log("ajouterJoueur : " + pseudonyme);
    let numero = 0;
    this.listeJoueur[pseudonyme] = {
      point: Attaque.NOMBRE_POINT,
      place: numero
    };
  }

  recevoirVariable(variable) {
    console.log("Surcharge de recevoirVariable " + variable.cle + " = " + variable.valeur);
    let message = JSON.parse(variable.valeur);
    
    if (message.pseudonyme == this.pseudonymeJoueur) {
      switch (variable.cle) {
        case Attaque.MESSAGE.POINT:
          this.changerPointJoueur(message.valeur);
          break;
        case Attaque.MESSAGE.PLACE:
          this.changerPlace(message.valeur);
          break;
      }
    } else {
      switch (variable.cle) {
        case Attaque.MESSAGE.ATTAQUE:
          this.subirAttaque(message.valeur);
          break;
        case Attaque.MESSAGE.POINT:
          this.changerPointAutreJoueur(message.valeur);
          break;
      }
    }
  }

  changerPlace(valeur){
    console.log("changerPlaceJoueur()=>valeur" + valeur);
    this.listeJoueur[this.pseudonymeJoueur].place = valeur;
    console.log("place du joueur "+ this.pseudonymeJoueur +" : " + this.listeJoueur[this.pseudonymeJoueur].place);
  }

  soumettreAuthentificationJoueur(evenementsubmit) {
    console.log("soumettreAuthentificationJoueur");
    evenementsubmit.preventDefault();
    //La demande de connexion au serveur est asynchrone, il faut attendre la réponse du serveur
    //pour faire une demande d'authentification
    this.multiNode.connecter();
    this.boutonAuthentification.disabled = true;
  }

  afficherPartie() {
    //console.log("place :" + this.listeJoueur[this.pseudonymeJoueur].place + "|||||||| place : " + this.listeJoueur[this.pseudonymeAutreJoueur].place);
    this.informationAutreJoueur.innerHTML =
      this.informationAutreJoueur.innerHTML.replace("{nom-autre-joueur}", this.pseudonymeAutreJoueur);
    this.champPointAutreJoueur.value = this.listeJoueur[this.pseudonymeAutreJoueur].point;
    this.champPoint.value = this.listeJoueur[this.pseudonymeJoueur].point;
    this.formulaireJeu.style.display = "block";
  }

  genererForceAttaque() {
    let attaque1 = Math.floor(Math.random() * Attaque.FORCE_MAXIMUM) + 1;
    console.log("De un = " + attaque1);
    let attaque2 = Math.floor(Math.random() * Attaque.FORCE_MAXIMUM) + 1;
    console.log("De deux = " + attaque2);
    let attaque = attaque1 + attaque2;
    if (attaque1 == attaque2) {
      console.log("vous avez fait un double, vous pouvez rejouer.");
    }
    return attaque;
  }

  gererPremier() {
    return Math.floor(Math.random() * Attaque.NOMBRE_JOUEUR_REQUIS) + 1;
  }

  soumettreAttaque(evenementsubmit) {
    console.log("soumettreAttaque");
    evenementsubmit.preventDefault();
    let forceAttaque = this.genererForceAttaque();
    this.champAttaque.value = forceAttaque;
    let message = {
      pseudonyme: this.pseudonymeJoueur,
      valeur: forceAttaque
    };
    this.multiNode.posterVariableTextuelle(Attaque.MESSAGE.ATTAQUE, JSON.stringify(message));
  }

  subirAttaque(valeur) {
    console.log("subirAttaque()=>valeur" + valeur);
    let message = {
      pseudonyme: this.pseudonymeJoueur,
      valeur: valeur
    };
    this.multiNode.posterVariableTextuelle(Attaque.MESSAGE.POINT, JSON.stringify(message));
  }

  changerPointJoueur(nouveauPoint) {
    console.log("changerPointJoueur()=>valeur" + nouveauPoint);
    this.listeJoueur[this.pseudonymeAutreJoueur].point += nouveauPoint;
    this.champPointAutreJoueur.value = this.listeJoueur[this.pseudonymeAutreJoueur].point;
    this.validerFinPartie();
  }

  changerPointAutreJoueur(nouveauPoint) {
    console.log("changerPointAutreJoueur()=>valeur" + nouveauPoint);
    this.listeJoueur[this.pseudonymeJoueur].point += nouveauPoint;
    this.champPoint.value = this.listeJoueur[this.pseudonymeJoueur].point;
    this.validerFinPartie();
  }

  validerFinPartie() {
    console.log("validerFinPartie");
    if (this.listeJoueur[this.pseudonymeJoueur].point >= 60) {
      alert("Vous avez gagné!");
    } else if (this.listeJoueur[this.pseudonymeAutreJoueur].point >= 60) {
      alert("Vous avez perdu!");
    }
  }
}

Attaque.NOMBRE_JOUEUR_REQUIS = 2;
Attaque.NOMBRE_POINT = 0;
Attaque.FORCE_MAXIMUM = 5;
Attaque.MESSAGE = {
  ATTAQUE: "ATTAQUE",
  POINT: "POINT",
  PLACE: "PLACE"
};

new Attaque();