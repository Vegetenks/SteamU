import base64, io, json, os, pathlib, re, shutil, struct, tempfile, threading, time, unicodedata, urllib.parse
import urllib.request, wave, zipfile, zlib
from array import array

HOTE = "themeplaza.art"
RACINE = "https://" + HOTE
ECART_S = 0.35                       
DELAI_S = 20                         
MAX_PAGE = 3 * 1024 * 1024           
MAX_APERCU = 2 * 1024 * 1024         
MAX_ZIP = 12 * 1024 * 1024           
MAX_ENTREES = 40
MAX_CORPS = 4 * 1024 * 1024          
FICHIERS = {"body_LZ.bin": 0x150000, "bgm.bcstm": 0x340000, "bgm.ogg": 10 * 1024 * 1024, "info.smdh": 0x4000,
            "preview.png": MAX_APERCU, "name.txt": 1024}
TRIS = {"recents": "newest", "telecharges": "most-downloaded", "aimes": "most-liked"}

_verrou_reseau = threading.Lock()
_derniere = 0.0
_cache_pages, _cache_apercus = {}, {}
VUS = {}                             
ETAT = {"etape": "repos"}            
_verrou_install = threading.Lock()

class Refus(Exception):
    pass

DEBOGUEUR = "http://127.0.0.1:8080/json"

class Verification(Refus):
    pass

class SansVue(Refus):
    pass

def _adresse(chemin, params=None):
    assert chemin.startswith("/") and "//" not in chemin and ".." not in chemin
    return RACINE + chemin + ("?" + urllib.parse.urlencode(params) if params else "")

LIRE_JS = r"""(async (url, types, max) => {
  if (location.origin !== "https://themeplaza.art" || !url.startsWith("https://themeplaza.art/")) return { e: "origine" };
  let r;
  try { r = await fetch(url, { credentials: "same-origin", redirect: "follow", cache: "default" }); }
  catch (e) { return { e: "réseau : " + String(e && e.message || e).slice(0, 80) }; }
  if (new URL(r.url).origin !== "https://themeplaza.art") return { e: "redirection hors du site" };
  const t = (r.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (r.status !== 200) { try { await r.body?.cancel(); } catch (e) {} return { s: r.status, cf: !!r.headers.get("cf-mitigated") }; }
  if (!types.includes(t)) { try { await r.body?.cancel(); } catch (e) {} return { s: 200, t: t.slice(0, 40) }; }
  if (+(r.headers.get("content-length") || 0) > max) { try { await r.body?.cancel(); } catch (e) {} return { e: "gros" }; }
  const lecteur = r.body.getReader(), morceaux = []; let n = 0;
  for (;;) { const { done, value } = await lecteur.read(); if (done) break; n += value.length;
    if (n > max) { try { await lecteur.cancel(); } catch (e) {} return { e: "gros" }; } morceaux.push(value); }
  let bin = ""; for (const m of morceaux) for (let i = 0; i < m.length; i += 0x8000) bin += String.fromCharCode.apply(null, m.subarray(i, i + 0x8000));
  return { s: 200, t, n, b64: btoa(bin) };
})"""

def _vue():
    try:
        cibles = json.load(urllib.request.urlopen(DEBOGUEUR, timeout=3))
    except (OSError, ValueError):
        raise SansVue("débogueur de Steam injoignable")
    for c in cibles if isinstance(cibles, list) else []:
        u = urllib.parse.urlsplit(c.get("url") or "")
        w = urllib.parse.urlsplit(c.get("webSocketDebuggerUrl") or "")
        if c.get("type") == "page" and u.scheme == "https" and u.hostname == HOTE and u.port in (None, 443) \
                and w.scheme == "ws" and w.hostname in ("127.0.0.1", "localhost"):
            return c["webSocketDebuggerUrl"]
    raise SansVue("vue ThemePlaza absente")

