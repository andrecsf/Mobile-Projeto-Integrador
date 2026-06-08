import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import { colors, shadows } from '../theme/colors';

// ─── Helpers ──────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDENTE:  { label: 'Pendente',  bg: colors.warningLight, text: colors.warning  },
  APROVADO:  { label: 'Aprovado',  bg: colors.successLight, text: colors.success  },
  REPROVADO: { label: 'Reprovado', bg: colors.dangerLight,  text: colors.danger   },
};

const formatarData = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return isoString;
  }
};

// ─── Linha de detalhe ─────────────────────────────────────
const DetalheRow = ({ label, value, accent }) => (
  <View style={styles.detalheRow}>
    <Text style={styles.detalheLabel}>{label}</Text>
    <Text style={[styles.detalheValue, accent && { color: colors.accent, fontWeight: '600' }]}>
      {value || '—'}
    </Text>
  </View>
);

// ─── Divisor ──────────────────────────────────────────────
const Divider = () => <View style={styles.divider} />;

// ─── Componente principal ─────────────────────────────────
/**
 * CertificadoModal
 *
 * Props:
 *   certificado  {SubmissaoDTO | null}  — objeto retornado pelo backend; null = modal fechado
 *   onClose      {() => void}
 *
 * SubmissaoDTO esperado:
 *   id, dataEnvio, status, horasAproveitadas, observacaoCoordenador,
 *   nomeAluno, nomeCategoria, urlCertificado, nomeCurso,
 *   dadosOcr: { nomeAlunoOcr, nomeCursoOcr, cargaHorariaOcr, dataConclusaoOcr } | null
 */
export default function CertificadoModal({ certificado, onClose }) {
  if (!certificado) return null;

  const status = STATUS_CONFIG[certificado.status] ?? STATUS_CONFIG.PENDENTE;
  const ocr = certificado.dadosOcr;

  const abrirCertificado = () => {
    if (certificado.urlCertificado) {
      Linking.openURL(certificado.urlCertificado);
    }
  };

  return (
    <Modal
      visible={!!certificado}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle} numberOfLines={2}>
              {ocr?.nomeCursoOcr || certificado.nomeCategoria || 'Certificado'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Preview do certificado */}
          {certificado.urlCertificado ? (
            <TouchableOpacity onPress={abrirCertificado} activeOpacity={0.85}>
              <Image
                source={{ uri: certificado.urlCertificado }}
                style={styles.certificadoImage}
                resizeMode="cover"
              />
              <View style={styles.verOriginalBanner}>
                <Text style={styles.verOriginalText}>🔗  Ver certificado original</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.semImagem}>
              <Text style={{ fontSize: 32 }}>📄</Text>
              <Text style={styles.semImagemText}>Sem imagem disponível</Text>
            </View>
          )}

          {/* ── Seção: Identificação ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identificação</Text>
            <DetalheRow label="Aluno"     value={certificado.nomeAluno} />
            <DetalheRow label="Curso"     value={certificado.nomeCurso} />
            <DetalheRow label="Categoria" value={certificado.nomeCategoria} />
          </View>

          <Divider />

          {/* ── Seção: Dados do certificado (OCR) ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Certificado</Text>
            <DetalheRow label="Nome no certificado" value={ocr?.nomeAlunoOcr} />
            <DetalheRow label="Evento / Curso"      value={ocr?.nomeCursoOcr} />
            <DetalheRow
              label="Carga horária"
              value={ocr?.cargaHorariaOcr != null ? `${ocr.cargaHorariaOcr}h` : null}
              accent
            />
            <DetalheRow label="Data de conclusão"   value={ocr?.dataConclusaoOcr} />
          </View>

          <Divider />

          {/* ── Seção: Análise ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise</Text>
            <DetalheRow label="Data de envio"      value={formatarData(certificado.dataEnvio)} />
            <DetalheRow
              label="Horas aproveitadas"
              value={certificado.horasAproveitadas > 0 ? `${certificado.horasAproveitadas}h` : null}
              accent
            />
            {certificado.observacaoCoordenador ? (
              <View style={styles.observacaoBox}>
                <Text style={styles.observacaoLabel}>Observação do coordenador</Text>
                <Text style={styles.observacaoText}>{certificado.observacaoCoordenador}</Text>
              </View>
            ) : (
              <DetalheRow label="Observação" value={null} />
            )}
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Estilos ───────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...shadows.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  closeBtnText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  scrollContent: { paddingBottom: 32 },

  // Imagem
  certificadoImage: {
    width: '100%',
    height: 200,
  },
  verOriginalBanner: {
    backgroundColor: colors.accentLight,
    paddingVertical: 10,
    alignItems: 'center',
  },
  verOriginalText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  semImagem: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 8,
  },
  semImagemText: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Seções
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },

  // Linhas de detalhe
  detalheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
    gap: 16,
  },
  detalheLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detalheValue: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1.4,
    textAlign: 'right',
  },

  // Observação do coordenador
  observacaoBox: {
    backgroundColor: colors.warningLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  observacaoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  observacaoText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});