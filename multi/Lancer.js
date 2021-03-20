class Lancer {
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
    this.boutonLancer = document.getElementById("bouton-lancer");
    this.formulaireJeu = document.getElementById("formulaire-jeu");
    this.formulaireJeu.addEventListener("submit", (evenementsubmit) => this.soumettreLancer(evenementsubmit))
    this.formulaireJeu.style.display = "none";
    this.champPoint = document.getElementById("champ-point-de-vie");
    this.champLancer = document.getElementById("champ-lancer");
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
            this.multiNode.posterVariableTextuelle(Lancer.MESSAGE.PLACE, JSON.stringify(message));

          } else if (this.listeJoueur[this.pseudonymeJoueur].place == 2) {
            this.listeJoueur[this.pseudonymeAutreJoueur].place = 1;

            let message = {
              pseudonyme: this.pseudonymeAutreJoueur,
              valeur: 1
            };
            this.multiNode.posterVariableTextuelle(Lancer.MESSAGE.PLACE, JSON.stringify(message));
          }
        } else {
          this.listeJoueur[this.pseudonymeJoueur].place = this.gererPremier();
        }
      }
      //console.log("place :" + this.listeJoueur[this.pseudonymeJoueur].place + "|||||||| place : " + this.listeJoueur[this.pseudonymeAutreJoueur].place)
      this.afficherPartie();
      this.definirPlaceAutreJoueur();
    }
  }

  apprendreAuthentification(pseudonyme) {
    console.log("Nouvel ami " + pseudonyme);
    this.ajouterJoueur(pseudonyme);
    this.pseudonymeAutreJoueur = pseudonyme;
  }

  ajouterJoueur(pseudonyme) {
    console.log("ajouterJoueur : " + pseudonyme);
    let numero = 0;
    this.listeJoueur[pseudonyme] = {
      point: Lancer.NOMBRE_POINT,
      place: numero
    };
  }

  recevoirVariable(variable) {
    console.log("Surcharge de recevoirVariable " + variable.cle + " = " + variable.valeur);
    let message = JSON.parse(variable.valeur);
    
    if (message.pseudonyme == this.pseudonymeJoueur) {
      switch (variable.cle) {
        case Lancer.MESSAGE.POINT:
          this.changerPointJoueur(message.valeur);
          break;
        case Lancer.MESSAGE.PLACE:
          this.changerPlace(message.valeur);
          break;
      }
    } else {
      switch (variable.cle) {
        case Lancer.MESSAGE.LANCER:
          this.subirLancer(message.valeur);
          break;
        case Lancer.MESSAGE.POINT:
          this.changerPointAutreJoueur(message.valeur);
          break;
      }
    }
  }

  changerPlace(valeur){
    console.log("changerPlaceJoueur()=>valeur" + valeur);
    this.listeJoueur[this.pseudonymeJoueur].place = valeur;
    console.log("place du joueur "+ this.pseudonymeJoueur +" : " + this.listeJoueur[this.pseudonymeJoueur].place);
    this.definirPlaceAutreJoueur();
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
    this.informationAutreJoueur.innerHTML =
      this.informationAutreJoueur.innerHTML.replace("{place-autre-joueur}", this.listeJoueur[this.pseudonymeAutreJoueur].place);
    this.champPointAutreJoueur.value = this.listeJoueur[this.pseudonymeAutreJoueur].point;
    this.champPoint.value = this.listeJoueur[this.pseudonymeJoueur].point;
    this.formulaireJeu.style.display = "block";
    if(this.listeJoueur[this.pseudonymeJoueur].place == 2){
      this.boutonLancer.disabled = true;
    }
  }

  definirPlaceAutreJoueur(){
    console.log("definirPlaceAutreJoueur" + this.listeJoueur[this.pseudonymeJoueur].place);
    if(this.listeJoueur[this.pseudonymeJoueur].place == 1){
      console.log("definir autre joueur sur 2");
      this.listeJoueur[this.pseudonymeAutreJoueur].place = 2;
    }
    else if(this.listeJoueur[this.pseudonymeJoueur].place == 2){
      console.log("definir autre joueur sur 1");
      this.listeJoueur[this.pseudonymeAutreJoueur].place = 1;
    }
    this.afficherPartie();
  }

  genererForceLancer() {
    let lancer1 = Math.floor(Math.random() * Lancer.FORCE_MAXIMUM) + 1;
    console.log("De un = " + lancer1);
    let lancer2 = Math.floor(Math.random() * Lancer.FORCE_MAXIMUM) + 1;
    console.log("De deux = " + lancer2);
    let lancer = lancer1 + lancer2;
    if (lancer1 == lancer2) {
      console.log("vous avez fait un double, vous pouvez rejouer.");
    }
    return lancer;
  }

  gererPremier() {
    return Math.floor(Math.random() * Lancer.NOMBRE_JOUEUR_REQUIS) + 1;
  }

  soumettreLancer(evenementsubmit) {
    console.log("soumettreLancer");
    evenementsubmit.preventDefault();
    let forceLancer = this.genererForceLancer();
    this.champLancer.value = forceLancer;
    let message = {
      pseudonyme: this.pseudonymeJoueur,
      valeur: forceLancer
    };
    this.multiNode.posterVariableTextuelle(Lancer.MESSAGE.LANCER, JSON.stringify(message));
    this.boutonLancer.disabled = true;
  }

  subirLancer(valeur) {
    console.log("subirLancer()=>valeur" + valeur);
    let message = {
      pseudonyme: this.pseudonymeJoueur,
      valeur: valeur
    };
    this.multiNode.posterVariableTextuelle(Lancer.MESSAGE.POINT, JSON.stringify(message));
    this.boutonLancer.disabled = false;
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

Lancer.NOMBRE_JOUEUR_REQUIS = 2;
Lancer.NOMBRE_POINT = 0;
Lancer.FORCE_MAXIMUM = 5;
Lancer.MESSAGE = {
  LANCER: "LANCER",
  POINT: "POINT",
  PLACE: "PLACE"
};

new Lancer();