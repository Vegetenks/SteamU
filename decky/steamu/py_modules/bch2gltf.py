import argparse, json, math, struct, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bch

FLOAT, USHORT, UINT = 5126, 5123, 5125
ENVELOPPE = {0: 33071, 1: 33071, 2: 10497, 3: 33648}   

class Gltf:
    def __init__(self):
        self.g = dict(asset=dict(version="2.0", generator="steam-theme outils/badge-arcade/bch2gltf.py"),
                      scene=0, scenes=[dict(nodes=[])], nodes=[], meshes=[], materials=[], textures=[], images=[],
                      samplers=[], accessors=[], bufferViews=[], buffers=[], animations=[])
        self.bin = bytearray()
        self.cache_tex = {}

    def vue(self, octets, cible=None):
        while len(self.bin) % 4: self.bin.append(0)
        v = dict(buffer=0, byteOffset=len(self.bin), byteLength=len(octets))
        if cible: v['target'] = cible
        self.bin.extend(octets); self.g['bufferViews'].append(v)
        return len(self.g['bufferViews']) - 1

    def accesseur(self, valeurs, typ, comp=FLOAT, cible=None, minmax=False, norm=False):
        n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[typ]
        plat = [x for v in valeurs for x in (v if n > 1 else [v])]
        f = {FLOAT: 'f', USHORT: 'H', UINT: 'I', 5121: 'B'}[comp]
        a = dict(bufferView=self.vue(struct.pack('<%d%s' % (len(plat), f), *plat), cible), componentType=comp,
                 count=len(valeurs), type=typ)
        if norm: a['normalized'] = True
        if minmax:
            a['min'] = [min(v[i] for v in valeurs) for i in range(n)] if n > 1 else [min(valeurs)]
            a['max'] = [max(v[i] for v in valeurs) for i in range(n)] if n > 1 else [max(valeurs)]
        self.g['accessors'].append(a)
        return len(self.g['accessors']) - 1

    def noeud(self, **k):
        self.g['nodes'].append({kk: v for kk, v in k.items() if v is not None})
        return len(self.g['nodes']) - 1

    def enfant(self, parent, n):
        if parent is None: self.g['scenes'][0]['nodes'].append(n)
        else: self.g['nodes'][parent].setdefault('children', []).append(n)

    def texture(self, R, nom, mapper):
        if not nom or nom not in R['textures']: return None
        cle = (id(R), nom, mapper.get('wrapU'), mapper.get('wrapV'))
        if cle in self.cache_tex: return self.cache_tex[cle]
        t = R['textures'][nom]; w, h = t['largeur'], t['hauteur']
        img = t['_img']()   
        self.g['images'].append(dict(name=nom, mimeType='image/png', bufferView=self.vue(bch.png(img, w, h))))
        filtre = 9729 if mapper.get('mag', 1) == 1 else 9728
        self.g['samplers'].append(dict(magFilter=filtre, minFilter=9729, wrapS=ENVELOPPE.get(mapper.get('wrapU', 2), 10497),
                                       wrapT=ENVELOPPE.get(mapper.get('wrapV', 2), 10497)))
        self.g['textures'].append(dict(name=nom, source=len(self.g['images']) - 1, sampler=len(self.g['samplers']) - 1))
        self.cache_tex[cle] = len(self.g['textures']) - 1
        return self.cache_tex[cle]

    def glb(self):
        g = dict(self.g)
        if not g['animations']: del g['animations']
        for k in ('samplers', 'textures', 'images', 'materials'):
            if not g[k]: del g[k]
        while len(self.bin) % 4: self.bin.append(0)
        g['buffers'] = [dict(byteLength=len(self.bin))]
        js = json.dumps(g, ensure_ascii=False, separators=(',', ':')).encode()
        while len(js) % 4: js += b' '
        return (struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(self.bin)) +
                struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(self.bin), 0x004E4942) + bytes(self.bin))

def couleur01(c): return [round(x / 255, 4) for x in c]

