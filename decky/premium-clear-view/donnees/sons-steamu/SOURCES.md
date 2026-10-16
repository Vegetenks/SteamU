# SteamU, sons originaux (premier essai, 14 octobre 2026)

> **Dans le greffon** (choix de l'auteur, 14/10) : les 10 sons d'interface de la variante B (« pop et bulles »),
> rangés sans le suffixe (`curseur-B.ogg` → `curseur.ogg`), les 5 ambiances et les 14 musiques d'applis.
> Les variantes A et C, `notes.txt`, `generer.py` et la page d'écoute restent dans `banc/sons-originaux/` de l'atelier.

## Comment c'est fait

Tout est **synthétisé de zéro** par `generer.py` (Python, numpy et scipy, encodage ogg par ffmpeg).
Aucun échantillon, aucune banque de sons, rien de Nintendo, rien de récupéré dans `ressources-privees/`.

- **Notes** : tempérament égal, La4 = 440 Hz, gamme de do majeur ; les sons d'interface n'utilisent que
  la pentatonique (do, ré, mi, sol, la). La liste des notes de chaque son est dans `notes.txt`.
- **Sons d'interface, 2e essai (14/10, « ça fait Windows » → sons de jouet)** : très courts et secs
  (curseur 75 ms, la plupart sous 0,25 s, réussite 0,77 s), réverbération presque nulle (0,25 s, 5 %).
  Primitives de `generer.py` (PRIM) : wood-block, toy piano, kalimba, « pop » de bouche, bulle, sifflet à coulisse,
  « bonk », carré filtré, triangle, et un petit claquement de bruit filtré (« clac », voulu : bois et cadenas).
  Les glissés partent d'une autre hauteur et finissent exactement sur la note visée.
  - A, jouet en bois : wood-block, toy piano, kalimba ;
  - B, pop et bulles : pops, bulles qui montent, sifflet à coulisse ;
  - C, chiptune doux : carré filtré et triangle, arpèges rapides.
  Un geste par action : tic (curseur), pop-ding (valider), boup qui descend (retour), éventail qui monte / redescend
  (ouvrir / fermer), flip (onglet), bonk (erreur), ding-ding (notification), mini fanfare (réussite), clac (verrou).
  Les notes de chaque variante sont dans `notes.txt`.
- **Enveloppe** : attaque en demi-cosinus de 1,5 ms, décroissance exponentielle, durée fixe, fondu de sortie de 10 ms,
  3 ms de silence avant et 15 ms après (le codec ogg ne fait ainsi aucun clic aux bords) ; passe-haut 25 Hz.
- **Réverbération des musiques** : réponse impulsionnelle fixe (bruit filtré, décroissant, graine fixe), 1,8 s, 30 %.
- **Musiques en boucle** (5 ambiances du menu, 14 musiques d'applis, 20 à 32 s) : même famille que l'ambiance 1
  (nappe très douce, basse feutrée, marimba, cloches), avec d'autres timbres de chant dans la même règle
  (piano feutré, vibraphone à léger battement de volume, guitare, flûte douce tenue : toujours des harmoniques justes).
  Chaque boucle est écrite en do puis transposée (« ton ») ; la queue de réverbération est repliée sur le début,
  donc aucune couture. Les notes, accords, tempo et tonalité de chacune sont dans `notes.txt`
  (notes en notation anglaise, dièses : A#5 = si bémol 5). L'ambiance 1 est identique, échantillon pour échantillon,
  à celle du premier essai.
- **Basse, correction du 14/10** (« boum » à moitié saccadés et qui grésillent) : mesuré, trois causes.
  1) Les notes de basse de même hauteur se recouvraient (résonance de 5 s) : selon leur phase, deux sinus graves
  s'annulent ou s'additionnent, d'où des « boum » inégaux, jusqu'à 7,6 dB d'écart (Place). La basse est maintenant
  monophonique : chaque note s'éteint quand la suivante arrive. Écart restant : 2,1 dB au plus.
  2) L'attaque de 4 ms et la fin coupée net des notes graves faisaient de petits clics (-55 à -65 dB au-dessus de 2 kHz
  sur la basse seule). Attaque de 15 ms et relâche de 25 ms en cosinus : -83 dB au plus après.
  3) L'encodage ogg q2 ajoutait un bruit de -24 à -32 dB dans le grave. Les boucles sont maintenant en q6 :
  -32 à -40 dB (les fichiers grossissent d'environ 70 %).
  S'y ajoute un passe-haut à 30 Hz appliqué par FFT (circulaire : la couture reste parfaite). Le reste de la musique
  ne change pas.
- **Applis couvertes** (d'après `greffon/themes.js`, ESPACES, et `greffon/console.js`, APPLIS) : Place des Mii, Mii Maker,
  Mes thèmes, eShop, Paramètres, Notifications, Amis, Bibliothèque, Captures (Album), Téléchargements, Profil,
  Page d'un jeu (fiche), Garde-robe des Mii, Personnaliser. L'accueil prend l'ambiance choisie. Écartés : casino, arcade,
  badges (casino) ; la recherche suit la Bibliothèque comme dans le greffon.
- **Éloignement des musiques Nintendo** (de mémoire, sans partition sous les yeux) : Mii Maker Wii U est un swing jazzy
  à quatre temps → ici une valse à trois temps en fa, avec des bips ; eShop Wii U est une bossa jazz aux accords
  enrichis → ici des accords parfaits simples, rythme pointé, en la ; Paramètres système → deux accords seulement,
  piano lent ; place Miiverse / place Mii → marimba et guitare en sol, rien de sifflé, aucune reprise du thème
  de la place Mii de la Wii. Toutes les mélodies ont été écrites pour l'occasion, sur la pentatonique pour l'essentiel.

## Licence

Sons, script et page : créés pour l'auteur, aucune source tierce, aucune dépendance de licence.
Libres de toute réutilisation dans SteamU (et donc publiables sur le Decky Store).

## Régénérer

    python3 -m venv /dev/shm/v && /dev/shm/v/bin/pip install numpy scipy
    /dev/shm/v/bin/python generer.py

Le script écrit les `.ogg` (sons q4, boucles q6), `notes.txt` et `ecoute.html` (à partir de `ecoute.modele.html`),
puis contrôle chaque fichier ogg décodé et affiche « TOUT OK » ou l'échec.

## Contrôles (faits sur les ogg décodés)

- crête : entre -14,1 (Notifications, voulue discrète) et -2,7 dBFS (exigé : sous -1) ;
- continu : moyenne < 1e-3 (mesuré : < 3e-5) ;
- bords : premier et dernier échantillon < 1e-2 (mesuré : < 1,2e-3 pour les sons d'interface) ;
- justesse : les pics forts du spectre sont à moins de 11 cents d'une note de la gamme ; aucune note hors gamme.
  Sons d'interface : une note de 30 ms a par nature un spectre large de ± 50 cents, on ne peut pas la mesurer
  au cent près sur le fichier ; la justesse se mesure donc sur le même son rendu avec des résonances dix fois
  plus longues : écart au plus 2,1 cents, et 87 % de l'énergie au moins sur un demi-ton de la gamme (le reste
  est le glissé, qui passe par les demi-tons voisins, voulu). Boucles : mesuré au-dessus de 250 Hz (une note
  répétée à tempo fixe fend son pic en raies de 1 à 2 Hz, ce qui fausse les cents dans le grave), et 98,7 %
  de l'énergie au moins dans la gamme.
- couture des boucles : le saut entre la fin et le début est plus petit que 99,9 % des pas entre échantillons voisins.
- clics dans le grave (automatique, toutes les boucles) : la basse seule est rendue à part ; tout contenu au-dessus de
  2 kHz y est un clic : exigé sous -60 dB (mesuré : -83 à -98 dB). Bruit d'encodage entre 40 et 300 Hz, entre le son
  avant encodage et l'ogg décodé : exigé sous -30 dB (mesuré : -32 à -40 dB).
- mélodie : aucun outil de comparaison avec une base de mélodies n'est disponible ici.
  Les sons d'interface ont de 1 à 8 notes très rapides (arpèges de do majeur), trop courts
  pour citer une mélodie ; les mélodies des boucles ont été écrites pour l'occasion et n'ont pas été
  comparées automatiquement aux musiques du menu Wii U, de la place Miiverse, de l'eShop,
  du Mii Maker ni du menu HOME 3DS. À vérifier à l'oreille.
