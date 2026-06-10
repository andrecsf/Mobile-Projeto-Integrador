import api from './api';


const ActivityService = {
  // ── CATEGORIAS ──────────────────────────────────────────
  getCategorias() {
    return api.get('/categorias').then(r => r.data);
  },

  getCategoriasByCurso(cursoId) {
    return api.get(`/categorias?cursoId=${cursoId}`).then(r => r.data);
  },

  getAluno(alunoId) {
    return api.get(`/alunos/${alunoId}`).then(r => r.data);
  },

  getCursosByAluno(alunoId) {
    return api.get(`/alunos/${alunoId}/cursos`).then(r => r.data);
  },

  // ── SUBMISSÕES ──────────────────────────────────────────
  getSubmissoesByAluno(alunoId, cursoId = null) {
    const url = cursoId
      ? `/submissoes/aluno/${alunoId}?cursoId=${cursoId}`
      : `/submissoes/aluno/${alunoId}`;
    return api.get(url).then(r => r.data);
  },

  
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