def desc_tev(m):
    et = []
    for s in m['tev']:
        src, op, cb, cst, sc = s['source'], s['operande'], s['combine'], s['constante'], s['echelle']
        et.append(dict(src_rgb=[(src >> (4 * k)) & 15 for k in range(3)], src_a=[(src >> (16 + 4 * k)) & 15 for k in range(3)],
                       op_rgb=[(op >> (4 * k)) & 15 for k in range(3)], op_a=[(op >> (12 + 4 * k)) & 7 for k in range(3)],
                       comb_rgb=cb & 15, comb_a=(cb >> 16) & 15,
                       constante=[(cst >> (8 * k)) & 255 for k in range(4)],
                       echelle_rgb=1 << (sc & 3), echelle_a=1 << ((sc >> 16) & 3)))
    tb = m['tev_tampon']
    bl = m['melange_cfg']; at = m['alpha_test']; prof = m['profondeur']
    return dict(etages=et,
                tampon=dict(maj_rgb=[bool(tb >> (8 + k) & 1) for k in range(4)], maj_a=[bool(tb >> (12 + k) & 1) for k in range(4)],
                            initial=[(m['frag'].get(0xfd, 0) >> (8 * k)) & 255 for k in range(4)]),
                constantes=[list(m['couleurs']['constante%d' % k]) for k in range(6)], affectation=m['affect_constantes'],
                couleurs={k: list(v) for k, v in m['couleurs'].items()},
                eclairage=dict(fragment=bool(m['drapeaux'] & 1), sommet=bool(m['drapeaux'] & 2), hemi=bool(m['drapeaux'] & 4)),
                melange=dict(eq_rgb=bl & 7, eq_a=(bl >> 8) & 7, src_rgb=(bl >> 16) & 15, dst_rgb=(bl >> 20) & 15,
                             src_a=(bl >> 24) & 15, dst_a=(bl >> 28) & 15, actif=bool(m['couleur_op'] & 0x100)),
                alpha_test=dict(actif=bool(at & 1), fonction=(at >> 4) & 7, ref=(at >> 8) & 255),
                profondeur=dict(test=bool(prof & 1), fonction=(prof >> 4) & 7, ecriture=bool(prof & 0x1000)),
                culling=m['culling'] & 3)

