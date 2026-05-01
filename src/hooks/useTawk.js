import { useEffect } from "react";

const TAWK_SRC = "https://embed.tawk.to/69f4d5618523f61c32f23bbc/1jni631ds";
const TAWK_SCRIPT_ID = "tawk-to-script";

export const useTawk = (enabled = true) => {
  useEffect(() => {
    // NOTE:
    // Tawk.to doesn't reliably support unloading/reloading its script within a
    // single SPA session. Removing the script + deleting `window.Tawk_API` can
    // cause the widget to never re-appear until a full page reload.
    //
    // For tab-based UX, we keep the script loaded once per page-load and just
    // hide/minimize/end the chat when disabled.

    window.Tawk_API = window.Tawk_API || {};

    const ensureScriptLoaded = () => {
      const existingScript = document.getElementById(TAWK_SCRIPT_ID);
      if (existingScript) return;

      window.Tawk_LoadStart = new Date();

      const script = document.createElement("script");
      script.id = TAWK_SCRIPT_ID;
      script.src = TAWK_SRC;
      script.async = true;
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");

      document.body.appendChild(script);
    };

    const hideAndClose = () => {
      try {
        window.Tawk_API?.minimize?.();
      } catch {
        // ignore
      }

      try {
        window.Tawk_API?.hideWidget?.();
      } catch {
        // ignore
      }

      try {
        window.Tawk_API?.endChat?.();
      } catch {
        // ignore
      }
    };

    if (enabled) {
      ensureScriptLoaded();
    } else {
      hideAndClose();
    }

    return () => {
      // On unmount or when switching enabled->false, close/hide the widget.
      // We intentionally do NOT remove the script or delete globals.
      hideAndClose();
    };
  }, [enabled]);
};