import base64, hashlib, json, os, pathlib, secrets, time, unicodedata, urllib.error, urllib.request

HOTE = "steamu-spotpass.steamu.workers.dev"
BASE = "https://" + HOTE   
FICHIER = "spotpass.json"
AGENT = "SteamU (plugin Decky ; SpotPass)"
DELAI_S = 15
MAX_OCTETS = 64 * 1024
LOT_MAX = 12

REGIONS = set((
    "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ "
    "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI "
    "GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI "
    "LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF "
    "PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL "
    "TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW").split())
TENUES = set((
    "bonnet cape casquette casquette-luigi chapeau-de-paille couronne echarpe ffl-bonnet-cotele ffl-capeline ffl-casque-velo "
    "ffl-casquette-sport ffl-gros-noeud ffl-haut-de-forme ffl-hijab ffl-oreilles-de-chat ffl-rubans gilet-croupier jupe-plissee lunettes-de-soleil "
    "noeud-papillon noeud-vert sac-a-dos").split())
RAISONS = {"pseudo", "phrase", "mii", "autre"}
POSES = {"pose%d" % k for k in range(1, 15)}
PHRASE_MAX = 32   
LANGUES = {"fr", "en", "es"}

def texte_bon(s, n):
    return (isinstance(s, str) and 0 < len(s.encode("utf-16-le")) // 2 <= n and s == unicodedata.normalize("NFC", s) and s[0] != " " and s[-1] != " "
            and all(c == " " or unicodedata.category(c)[0] in "LNP" for c in s))

def tenue_sure(ids):
    return [x for x in ids if isinstance(x, str) and x in TENUES][:4] if isinstance(ids, list) else []

def _crc(d):
    c = 0
    for x in d[:0x5E]:
        c ^= x << 8
        for _ in range(8):
            c = ((c << 1) ^ 0x1021) & 0xFFFF if c & 0x8000 else (c << 1) & 0xFFFF
    return c

def _nom(d):
    try:
        s = bytes(d[0x1A:0x2E]).decode("utf-16-le")
    except UnicodeDecodeError:
        return None
    n = s.split("\0", 1)[0]
    return n if s == n.ljust(10, "\0") else None

def preparer(b64):
    d = bytearray(base64.b64decode(b64, validate=True))
    if len(d) != 96:
        raise ValueError("mii")
    d[0x04:0x0C] = bytes(8); d[0x10:0x16] = bytes(6); d[0x1A:0x2E] = bytes(20); d[0x48:0x5C] = bytes(20)
    d[0x5E:0x60] = _crc(d).to_bytes(2, "big")
    return base64.b64encode(bytes(d)).decode()

def mii_bon(b64):
    try:
        d = base64.b64decode(b64, validate=True)
    except (ValueError, TypeError):
        return False
    return (len(d) == 96 and not any(d[0x04:0x0C]) and not any(d[0x10:0x16]) and not any(d[0x48:0x5C])
            and _nom(d) == "" and _crc(d) == int.from_bytes(d[0x5E:0x60], "big"))

def pseudo_bon(s):
    return texte_bon(s, 10) and len(s.encode("utf-16-le")) <= 20 and "%" not in s and "\\" not in s

def nommer(b64, pseudo):
    d = bytearray(base64.b64decode(b64)); n = pseudo.encode("utf-16-le")
    d[0x1A:0x1A + len(n)] = n
    d[0x5E:0x60] = _crc(d).to_bytes(2, "big")
    return base64.b64encode(bytes(d)).decode()

_P = 2 ** 255 - 19
_L = 2 ** 252 + 27742317777372353535851937790883648493
_D = -121665 * pow(121666, _P - 2, _P) % _P
_GX = 15112221349535400772501151409588531511454012693041857206046113283949847762202
_GY = 46316835694926478169428394003475163141307993866256225615783033603165251855960
_G = (_GX, _GY, 1, _GX * _GY % _P)

def _ajouter(a, b):
    A, B = (a[1] - a[0]) * (b[1] - b[0]) % _P, (a[1] + a[0]) * (b[1] + b[0]) % _P
    C, D = 2 * a[3] * b[3] * _D % _P, 2 * a[2] * b[2] % _P
    E, F, G, H = B - A, D - C, D + C, B + A
    return (E * F % _P, G * H % _P, F * G % _P, E * H % _P)

def _fois(s, p):
    q = (0, 1, 1, 0)
    while s:
        if s & 1:
            q = _ajouter(q, p)
        p, s = _ajouter(p, p), s >> 1
    return q

