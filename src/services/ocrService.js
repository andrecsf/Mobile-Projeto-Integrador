// src/services/ocrService.js
const OCR_BASE_URL = 'https://ocr-tesseract-python.onrender.com';

const OcrService = {
  async lerCertificado({ uri, name, type }) {
    const formData = new FormData();
    formData.append('file', { uri, name: name || 'certificado.jpg', type: type || 'image/jpeg' });

    const MAX_TENTATIVAS = 3;
    const ESPERA_MS = 5000;

    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
      const response = await fetch(`${OCR_BASE_URL}/ler-certificado`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.sucesso) throw new Error('OCR não retornou sucesso.');
        return data.dadosOcr; // { nomeAlunoOcr, nomeCursoOcr, cargaHorariaOcr, dataConclusaoOcr }
      }

      // 503 = Render ainda acordando, espera e tenta de novo
      if (response.status === 503 && tentativa < MAX_TENTATIVAS) {
        await new Promise(res => setTimeout(res, ESPERA_MS));
        continue;
      }

      // Outro erro ou esgotou tentativas
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Erro OCR: ${response.status}`);
    }
  },
};

export default OcrService;