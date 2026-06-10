/**
 * authStore.js
 *
 * Armazena em memória os dados da sessão do usuário após o login:
 *   - token JWT
 *   - role  (ex: "ROLE_ALUNO")
 *   - user  (id, name, email — preenchido após decodificar o token)
 *   - cursoAtivo  ({ id, nome } | null) — curso selecionado pelo aluno
 *                 Definido automaticamente ao carregar os cursos pela primeira vez
 *                 e pode ser trocado pelo aluno na Home ou MinhasSubmissões.
 *
 * Não usa AsyncStorage por enquanto: ao fechar o app a sessão é perdida.
 * Para persistência, basta trocar as variáveis por chamadas ao AsyncStorage.
 */

let _token      = null;
let _role       = null;
let _user       = null;   // { id, name, email }
let _cursoAtivo = null;   // { id, nome } | null

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

  // ── Curso ativo ───────────────────────────────────────────

  /**
   * Retorna o curso atualmente selecionado pelo aluno.
   * Retorna null se nenhum curso foi definido ainda.
   */
  getCursoAtivo() { return _cursoAtivo; },

  /**
   * Define o curso ativo. Deve receber um objeto { id, nome }.
   * Chamado ao carregar os cursos do aluno (define o primeiro automaticamente)
   * e quando o aluno troca o curso pelo seletor.
   */
  setCursoAtivo(curso) {
    _cursoAtivo = curso ? { id: curso.id, nome: curso.nome } : null;
  },

  /**
   * Inicializa o curso ativo a partir de uma lista de cursos do backend,
   * mas só se ainda não houver um curso ativo definido (evita sobrescrever
   * a escolha do aluno ao navegar entre telas).
   * Recebe o array bruto retornado por ActivityService.getCursosByAluno.
   */
  inicializarCursoAtivo(cursos) {
    if (_cursoAtivo !== null) return; // já foi definido, não sobrescreve
    if (!cursos || cursos.length === 0) return;
    const primeiro = cursos[0];
    _cursoAtivo = { id: primeiro.id, nome: primeiro.nome };
  },

  // ── Limpar (logout) ───────────────────────────────────────
  clearSession() {
    _token      = null;
    _role       = null;
    _user       = null;
    _cursoAtivo = null;
  },
};

export default authStore;