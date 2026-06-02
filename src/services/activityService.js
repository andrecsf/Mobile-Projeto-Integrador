import api from './api';

/**
 * activityService.js — AcadFlow Mobile
 *
 * Contrato do backend:
 * POST /submissoes  multipart/form-data
 *   part "submissao" (JSON):
 *     { aluno: { id }, categoria: { id }, curso: { id },
 *       certificado: { nomeAlunoOcr, nomeCursoOcr, cargaHorariaOcr, dataConclusaoOcr } | null }
 *   part "file": arquivo binário
 */

const ActivityService = {
  // ── CATEGORIAS ──────────────────────────────────────────
  getCategorias() {
    return api.get('/categorias');
  },

  getCategoriasByCurso(cursoId) {
    return api.get(`/categorias?cursoId=${cursoId}`);
  },

  // ── CURSOS ───────────────────────────────────────────────
  getCursos() {
    return api.get('/cursos');
  },

  // ── SUBMISSÕES ───────────────────────────────────────────
  getSubmissoesByAluno(alunoId) {
    return api.get(`/submissoes?alunoId=${alunoId}`);
  },

  /**
   * Envia um certificado.
   *
   * @param {object} params
   *   alunoId      {number}
   *   categoriaId  {number}
   *   cursoId      {number}
   *   fileUri      {string}  — URI local do arquivo (expo-image-picker)
   *   fileName     {string}  — nome do arquivo
   *   fileType     {string}  — mime type (image/jpeg, application/pdf…)
   *   dadosOcr     {object|null}
   *     nomeAlunoOcr, nomeCursoOcr, cargaHorariaOcr, dataConclusaoOcr
   */
  async inserirSubmissao({ alunoId, categoriaId, cursoId, fileUri, fileName, fileType, dadosOcr = null }) {
    const submissaoObj = {
      aluno:     { id: alunoId },
      categoria: { id: categoriaId },
      curso:     { id: cursoId },
    };

    if (dadosOcr && Object.values(dadosOcr).some(v => v !== null && v !== '')) {
      submissaoObj.certificado = {
        nomeAlunoOcr:     dadosOcr.nomeAlunoOcr     || null,
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