def _coder(p):
    z = pow(p[2], _P - 2, _P)
    x, y = p[0] * z % _P, p[1] * z % _P
    return (y | (x & 1) << 255).to_bytes(32, "little")

def _secret(graine):
    h = hashlib.sha512(graine).digest()
    a = int.from_bytes(h[:32], "little") & ((1 << 254) - 8) | (1 << 254)
    return a, h[32:], _coder(_fois(a, _G))

def publique(graine):
    return _secret(graine)[2]

def signer(graine, message):
    a, prefixe, pub = _secret(graine)
    r = int.from_bytes(hashlib.sha512(prefixe + message).digest(), "little") % _L
    R = _coder(_fois(r, _G))
    h = int.from_bytes(hashlib.sha512(R + pub + message).digest(), "little") % _L
    return R + ((r + h * a) % _L).to_bytes(32, "little")

def _decoder(o):
    y = int.from_bytes(o, "little")
    signe, y = y >> 255, y & ((1 << 255) - 1)
    if y >= _P:
        raise ValueError("point invalide")
    x2 = (y * y - 1) * pow(_D * y * y + 1, _P - 2, _P) % _P
    x = pow(x2, (_P + 3) // 8, _P)
    if (x * x - x2) % _P:
        x = x * pow(2, (_P - 1) // 4, _P) % _P
    if (x * x - x2) % _P or (x == 0 and signe):
        raise ValueError("point invalide")
    if x & 1 != signe:
        x = _P - x
    return (x, y, 1, x * y % _P)

def verifier(pub, message, signature):
    try:
        if len(pub) != 32 or len(signature) != 64 or int.from_bytes(signature[32:], "little") >= _L:
            return False
        R, A = _decoder(signature[:32]), _decoder(pub)
        if _coder(_fois(8, A)) == _coder((0, 1, 1, 0)):
            return False   
        h = int.from_bytes(hashlib.sha512(signature[:32] + pub + message).digest(), "little") % _L
        return _coder(_fois(int.from_bytes(signature[32:], "little"), _G)) == _coder(_ajouter(R, _fois(h, A)))
    except (TypeError, ValueError):
        return False

def _b64u(o):
    return base64.urlsafe_b64encode(o).decode().rstrip("=")

def _graine(dossier, creer=True):
    f = pathlib.Path(dossier) / FICHIER
    try:
        return base64.b64decode(json.loads(f.read_text())["graine"])
    except (OSError, ValueError, KeyError):
        if not creer:
            return None
    g = secrets.token_bytes(32)
    f.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(f, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as o:
        json.dump({"graine": base64.b64encode(g).decode()}, o)
    return g

def _signe(graine, *parties):
    return _b64u(signer(graine, "\n".join(str(p) for p in parties).encode()))

class _SansRedirection(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None

_ouvreur = None

def _requete(methode, chemin, corps=None):
    global _ouvreur
    if _ouvreur is None:
        from infinimii import _contexte   
        _ouvreur = urllib.request.build_opener(urllib.request.HTTPSHandler(context=_contexte()), _SansRedirection())
    req = urllib.request.Request(BASE + chemin, method=methode, data=None if corps is None else json.dumps(corps).encode(),
                                 headers={"User-Agent": AGENT, "Accept": "application/json", "Content-Type": "application/json"})
    try:
        with _ouvreur.open(req, timeout=DELAI_S) as r:
            o = r.read(MAX_OCTETS + 1)
    except urllib.error.HTTPError as e:
        o = e.read(4096)
        try:
            return {"erreur": str(json.loads(o)["erreur"])[:20]}
        except (ValueError, KeyError, TypeError):
            return {"erreur": "service"}   
    except (OSError, ValueError):
        return {"erreur": "reseau"}
    if len(o) > MAX_OCTETS:
        return {"erreur": "reseau"}
    try:
        r = json.loads(o)
    except ValueError:
        return {"erreur": "reseau"}
    return r if isinstance(r, dict) else {"erreur": "reseau"}

def envoyer(dossier, mii, pseudo, phrase, region, tenue="", pose=""):
    try:
        mii = preparer(mii)
    except (ValueError, TypeError):
        return {"erreur": "mii"}
    tenue = ",".join(tenue_sure(str(tenue).split(",")))
    if not pseudo_bon(pseudo):
        return {"erreur": "pseudo"}
    if not texte_bon(phrase, PHRASE_MAX):
        return {"erreur": "phrase"}
    if region not in REGIONS:
        return {"erreur": "region"}
    if pose != "" and pose not in POSES:
        return {"erreur": "pose"}
    g = _graine(dossier)
    cle, date = _b64u(publique(g)), int(time.time())
    sig = _signe(g, "steamu-carte-v2", cle, date, mii, pseudo, phrase, region, tenue, pose)
    return _requete("PUT", "/carte", {"v": 2, "cle": cle, "date": date, "mii": mii, "pseudo": pseudo, "phrase": phrase, "region": region, "tenue": tenue,
                                      "pose": pose, "sig": sig})

def recu_bon(m):
    if not isinstance(m, dict):
        return None
    visiteur = "id" in m
    cle = ("v-" + m["id"]) if visiteur and isinstance(m.get("id"), str) else m.get("cle")
    if not (isinstance(cle, str) and 0 < len(cle) <= 43 and all(c.isascii() and (c.isalnum() or c in "-_") for c in cle)):
        return None
    pose = m.get("pose", "")   
    if not (pseudo_bon(m.get("pseudo")) and texte_bon(m.get("phrase"), PHRASE_MAX) and m.get("region") in REGIONS and mii_bon(m.get("mii"))
            and (pose == "" or pose in POSES)):
        return None
    tenue = m.get("tenue", "")
    return {"cle": cle, "mii": nommer(m["mii"], m["pseudo"]), "pseudo": m["pseudo"], "phrase": m["phrase"], "region": m["region"],
            "tenue": tenue_sure(tenue.split(",")) if isinstance(tenue, str) else [], "pose": pose, "visiteur": visiteur}

VISITEUR_SIGNE = ("id", "mii", "pseudo", "region", "phrases")

def message_visiteur(v):
    return b"SteamU visiteur v1\n" + json.dumps(v, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()

def visiteur_signe(m, langue):
    from eshop import CLE_SOURCES   
    try:
        v = {k: m[k] for k in VISITEUR_SIGNE}
        if isinstance(v["phrases"], dict) and verifier(CLE_SOURCES, message_visiteur(v), base64.b64decode(m["signature"], validate=True)):
            return {**v, "phrase": v["phrases"].get(langue)}
    except (TypeError, KeyError, ValueError):
        pass
    return None

def lot(dossier, langue="fr"):
    g = _graine(dossier, creer=False)
    if g is None:
        return {"erreur": "inconnue"}
    langue = langue if langue in LANGUES else "en"
    r = _requete("GET", f"/lot?cle={_b64u(publique(g))}&langue={langue}")
    if "erreur" in r:
        return r
    moi, vus, l = _b64u(publique(g)), set(), []
    liste = lambda x: x[:LOT_MAX] if isinstance(x, list) else []
    cartes = [m for m in liste(r.get("cartes")) if not (isinstance(m, dict) and "id" in m)]
    for m in cartes + [visiteur_signe(m, langue) for m in liste(r.get("visiteurs"))]:
        m = recu_bon(m)
        if m and m["cle"] != moi and m["cle"] not in vus:
            vus.add(m["cle"]); l.append(m)
    return {"jour": r.get("jour")[:10] if isinstance(r.get("jour"), str) else "", "mii": l[:LOT_MAX]}

def signaler(dossier, cible, raison):
    g = _graine(dossier, creer=False)
    if g is None or raison not in RAISONS or not isinstance(cible, str) or cible.startswith("v-"):
        return {"erreur": "paquet"}   
    cle, date = _b64u(publique(g)), int(time.time())
    return _requete("POST", "/signaler", {"cle": cle, "date": date, "cible": cible, "raison": raison, "sig": _signe(g, "steamu-signaler-v1", cle, date, cible, raison)})

def effacer(dossier):
    g = _graine(dossier, creer=False)
    if g is None:
        return {"ok": True}
    cle, date = _b64u(publique(g)), int(time.time())
    r = _requete("POST", "/effacer", {"cle": cle, "date": date, "sig": _signe(g, "steamu-effacer-v1", cle, date)})
    if r.get("ok"):
        (pathlib.Path(dossier) / FICHIER).unlink(missing_ok=True)   
    return r

RARES = "visiteurs-rares.json"
LIVRES = pathlib.Path(__file__).resolve().parents[1] / "donnees/visiteurs" / RARES
LOCAUX = {"s%d" % n for n in range(1, 14)}
RARES_RELIRE_S = 6 * 3600
RARES_MAX = 20
GESTES = set((
    "saluer applaudir content danser parler hausser sauter pencher pousser accroupi somnoler frotter yeux photo lancer balayer "
    "frapper atterrir projeter charger garde coupPied brandir brasTendus deposer viser pointer trancher impatient doigt boule "
    "peur victoire ange tapi etirer chanter assisSol").split())
ENTREES = {"marche", "course", "ciel"}   
_rares_lu = 0

def message_signe(prefixe):
    return lambda date, donnees: prefixe + json.dumps({"date": date, "donnees": donnees}, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()

message_rares = message_signe(b"SteamU visiteurs-rares v1\n")

def rare_bon(v):
    if not isinstance(v, dict):
        return None
    i, nom, gestes, phrase = v.get("id"), v.get("nom"), v.get("gestes"), v.get("phrase", {})
    periode = isinstance(v.get("debut"), int) and isinstance(v.get("fin"), int) and v["debut"] < v["fin"]
    if i in LOCAUX:   
        return {"id": i, "local": True, "debut": v["debut"], "fin": v["fin"]} if periode and set(v) == {"id", "debut", "fin"} else None
    if not (isinstance(i, str) and 0 < len(i) <= 32 and all(c in "abcdefghijklmnopqrstuvwxyz0123456789-" for c in i)
            and pseudo_bon(nom) and mii_bon(v.get("mii")) and periode
            and isinstance(gestes, list) and 0 < len(gestes) <= 6 and all(g in GESTES for g in gestes)
            and v.get("entree") in ENTREES and v.get("arrivee", "victoire") in GESTES and isinstance(v.get("aura"), str) and len(v["aura"]) == 7 and v["aura"][0] == "#"
            and all(c in "0123456789abcdef" for c in v["aura"][1:])
            and isinstance(phrase, dict) and all(k in LANGUES and texte_bon(t, PHRASE_MAX) for k, t in phrase.items())):
        return None
    return {"id": i, "nom": nom, "mii": nommer(v["mii"], nom), "tenue": tenue_sure(v.get("tenue")), "debut": v["debut"], "fin": v["fin"],
            "gestes": gestes,
            "entree": v["entree"], "arrivee": v.get("arrivee", "victoire"), "aura": v["aura"], "phrase": phrase}

def _verifier_signe(f, message, date_gardee):
    from eshop import CLE_SOURCES   
    if not (isinstance(f, dict) and isinstance(f.get("date"), int) and f["date"] >= date_gardee and isinstance(f.get("donnees"), dict)
            and verifier(CLE_SOURCES, message(f["date"], f["donnees"]), base64.b64decode(f["signature"], validate=True))):
        raise ValueError("fichier refusé")

def _lire_json(f):
    try:
        j = json.loads(pathlib.Path(f).read_text())
    except (OSError, ValueError):
        return {}
    return j if isinstance(j, dict) else {}

def _relire_signe(dossier, nom, chemin, message, garde):
    fichier = pathlib.Path(dossier) / nom
    r = _requete("GET", chemin)
    try:
        _verifier_signe(r, message, garde.get("date") if isinstance(garde.get("date"), int) else 0)
    except Exception:
        return garde
    fichier.parent.mkdir(parents=True, exist_ok=True)
    tmp = fichier.with_suffix(".tmp")
    tmp.write_text(json.dumps(r, ensure_ascii=False))
    os.replace(tmp, fichier)
    return r

def visiteurs_rares(dossier):
    global _rares_lu
    fichier = pathlib.Path(dossier) / RARES
    garde, livre = _lire_json(fichier), _lire_json(LIVRES)
    try:   
        _verifier_signe(livre, message_rares, (garde.get("date") if isinstance(garde.get("date"), int) else -1) + 1)
        garde = livre
    except Exception:
        pass
    if time.time() - _rares_lu >= RARES_RELIRE_S:
        _rares_lu = time.time()
        garde = _relire_signe(dossier, RARES, "/visiteurs-rares", message_rares, garde)
    l = (garde.get("donnees") or {}).get("visiteurs") if isinstance(garde.get("donnees"), dict) else None
    return {"date": garde.get("date", 0), "visiteurs": [x for x in map(rare_bon, l[:RARES_MAX] if isinstance(l, list) else []) if x]}

ANNONCES = "annonces.json"
ANNONCES_MAX = 20   
message_annonces = message_signe(b"SteamU annonces v1\n")

def annonces(dossier):
    garde = _relire_signe(dossier, ANNONCES, "/annonces-signees", message_annonces, _lire_json(pathlib.Path(dossier) / ANNONCES))
    l = garde.get("donnees", {}).get("annonces") if isinstance(garde.get("donnees"), dict) else None
    return {"annonces": l[:ANNONCES_MAX] if isinstance(l, list) else []}
