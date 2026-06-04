import api from './api';

/**
 * activityService.js — AcadFlow Mobile
 *
 * Contrato do backend:
 * POST /submissoes  multipart/form-data
 * part "submissao" (JSON):
 * { aluno: { id }, categoria: { id }, curso: { id },
 * certificado: { nomeAlunoOcr, nomeCursoOcr, cargaHorariaOcr, dataConclusaoOcr } | null }
 * part "file": arquivo binário
 */

const ActivityService = {
  // ── CATEGORIAS ──────────────────────────────────────────
  getCategorias() {
    return api.get('/categorias').then(r => r.data);
  },

  getCategoriasByCurso(cursoId) {
    return api.get(`/categorias?cursoId=${cursoId}`).then(r => r.data);
  },

  // ── CURSOS DO ALUNO ─────────────────────────────────────
  /**
   * Consome a nova rota otimizada para trazer apenas os cursos em que o aluno está matriculado.
   */
  getAluno(alunoId) {
    return api.get(`/alunos/${alunoId}`).then(r => r.data);
  },

  getCursosByAluno(alunoId) {
    return api.get(`/alunos/${alunoId}/cursos`).then(r => r.data);
  },

  // ── SUBMISSÕES ──────────────────────────────────────────
  getSubmissoesByAluno(alunoId) {
    return api.get(`/submissoes?alunoId=${alunoId}`).then(r => r.data);
  },

  /**
   * Envia um certificado.
   */
  async inserirSubmissao({ alunoId, categoriaId, cursoId, fileUri, fileName, fileType, dadosOcr = null }) {
    const submissaoObj = {
      aluno:     { id: alunoId },
      categoria: { id: categoriaId },
      curso:     { id: cursoId },
    };

    if (dadosOcr && Object.values(dadosOcr).some(v => v !== null && v !== '')) {
      submissaoObj.certificado = {
        nomeAlunoOcr:     dadosOcr.nomeAlunoOcr      || null,
        nomeCursoOcr:     dadosOcr.nomeCursoOcr      || null,
        cargaHorariaOcr:  dadosOcr.cargaHorariaOcr   ? Number(dadosOcr.cargaHorariaOcr) : null,
        dataConclusaoOcr: dadosOcr.dataConclusaoOcr  || null,
      };
    }

    const formData = new FormData();

    formData.append('submissao', {
      string: JSON.stringify(submissaoObj),
      type: 'application/json',
      name: 'submissao.json',
    });

    formData.append('file', {
      uri: fileUri,
      type: fileType || 'image/jpeg',
      name: fileName || 'certificado.jpg',
    });

    return api.post('/submissoes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default ActivityService;