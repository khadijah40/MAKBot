import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import KhaazChat from "./KhaazChat";

const App = () => {
  // Replace this with your actual Google Client ID
  const GOOGLE_CLIENT_ID =
    "901230616487-svqcaqtneo22e3hemlb3ccop7mdu6lg2.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <NexusChat />
    </GoogleOAuthProvider>
  );
};

export default App;
