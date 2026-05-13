import { useEffect } from "react";
import { useTawk } from "../../hooks/useTawk";
import { setTawkUser } from "../../services/tawkService";

const TawkChat = ({ user, enabled = true }) => {
  useTawk(enabled);

  useEffect(() => {
    if (!user) return;
    setTawkUser(user);
  }, [user?.email, user?.name, user?.username, user?.firstName, user?.lastName, user?.firstname, user?.lastname]);

  return null;
};

export default TawkChat;