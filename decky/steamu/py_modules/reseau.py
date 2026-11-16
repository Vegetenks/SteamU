from pathlib import Path

def etat(routes=Path('/proc/net/route'), cartes=Path('/sys/class/net')):
    try:
        lignes = routes.read_text().splitlines()[1:]
    except OSError:
        return None
    choix = []
    for ligne in lignes:
        champs = ligne.split()
        try:
            if champs[1] == '00000000' and champs[7] == '00000000' and int(champs[3], 16) & 1:
                choix.append((int(champs[6]), champs[0]))
        except (IndexError, ValueError):
            continue
    for _, nom in sorted(choix):
        if '/' in nom or nom in ('.', '..', 'lo'):
            continue
        carte = cartes / nom
        if not carte.exists():
            continue
        try:
            if (carte / 'carrier').read_text().strip() == '0':
                continue
        except OSError:
            pass
        return {'connected': True, 'filaire': not (carte / 'wireless').exists(), 'wifi': ''}
    return {'connected': False, 'filaire': False, 'wifi': ''}

DELAI_DNS = 5

def borner_resolution(delai=DELAI_DNS, en_ligne=None):
    import ipaddress, socket, threading
    en_ligne = en_ligne or (lambda: (etat() or {}).get('connected', True))
    origine = getattr(socket.getaddrinfo, 'origine', socket.getaddrinfo)

    def getaddrinfo(hote, *a, **k):
        nom = hote.decode() if isinstance(hote, bytes) else hote
        if nom is None or nom == 'localhost': return origine(hote, *a, **k)
        try:
            ipaddress.ip_address(nom.split('%')[0])
            return origine(hote, *a, **k)
        except ValueError:
            pass
        if not en_ligne(): raise socket.gaierror(socket.EAI_AGAIN, 'hors ligne')
        fin = {}
        def resoudre():
            try: fin['ok'] = origine(hote, *a, **k)
            except Exception as e: fin['erreur'] = e
        t = threading.Thread(target=resoudre, name='pcv-dns', daemon=True); t.start(); t.join(delai)
        if 'ok' in fin: return fin['ok']
        raise fin.get('erreur') or socket.gaierror(socket.EAI_AGAIN, 'résolution trop lente')
    getaddrinfo.origine = origine
    socket.getaddrinfo = getaddrinfo
