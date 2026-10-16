# SteamU LED

Compagnon de SteamU pour le Legion Go 2 : il donne à chaque anneau de stick sa propre couleur (ambilight gauche/droite).
SteamU tourne sans privilège ; depuis Bazzite 44, InputPlumber ferme l'interface vendeur de la manette (chmod 000) et
la LED du noyau n'a qu'une couleur pour les deux anneaux. Ce greffon, lancé en root par Decky, fait seulement le pont.

Licence : AGPL-3.0-or-later.

## Ce qui tourne en root, et ce qu'il accepte

- Tout le code root tient dans `main.py` (bibliothèque standard Python seulement).
- Il crée `/run/steamu-led/` (root, 0755) et le socket `/run/steamu-led/led.sock`, propriété de l'utilisateur de Decky,
  mode 0600 : seuls cet utilisateur et root peuvent s'y connecter.
- Il n'accepte qu'un message de 12 octets exactement : pour chaque stick (gauche, droit) mode (0 éteint, 1 fixe,
  2 pulsation, 3 dynamique, 4 spirale, 255 inchangé), rouge, vert, bleu (0-255), luminosité et vitesse (0-100).
  Tout autre message est refusé (réponse 0) et ignoré.
- Il n'écrit que les rapports LED de la manette, sur le hidraw trouvé par sa forme (USB 17EF:61EB à 61EE, page d'usage
  vendeur 0xFFA0), au plus 30 fois par seconde. Aucun shell, aucun chemin reçu, aucune autre action, aucun réseau.
- Au déchargement : socket fermé et effacé, LED du noyau réactivée (`enabled` = true).

Le pire qu'un programme de l'utilisateur puisse faire par ce socket : changer la couleur des anneaux.