def ajouter_modele(G, R, parent, prefixe='', exclure_silhouettes=True):
    M = R['modeles'][0]
    os_noeuds = {}
    noms = [o['nom'] for o in M['os']]
    for i, o in enumerate(M['os']):
        rx, ry, rz = o['rotation']
        def q_axe(ax, a):
            s = math.sin(a / 2); c = math.cos(a / 2)
            return [s if ax == 0 else 0, s if ax == 1 else 0, s if ax == 2 else 0, c]
        def mul(a, b):
            ax, ay, az, aw = a; bx, by, bz, bw = b
            return [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx,
                    aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz]
        q = mul(q_axe(2, rz), mul(q_axe(1, ry), q_axe(0, rx)))
        n = G.noeud(name=prefixe + o['nom'], translation=o['translation'] if any(o['translation']) else None,
                    rotation=[round(x, 7) for x in q] if any(abs(x) > 1e-7 for x in (rx, ry, rz)) else None,
                    scale=o['echelle'] if o['echelle'] != [1.0, 1.0, 1.0] else None,
                    extras=dict(meta=o['meta']) if o['meta'] else None)
        os_noeuds[o['nom']] = n
        G.enfant(parent if o['parent'] < 0 else os_noeuds[noms[o['parent']]], n)
    mats = []
    for m in M['materiaux']:
        mp = m['mappers']
        tex = [G.texture(R, m['textures'][k], mp[k]) for k in range(3)]
        pica = desc_tev(m)
        pica['textures'] = tex
        pica['coords'] = m['coords']
        blend = pica['melange']['src_rgb'] == 6 and pica['melange']['dst_rgb'] == 7
        mat = dict(name=prefixe + m['nom'], doubleSided=True,
                   pbrMetallicRoughness=dict(baseColorFactor=[1, 1, 1, 1], metallicFactor=0, roughnessFactor=1),
                   extras=dict(pica=pica))
        if tex[0] is not None: mat['pbrMetallicRoughness']['baseColorTexture'] = dict(index=tex[0])
        if blend: mat['alphaMode'] = 'BLEND'
        elif pica['alpha_test']['actif']:
            mat['alphaMode'] = 'MASK'; mat['alphaCutoff'] = pica['alpha_test']['ref'] / 255
        G.g['materials'].append(mat); mats.append(len(G.g['materials']) - 1)
    for k, s in enumerate(M['maillages']):
        if exclure_silhouettes and s['type'] == 1: continue
        prims = []
        dec = s['decalage']
        noms_attr = {a[0] for a in s['attributs']}
        fixes = s['fixes_valeurs']
        os_mesh = None
        for sm in s['sous_maillages']:
            idx = sm['indices']
            if not idx: continue
            uniq = sorted(set(idx)); rem = {v: i for i, v in enumerate(uniq)}
            V = [s['sommets'][v] for v in uniq]
            pos = [[V_[0][0] + dec[0], V_[0][1] + dec[1], V_[0][2] + dec[2]] for V_ in V]
            attrs = dict(POSITION=G.accesseur(pos, 'VEC3', cible=34962, minmax=True))
            if 1 in noms_attr:
                nrm = []
                for V_ in V:
                    x, y, z = V_[1][:3]; l = math.sqrt(x * x + y * y + z * z) or 1
                    nrm.append([x / l, y / l, z / l])
                attrs['NORMAL'] = G.accesseur(nrm, 'VEC3', cible=34962)
            elif 1 in fixes and fixes[1]:
                x, y, z = fixes[1][:3]; l = math.sqrt(x * x + y * y + z * z) or 1
                attrs['NORMAL'] = G.accesseur([[x / l, y / l, z / l]] * len(V), 'VEC3', cible=34962)
            if 4 in noms_attr:
                attrs['TEXCOORD_0'] = G.accesseur([[V_[4][0], 1 - V_[4][1]] for V_ in V], 'VEC2', cible=34962)
            if 5 in noms_attr:
                attrs['TEXCOORD_1'] = G.accesseur([[V_[5][0], 1 - V_[5][1]] for V_ in V], 'VEC2', cible=34962)
            if 3 in noms_attr:
                col = [[max(0, min(1, c)) for c in (V_[3] + [1, 1, 1, 1])[:4]] for V_ in V]
                attrs['COLOR_0'] = G.accesseur(col, 'VEC4', cible=34962)
            elif 3 in fixes and fixes[3]:
                attrs['COLOR_0'] = G.accesseur([list(fixes[3])] * len(V), 'VEC4', cible=34962)
            ind = [rem[i] for i in idx]
            prims.append(dict(attributes=attrs, indices=G.accesseur(ind, 'SCALAR', USHORT, cible=34963), material=mats[s['materiau']]))
            os_mesh = sm['os'][0] if sm['os'] else 0
        if not prims: continue
        nomm = M['materiaux'][s['materiau']]['nom']
        G.g['meshes'].append(dict(name=prefixe + nomm, primitives=prims,
                                  extras=dict(priorite=s['priorite'], couche=s['couche'], noeud=(M['noeuds'][s['noeud']] if s['noeud'] < len(M['noeuds']) else None))))
        n = G.noeud(name=prefixe + 'maillage-' + nomm, mesh=len(G.g['meshes']) - 1)
        G.enfant(os_noeuds[noms[os_mesh or 0]] if noms else parent, n)   
    return os_noeuds

