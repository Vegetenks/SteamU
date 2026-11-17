import base64
import configparser
import mimetypes
import pathlib
import shlex

def _image(f):
    f = pathlib.Path(str(f).strip('"'))
    if f.suffix.lower() not in ('.png', '.svg', '.jpg', '.jpeg', '.webp', '.ico'):
        return None
    try:
        if f.stat().st_size > 2 * 1024 * 1024:
            return None
        return 'data:' + (mimetypes.guess_type(f.name)[0] or 'image/png') + ';base64,' + base64.b64encode(f.read_bytes()).decode('ascii')
    except OSError:
        return None

def resoudre(icone, racines):
    if not icone:
        return None
    if pathlib.Path(icone).is_absolute():
        return _image(icone)
    for racine in racines:
        fichiers = [f for f in racine.glob('*/**/apps/*') if f.stem == icone or f.name == icone]
        fichiers.sort(key=lambda f: ('scalable' not in f.parts, '256x256' not in f.parts, str(f)))
        for f in fichiers:
            image = _image(f)
            if image:
                return image
    return None

def chercher(home, appid, nom=""):
    import fiches_switch
    home = pathlib.Path(home)
    bases = [home / '.local/share/Steam/userdata', home / '.var/app/com.valvesoftware.Steam/.local/share/Steam/userdata']
    entree = None
    for base in bases:
        for compte in base.glob('*'):
            entree = fiches_switch.raccourcis_utilisateur(compte).get(int(appid))
            if entree:
                break
        if entree:
            break
    if not entree:
        entree = {"exe": "", "options": "", "nom": nom}
    partages = [home / '.local/share', home / '.local/share/flatpak/exports/share', pathlib.Path('/var/lib/flatpak/exports/share'), pathlib.Path('/usr/local/share'), pathlib.Path('/usr/share')]
    racines = [p / 'icons' for p in partages] + [home / '.icons']
    image = resoudre(entree.get('icone', ''), racines)
    if image:
        return image
    try:
        arguments = shlex.split(entree['exe'] + ' ' + entree['options'])
    except ValueError:
        return None
    directs = [pathlib.Path(a) for a in arguments if a.endswith('.desktop') and pathlib.Path(a).is_absolute()]
    programmes = {pathlib.Path(a).name for a in arguments if a and not a.startswith('-')}
    for f in directs + [f for p in partages for f in (p / 'applications').glob('*.desktop')]:
        c = configparser.ConfigParser(interpolation=None, strict=False)
        try:
            c.read(f, encoding='utf-8')
            d = c['Desktop Entry']
            execution = shlex.split(d.get('Exec', ''))
            correspond = (bool(nom) and any(v.casefold() == nom.casefold() for k, v in d.items() if k == 'name' or k.startswith('name['))) or f in directs or f.stem in programmes or (execution and pathlib.Path(execution[0]).name in programmes and pathlib.Path(execution[0]).name not in ('flatpak', 'env', 'sh', 'bash'))
            if correspond:
                image = resoudre(d.get('Icon', ''), racines)
                if image:
                    return image
        except (OSError, ValueError, configparser.Error, KeyError):
            continue
    return None
