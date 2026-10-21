window.__pcvBridge = (() => {
  const O = window.opener || window;
  const req = () => O.__pcvReq ||= (() => {
    if (!O.webpackChunksteamui) return void 0;
    let r;
    O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv-bridge")], {}, (q) => {
      r = q;
    }]);
    return r;
  })();
  const found = O.__pcvModules ||= {};
  const manquants = O.__pcvModulesManquants ||= /* @__PURE__ */ new Map(), ATTENTE_MODULE = 1e3;
  const findModule = (key, signature, test) => {
    if (found[key] != null) return found[key];
    const maintenant = Date.now();
    if (maintenant - (manquants.get(key) ?? -Infinity) < ATTENTE_MODULE) return null;
    manquants.set(key, maintenant);
    const r = req();
    if (!r) return null;
    for (const id of Object.keys(r.m)) {
      if (!String(r.m[id]).includes(signature)) continue;
      let x;
      try {
        x = r(id);
      } catch (e) {
        continue;
      }
      if (!x || typeof x !== "object") continue;
      for (const v of Object.values(x)) {
        try {
          if (test(v)) {
            manquants.delete(key);
            return found[key] = v;
          }
        } catch (e) {
        }
      }
    }
    return null;
  };
  const globalStore = (name) => {
    if (O[name]) return O[name];
    const cle = "global:" + name, maintenant = Date.now();
    if (maintenant - (manquants.get(cle) ?? -Infinity) < ATTENTE_MODULE) return void 0;
    manquants.set(cle, maintenant);
    const r = req();
    if (!r) return void 0;
    for (const id of Object.keys(r.m)) {
      if (!String(r.m[id]).includes("window." + name + "=")) continue;
      let x;
      try {
        x = r(id);
      } catch (e) {
        continue;
      }
      for (const v of Object.values(x || {})) {
        try {
          if (typeof v?.Get === "function" && "s_Singleton" in v) {
            v.Get();
            if (O[name]) return O[name];
          }
        } catch (e) {
        }
      }
    }
    return O[name];
  };
  const bt = () => findModule("bt", "SetDiscovering", (v) => typeof v?.SetDiscovering === "function" && typeof v?.Pair === "function" && typeof v?.GetDeviceDetails === "function");
  const settingsWriter = () => findModule("settingsWriter", "BinaryWriter", (f) => typeof f === "function" && /BinaryWriter[\s\S]*SetSetting\(/.test(String(f)));
  const clientSettings = () => globalStore("settingsStore")?.m_ClientSettings;
  const menuStore = () => {
    try {
      return O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore;
    } catch (e) {
      return null;
    }
  };
  const navigator_ = () => {
    try {
      return O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.m_Navigator;
    } catch (e) {
      return null;
    }
  };
  return {
    // Contrats pour nos écrans : données simples, jamais un objet observable de Steam ni son DOM.
    // null signifie « profil pas encore disponible » ; un avatar vide est une valeur valide.
    compteCourant: () => {
      try {
        const p = O.g_FriendsUIApp?.FriendStore?.self?.persona;
        if (!p || typeof p.m_strPlayerName !== "string" || !p.m_strPlayerName) return null;
        return {
          nom: p.m_strPlayerName,
          avatar: typeof p.avatar_url_full === "string" && p.avatar_url_full || typeof p.avatar_url_medium === "string" && p.avatar_url_medium || ""
        };
      } catch (e) {
        return null;
      }
    },
    // Ne jamais lire visibleApps avant collectionsFromStorage : Steam mémorise l'erreur de calcul.
    // Une bibliothèque vide est prête ; aucune énumération de allApps pendant l'attente.
    resumeBibliotheque: () => {
      try {
        if (!O.collectionStore?.collectionsFromStorage) return { pret: false, nombreJeux: null };
        const n = O.collectionStore.allGamesCollection.visibleApps.length;
        return Number.isSafeInteger(n) && n >= 0 ? { pret: true, nombreJeux: n } : { pret: false, nombreJeux: null };
      } catch (e) {
        return { pret: false, nombreJeux: null };
      }
    },
    // Adaptation provisoire à l'hôte Steam : la vue n'a pas à connaître ses routes.
    ouvrirAccueil: () => {
      try {
        if (!/^\/routes\/library\/home/.test(O.location?.pathname || "")) O.__pcvAller?.(1);
      } catch (e) {
      }
    },
    // the app running in the foreground (null if none) ; appOverview() : its full card (name, playtime, images...)
    runningApp: () => {
      try {
        return O.SteamUIStore.MainRunningApp || null;
      } catch (e) {
        return null;
      }
    },
    appOverview: (appid) => {
      try {
        return O.appStore.GetAppOverviewByAppID(appid) || null;
      } catch (e) {
        return null;
      }
    },
    // 0 = no side menu open, 1 = HOME menu, 2 = Quick Access (Steam's own enum, read only)
    menuState: () => {
      try {
        return menuStore()?.m_eOpenSideMenu || 0;
      } catch (e) {
        return 0;
      }
    },
    closeMenus: () => {
      try {
        menuStore()?.CloseSideMenus();
      } catch (e) {
      }
    },
    // switches the tab shown inside the Quick Access side menu (0..N, Steam's own tab indices)
    openQuickAccessTab: (index) => {
      try {
        menuStore()?.OpenQuickAccessMenu(+index);
      } catch (e) {
      }
    },
    closeApp: (gameId) => {
      try {
        O.SteamClient.Apps.TerminateApp(gameId, false);
      } catch (e) {
      }
    },
    // brings a running app's window to the front (used for "open the app" from a notification/media player card)
    resumeApp: (appid) => {
      try {
        const id = String(appid);
        return O.SteamClient.Apps.RaiseWindowForGame?.(id) ?? O.SteamClient.Apps.NavigateToRunningApp?.(id);
      } catch (e) {
      }
    },
    // a page of Steam's own Settings ("Internet", "Display", "Controller"...)
    navigate: (page) => {
      try {
        navigator_()?.Settings(page);
      } catch (e) {
      }
    },
    controllerConfig: (appid) => {
      try {
        navigator_()?.ControllerConfigurator?.Main(appid);
      } catch (e) {
      }
    },
    // the controllers Steam currently knows about (raw list, as ControllerStore gives it)
    controllers: () => {
      try {
        return [...O.ControllerStore?.m_controllerList || []];
      } catch (e) {
        return [];
      }
    },
    // our own persona (name, avatar) : used for the "me" pill of the HOME menu
    friends: () => {
      try {
        return O.g_FriendsUIApp.FriendStore.self.persona || null;
      } catch (e) {
        return null;
      }
    },
    // battery (percent 0..1, charging, time left) : a single, normalized read of Steam's SystemPowerStore
    battery: () => {
      const p = globalStore("SystemPowerStore");
      if (!p) return null;
      return {
        present: !!p.m_bHasBattery,
        percent: p.m_flBatteryLevel,
        charging: p.m_eACState === 2,
        acState: p.m_eACState,
        batteryState: p.m_eBatteryState,
        secondsRemaining: p.m_nBatterySecondsRemaining,
        confidence: p.m_eBatteryTimeConfidence
      };
    },
    // calls cb on every battery change ; returns the subscription Steam gives (call .unregister() on it to stop)
    onBattery: (cb) => {
      try {
        return O.SteamClient.System.RegisterForBatteryStateChanges(cb);
      } catch (e) {
        return null;
      }
    },
    // simple connectivity (the Wi-Fi network LIST/scan/connect stays direct in acces-rapide.js : a much bigger surface)
    network: () => ({ connected: !!globalStore("SystemNetworkStore")?.hasNetworkConnection }),
    bluetooth: {
      state: async () => {
        const S = bt();
        if (!S) return null;
        try {
          return (await S.GetState({})).Body().toObject();
        } catch (e) {
          return null;
        }
      },
      deviceDetails: async (id) => {
        const S = bt();
        if (!S) return null;
        try {
          return (await S.GetDeviceDetails({ id })).Body().toObject().device || null;
        } catch (e) {
          return null;
        }
      },
      setDiscovering: (enabled) => {
        try {
          bt()?.SetDiscovering({ enabled });
        } catch (e) {
        }
      },
      pair: (id) => bt()?.Pair({ id }),
      cancelPair: (id) => bt()?.CancelPair({ id }),
      connect: (id) => bt()?.Connect({ id }),
      disconnect: (id) => bt()?.Disconnect({ id }),
      forget: (id) => bt()?.Forget({ id }),
      isEnabled: () => !!clientSettings()?.system_bluetooth_enabled,
      setEnabled: (v) => {
        try {
          settingsWriter()?.("system_bluetooth_enabled", v);
        } catch (e) {
        }
      }
    },
    // a Decky plugin method (loader/call_plugin_method) : pluginName defaults to SteamU's own greffon
    callPlugin: (pluginName, method, ...args) => O.DeckyBackend?.call("loader/call_plugin_method", pluginName, method, ...args) ?? Promise.reject(new Error("Decky absent"))
  };
})();
