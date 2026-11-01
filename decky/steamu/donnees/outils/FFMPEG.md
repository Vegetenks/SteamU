# ffmpeg embarqué (audio seulement)

`ffmpeg-x86_64` : FFmpeg 7.1, compilé par `construire.sh` dans un conteneur Alpine 3.20 jetable
(`docker run --rm -v ./construire.sh:/construire.sh:ro -v ./sortie:/sortie --tmpfs /tmp:exec,size=3g alpine:3.20 sh /construire.sh`),
entièrement statique (musl), sans les parties GPL : **LGPL 2.1 ou plus récente**, avec libvorbis (BSD) et LAME (LGPL).
Source : https://ffmpeg.org/releases/ffmpeg-7.1.tar.xz, LAME 3.100 (sourceforge), paquets Alpine libogg et libvorbis.

Utilisé seulement quand la machine n'a pas son propre ffmpeg (SteamOS du Steam Deck) : main.py ajoute son dossier au
PATH du greffon. Sur Bazzite, le ffmpeg du système reste prioritaire. Sert à l'import des sons (importer.py,
empreinte_son.py, lecteurs.py) et à la conversion PNG vers JPEG des bornes.
