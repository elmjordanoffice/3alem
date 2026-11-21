import * as React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { parseInvitation } from "../../api/client";
import { useSession } from "../../state/session";

/**
 * Deep links: aalim://a/<token> and the universal link https://<host>/a/<token>
 * (the same path as the web invitation). Remember the token, then go in.
 */
export default function InvitationLink() {
  const { token: param } = useLocalSearchParams<{ token: string }>();
  const { token, setToken } = useSession();
  const parsed = parseInvitation(String(param ?? ""));
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!parsed) return;
    if (parsed === token) setReady(true);
    else void setToken(parsed).then(() => setReady(true));
  }, [parsed, token, setToken]);

  if (!parsed) return <Redirect href="/" />;
  if (!ready) return null;
  return <Redirect href="/assessment" />;
}
