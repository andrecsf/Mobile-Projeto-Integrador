import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import authService from "../services/authService";

export default function LoginScreen({ navigation, onLogin  }) {
  const [email, setEmail]     = useState("");
  const [senha, setSenha]     = useState("");
  const [erro, setErro]       = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      await authService.login(email, senha);
      onLogin(); // avisa o App.js que logou
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoBadge}>
          <View style={styles.logoDot} />
          <Text style={styles.logoText}>
            Acad<Text style={{ color: "#378ADD" }}>Flow</Text>
          </Text>
        </View>
        <Text style={styles.tagline}>Sistema de Gestão Acadêmica</Text>
      </View>

      <Text style={styles.title}>Bem-vindo 👋</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      {/* Banner Render */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ</Text>
        <Text style={styles.infoText}>
          Servidor no Render (plano gratuito). Primeira requisição pode levar até{" "}
          <Text style={styles.infoBold}>30 segundos</Text>.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>E-MAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor="#3a3f52"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>SENHA</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#3a3f52"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={[styles.btnLogin, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnTexto}>Entrar</Text>
        }
      </TouchableOpacity>

      {/* Credenciais de demonstração — apenas Aluno */}
      <View style={styles.demoCard}>
        <Text style={styles.demoTitle}>CREDENCIAIS DE DEMONSTRAÇÃO</Text>
        <TouchableOpacity
          style={styles.demoRow}
          activeOpacity={0.6}
          onPress={() => { setEmail("aluno@senac.com"); setSenha("123456"); }}
        >
          <Text style={styles.demoIcon}>🎓</Text>
          <Text style={styles.demoRole}>Aluno</Text>
          <Text style={styles.demoDash}> — </Text>
          <Text style={styles.demoEmail}>aluno@senac.com</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>AcadFlow © 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1117",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#151825",
    borderWidth: 0.5,
    borderColor: "#2a2d3e",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#378ADD",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e8eaf0",
  },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e8eaf0",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0d1f35",
    borderWidth: 0.5,
    borderColor: "#1e3a5f",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoIcon: {
    fontSize: 13,
    color: "#378ADD",
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#7aade0",
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: "700",
    color: "#9ec8f0",
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#151825",
    borderWidth: 0.5,
    borderColor: "#2a2d3e",
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: "#e8eaf0",
  },
  erro: {
    color: "#E24B4A",
    fontSize: 13,
    marginBottom: 8,
  },
  btnLogin: {
    backgroundColor: "#378ADD",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  btnTexto: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  demoCard: {
    marginTop: 32,
    backgroundColor: "#151825",
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "#2a2d3e",
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3a3f52",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  demoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  demoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  demoRole: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e8eaf0",
  },
  demoDash: {
    fontSize: 13,
    color: "#3a3f52",
  },
  demoEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
  footer: {
    marginTop: "auto",
    textAlign: "center",
    fontSize: 11,
    color: "#3a3f52",
    paddingTop: 24,
  },
});