def echantillonner_anims_materiau(R, prefixe=''):
    out = []
    for a in R['anims_materiau'] + R['anims_visibilite']:
        n = max(1, int(round(a['images'])))
        els = []
        for e in a['elements']:
            el = dict(cible=e['nom'] if a['type'] != 1 else prefixe + e['nom'], type_cible=e['cible'], primitive=e['prim'])
            if 'composantes' in e:
                el['valeurs'] = [[None if c is None else round(bch.valeur_courbe(c, f), 5) for c in e['composantes']] for f in range(n + 1)]
                el['courbes'] = [None if c is None else dict(interp=c['interp'], cles=[[round(x, 5) for x in k] for k in c['cles']]) for c in e['composantes']]
            if 'booleens' in e: el['booleens'] = e['booleens']['valeurs']
            els.append(el)
        d = dict(nom=a['nom'], type=['squelette', 'materiau', 'visibilite'][a['type']] if a['type'] < 3 else a['type'],
                 images=a['images'], boucle=a['boucle'], elements=els)
        if a.get('textures'): d['textures'] = a['textures']
        out.append(d)
    return out

def anims_squelette_brutes(R):
    return [dict(nom=a['nom'], images=a['images'], boucle=a['boucle'],
                 elements=[dict(os=e['nom'], quat=e.get('quat'), translation=bool(e.get('translation'))) for e in a['elements']])
            for a in R['anims_squelette']]

def lire(romfs, nom):
    p = Path(romfs) / 'region_common' / nom
    return bch.lire_bch(bch.yaz0(p.read_bytes()))

def textures_toutes(G, R):
    idx = {}
    for nom in R['textures']:
        idx[nom] = G.texture(R, nom, dict(wrapU=0, wrapV=0, mag=1))
    return idx

def ombre(G, romfs, nom, parent):
    p = Path(romfs) / 'region_common/model' / (nom + '.bch.szs')
    if not p.exists(): return
    n = G.noeud(name='Ombre-' + nom.replace('CaOb', '').replace('Sdw', '')); G.enfant(parent, n)
    ajouter_modele(G, bch.lire_bch(bch.yaz0(p.read_bytes())), n)

def pince(romfs, corps, bras, tige=True, allumee=True, extra=None):
    G = Gltf()
    suf = 'LightOn' if allumee else 'LightOff'
    racine = G.noeud(name='Pince', extras=dict(source='Nintendo Badge Arcade, RomFS EUR, region_common/model'))
    G.enfant(None, racine)
    Rc = lire(romfs, 'model/CaOb%s%s.bch.szs' % (corps, suf))
    moyeu = G.noeud(name='Moyeu'); G.enfant(racine, moyeu)
    os_c = ajouter_modele(G, Rc, moyeu)
    ombre(G, romfs, 'CaOb%sSdw' % corps, moyeu)
    tex_c = textures_toutes(G, Rc)
    anims = echantillonner_anims_materiau(Rc)
    brutes = {'CaOb%s%s' % (corps, suf): anims_squelette_brutes(Rc)}
    pivots = {}
    for fichier, loc, pos in bras:
        Rb = lire(romfs, 'model/%s%s.bch.szs' % (fichier, suf))
        piv = G.noeud(name='Pivot-' + fichier.replace('CaOb', ''), translation=pos)
        G.enfant(os_c[loc], piv)
        ajouter_modele(G, Rb, piv)
        ombre(G, romfs, '%sSdw' % fichier, piv)
        textures_toutes(G, Rb)
        anims += echantillonner_anims_materiau(Rb)
        brutes['%s%s' % (fichier, suf)] = anims_squelette_brutes(Rb)
        pivots[fichier] = piv
    if tige:
        Rt = lire(romfs, 'model/CaObPole%s.bch.szs' % suf)
        nt = G.noeud(name='Tige'); G.enfant(racine, nt)
        ajouter_modele(G, Rt, nt)
        ombre(G, romfs, 'CaObPoleSdw', nt)
        anims += echantillonner_anims_materiau(Rt)
    G.g['nodes'][racine]['extras'].update(dict(
        textures=tex_c, animations_materiau=anims, animations_squelette_du_fichier=brutes,
        pivots={k: G.g['nodes'][v]['name'] for k, v in pivots.items()},
        **(extra or {})))
    return G

