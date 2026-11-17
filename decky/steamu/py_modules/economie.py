import glob, json, os, pathlib, shutil, subprocess

EPP_ECO = "power"
PPT = ("ppt_pl1_spl", "ppt_pl2_sppt", "ppt_pl3_fppt")   

def _lire(p):
    try: return pathlib.Path(p).read_text().strip()
    except OSError: return None

def _ecrire(p, v):
    try: pathlib.Path(p).write_text(str(v))
    except OSError: return False
    return _lire(p) == str(v)

def _iw(interface, valeur=None):
    iw = shutil.which("iw") or "/usr/bin/iw"
    try:
        if valeur: subprocess.run([iw, "dev", interface, "set", "power_save", valeur], timeout=3, check=True, capture_output=True)
        s = subprocess.run([iw, "dev", interface, "get", "power_save"], timeout=3, check=True, capture_output=True, text=True).stdout
    except (OSError, subprocess.SubprocessError): return None
    return "on" if "Power save: on" in s else "off" if "Power save: off" in s else None

class Economie:
    def __init__(self, fichier, racine="", iw=_iw):
        self.f, self.r, self.iw = pathlib.Path(fichier), racine, iw

    def _boot(self): return _lire(f"{self.r}/proc/sys/kernel/random/boot_id")
    def _epp(self): return sorted(glob.glob(f"{self.r}/sys/devices/system/cpu/cpu[0-9]*/cpufreq/energy_performance_preference"))
    def _wifi(self): return sorted(pathlib.Path(p).parent.name for p in glob.glob(f"{self.r}/sys/class/net/*/wireless"))

    def etat(self):
        try: return json.loads(self.f.read_text())
        except (OSError, ValueError): return None

    def _garder(self, e):
        t = self.f.with_suffix(".tmp"); t.write_text(json.dumps(e)); os.replace(t, self.f)

    def entrer(self, systeme=True):
        e = self.etat()
        if e and (e["avant"] or not systeme): return e["avant"]
        if not systeme:
            self._garder({"boot": self._boot(), "avant": {}}); return {}
        epp = {p: v for p in self._epp() if (v := _lire(p)) and v != EPP_ECO
               and EPP_ECO in (_lire(pathlib.Path(p).with_name("energy_performance_available_preferences")) or "").split()}
        wifi = {i: "off" for i in self._wifi() if self.iw(i) == "off"}
        self._garder({"boot": self._boot(), "avant": {"epp": epp, "wifi": wifi}})   
        epp = {p: v for p, v in epp.items() if _ecrire(p, EPP_ECO)}
        wifi = {i: v for i, v in wifi.items() if self.iw(i, "on") == "on"}
        self._garder({"boot": self._boot(), "avant": {"epp": epp, "wifi": wifi}})
        return {"epp": epp, "wifi": wifi}

    def rendre(self):
        e = self.etat()
        if not e: return False
        for p, v in e["avant"].get("epp", {}).items():
            if _lire(p) == EPP_ECO: _ecrire(p, v)
        for i, v in e["avant"].get("wifi", {}).items():
            if self.iw(i) == "on": self.iw(i, v)
        self._garder({"boot": e.get("boot"), "avant": {}})
        return True

    def sortir(self):
        if not self.rendre(): return False
        try: self.f.unlink()
        except OSError: pass
        return True

    def reprendre(self):
        e = self.etat()
        return bool(e and e.get("boot") != self._boot() and self.sortir())

    def tenir_tdp(self, watts):
        att = sorted(glob.glob(f"{self.r}/sys/class/firmware-attributes/*/attributes/{PPT[0]}"))
        if not att: return None
        base = pathlib.Path(att[0]).parent
        if _lire(f"{self.r}/sys/firmware/acpi/platform_profile") == "custom":
            for n in PPT:
                v = _lire(base / n / "current_value")
                if v is not None and v != str(watts): _ecrire(base / n / "current_value", watts)
        puce = [_lire(p) for p in glob.glob(f"{self.r}/sys/class/hwmon/hwmon*/power1_average") if _lire(pathlib.Path(p).with_name("name")) == "amdgpu"]
        return {**{n: _lire(base / n / "current_value") for n in PPT}, "puce": round(int(puce[0]) / 1e6, 2) if puce and puce[0] else None}
