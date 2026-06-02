 /**
 * authStore.js
 *
 * Armazena em memória os dados da sessão do usuário após o login:
 *   - token JWT
 *   - role  (ex: "ROLE_ALUNO")
 *   - user  (id, name, email — preenchido após decodificar o token)
 *
 * Não usa AsyncStorage por enquanto: ao fechar o app a sessão é perdida.
 * Para persistência, basta trocar as variáveis por chamadas ao AsyncStorage.
 */

let _token = null;
let _role  = null;
let _user  = null;   // { id, name, email }

const authStore = {
  // ── Gravar ────────────────────────────────────────────────
  setSession({ token, role, user = null }) {
    _token = token;
    _role  = role;
    _user  = user;
  },

  // ── Ler ───────────────────────────────────────────────────
  getToken() { return _token; },
  getRole()  { return _role;  },
  getUser()  { return _user;  },

  isAuthenticated() { return !!_token; },

  // ── Limpar (logout) ───────────────────────────────────────
  clearSession() {
    _token = null;
    _role  = null;
    _user  = null;
  },
};

export default authStore;

