/**
  * authService.js
  *
  * Responsável por:
  *   1. Chamar POST /auth/login com e-mail + senha
  *   2. Salvar token e role no authStore
  *   3. Expor logout (limpa o store)
  *
  * Resposta esperada do backend (LoginResponseDTO):
  *   { token: "eyJ...", role: "ROLE_ALUNO" }
  */
 
 import api       from './api';
 import authStore from '../store/authStore';
 
 const authService = {
   /**
    * Realiza o login e persiste a sessão.
    *
    * @param {string} email
    * @param {string} password
    * @returns {{ token: string, role: string }}
    * @throws Error com mensagem amigável em caso de falha
    */
   async login(email, password) {
     try {
       const response = await api.post('/auth/login', { email, password });
        const { token, role } = response.data;
        // Base64url -> Base64 padrao antes do atob (JWT usa '-' e '_')
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(b64));
        authStore.setSession({ token, role, user: { id: payload.userId, email: payload.sub } });
 
       return { token, role };
     } catch (err) {
       const status = err.response?.status;
 
       if (status === 401 || status === 403) {
         throw new Error('E-mail ou senha incorretos.');
       }
       throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
     }
   },
 
   /** Remove a sessão local (não chama nenhum endpoint). */
   logout() {
     authStore.clearSession();
   },
 };
 
 export default authService;