def _obtenir(chemin, params, limite, types):
    global _derniere
    import websocket                  
    url = _adresse(chemin, params)
    with _verrou_reseau:
        attente = _derniere + ECART_S - time.monotonic()
        if attente > 0:
            time.sleep(attente)
        _derniere = time.monotonic()
    code = "%s(%s, %s, %d)" % (LIRE_JS, json.dumps(url), json.dumps(list(types)), int(limite))
    try:
        ws = websocket.create_connection(_vue(), suppress_origin=True, timeout=DELAI_S + 10)
    except SansVue:
        raise
    except Exception as e:
        raise SansVue("vue ThemePlaza injoignable (%s)" % type(e).__name__)
    try:
        ws.send(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": code, "awaitPromise": True, "returnByValue": True}}))
        while True:
            r = json.loads(ws.recv())
            if r.get("id") == 1:
                break
    except Exception as e:
        raise Refus("vue ThemePlaza : %s" % type(e).__name__)
    finally:
        ws.close()
    v = (r.get("result") or {}).get("result", {}).get("value")
    if not isinstance(v, dict):
        raise SansVue("vue ThemePlaza en cours de chargement")    
    if v.get("e") == "gros":
        raise Refus("fichier trop gros")
    if v.get("e") == "origine":
        raise SansVue("vue ThemePlaza hors du site")
    if v.get("e"):
        raise Refus(_texte(v["e"], 100))
    if v.get("s") != 200:
        if v.get("cf") or v.get("s") in (403, 503):
            raise Verification("ThemePlaza demande une vérification")
        raise Refus("ThemePlaza a répondu %d" % _entier(v.get("s")))
    if v.get("t") not in types:
        raise Refus("type de réponse inattendu : " + _texte(v.get("t"), 40))
    b64 = v.get("b64")
    if not isinstance(b64, str) or len(b64) > (limite + 2) // 3 * 4:
        raise Refus("fichier trop gros")
    try:
        octets = base64.b64decode(b64, validate=True)
    except ValueError:
        raise Refus("réponse illisible")
    if len(octets) > limite:
        raise Refus("fichier trop gros")
    return octets

def _texte(v, n=80):
    if not isinstance(v, str):
        return ""
    v = "".join(c for c in unicodedata.normalize("NFC", v) if unicodedata.category(c)[0] != "C" or c == " ")
    return re.sub(r"\s+", " ", v).strip()[:n]

def _entier(v):
    return v if isinstance(v, int) and not isinstance(v, bool) and 0 <= v < 10 ** 9 else 0

def _numero(v):
    v = str(v) if isinstance(v, (int, str)) and not isinstance(v, bool) else ""
    if not re.fullmatch(r"[1-9][0-9]{0,8}", v):
        raise Refus("numéro de thème invalide")
    return v

def _devalue(donnees):
    def v(i, p=0):
        if not isinstance(i, int) or i < 0 or i >= len(donnees) or p > 12:
            return None
        x = donnees[i]
        if isinstance(x, dict):
            return {k: v(j, p + 1) for k, j in x.items()}
        if isinstance(x, list):
            return None if x and isinstance(x[0], str) else [v(j, p + 1) for j in x]
        return x
    return v(0)

def recherche(texte="", page=1, tri="recents", musique=False):
    texte = _texte(texte, 60)
    page = max(1, min(int(page) if isinstance(page, (int, float)) else 1, 999))
    params = {"page": page, "sort": TRIS.get(tri, "newest")}
    if texte:
        params["query"] = texte
    if musique:
        params["fbgm"] = 1
    cle = json.dumps(params, sort_keys=True)
    if cle in _cache_pages and time.monotonic() - _cache_pages[cle][0] < 600:
        return _cache_pages[cle][1]
    brut = json.loads(_obtenir("/themes/__data.json", params, MAX_PAGE, ("application/json",)))
    res = None
    for n in brut.get("nodes") or []:
        if isinstance(n, dict) and isinstance(n.get("data"), list):
            d = _devalue(n["data"])
            if isinstance(d, dict) and isinstance(d.get("result"), dict) and isinstance(d["result"].get("items"), list):
                res = d["result"]
    if res is None:
        raise Refus("page de ThemePlaza illisible")
    themes = []
    for it in res["items"][:60]:
        if not isinstance(it, dict) or it.get("category") not in (None, "themes"):
            continue
        try:
            num = _numero(it.get("id"))
        except Refus:
            continue
        meta = it.get("metadata") if isinstance(it.get("metadata"), dict) else {}
        bgm = it.get("bgm") if isinstance(it.get("bgm"), dict) else {}
        t = {"id": num, "titre": _texte(it.get("title")) or "Thème " + num, "auteur": _texte(it.get("uploader"), 40),
             "description": _texte(it.get("description"), 240), "telechargements": _entier(it.get("downloads")),
             "aimes": _entier(it.get("likes")), "musique": bool(meta.get("enable_bgm")), "piste": _texte(bgm.get("track"), 80)}
        VUS[num] = {"titre": t["titre"], "auteur": t["auteur"]}
        themes.append(t)
    sortie = {"page": page, "pages": _entier(res.get("totalPages")), "total": _entier(res.get("total")), "themes": themes}
    if len(_cache_pages) > 60:
        _cache_pages.clear()
    _cache_pages[cle] = (time.monotonic(), sortie)
    return sortie

def apercu(numero):
    num = _numero(numero)
    if num not in _cache_apercus:
        png = _obtenir("/download/%s/preview" % num, None, MAX_APERCU, ("image/png",))
        if not png.startswith(b"\x89PNG\r\n\x1a\n"):
            raise Refus("aperçu qui n'est pas un PNG")
        if len(_cache_apercus) > 120:
            _cache_apercus.pop(next(iter(_cache_apercus)))
        _cache_apercus[num] = base64.b64encode(png).decode()
    return _cache_apercus[num]

def lire_archive(octets):
    if len(octets) > MAX_ZIP:
        raise Refus("archive trop grosse")
    try:
        z = zipfile.ZipFile(io.BytesIO(octets))
        infos = z.infolist()
    except (zipfile.BadZipFile, OSError, ValueError):
        raise Refus("archive illisible")
    if len(infos) > MAX_ENTREES:
        raise Refus("archive : trop de fichiers")
    for i in infos:
        n = i.filename
        if not n or n.startswith(("/", "\\")) or "\\" in n or "\0" in n or ".." in n.split("/") or re.match(r"^[A-Za-z]:", n):
            raise Refus("archive : chemin interdit")
        if (i.external_attr >> 16) & 0o170000 == 0o120000:
            raise Refus("archive : lien symbolique")
        if i.flag_bits & 1:
            raise Refus("archive chiffrée")
    fichiers = {}
    for i in infos:
        n = i.filename
        if n not in FICHIERS:        
            continue
        limite = FICHIERS[n]
        if i.file_size > limite:
            raise Refus("archive : %s trop gros" % n)
        try:
            with z.open(i) as f:
                d = f.read(limite + 1)
        except (zipfile.BadZipFile, OSError, ValueError, NotImplementedError, zlib.error, EOFError):
            raise Refus("archive : %s illisible" % n)
        if len(d) > limite:
            raise Refus("archive : %s trop gros" % n)
        fichiers[n] = d
    if "body_LZ.bin" not in fichiers:
        raise Refus("pas un thème de la 3DS (body_LZ.bin absent)")
    return fichiers

def lz11(d):
    if len(d) < 4 or d[0] != 0x11:
        raise Refus("body_LZ.bin n'est pas compressé en LZ11")
    n, i = d[1] | d[2] << 8 | d[3] << 16, 4
    if n == 0:
        n, i = struct.unpack_from("<I", d, 4)[0], 8
    if not 0 < n <= MAX_CORPS:
        raise Refus("corps du thème trop gros")
    out = bytearray()
    try:
        while len(out) < n:
            f = d[i]; i += 1
            for b in range(8):
                if len(out) >= n:
                    break
                if not f & (0x80 >> b):
                    out.append(d[i]); i += 1; continue
                b1 = d[i]; ind = b1 >> 4
                if ind == 0:
                    l, dist, i = ((b1 & 0xF) << 4 | d[i + 1] >> 4) + 0x11, ((d[i + 1] & 0xF) << 8 | d[i + 2]) + 1, i + 3
                elif ind == 1:
                    l, dist, i = ((b1 & 0xF) << 12 | d[i + 1] << 4 | d[i + 2] >> 4) + 0x111, ((d[i + 2] & 0xF) << 8 | d[i + 3]) + 1, i + 4
                else:
                    l, dist, i = ind + 1, ((b1 & 0xF) << 8 | d[i + 1]) + 1, i + 2
                if dist > len(out):
                    raise Refus("corps du thème corrompu")
                for _ in range(min(l, n - len(out))):
                    out.append(out[-dist])
    except IndexError:
        raise Refus("corps du thème tronqué")
    return bytes(out)

ZORDRE = [(sum(((k >> (2 * j)) & 1) << j for j in range(3)), sum(((k >> (2 * j + 1)) & 1) << j for j in range(3))) for k in range(64)]

def texture565(d, off, l, h, gl, gh):
    if off < 0 or off + l * h * 2 > len(d):
        raise Refus("texture hors du corps")
    lignes = [bytearray(gl * 3) for _ in range(gh)]
    i = off
    for ty in range(h // 8):
        for tx in range(l // 8):
            if tx * 8 >= gl or ty * 8 >= gh:
                i += 128; continue
            for x, y in ZORDRE:
                v = d[i] | d[i + 1] << 8; i += 2
                px, py = tx * 8 + x, ty * 8 + y
                if px < gl and py < gh:
                    lignes[py][px * 3:px * 3 + 3] = bytes(((v >> 11 & 31) * 255 // 31, (v >> 5 & 63) * 255 // 63, (v & 31) * 255 // 31))
    return lignes

def texture888(d, off, l, h):
    if off <= 0 or off + l * h * 3 > len(d):
        raise Refus("texture hors du corps")
    lignes = [bytearray(l * 3) for _ in range(h)]
    i = off
    for ty in range(h // 8):
        for tx in range(l // 8):
            for x, y in ZORDRE:
                lignes[ty * 8 + y][(tx * 8 + x) * 3:(tx * 8 + x) * 3 + 3] = bytes((d[i + 2], d[i + 1], d[i])); i += 3
    return lignes

def png(lignes):
    h, l = len(lignes), len(lignes[0]) // 3
    bloc = lambda t, x: struct.pack(">I", len(x)) + t + x + struct.pack(">I", zlib.crc32(t + x) & 0xFFFFFFFF)
    brut = b"".join(b"\0" + bytes(r) for r in lignes)
    return b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", struct.pack(">IIBBBBB", l, h, 8, 2, 0, 0, 0)) + bloc(b"IDAT", zlib.compress(brut, 6)) + bloc(b"IEND", b"")

def _u32(c, o):
    if o + 4 > len(c):
        raise Refus("en-tête du thème tronqué")
    return struct.unpack_from("<I", c, o)[0]

def _couleur(c, o):
    if o + 3 > len(c):
        return None
    return "#%02x%02x%02x" % tuple(c[o:o + 3])

def ecran(corps, type_off, cadre_off, tex_off, gl, fin):
    if _u32(corps, type_off) != 3:
        return None
    off = _u32(corps, tex_off)
    l = 512 if _u32(corps, cadre_off) == 3 or fin - off < 1024 * 256 * 2 else 1024
    return texture565(corps, off, l, 256, gl, 240)

_HAUT = [((b >> 4) ^ 8) - 8 for b in range(256)]
_BAS = [((b & 15) ^ 8) - 8 for b in range(256)]

def decoder_dsp(donnees, nb, coefs, h1=0, h2=0):
    sortie = array("h", bytes(2 * nb))
    k = p = 0
    while k < nb:
        entete = donnees[p]
        echelle = 1 << (entete & 15)
        paire = min(entete >> 4, 7)
        c1, c2 = coefs[2 * paire], coefs[2 * paire + 1]
        fin = min(14, nb - k)
        for j in range(fin):
            octet = donnees[p + 1 + (j >> 1)]
            q = _BAS[octet] if j & 1 else _HAUT[octet]
            s = ((q * echelle) << 11) + 1024 + c1 * h1 + c2 * h2 >> 11
            s = 32767 if s > 32767 else -32768 if s < -32768 else s
            sortie[k + j] = s
            h2, h1 = h1, s
        k += fin
        p += 8
    return sortie

def lire_bcstm(d):
    try:
        if len(d) < 0x40 or d[:4] != b"CSTM" or struct.unpack_from("<H", d, 4)[0] != 0xFEFF:
            raise Refus("bgm.bcstm illisible")
        blocs = {}
        for i in range(min(struct.unpack_from("<H", d, 0x10)[0], 8)):
            genre, _, decalage, _ = struct.unpack_from("<HHII", d, 0x14 + 12 * i)
            blocs[genre] = decalage
        if 0x4000 not in blocs or 0x4002 not in blocs:
            raise Refus("bgm.bcstm sans INFO ni DATA")
        ref = lambda o: struct.unpack_from("<HHi", d, o)[2]
        base = blocs[0x4000] + 8
        o_flux, o_canaux = ref(base), ref(base + 16)
        (codage, boucle, nc, _, freq, debut_b, fin_b, nb_blocs, taille_bloc, ech_bloc, taille_dernier,
         ech_dernier, taille_dernier_rempli) = struct.unpack_from("<BBBBIIIIIIIII", d, base + o_flux)
        debut_donnees = blocs[0x4002] + 8 + ref(base + o_flux + 0x30)
        total = (nb_blocs - 1) * ech_bloc + ech_dernier if nb_blocs else 0
        if not 0 < nc <= 16 or not 8000 <= freq <= 96000 or not 0 < total <= freq * 600 or codage not in (1, 2):
            raise Refus("bgm.bcstm : format non géré")
        fin = fin_b if 0 < fin_b <= total else total
        table = base + o_canaux
        canaux = []
        for c in range(min(nc, 2)):
            canal = table + ref(table + 4 + 8 * c)
            coefs, ctx = None, (0, 0)
            if codage == 2:
                o = canal + ref(canal)
                coefs = struct.unpack_from("<16h", d, o)
                ctx = struct.unpack_from("<hh", d, o + 34)
            morceaux = []
            for b in range(nb_blocs):
                if b < nb_blocs - 1:
                    o, n = debut_donnees + (b * nc + c) * taille_bloc, taille_bloc
                else:
                    o, n = debut_donnees + (nb_blocs - 1) * nc * taille_bloc + c * taille_dernier_rempli, taille_dernier
                morceaux.append(d[o:o + n])
            brut = b"".join(morceaux)
            if codage == 2:
                if len(brut) < (fin + 13) // 14 * 8:
                    raise Refus("bgm.bcstm tronqué")
                canaux.append(decoder_dsp(brut, fin, coefs, *ctx))
            else:
                if len(brut) < 2 * fin:
                    raise Refus("bgm.bcstm tronqué")
                a = array("h"); a.frombytes(brut[:2 * fin]); canaux.append(a)
        return canaux, freq, (debut_b if boucle and debut_b < fin else None), fin
    except (struct.error, IndexError):
        raise Refus("bgm.bcstm corrompu")

def wav(canaux, freq):
    if len(canaux) == 2:
        pcm = array("h", bytes(4 * len(canaux[0])))
        pcm[0::2], pcm[1::2] = canaux[0], canaux[1]
    else:
        pcm = canaux[0]
    o = io.BytesIO()
    with wave.open(o, "wb") as w:
        w.setnchannels(len(canaux)); w.setsampwidth(2); w.setframerate(freq); w.writeframes(pcm.tobytes())
    return o.getvalue()

def convertir(fichiers, ident, nom, auteur, numero, etape=lambda *a: None):
    sortie = {}
    corps = lz11(fichiers["body_LZ.bin"])
    etape("images", .55)
    fin_bas = _u32(corps, 0xC0) or len(corps)
    tex_bas = _u32(corps, 0x28)
    haut = ecran(corps, 0x0C, 0x10, 0x18, 412, tex_bas or len(corps))
    bas = ecran(corps, 0x20, 0x24, 0x28, 320, fin_bas if fin_bas > tex_bas else len(corps))
    j = {"nom": nom, "sous": ("de " + auteur + ", ThemePlaza") if auteur else "ThemePlaza", "famille": "3ds",
         "auteur": auteur, "source": "ThemePlaza", "lien": RACINE + "/item/" + numero}
    if _u32(corps, 0x2C) and _couleur(corps, _u32(corps, 0x30) + 3):
        j["accent"] = _couleur(corps, _u32(corps, 0x30) + 3)
    if _u32(corps, 0x6C) and _couleur(corps, _u32(corps, 0x70) + 7):
        j["accent2"] = _couleur(corps, _u32(corps, 0x70) + 7)
    if haut:
        sortie[ident + "-haut.png"] = png(haut); j["haut"] = ident + "-haut.png"
    elif _couleur(corps, _u32(corps, 0x14)):
        j["couleur"] = _couleur(corps, _u32(corps, 0x14))
    if bas:
        sortie[ident + "-bas.png"] = png(bas); j["bas"] = ident + "-bas.png"
    if _u32(corps, 0x3C):
        for cle, o in (("dossier", 0x40), ("dossier-ouvert", 0x44)):
            try:
                f = "%s-%s.png" % (ident, cle)
                sortie[f] = png(texture888(corps, _u32(corps, o), 128, 64)); j.setdefault("icones", {})[cle] = f
            except Refus:
                pass
    if fichiers.get("preview.png", b"").startswith(b"\x89PNG\r\n\x1a\n"):
        sortie[ident + "-apercu.png"] = fichiers["preview.png"]; j["apercu"] = ident + "-apercu.png"
    if "bgm.bcstm" in fichiers:
        etape("musique", .7)
        try:
            canaux, freq, debut, fin = lire_bcstm(fichiers["bgm.bcstm"])
            sortie[ident + ".wav"] = wav(canaux, freq); j["musique"] = ident + ".wav"
            if debut is not None:
                sortie[ident + ".wav.boucle"] = json.dumps({"debut": debut / freq, "fin": fin / freq, "source": "bgm.bcstm"}).encode()
        except Refus:
            pass
    if "musique" not in j and fichiers.get("bgm.ogg", b"").startswith(b"OggS"):
        sortie[ident + ".ogg"] = fichiers["bgm.ogg"]; j["musique"] = ident + ".ogg"
    sortie[ident + ".json"] = json.dumps(j, ensure_ascii=False, indent=2).encode()
    return sortie

def ranger(fichiers, dossier):
    dossier = pathlib.Path(dossier)
    dossier.mkdir(parents=True, exist_ok=True)
    tmp = pathlib.Path(tempfile.mkdtemp(prefix=".themeplaza-", dir=dossier))
    try:
        for n, d in fichiers.items():
            if not re.fullmatch(r"themeplaza-[0-9]+[a-z.-]*", n):
                raise Refus("nom de fichier inattendu")
            (tmp / n).write_bytes(d)
        for n in sorted(fichiers, key=lambda n: n.endswith(".json")):
            os.replace(tmp / n, dossier / n)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

def installer(numero, dossier_themes):
    num = _numero(numero)
    if num not in VUS:
        raise Refus("thème inconnu : cherche-le d'abord")
    if not _verrou_install.acquire(blocking=False):
        raise Refus("une installation est déjà en cours")
    try:
        meta = VUS[num]
        etape = lambda e, p: ETAT.update(etape=e, pct=round(p, 2))
        ETAT.clear(); ETAT.update(etape="telechargement", pct=0, id=num, nom=meta["titre"])
        octets = _obtenir("/download/%s" % num, None, MAX_ZIP, ("application/zip", "application/x-zip-compressed", "application/octet-stream"))
        etape("verification", .5)
        fichiers = lire_archive(octets)
        ident = "themeplaza-" + num
        sortie = convertir(fichiers, ident, meta["titre"], meta["auteur"], num, etape)
        etape("rangement", .95)
        ranger(sortie, dossier_themes)
        if ident + "-haut.png" in sortie:
            etape("agrandissement", .97)
            try:
                import agrandir
                agrandir.preparer(dossier_themes, ident + "-haut.png")
            except Exception:
                pass
        ETAT.update(etape="fini", pct=1, ident=ident)
        return ident
    except Exception as e:
        ETAT.update(etape="erreur", message=str(e)[:160] if isinstance(e, Refus) else "échec (%s)" % type(e).__name__,
                    verification=isinstance(e, Verification), vue=isinstance(e, SansVue))
        raise
    finally:
        _verrou_install.release()
