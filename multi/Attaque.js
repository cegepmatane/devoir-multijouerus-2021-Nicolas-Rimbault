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
    this.champPointDeVie = document.getElementById("champ-point-de-vie");
    this.champAttaque = document.getElementById("champ-attaque");
    this.informationAutreJoueur = document.getElementById("information-autre-joueur");
    this.champPointDeVieAutreJoueur = document.getElementById("champ-point-de-vie-autre-joueur");
    this.place = 0;
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
      this.afficherPartie();
    }
  }

  apprendreAuthentification(pseudonyme) {
    console.log("Nouvel ami " + pseudonyme + ": Joueur 2");
    this.ajouterJoueur(pseudonyme);
    this.pseudonymeAutreJoueur = pseudonyme;
    this.afficherPartie();
  }

  ajouterJoueur(pseudonyme) {
    console.log("ajouterJoueur : " + pseudonyme);
    
    this.listeJoueur[pseudonyme] = {
      pointDeVie: Attaque.NOMBRE_POINT_DE_VIE
    };

  }

  recevoirVariable(variable) {
    console.log("Surcharge de recevoirVariable " + variable.cle + " = " + variable.valeur);
    let message = JSON.parse(variable.valeur);
    if (message.pseudonyme == this.pseudonymeJoueur) {
      switch (variable.cle) {
        case Attaque.MESSAGE.POINT_DE_VIE:
          this.changerPointdeVieJoueur(message.valeur);
          break;
      }
    } else {
      switch (variable.cle) {
        case Attaque.MESSAGE.ATTAQUE:
          this.subirAttaque(message.valeur);
          break;
        case Attaque.MESSAGE.POINT_DE_VIE:
          this.changerPointdeVieAutreJoueur(message.valeur);
          break;
      }
    }
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
    this.informationAutreJoueur.innerHTML =
      this.informationAutreJoueur.innerHTML.replace("{nom-autre-joueur}", this.pseudonymeAutreJoueur);
    this.champPointDeVieAutreJoueur.value = this.listeJoueur[this.pseudonymeAutreJoueur].pointDeVie;
    this.champPointDeVie.value = this.listeJoueur[this.pseudonymeJoueur].pointDeVie;
    this.formulaireJeu.style.display = "block";
    console.log("le 1er joueur est le : " + this.gererPremier());
  }

  genererForceAttaque() {
    attaque1 = Math.floor(Math.random() * Attaque.FORCE_MAXIMUM) + 1;
    console.log("De un = "+ attaque1);
    attaque2 = Math.floor(Math.random() * Attaque.FORCE_MAXIMUM) + 1;
    console.log("De deux = "+ attaque2);
    attaque = attaque1 + attaque2;
    if (attaque1 == attaque2) {
      console.log("vous avez fait un double, vous pouvez rejouer.")
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
      valeur: this.listeJoueur[this.pseudonymeJoueur].pointDeVie - valeur
    };
    this.multiNode.posterVariableTextuelle(Attaque.MESSAGE.POINT_DE_VIE, JSON.stringify(message));
  }

  changerPointdeVieJoueur(nouveauPointDeVie) {
    console.log("changerPointdeVieJoueur()=>valeur" + nouveauPointDeVie);
    this.listeJoueur[this.pseudonymeJoueur].pointDeVie = nouveauPointDeVie;
    this.champPointDeVie.value = nouveauPointDeVie;
    this.validerFinPartie();
  }

  changerPointdeVieAutreJoueur(nouveauPointDeVie) {
    console.log("changerPointdeVieAutreJoueur()=>valeur" + nouveauPointDeVie);
    this.listeJoueur[this.pseudonymeAutreJoueur].pointDeVie = nouveauPointDeVie;
    this.champPointDeVieAutreJoueur.value = nouveauPointDeVie;
    this.validerFinPartie();
  }

  validerFinPartie() {
    console.log("validerFinPartie");
    if (this.listeJoueur[this.pseudonymeAutreJoueur].pointDeVie <= 0) {
      alert("Vous avez gagné!");
    } else if (this.listeJoueur[this.pseudonymeJoueur].pointDeVie <= 0) {
      alert("Vous avez perdu!");
    }
  }

}

Attaque.NOMBRE_JOUEUR_REQUIS = 2;
Attaque.NOMBRE_POINT_DE_VIE = 20;
Attaque.FORCE_MAXIMUM = 5;
Attaque.MESSAGE = {
  ATTAQUE: "ATTAQUE",
  POINT_DE_VIE: "POINT_DE_VIE"
};

new Attaque();