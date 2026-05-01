const getDisplayName = (user) => {
  if (!user) return "";

  const direct = user.name || user.username;
  if (direct) return String(direct);

  const firstName = user.firstName ?? user.firstname;
  const lastName = user.lastName ?? user.lastname;
  const combined = `${firstName || ""} ${lastName || ""}`.trim();
  return combined;
};

const withTawkOnLoad = (fn) => {
  window.Tawk_API = window.Tawk_API || {};
  const prev = window.Tawk_API.onLoad;

  window.Tawk_API.onLoad = function () {
    try {
      if (typeof prev === "function") prev();
    } finally {
      fn?.();
    }
  };
};

export const setTawkUser = (user) => {
  if (!user) return;

  const name = getDisplayName(user);
  const email = user.email ? String(user.email) : "";

  const apply = () => {
    if (!window.Tawk_API?.setAttributes) return;

    window.Tawk_API.setAttributes(
      {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
      function (error) {
        if (error) console.error("Tawk Error:", error);
      }
    );
  };

  // If script isn't ready yet, queue via onLoad
  if (!window.Tawk_API?.setAttributes) {
    withTawkOnLoad(apply);
    return;
  }

  apply();
};

export const showTawk = () => {
  const show = () => {
    window.Tawk_API?.showWidget?.();
  };

  if (!window.Tawk_API?.showWidget) {
    withTawkOnLoad(show);
    return;
  }

  show();
};

export const openTawk = () => {
  const open = () => {
    // Ensure the launcher is visible, then open the chat panel.
    window.Tawk_API?.showWidget?.();

    // Tawk supports maximize() to open the widget.
    if (typeof window.Tawk_API?.maximize === "function") {
      window.Tawk_API.maximize();
      return;
    }

    // Fallbacks for different widget versions.
    if (typeof window.Tawk_API?.popup === "function") {
      window.Tawk_API.popup();
      return;
    }

    if (typeof window.Tawk_API?.toggle === "function") {
      window.Tawk_API.toggle();
    }
  };

  // If script isn't ready yet, queue via onLoad
  if (!window.Tawk_API?.maximize && !window.Tawk_API?.popup && !window.Tawk_API?.toggle) {
    withTawkOnLoad(open);
    return;
  }

  open();
};

export const hideTawk = () => {
  const hide = () => {
    window.Tawk_API?.hideWidget?.();
  };

  if (!window.Tawk_API?.hideWidget) {
    withTawkOnLoad(hide);
    return;
  }

  hide();
};

export const endTawkChat = () => {
  window.Tawk_API?.endChat?.();
};