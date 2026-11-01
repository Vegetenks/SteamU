(() => {
  const PAGES = {
    systeme: "system",
    internet: "internet",
    stockage: "storage",
    affichage: "display",
    audio: "audio",
    controleur: "controller",
    clavier: "keyboard",
    personnalisation: "customization",
    accessibilite: "accessibility",
    notifications: "notifications",
    "contacts-et-chat": "friends",
    telechargements: "downloads",
    cloud: "cloud",
    "en-jeu": "ingame",
    compatibilite: "compatibility",
    famille: "family",
    "remote-play": "remoteplay",
    "voix-en-jeu": "ingamevoice",
    "enreg-de-parties": "gamerecording",
    accueil: "home",
    bibliotheque: "library",
    magasin: "store",
    interface: "interface",
    // (lot 2) l'hôte de chaque page nouvelle : Contacts et chat et Accueil, vidés ; Famille (sa liste de la famille reste) ;
    // Magasin (ses boutons « Gérer » restent). « a|b » : la première route dont la tuile existe (la page Alimentation de
    // Steam n'existe que sur un appareil à batterie, comme la console ; ailleurs, Accueil)
    "date-et-heure": "friends",
    batterie: "power|home",
    "controle-parental": "family",
    eshop: "store",
    // (lot 3) la page Contrôleur de Steam, sous le nom de la console (Switch : Manettes et capteurs)
    manettes: "controller"
  };
  const NOUVELLES = { "date-et-heure": "reglages.page.date", batterie: "reglages.page.batterie", "controle-parental": "reglages.page.parental", eshop: "reglages.page.eshop", manettes: "reglages.page.manettes" };
  const REGLAGES = {
    "accessibilite.echelle-de-l-interface": ["garder"],
    "accessibilite.mode-contraste": ["garder"],
    "accessibilite.reduction-des-mouvements": ["deplacer", "batterie", "t:Settings_ReduceMotion", "", "inter:accessibility_reduce_motion", "Settings_ReduceMotion_Description"],
    "accueil.afficher-seulement-les-mises-a-jour-de-produits-dans-la-sect": ["retirer", "", "t:HomeSettings_WhatsNewUpdatesOnly"],
    "accueil.jeux-masques-30": ["deplacer", "bibliotheque", "t:HomeSettings_HiddenGameCount_Plural|t:HomeSettings_HiddenGameCount", "reglages.nom.jeux_masques", "jeux-masques"],
    "accueil.mode-grande-illustration": ["retirer", "", "t:Settings_Customization_HomeScreen_BigArt"],
    "accueil.voir-du-contenu-personnalise-sur-la-page-d-accueil": ["retirer", "", "t:HomeSettings_ShowStoreContent"],
    // (29/10, hors de l'inventaire) l'explication de la section des nouveautés, dont tous les réglages sont retirés
    "accueil.explication-des-nouveautes": ["retirer", "", "t:HomeSettings_WhatsNew_Instructions"],
    "affichage.desactiver-la-liste-noire-des-gpu": ["retirer", "", "t:Settings_CEFDisableGPUBlocklist"],
    "affichage.mode-fenetre": ["retirer", "", "t:Settings_Display_BPM_Windowed"],
    "affichage.redimensionner-automatiquement-l-interface": ["garder"],
    "audio.activer-les-sons-de-l-interface": ["garder"],
    "audio.peripherique-d-entree": ["garder"],
    "audio.peripherique-de-sortie": ["garder"],
    "audio.volume-de-sortie": ["garder", "", "t:Audio_OutputVolume", "reglages.nom.volume_son"],
    "audio.volume-du-micro": ["garder", "", "t:Audio_InputVolume", "reglages.nom.volume_micro"],
    "bibliotheque.afficher-les-informations-de-compatibilite-avec-steam-deck-d": ["garder"],
    "bibliotheque.ajouter-a-la-bibliotheque": ["deplacer", "eshop", "t:Settings_Library_Add_To_Library", "", "bouton:activer:Settings_Library_ProdKey_AddGame", "Settings_Library_ProdKey_UseCode"],
    "bibliotheque.voir-le-nombre-de-copies-dans-la-bibliotheque-familiale-stea": ["avances", "", "t:Settings_Library_Show_Copy_Count"],
    "clavier.activer-le-clic-de-gachette": ["avances", "", "t:Settings_Keyboard_TrackpadingTyping_TriggerAsClick"],
    "clavier.configuration-actuelle": ["garder", "", "t:Settings_Keyboard_CurrentLayout", "reglages.nom.clavier_choisi"],
    "clavier.chat-rapide-8-phrases-option-1-a-8": ["avances", "", "s:Settings_Customization_ChatRadialMenu"],
    "clavier.emplacement-initial-bureau": ["avances", "", "t:Settings_Keyboard_Location_Desktop"],
    "clavier.emplacement-initial-overlay": ["avances", "", "t:Settings_Keyboard_Location_Overlay"],
    "clavier.retour-haptique": ["garder"],
    "clavier.selectionner-les-claviers-disponibles": ["garder", "", "t:Settings_Keyboard_SelectKeyboards", "reglages.nom.choisir_claviers"],
    "clavier.sensibilite-des-paves-tactiles-1x": ["avances", "", "t:Settings_Keyboard_TrackpadingTyping_InputScale"],
    "clavier.theme-actuel-du-clavier": ["avances", "", "t:Settings_Keyboard_Theme"],
    "clavier.voir-plus-de-themes-de-clavier": ["retirer", "", "t:Settings_Keyboard_PointsShop"],
    "cloud.activer-steam-cloud": ["garder"],
    "cloud.gestion-des-captures-d-ecran": ["retirer", "", "t:CloudSettings_ShowScreenshotManager"],
    "compatibilite.afficher-tous-les-outils-de-compatibilite": ["avances", "", "t:Settings_SteamPlay_ShowAll"],
    "compatibilite.outil-de-compatibilite-par-defaut": ["garder"],
    "contacts-et-chat.accrocher-les-chats-a-la-liste-de-contacts": ["retirer", "", "t:FriendSettings_DockChats"],
    "contacts-et-chat.activer-les-avatars-et-les-cadres-d-avatar-animes-dans-votre": ["retirer", "", "t:FriendSettings_AnimatedAvatars"],
    "contacts-et-chat.afficher-le-surnom-a-cote-du-nom-des-contacts": ["retirer", "", "t:FriendSettings_ParenthesizeNicknames"],
    "contacts-et-chat.desactiver-la-verification-orthographique-pour-les-messages-": ["retirer", "", "t:FriendSettings_DisableSpellcheck"],
    "contacts-et-chat.desactiver-les-effets-de-salle-animes": ["retirer", "", "t:FriendSettings_DisableRoomEffects"],
    "contacts-et-chat.filtre-de-chat": ["retirer", "", "t:Settings_InGame_ChatFiltering"],
    "contacts-et-chat.ignorer-le-statut-absent-e-dans-le-tri-des-contacts": ["retirer", "", "t:FriendSettings_SortFriendsByStatus"],
    "contacts-et-chat.liste-de-contacts-et-vue-du-chat-compactes": ["retirer", "", "t:FriendSettings_CompactFriendsAndChat"],
    "contacts-et-chat.masquer-les-contacts-appartenant-a-une-categorie-dans-les-li": ["retirer", "", "t:FriendSettings_HideCategorizedFriends"],
    "contacts-et-chat.masquer-les-contacts-hors-ligne-dans-les-categories": ["retirer", "", "t:FriendSettings_HideOfflineFriendsInCategories"],
    "contacts-et-chat.ne-pas-integrer-d-images-et-d-autres-fichiers-multimedias": ["retirer", "", "t:FriendSettings_DisableEmbedInlining"],
    "contacts-et-chat.ouvrir-une-nouvelle-fenetre-pour-les-nouveaux-chats-plutot-q": ["retirer", "", "t:FriendSettings_AlwaysNewChatWindow"],
    "contacts-et-chat.regrouper-les-contacts-par-jeux": ["retirer", "", "t:FriendSettings_CategorizeInGameFriendsByGame"],
    "contacts-et-chat.se-connecter-au-reseau-de-contacts-au-demarrage-de-steam": ["retirer", "", "t:FriendSettings_SignInToFriends"],
    "contacts-et-chat.se-souvenir-de-mes-chats-ouverts": ["retirer", "", "t:FriendSettings_RememberOpenChats"],
    "contacts-et-chat.zone-des-favoris-compacte": ["retirer", "", "t:FriendSettings_CompactQuickAccess"],
    "controleur.ajouter-un-nouveau-controleur": ["garder", "", "t:Settings_Controller_AddANewController", "reglages.nom.ajouter_manette", "", "", "reglages.nom.ajouter_manette"],
    "controleur.controleurs-connectes": ["garder"],
    "controleur.parametres-avances": ["garder", "", "t:Settings_Controller_Advanced", "", "", "", "reglages.nom.parametres_avances"],
    // (le grand bouton de la page Manettes, theme-wiiu.src.css)
    // (29/10, lot 3) « contrôleur » de Steam devient « manette » : lignes de la page d'une manette et des paramètres avancés
    // (même route), hors des choix du 28/10, toutes gardées
    "controleur.nom-de-la-manette": ["garder", "", "t:QuickAccess_Tab_ControllerSettings_Section_Controller_Personalized_Name", "reglages.nom.nom_manette"],
    "controleur.configurer-les-entrees": ["garder", "", "t:Settings_Controller_BindInput", "reglages.nom.configurer_manette"],
    "controleur.tester-les-entrees": ["garder", "", "t:Settings_Controller_TestInput", "reglages.nom.tester_manette"],
    "controleur.identifier": ["garder", "", "t:Settings_Controller_IdentifyController", "reglages.nom.identifier_manette"],
    "controleur.reinitialiser-les-entrees": ["garder", "", "t:Settings_Controller_ResetInput", "reglages.nom.reinitialiser_manette"],
    "controleur.delai-de-mise-en-veille": ["garder", "", "t:ControllerSettings_TurnOffTimeout", "reglages.nom.veille_manette"],
    "controleur.eteindre-en-quittant": ["garder", "", "t:Settings_Controller_TurnOffOnExit", "reglages.nom.eteindre_manettes"],
    "controleur.configuration-bouton-guide": ["garder", "", "t:Settings_Controller_ChordConfigEnable", "reglages.nom.guide_manettes"],
    "controleur.associer-bluetooth": ["garder", "", "t:Settings_Controller_PairBTController", "reglages.nom.associer_manette_bt"],
    // (la page Ajouter une manette)
    "en-jeu.activer-l-overlay-steam": ["retirer", "", "t:Settings_InGame_EnableOverlay"],
    "en-jeu.activer-la-ou-les-touche-s-du-moniteur-de-performances": ["retirer", "", "t:Settings_InGame_PerfOverlayShortcut"],
    "en-jeu.afficher-la-barre-d-outils-sous-forme-de-liste": ["retirer", "", "t:Settings_InGame_Overlay_ToolBar_ListView"],
    "en-jeu.afficher-le-moniteur-de-performances": ["avances", "", "t:Settings_InGame_PerformanceMonitor"],
    "en-jeu.afficher-une-notification-quand-une-capture-d-ecran-est-pris": ["garder"],
    "en-jeu.conserver-une-copie-externe-de-mes-captures-d-ecran": ["avances", "", "t:Settings_InGame_ScreenshotUncompressed"],
    "en-jeu.effacer-les-donnees-du-navigateur": ["avances", "", "t:Settings_InGame_WebBrowserDeleteData"],
    "en-jeu.emettre-un-son-quand-une-capture-d-ecran-est-prise": ["garder"],
    "en-jeu.mettre-a-l-echelle-le-texte-et-les-icones-de-l-overlay-steam": ["retirer", "", "t:Settings_InGame_ScaleInterface"],
    "en-jeu.ouvrir-l-overlay-big-picture-quand-un-controleur-est-utilise": ["retirer", "", "t:Settings_InGame_UseGamepadOverlay"],
    "en-jeu.page-d-accueil-du-navigateur-internet": ["avances", "", "t:Settings_InGame_WebBrowserHome"],
    "en-jeu.pings-de-navigateur-de-serveur-min": ["retirer", "", "t:Settings_InGame_ServerBrowserPings"],
    "en-jeu.preferences-de-la-barre-d-outils": ["retirer", "", "t:Settings_InGame_ToolbarPreferences"],
    "en-jeu.prendre-une-capture-d-ecran": ["retirer", "", "t:Settings_InGame_ScreenshotShortcut"],
    "en-jeu.raccourci-clavier-de-l-overlay": ["retirer", "", "t:Settings_InGame_OverlayShortcut"],
    "en-jeu.reseau-steam": ["avances", "", "t:Settings_InGame_SteamNetworking"],
    "en-jeu.restaurer-mes-anciens-onglets-dans-le-navigateur-au-demarrag": ["retirer", "", "t:Settings_InGame_Overlay_Restore_Browser_Tabs"],
    "enreg-de-parties.en-savoir-plus-sur-l-enregistrement-de-jeux": ["garder"],
    "enreg-de-parties.mode-d-enregistrement": ["garder"],
    "famille.famille-steam": ["deplacer", "controle-parental", "t:GameList_View_FamilyGroup"],
    "interface.activer-le-decodage-video-materiel-si-pris-en-charge-redemar": ["retirer", "", "t:Settings_Interface_EnableHardwareDecoding"],
    "interface.activer-le-defilement-fluide-pour-les-affichages-web-redemar": ["retirer", "", "t:Settings_Interface_EnableSmoothScrolling"],
    "interface.activer-le-mode-compatibilite-pour-les-menus-contextuels": ["retirer", "", "t:Settings_Interface_EnableContextMenuBlurDelay"],
    "interface.activer-le-rendu-accelere-par-gpu-pour-les-affichages-web-re": ["retirer", "", "t:Settings_Interface_EnableGPURendering"],
    "interface.choisir-le-compte-a-utiliser-a-chaque-lancement-de-steam": ["garder"],
    "interface.echelonner-texte-et-icones-selon-les-parametres-de-l-ecran-r": ["retirer", "", "t:Settings_Interface_ScaleText"],
    "interface.lancer-steam-au-demarrage-de-l-ordinateur": ["retirer", "", "t:Settings_Interface_RunAtStartup"],
    "interface.lancer-steam-en-mode-big-picture": ["retirer", "", "t:Settings_Interface_StartInBigPicture"],
    "interface.m-informer-des-ajouts-ou-modifications-apportees-a-mes-jeux-": ["deplacer", "notifications", "t:Settings_Interface_ShowMarketingMessages", "reglages.nom.nouveautes_jeux", "inter:enable_marketing_messages"],
    "interface.utiliser-le-client-steam-experimental-steamrt3": ["retirer", "", "t:Settings_Interface_SteamRTClient"],
    "internet.connexion-filaire-1": ["garder"],
    "internet.effacer-les-donnees-du-navigateur": ["avances", "", "t:Settings_Internet_WebBrowserDataDelete"],
    "internet.mode-hors-ligne": ["garder", "", "t:Settings_Internet_Go_Offline|t:BottomBar_Offline|t:AppDetails_SectionTitle_OfflineMode", "reglages.nom.sans_internet"],
    "internet.proxy-http": ["avances", "", "t:Settings_Internet_HTTPProxy"],
    "magasin.commentaires-steam-deck": ["deplacer", "eshop", "t:StoreSettings_SteamDeckFeedback_Label"],
    "magasin.contenu-de-la-liste-de-decouvertes": ["deplacer", "eshop", "t:StoreSettings_DiscoveryQueue_Label"],
    "magasin.contenu-de-la-liste-de-nouveautes": ["deplacer", "eshop", "t:StoreSettings_NewOnSteamQueue_Label"],
    "magasin.contenu-pour-adultes": ["deplacer", "controle-parental", "t:StoreSettings_MatureContent_Label", "", "bouton:web#MatureContentPreferences:StoreSettings_MatureContent_Button", "StoreSettings_MatureContent_Description"],
    "magasin.diffusions-en-direct": ["deplacer", "eshop", "t:StoreSettings_LiveBroadcasts_Label"],
    "magasin.exclure-du-magasin": ["deplacer", "eshop", "t:StoreSettings_Exclusions_Label"],
    "magasin.preferences-de-plateforme": ["deplacer", "eshop", "t:StoreSettings_Platforms_Label"],
    "notifications.afficher-les-bulles-de-notification": ["garder"],
    "notifications.des-soldes-commencent": ["avances", "", "k:6"],
    "notifications.emettre-un-son-lorsqu-une-bulle-de-notification-s-affiche": ["garder"],
    "notifications.en-sortie-de-veille-lorsque-plusieurs-comptes-sont-connectes": ["garder"],
    "notifications.je-connecte-ou-deconnecte-un-controleur": ["garder"],
    "notifications.je-debloque-un-succes": ["garder"],
    "notifications.je-recois-des-notifications-d-evenements-de-jeux": ["avances", "", "k:email-7"],
    "notifications.je-recois-des-recompenses-de-la-communaute-steam": ["avances", "", "k:email-8"],
    "notifications.je-recois-un-cadeau": ["avances", "", "k:2"],
    "notifications.je-recois-un-message-direct-dans-le-chat": ["garder"],
    "notifications.je-recois-un-nouvel-item-dans-mon-inventaire": ["avances", "", "k:4"],
    "notifications.je-recois-une-demande-de-contact": ["avances", "", "k:5"],
    "notifications.je-recois-une-invitation-a-rejoindre-un-playtest-ou-un-lance": ["avances", "", "k:28"],
    "notifications.je-recois-une-invitation-a-rejoindre-une-famille-steam": ["deplacer", "controle-parental", "k:16", "reglages.nom.notif_invitation", "notif:16", "NotificationsSettings_Column_Notification"],
    "notifications.je-recois-une-notification-de-salle-de-chat": ["garder"],
    "notifications.je-recois-une-notification-de-tour-steam": ["avances", "", "k:12"],
    "notifications.je-recois-une-offre-d-echange": ["avances", "", "k:9"],
    "notifications.je-recois-une-reponse-du-support-steam": ["avances", "", "k:11"],
    "notifications.la-batterie-d-un-controleur-est-faible": ["garder"],
    "notifications.ma-retrospective-steam-annuelle-est-disponible": ["avances", "", "k:email-10"],
    "notifications.se-desabonner-de-toutes-les-communications-marketing-par-e-m": ["avances", "", "s:Email_OptOut_Settings_Section_Title"],
    "notifications.un-article-de-ma-liste-de-souhaits-est-en-promotion": ["avances", "", "k:8"],
    "notifications.un-article-de-ma-liste-de-souhaits-est-maintenant-disponible": ["avances", "", "k:email-3"],
    "notifications.un-contact-rejoint-une-partie": ["garder"],
    "notifications.un-contact-se-connecte": ["garder"],
    "notifications.un-e-enfant-de-ma-famille-demande-du-temps-de-jeu-supplement": ["deplacer", "controle-parental", "k:18", "reglages.nom.notif_temps", "notif:18", "NotificationsSettings_Column_Notification"],
    "notifications.un-e-enfant-de-ma-famille-demande-l-acces-a-des-fonctionnali": ["deplacer", "controle-parental", "k:15", "reglages.nom.notif_acces", "notif:15", "NotificationsSettings_Column_Notification"],
    "notifications.un-e-enfant-de-ma-famille-fait-une-demande-d-achat": ["deplacer", "controle-parental", "k:17", "reglages.nom.notif_achat", "notif:17", "NotificationsSettings_Column_Notification"],
    "notifications.un-jeu-que-je-suis-recoit-du-nouveau-contenu-de-sa-feuille-d": ["avances", "", "k:email-14"],
    "notifications.un-passe-de-saison-que-je-possede-recoit-du-nouveau-contenu": ["avances", "", "k:email-13"],
    "notifications.une-demo-d-un-jeu-dans-ma-liste-de-souhaits-a-ete-publiee": ["avances", "", "k:email-11"],
    "notifications.une-discussion-a-laquelle-je-suis-abonne-e-a-recu-une-repons": ["avances", "", "k:3"],
    "notifications.une-equipe-de-developpement-envoie-une-copie-d-evaluation-de": ["avances", "", "k:email-5"],
    "notifications.une-equipe-de-developpement-ou-d-edition-que-je-suis-a-publi": ["avances", "", "k:email-12"],
    "notifications.une-equipe-de-developpement-ou-d-edition-que-je-suis-a-sorti": ["avances", "", "k:email-6"],
    "personnalisation.afficher-les-ecrans-de-veille-en-cours-de-jeu": ["deplacer", "batterie", "t:Settings_Customization_Screensaver_WhileInGame", "", "inter:screensaver_while_ingame"],
    "personnalisation.ecran-de-veille-actuel": ["garder", "", "t:Settings_Customization_CurrentScreensaver", "reglages.nom.ecran_veille"],
    "personnalisation.en-cas-d-inactivite-afficher-l-ecran-de-veille-apres": ["deplacer", "batterie", "t:Settings_Customization_Screensaver_Idle", "", "liste:system_idle_screensaver_ac_sec"],
    "personnalisation.inclure-les-visuels-des-jeux-lances-recemment": ["garder"],
    "personnalisation.inclure-mes-captures-d-ecran-recentes": ["garder"],
    "personnalisation.previsualiser-l-ecran-de-veille-choisi": ["deplacer", "batterie", "t:Settings_Customization_Preview", "", "bouton:veille:Settings_Customization_PreviewButton"],
    // (29/10, l'auteur)
    "personnalisation.utiliser-comme-video-de-sortie-de-veille": ["avances", "", "t:Settings_Customization_StartupVideo_Resume"],
    "personnalisation.video-de-demarrage-aleatoire": ["avances", "", "t:Settings_Customization_StartupVideo_Shuffle"],
    "personnalisation.voir-plus-de-videos-de-demarrage": ["retirer", "", "t:Settings_Customization_StartupVideo_PointsShop"],
    "remote-play.activer-les-options-avancees-de-l-hote": ["retirer", "", "t:Settings_RemotePlay_EnableServerConfig"],
    "remote-play.activer-les-options-avancees-du-client": ["retirer", "", "t:Settings_RemotePlay_EnableClientConfig"],
    "remote-play.activer-remote-play": ["garder"],
    "remote-play.appareil-remote-play-nom-d-hote-non-recopie": ["garder"],
    "remote-play.autoriser-la-connexion-directe-partage-d-ip": ["avances", "", "t:Settings_RemotePlay_P2PScope_Description"],
    "remote-play.code-de-connexion": ["avances", "", "t:Settings_RemotePlay_ConnectionPIN"],
    "remote-play.en-savoir-plus-sur-remote-play": ["garder"],
    "steamu.accueil-jeux": ["garder"],
    "steamu.apparence-auto": ["garder"],
    "steamu.apparence": ["garder"],
    "steamu.applis-devant": ["garder"],
    "steamu.applis": ["retirer"],
    "steamu.arcade": ["garder"],
    "steamu.art-auto": ["garder"],
    "steamu.badges": ["garder"],
    "steamu.credits": ["garder"],
    "steamu.diagnostic": ["garder"],
    "steamu.effacer": ["garder"],
    "steamu.film": ["garder"],
    "steamu.guides": ["garder"],
    "steamu.importer": ["garder"],
    "steamu.interface": ["deplacer", "steamu.debug"],
    "steamu.led-jeu": ["garder"],
    "steamu.led": ["garder"],
    "steamu.maj": ["garder"],
    "steamu.mode-console": ["garder"],
    "steamu.moteur-mii": ["garder"],
    "steamu.musique-casino": ["garder"],
    "steamu.paroles": ["garder"],
    "steamu.plugins-hors-store": ["garder"],
    "steamu.pieces": ["garder"],
    "steamu.reset": ["garder"],
    "steamu.signaler": ["garder"],
    "steamu.touches": ["garder"],
    "steamu.version": ["garder"],
    "stockage.stockage-disques-et-jeux-installes": ["garder"],
    "systeme.canal-de-mises-a-jour-du-client-steam": ["avances", "", "t:Settings_Beta_SteamUpdateChannel"],
    "systeme.format-24-heures": ["deplacer", "date-et-heure", "t:Settings_TimeAndDate_24HourClock", "", "ami:b24HourClock", "Settings_TimeAndDate_24HourClock_Description"],
    "systeme.informations-sur-l-environnement-d-execution-de-steam-runtim": ["avances", "", "t:Settings_SteamRuntimeSystemInformation"],
    "systeme.mises-a-jour-logicielles": ["garder"],
    "systeme.rapport-systeme": ["avances", "", "t:Settings_SystemReport_Title"],
    "systeme.selectionnez-la-langue-de-votre-choix": ["garder"],
    "systeme.utiliser-le-client-steam-experimental-steamrt3": ["avances", "", "t:Settings_Interface_SteamRTClient"],
    "telechargements.afficher-la-vitesse-de-telechargement-en-bits-par-seconde": ["retirer", "", "t:DownloadSettings_DisplayInBitsPerSecond"],
    "telechargements.autoriser-les-telechargements-en-cours-de-jeu": ["garder", "", "t:DownloadSettings_AllowDownloadDuringGameplay", "reglages.nom.telecharger_en_jouant"],
    "telechargements.autoriser-les-transferts-depuis-cet-appareil-vers": ["avances", "", "t:DownloadSettings_PeerContentServerMode"],
    "telechargements.limiter-la-vitesse-de-telechargement": ["garder"],
    "telechargements.programmer-les-mises-a-jour-automatiques": ["garder"],
    "telechargements.ralentir-les-telechargements-pendant-le-stream": ["avances", "", "t:DownloadSettings_ThrottleDuringStreaming"],
    "telechargements.region-de-telechargement": ["avances", "", "t:DownloadSettings_SelectRegion"],
    "telechargements.transfert-de-fichiers-de-jeux-via-le-reseau-local": ["avances", "", "t:DownloadSettings_PeerContent"],
    // (29/10, hors de l'inventaire) les deux lignes qui restent sur la page : elle reste donc dans le carrousel
    "voix-en-jeu.nom-du-micro-actuel": ["garder"],
    "voix-en-jeu.test-du-micro": ["garder"],
    "voix-en-jeu.volume-gain-en-entree": ["deplacer", "audio", "q:[role=slider]", "reglages.nom.ma_voix", "curseur:voice_mic_input_gain"],
    "voix-en-jeu.volume-gain-en-sortie": ["deplacer", "audio", "q:[role=slider]", "reglages.nom.voix_amis", "curseur:voice_speaker_output_gain"]
  };
  const LISTES = { system_idle_screensaver_ac_sec: [0, 60, 300, 900, 1800, 3600] };
  const regle = (id) => {
    const r = REGLAGES[id];
    return r && { id, choix: r[0], vers: r[1] || "", cle: r[2] || "", nom: r[3] || "", rendu: r[4] || "", aide: r[5] || "", bouton: r[6] || "" };
  };
  const tuileDe = (route) => window.document?.querySelector?.(`.PageListColumn [role=tab][id$="/settings/${route}"]`);
  let routes = {};
  const vide = () => {
    routes = {};
    bilans = {};
  };
  const routeDe = (p) => routes[p] ??= ((r) => r.find(tuileDe) || r[r.length - 1])((PAGES[p] || "").split("|"));
  const effet = (r) => r.choix === "deplacer" && (!PAGES[r.vers] || routeDe(r.vers) === routeDe(r.id.split(".")[0])) ? "garder" : r.choix;
  window.__pcvReglages = { REGLAGES, PAGES, NOUVELLES, LISTES, regle, effet };
  if (!window.document?.documentElement) return;
  const B = () => window.__pcvBridge, T = (k) => window.__pcvT?.(k) ?? k, son = (s) => window.__pcvSon?.(s);
  const plat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
  const ids = Object.keys(REGLAGES);
  const pageDe = (route) => Object.keys(NOUVELLES).find((p) => routeDe(p) === route) || Object.keys(PAGES).find((p) => PAGES[p] === route);
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const steam = (jeton) => B()?.texteSteam?.(jeton) ?? "";
  const routeActuelle = () => (/^\/settings\/([^/]+)/.exec(B()?.page?.() || "") || [])[1] || document.querySelector('.PageListColumn [role=tab][aria-selected=true][id*="/settings/"]')?.id.split("/settings/")[1].split("/")[0] || "";
  let cache = { langue: null, pages: {} };
  const reglesDe = (route) => {
    if (cache.langue !== document.documentElement.lang) cache = { langue: document.documentElement.lang, pages: {} };
    return cache.pages[route] ||= ids.filter((id) => PAGES[id.split(".")[0]] === route).map(regle).filter((r) => r.cle).flatMap((r) => r.cle.split("|").map((c) => {
      const genre = c[0], v = c.slice(2);
      if (genre === "k" || genre === "q") return { r, genre, v };
      const t = plat(B()?.texteSteam?.(v));
      if (!t) return null;
      const motif = new RegExp("^" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%\d\\\$s/g, ".+?"));
      return { r, genre, motif, exact: /%\d\$s/.test(t) ? null : t, n: t.length };
    }).filter(Boolean));
  };
  const fibre = (e) => {
    const k = Object.keys(e).find((x) => x.startsWith("__reactFiber"));
    return k ? e[k] : null;
  };
  const clesReact = (ligne) => {
    const s = /* @__PURE__ */ new Set();
    let f = fibre(ligne);
    for (let i = 0; f && i < 8; i++, f = f.return) if (f.key != null) s.add(String(f.key));
    return s;
  };
  const titreSection = (ligne) => {
    const id = ligne.parentElement?.closest("[aria-labelledby]")?.getAttribute("aria-labelledby");
    return plat(id && document.getElementById(id)?.textContent);
  };
  const reconnaitre = (ligne, regles) => {
    const lab = ligne.querySelector("{{FieldLabel@FieldLeftColumn}}"), desc = ligne.querySelector("{{FieldDescription@FieldLabel}}");
    const curseur = ligne.querySelector("[role=slider][aria-label]"), tl = plat(lab?.textContent), td = plat(desc?.textContent);
    const droite = [...ligne.querySelectorAll("{{FieldChildrenInner@FieldIcon}} > *")].find((e) => !e.firstElementChild);
    let mieux = null;
    for (const x of regles) {
      let cible = null, n = 0;
      if (x.genre === "t") {
        if (lab && x.motif.test(tl)) {
          cible = lab;
          n = x.n;
        } else if (desc && x.exact && td === x.exact) {
          cible = desc;
          n = x.n;
        } else if (droite && x.exact && plat(droite.textContent) === x.exact) {
          cible = droite;
          n = x.n;
        } else if (curseur && x.exact && plat(curseur.getAttribute("aria-label")) === x.exact) {
          cible = ligne.querySelector("{{FieldIcon@FieldLabel}}") || curseur;
          n = x.n;
        } else if (!lab && x.motif.test(plat(ligne.textContent))) {
          cible = ligne;
          n = 1;
        }
      } else if (x.genre === "s") {
        if (x.exact && titreSection(ligne) === x.exact) {
          cible = lab || ligne;
          n = 1;
        }
      } else if (x.genre === "k") {
        if (clesReact(ligne).has(x.v)) {
          cible = lab || ligne;
          n = 1e3;
        }
      } else if (ligne.querySelector(x.v)) {
        cible = lab || ligne;
        n = 1;
      }
      if (cible && n > (mieux?.n || 0)) mieux = { r: x.r, cible, n };
    }
    return mieux;
  };
  const LIGNE = "{{Field@FieldLabel}}";
  const lignesDe = (corps) => [...corps.querySelectorAll(LIGNE)].filter((e) => !e.closest(".pcv-bas") && !e.parentElement.closest(LIGNE));
  const toutes = ids.map(regle);
  let bilans = {};
  const bilan = (route) => bilans[route] ??= bilanDe(route);
  const bilanDe = (route) => {
    const p = Object.keys(PAGES).filter((x) => routeDe(x) === route), r = toutes, siens = r.filter((x) => p.includes(x.id.split(".")[0]));
    return { parti: siens.length > 0 && siens.every((x) => ["retirer", "deplacer"].includes(effet(x))), arrive: r.some((x) => effet(x) === "deplacer" && p.includes(x.vers)) };
  };
  let ouvert = "", vise = -1, vue = "";
  const lireClient = (nom) => B()?.reglageClient?.(nom);
  const INTER = '<div class="pcv-inter"><i></i><i></i></div>';
  const FLECHE = '<svg viewBox="0 0 36 36"><path d="M17.98 26.54L3.21 11.77H32.75L17.98 26.54Z" fill="currentColor"/></svg>';
  const LIRE = { inter: lireClient, ami: (n) => B()?.reglageAmi?.(n), notif: (n) => B()?.notifBulle?.(+n) };
  const BASCULER = { inter: (n) => B()?.ecrireReglageClient?.(n, !lireClient(n)), ami: (n) => B()?.ecrireReglageAmi?.(n, !LIRE.ami(n)), notif: (n) => B()?.basculerNotifBulle?.(+n) };
  const duree = (s) => {
    if (!s) return steam("Settings_System_IdleDisabled");
    const [n, u] = s % 3600 === 0 ? [s / 3600, "hour"] : s % 60 === 0 ? [s / 60, "minute"] : [s, "second"];
    try {
      return new Intl.NumberFormat(document.documentElement.lang || void 0, { style: "unit", unit: u, unitDisplay: "long" }).format(n);
    } catch (e) {
      return n + " " + u;
    }
  };
  const ligneVenue = (r) => {
    const [genre, nom, bouton] = r.rendu.split(":"), d = `class="pcv-ligne" data-rendu="${r.rendu}"`;
    const lib = `<div class="pcv-lib">${r.nom ? T(r.nom) : esc(steam(r.cle.split("|")[0].slice(2)))}${r.aide ? `<small>${esc(steam(r.aide))}</small>` : ""}</div>`;
    if (genre === "curseur") return `<div ${d}>${lib}<input class="pcv-curseur" type="range" min="0" max="100" step="1"></div>`;
    if (LIRE[genre]) return `<div ${d}>${lib}${INTER}</div>`;
    if (genre === "liste") return `<div ${d}>${lib}<button class="DialogButton pcv-liste" tabindex="-1"><span></span>${FLECHE}</button></div>`;
    if (genre === "bouton") return `<div ${d}>${lib}<button class="DialogButton" tabindex="-1">${esc(steam(bouton))}</button></div>`;
    return `<div ${d}>${lib}<b class="pcv-val"></b><button class="DialogButton" tabindex="-1">${T("reglages.jeux_masques.voir")}</button></div>`;
  };
  const remplir = (c) => c.style.setProperty("--v", c.value + "%");
  const actualiser = (bas) => {
    for (const l of bas.children) {
      const [genre, nom] = (l.dataset.rendu || "").split(":");
      if (genre === "curseur") {
        const v = Math.round(100 * (+lireClient(nom) || 0)), c = l.querySelector("input");
        if (document.activeElement !== c && +c.value !== v) c.value = v;
        remplir(c);
      } else if (LIRE[genre]) l.querySelector(".pcv-inter").classList.toggle("pcv-oui", !!LIRE[genre](nom));
      else if (genre === "liste") {
        const t = duree(+lireClient(nom) || 0), v = l.querySelector(".pcv-liste > span");
        if (v.textContent !== t) v.textContent = t;
      } else if (genre === "jeux-masques") {
        const n = String(B()?.jeuxMasques?.() ?? ""), v = l.querySelector(".pcv-val");
        if (v.textContent !== n) v.textContent = n;
      }
    }
  };
  const poserBas = (corps, route) => {
    const page = pageDe(route), venus = ids.map(regle).filter((r) => effet(r) === "deplacer" && r.vers === page);
    const avances = !!corps.querySelector('[data-pcv-choix="avances"]'), sig = venus.map((r) => r.id).join() + "|" + avances + "|" + (ouvert === route);
    let bas = corps.querySelector(":scope > .pcv-bas");
    if (!venus.length && !avances) {
      bas?.remove();
      return;
    }
    if (!bas) {
      bas = document.createElement("div");
      bas.className = "pcv-bas";
      bas.addEventListener("click", (e) => {
        const l = e.target.closest(".pcv-ligne");
        if (l && !e.target.matches("input")) activer(l, false);
      });
      bas.addEventListener("input", (e) => {
        const [, nom] = e.target.closest(".pcv-ligne").dataset.rendu.split(":");
        remplir(e.target);
        B()?.ecrireReglageClient?.(nom, +e.target.value / 100);
      });
    }
    if (bas.dataset.sig !== sig) {
      bas.dataset.sig = sig;
      bas.innerHTML = (ouvert === route ? "" : venus.map(ligneVenue).join("")) + (!avances ? "" : ouvert === route ? `<div class="pcv-ligne pcv-avances-bouton" data-rendu="avances"><div class="pcv-lib">${T("reglages.avances.fermer")}</div><i class="pcv-chevron pcv-retour"></i></div>` : `<div class="pcv-ligne pcv-avances-bouton" data-rendu="avances"><div class="pcv-lib">${T("reglages.avances")}<small>${T("reglages.avances.aide")}</small></div><i class="pcv-chevron"></i></div>`);
    }
    if (corps.lastElementChild !== bas) corps.append(bas);
    actualiser(bas);
    viser(bas);
  };
  const lignesBas = () => [...document.querySelectorAll(".pcv-bas > .pcv-ligne")];
  const viser = (bas) => {
    const l = lignesBas();
    if (vise >= l.length) vise = l.length - 1;
    l.forEach((x, i) => x.classList.toggle("gpfocus", i === vise));
    for (const x of bas?.parentElement ? lignesDe(bas.parentElement) : []) if (vise >= 0 !== x.hasAttribute("data-pcv-sans-focus")) x.toggleAttribute("data-pcv-sans-focus", vise >= 0);
  };
  const derniere = (corps) => {
    const l = [...lignesDe(corps), ...lignesDe(corps).length ? [] : corps.querySelectorAll(".Focusable, .DialogButton, button")].filter((x) => x.offsetParent && !x.closest(".pcv-bas"));
    return l[l.length - 1];
  };
  const donnerASteam = () => {
    const c = document.querySelector(".pcv-bas")?.parentElement;
    window.__pcvNoeud?.(c && derniere(c))?.BTakeFocus?.(4);
  };
  const premiereAvancee = () => document.querySelector('.DialogBody [data-pcv-choix="avances"]');
  const activer = (l, manette) => {
    const [genre, nom] = l.dataset.rendu.split(":"), route = routeActuelle();
    if (genre === "avances") {
      ouvert = ouvert === route ? "" : route;
      son("choisir");
      appliquer();
      if (manette && ouvert) {
        const p = premiereAvancee();
        vise = -1;
        viser(document.querySelector(".pcv-bas"));
        window.__pcvNoeud?.(p)?.BTakeFocus?.(4);
      } else if (manette) {
        donnerASteam();
        vise = lignesBas().length - 1;
        viser(document.querySelector(".pcv-bas"));
      }
      (ouvert ? premiereAvancee() : document.querySelector(".pcv-avances-bouton"))?.scrollIntoView?.({ block: "nearest" });
      return;
    }
    if (BASCULER[genre]) {
      BASCULER[genre](nom);
      son("choisir");
      setTimeout(() => actualiser(l.parentElement), 300);
    } else if (genre === "liste") ouvrirListe(l, nom);
    else if (genre === "bouton") {
      son("choisir");
      if (nom === "activer") B()?.activerProduit?.();
      else if (nom === "veille") B()?.apercuVeille?.();
      else B()?.ouvrirPrefsMagasin?.(nom.slice(4));
    } else if (genre === "jeux-masques") {
      son("choisir");
      B()?.ouvrirJeuxMasques?.();
    }
  };
  const ouvrirListe = (l, nom) => {
    const O = window.opener || window, D = O.DFL, R = O.SP_REACT;
    if (!D?.showContextMenu || !R) return;
    const v = +lireClient(nom) || 0, choix = [.../* @__PURE__ */ new Set([...LISTES[nom], v])].sort((a, b) => a - b);
    son("choisir");
    D.showContextMenu(
      R.createElement(
        D.Menu,
        { label: l.querySelector(".pcv-lib").textContent, cancelText: steam("Button_Cancel") || void 0 },
        choix.map((c) => R.createElement(D.MenuItem, { key: c, selected: c === v, onSelected: () => {
          B()?.ecrireReglageClient?.(nom, c);
          setTimeout(() => actualiser(l.parentElement), 300);
        } }, duree(c)))
      ),
      l.querySelector(".pcv-liste") || l
    );
  };
  const manetteDe = (x) => {
    for (let f = fibre(x), i = 0; f && i < 12; f = f.return, i++)
      for (const v of Object.values(f.memoizedProps || {})) if (v && typeof v === "object" && "eControllerType" in v) return v;
    return null;
  };
  const memeManette = (a, b) => a === b || !!a && !!b && ["unVendorID", "unProductID", "strName", "nXInputIndex"].every((k) => a[k] === b[k]);
  let peinture = null;
  const peindreManettes = (corps) => {
    const lab = [...corps.querySelectorAll("{{ControllerLabel@Dongle}}")];
    if (peinture || !lab.some((x) => !x.querySelector(":scope > .pcv-picto"))) return;
    peinture = Promise.resolve(window.__pcvJoueurs?.(true)).then((j) => {
      const brut = B()?.controllers?.() || [];
      lab.forEach((x, i) => {
        const c = manetteDe(x) || brut[i], p = (j || []).find((y) => memeManette(y.c, c))?.picto;
        if (p && !x.querySelector(":scope > .pcv-picto")) x.insertAdjacentHTML("beforeend", window.__pcvIcones?.svg(p, { classe: "pcv-picto" }) || "");
      });
    }).catch(() => {
    }).finally(() => {
      peinture = null;
    });
  };
  const TEXTES_AJOUT = { Settings_Controller_NoDongle: "reglages.texte.sans_puck", Settings_Controller_NoBluetooth: "reglages.texte.sans_bluetooth" };
  const typeDe = (x) => {
    for (let f = fibre(x), i = 0; f && i < 4; f = f.return, i++) if (f.memoizedProps && "controllerType" in f.memoizedProps) return f.memoizedProps.controllerType;
  };
  const peindreAjout = (corps) => {
    const rang = corps.querySelector("{{ControllerRecommendedImageRow@PairingController}}");
    if (!rang) return;
    for (const x of rang.querySelectorAll(":scope > svg:not(.pcv-picto):not([data-pcv-peint])")) {
      const t = typeDe(x);
      const h = t != null && window.__pcvIcones?.svg(window.__pcvPictoManette?.({ eControllerType: t }), { classe: "pcv-picto" });
      if (h) {
        x.insertAdjacentHTML("afterend", h);
        x.dataset.pcvPeint = "";
      }
    }
    for (const [j, k] of Object.entries(TEXTES_AJOUT)) {
      const t = steam(j);
      for (const d of t ? corps.querySelectorAll("div:not(:has(*))") : []) if (d.textContent === t) d.firstChild.nodeValue = T(k);
    }
  };
  const entrante = (b) => {
    for (let f = fibre(b), i = 0; f && i < 40; f = f.return, i++) if (f.memoizedProps && "in" in f.memoizedProps) return f.memoizedProps.in !== false;
    return true;
  };
  const corpsVu = () => {
    const l = [...document.querySelectorAll(".DialogContentTransition .DialogBody")], v = l.filter(entrante);
    return v[v.length - 1] || l[l.length - 1];
  };
  window.__pcvReglages.corps = corpsVu;
  let sigTuiles = "";
  const appliquer = () => {
    const tuiles = document.querySelectorAll('.PageListColumn [role=tab][id*="/settings/"]'), sig = document.documentElement.lang + [...tuiles].map((t) => t.id).join();
    if (sig !== sigTuiles) {
      sigTuiles = sig;
      vide();
      for (const t of tuiles) {
        const r = t.id.split("/settings/")[1].split("/")[0], n = NOUVELLES[pageDe(r)];
        const v = bilan(r);
        if (v.parti && !v.arrive) {
          if (t.dataset.pcvChoix !== "retirer") t.dataset.pcvChoix = "retirer";
        } else if (t.dataset.pcvChoix) delete t.dataset.pcvChoix;
        const e = n && [...t.querySelectorAll("*")].find((x) => !x.children.length && x.textContent.trim());
        if (e && e.textContent !== T(n)) e.firstChild.nodeValue = T(n);
      }
    }
    const route = routeActuelle();
    if (route !== vue) {
      vue = route;
      vise = -1;
    }
    if (!route) return;
    if (ouvert && ouvert !== route) ouvert = "";
    const corps = corpsVu();
    if (!corps) return;
    const regles = reglesDe(route);
    const neuves = lignesDe(corps).filter((l) => l.dataset.pcvRoute !== route).map((l) => {
      const m = reconnaitre(l, regles);
      return { l, m, taille: m?.r.nom && effet(m.r) === "garder" ? getComputedStyle(m.cible).fontSize : "" };
    });
    for (const { l, m, taille } of neuves) {
      l.dataset.pcvRoute = route;
      l.dataset.pcvChoix = m ? effet(m.r) : "garder";
      if (m) {
        l.dataset.pcvReglage = m.r.id;
        if (taille) {
          m.cible.style.setProperty("--pcv-nom-taille", taille);
          m.cible.dataset.pcvRenomme = T(m.r.nom);
        }
        const b = m.r.bouton && effet(m.r) === "garder" && l.querySelector(".DialogButton");
        if (b?.firstChild?.nodeType === 3) b.firstChild.nodeValue = T(m.r.bouton);
      }
    }
    for (const sec of corps.querySelectorAll("[role=region]")) {
      const c = new Set(lignesDe(sec).map((l) => l.dataset.pcvChoix));
      const v = c.size === 1 ? [...c][0] : c.size ? "mixte" : "";
      if (v && sec.dataset.pcvChoix !== v) sec.dataset.pcvChoix = v;
    }
    corps.classList.toggle("pcv-avances", ouvert === route);
    corps.classList.toggle("pcv-hote", bilan(route).parti);
    if (corps.classList.toggle("pcv-manettes", !!corps.querySelector('[data-pcv-reglage="controleur.ajouter-un-nouveau-controleur"]'))) peindreManettes(corps);
    peindreAjout(corps);
    poserBas(corps, route);
    window.__pcvParametres?.rafraichir?.();
  };
  let prevu = 0;
  window.__pcvReglagesObs?.disconnect();
  document.querySelectorAll(".pcv-bas").forEach((e) => e.remove());
  const QUOI = `${LIGNE}, [role=tab], .DialogBody`, NOTRES = "#pcv-parametres, #pcv-rangee-cadre, .pcv-bas";
  const pertinent = (r) => r.type === "attributes" ? r.target === document.body : !r.target.closest?.(`${LIGNE}, ${NOTRES}`) && [...r.addedNodes, ...r.removedNodes].some((n) => n.nodeType === 1 && (n.matches(QUOI) || !!n.querySelector(QUOI)));
  const observer = (l) => {
    if (!prevu && document.body.dataset.pcvPage === "parametres" && l.some(pertinent)) prevu = requestAnimationFrame(() => {
      prevu = 0;
      appliquer();
    });
  };
  window.__pcvReglagesObs = new MutationObserver(observer);
  window.__pcvReglagesObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-pcv-page"] });
  appliquer();
  (window.__pcvManette ||= {}).reglages = (b) => {
    if (document.body.dataset.pcvPage !== "parametres" || window.__pcvSteamU?.ouvert?.() || window.__pcvParametres?.couvre?.()) return false;
    const retour = b === 2 && vise < 0 && document.querySelector(".DialogBody .gpfocus") && document.querySelector(".DialogBody {{ControllerSettingsHeader@PairingController}} .DialogButton");
    if (retour) {
      retour.click();
      son("retour");
      return true;
    }
    const l = lignesBas(), bas = document.querySelector(".pcv-bas");
    if (!l.length) {
      vise = -1;
      return false;
    }
    if (vise < 0) {
      if (b !== 10) return false;
      let f = null;
      try {
        f = window.__pcvNav?.GetActiveNavTree()?.GetLastFocusedNode()?.Element || null;
      } catch (e) {
      }
      if (!f || !document.contains(f)) f = document.querySelector(".DialogBody .gpfocus");
      const der = derniere(bas.parentElement);
      if (!f || der && !der.contains(f)) return false;
      vise = 0;
      son("bouge");
      viser(bas);
      window.__pcvSuivre?.(l[0]);
      return true;
    }
    if (b === 9) {
      if (vise === 0) {
        vise = -1;
        viser(bas);
        donnerASteam();
      } else {
        vise--;
        viser(bas);
        window.__pcvSuivre?.(l[vise]);
      }
      son("bouge");
      return true;
    }
    if (b === 10) {
      if (vise < l.length - 1) {
        vise++;
        son("bouge");
        viser(bas);
        window.__pcvSuivre?.(l[vise]);
      } else son("bord");
      return true;
    }
    const ligne = l[vise];
    if (b === 1) {
      activer(ligne, true);
      return true;
    }
    if (b === 11 || b === 12) {
      const c = ligne.querySelector("input");
      if (c) {
        c.value = Math.max(0, Math.min(100, +c.value + (b === 12 ? 5 : -5)));
        remplir(c);
        B()?.ecrireReglageClient?.(ligne.dataset.rendu.split(":")[1], +c.value / 100);
        son("bouge");
      }
      return true;
    }
    vise = -1;
    viser(bas);
    return false;
  };
})();
