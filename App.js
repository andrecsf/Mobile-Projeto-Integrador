import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./src/navigation/AuthNavigator";
import AppNavigator from "./src/navigation/AppNavigator";
import authStore from "./src/store/authStore";

export default function App() {
  const [logado, setLogado] = useState(authStore.isAuthenticated());

  return (
    <NavigationContainer>
      {logado ? <AppNavigator /> : <AuthNavigator onLogin={() => setLogado(true)} />}
    </NavigationContainer>
  );
}