def ajouter_anim_bras(G, nom, cles, pivots):
    temps = [t for t, _ in cles]
    acc_t = G.accesseur(temps, 'SCALAR', minmax=True)
    chans, samps = [], []
    for nom_piv, signe in pivots:
        n = next(i for i, x in enumerate(G.g['nodes']) if x.get('name') == nom_piv)
        q = [[0, 0, math.sin(signe * a / 2), math.cos(signe * a / 2)] for _, a in cles]
        samps.append(dict(input=acc_t, output=G.accesseur(q, 'VEC4'), interpolation='LINEAR'))
        chans.append(dict(sampler=len(samps) - 1, target=dict(node=n, path='rotation')))
    G.g['animations'].append(dict(name=nom, channels=chans, samplers=samps))

def cadre(romfs):
    G = Gltf()
    racine = G.noeud(name='Borne'); G.enfant(None, racine)
    anims = []
    for f in ('CrSt', 'CrStFront'):
        R = lire(romfs, 'model/%s.bch.szs' % f)
        n = G.noeud(name=f); G.enfant(racine, n)
        ajouter_modele(G, R, n)
        anims += echantillonner_anims_materiau(R, '')
    cams = []
    for f in ('CrSt', 'CrStFront'):
        Rk = lire(romfs, 'camera/%s.bch.szs' % f)
        cams += [dict(fichier=f, **c) for c in Rk['cameras']]
    G.g['nodes'][racine]['extras'] = dict(animations_materiau=anims, cameras=cams)
    return G

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--romfs', default='/dev/shm/ba-romfs/romfs')
    ap.add_argument('--sortie', default=str(Path(__file__).resolve().parents[2] / 'ressources-privees/badge-arcade/modeles/romfs'))
    ap.add_argument('--ouverture', type=float, default=55, help="angle d'ouverture maximal (degrés) des animations reconstruites")
    a = ap.parse_args()
    out = Path(a.sortie); out.mkdir(parents=True, exist_ok=True)
    for nom, G in pinces(a.romfs, a.ouverture):
        (out / (nom + '.glb')).write_bytes(G.glb())
        print(nom, len(G.bin) // 1024, 'Kio')
    G = cadre(a.romfs)
    (out / 'borne-cadre.glb').write_bytes(G.glb())
    print('borne-cadre', len(G.bin) // 1024, 'Kio')

def pinces(romfs, ouverture=55):
    std = [('CaObArmL', 'Lo_ArmLeft', None), ('CaObArmR', 'Lo_ArmRight', None)]
    jeux = {
        'pince-standard': dict(corps='Body', bras=std),
        'pince-standard-eteinte': dict(corps='Body', bras=std, allumee=False),
        'pince-marteau': dict(corps='HammerBody', bras=[('CaObHammerArm', 'Lo_ArmCenter', None)]),
        'pince-baton': dict(corps='StickBody', bras=[('CaObStickArm', 'Lo_ArmCenter', None)]),
        'pince-bombe': dict(corps='BombBody', bras=[('CaObBombChain', 'Lo_ArmCenter', None), ('CaObBomb', 'Lo_ArmCenter', [0, -2.4, 0])]),
    }
    for nom, p in jeux.items():
        try: G = pince(romfs, **p)
        except (OSError, KeyError, ValueError, IndexError, struct.error): continue
        if nom.startswith('pince-standard') and ouverture:
            ouv = math.radians(ouverture)
            piv = [('Pivot-ArmL', -1), ('Pivot-ArmR', 1)]
            ajouter_anim_bras(G, 'ouverture-reconstruite', [(t, ouv * k) for t, k in
                              [(0, 0), (.35, .75), (.6, 1.08), (.85, .96), (1.05, 1.02), (1.3, 1)]], piv)
            ajouter_anim_bras(G, 'fermeture-reconstruite', [(t, ouv * k) for t, k in
                              [(0, 1), (.4, .8), (.8, .45), (1.1, .15), (1.4, 0)]], piv)
            G.g['nodes'][0]['extras']['animations_reconstruites'] = dict(
                ouverture_max_deg=ouverture, source="estimées sur les vidéos officielles (P02, P03) : non présentes dans le RomFS",
                bras_gauche="Pivot-ArmL : rotation z = −angle", bras_droit="Pivot-ArmR : rotation z = +angle")
        yield nom, G

if __name__ == '__main__':
    main()
