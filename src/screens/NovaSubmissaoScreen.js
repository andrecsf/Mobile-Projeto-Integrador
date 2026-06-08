import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ActivityService from '../services/activityService';
import { colors, shadows } from '../theme/colors';
import authStore from '../store/authStore';

// ─── Select customizado ────────────────────────────────────
const SelectField = ({ placeholder, value, options, onSelect, loading, disabled, error }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);

  return (
    <View>
      <TouchableOpacity
        style={[styles.selectButton, error && styles.inputError, disabled && styles.inputDisabled]}
        onPress={() => !disabled && setOpen(v => !v)}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <>
            <Text style={selected ? styles.selectValue : styles.selectPlaceholder} numberOfLines={1}>
              {selected ? selected.label : placeholder}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>▾</Text>
          </>
        )}
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.length === 0 ? (
            <Text style={styles.dropdownEmpty}>Nenhuma opção disponível</Text>
          ) : (
            options.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.dropdownItem, value === opt.id && styles.dropdownItemActive]}
                onPress={() => { onSelect(opt.id); setOpen(false); }}
              >
                <Text style={[styles.dropdownLabel, value === opt.id && styles.dropdownLabelActive]}>
                  {opt.label}
                </Text>
                {value === opt.id && <Text style={{ color: colors.accent, fontSize: 14 }}>✓</Text>}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
};

// ─── Campo com label e erro ────────────────────────────────
const FormField = ({ label, required, error, children }) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>
      {label}{required && <Text style={{ color: colors.danger }}> *</Text>}
    </Text>
    {children}
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ─── Tela principal ────────────────────────────────────────
export default function NovaSubmissaoScreen() {
  const [form, setForm] = useState({
    cursoId: null,
    categoriaId: null,
    nomeAluno: '',
    nomeEvento: '',
    cargaHoraria: '',
    dataConclusao: '',
  });
  const [arquivo, setArquivo] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // ── BUSCA DE CURSOS OTIMIZADA ──
  useEffect(() => {
    const fetchCursos = async () => {
      setLoadingCursos(true);
      try {
        const user = authStore.getUser();
        if (!user || !user.id) {
          Alert.alert('Erro', 'Sessão inválida. Inicie sessão novamente.');
          return;
        }

        const cursosDoAluno = await ActivityService.getCursosByAluno(user.id);
        
        setCursos((cursosDoAluno || []).map(c => ({ 
          id: c.id, 
          label: c.nome 
        })));

      } catch (error) {
        console.log("ERRO BUSCA CURSOS:", error.response ? error.response.status : error.message);
        Alert.alert('Erro', 'Não foi possível carregar os seus cursos.');
      } finally {
        setLoadingCursos(false);
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    if (!form.cursoId) { setCategorias([]); return; }
    const fetchCategorias = async () => {
      setLoadingCategorias(true);
      try {
        const data = await ActivityService.getCategoriasByCurso(form.cursoId);
        setCategorias((data || []).map(c => ({ id: c.id, label: c.area })));
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar as categorias.');
      } finally {
        setLoadingCategorias(false);
      }
    };
    fetchCategorias();
    setForm(f => ({ ...f, categoriaId: null }));
  }, [form.cursoId]);

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: null }));
  };

  const pedirPermissao = async (tipo) => {
    if (tipo === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à câmara nas definições.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à galeria nas definições.');
        return false;
      }
    }
    return true;
  };

  const abrirGaleria = async () => {
    if (!(await pedirPermissao('galeria'))) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setArquivo({ uri: asset.uri, name: asset.fileName || `cert_${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' });
      setErrors(e => ({ ...e, arquivo: null }));
    }
  };

  const abrirCamera = async () => {
    if (!(await pedirPermissao('camera'))) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setArquivo({ uri: asset.uri, name: `cert_${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' });
      setErrors(e => ({ ...e, arquivo: null }));
    }
  };

  const validar = useCallback(() => {
    const e = {};
    if (!form.cursoId)            e.cursoId      = 'Selecione o curso.';
    if (!form.categoriaId)        e.categoriaId  = 'Selecione a categoria.';
    if (!form.nomeAluno.trim())   e.nomeAluno    = 'Introduza o nome do aluno.';
    if (!form.nomeEvento.trim())  e.nomeEvento   = 'Introduza o nome do evento ou curso.';
    if (!form.cargaHoraria.trim()) e.cargaHoraria = 'Introduza a carga horária.';
    else if (isNaN(Number(form.cargaHoraria)) || Number(form.cargaHoraria) <= 0)
      e.cargaHoraria = 'Deve ser um número positivo.';
    if (!form.dataConclusao.trim()) e.dataConclusao = 'Introduza a data de conclusão.';
    if (!arquivo)                 e.arquivo      = 'Anexe o certificado.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, arquivo]);

  const handleEnviar = async () => {
    if (!validar()) return;
    setSubmitting(true);
    try {
      await ActivityService.inserirSubmissao({
        alunoId: authStore.getUser().id,
        categoriaId: form.categoriaId,
        cursoId:    form.cursoId,
        fileUri:    arquivo.uri,
        fileName:   arquivo.name,
        fileType:   arquivo.type,
        dadosOcr: {
          nomeAlunoOcr:     form.nomeAluno,
          nomeCursoOcr:     form.nomeEvento,
          cargaHorariaOcr:  form.cargaHoraria,
          dataConclusaoOcr: form.dataConclusao,
        },
      });
      setSucesso(true);
    } catch (err) {
      Alert.alert('Erro ao enviar', err.message || 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetar = () => {
    setForm({ cursoId: null, categoriaId: null, nomeAluno: '', nomeEvento: '', cargaHoraria: '', dataConclusao: '' });
    setArquivo(null);
    setErrors({});
    setSucesso(false);
  };

  // ── Ecrã de sucesso ───────────────────────────────────────
  if (sucesso) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={{ fontSize: 38, color: colors.success }}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Certificado enviado!</Text>
          <Text style={styles.successSubtitle}>
            A sua submissão foi registada e aguarda análise do coordenador.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={resetar}>
            <Text style={styles.btnPrimaryText}>Enviar outro certificado</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Novo Certificado</Text>
            <Text style={styles.headerSubtitle}>Preencha os dados e anexe o comprovante</Text>
          </View>

          {/* ── Card 1: Comprovante ─── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Comprovante</Text>
            <Text style={styles.sectionSubtitle}>Tire uma fotografia ou selecione da galeria</Text>

            {arquivo ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: arquivo.uri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.previewBar}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.previewName} numberOfLines={1}>{arquivo.name}</Text>
                    <Text style={styles.previewType}>{arquivo.type}</Text>
                  </View>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setArquivo(null)}>
                    <Text style={styles.removeBtnText}>✕ Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.uploadArea}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📎</Text>
                <Text style={styles.uploadHint}>Nenhum ficheiro selecionado</Text>
                {errors.arquivo && (
                  <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 8 }]}>
                    {errors.arquivo}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.uploadButtons}>
              <TouchableOpacity style={styles.btnCamera} onPress={abrirCamera} activeOpacity={0.7}>
                <Text style={styles.btnCameraText}>📷  Câmara</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGaleria} onPress={abrirGaleria} activeOpacity={0.7}>
                <Text style={styles.btnGaleriaText}>🖼️  Galeria</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Card 2: Identificação ─── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Identificação</Text>

            <FormField label="Curso" required error={errors.cursoId}>
              <SelectField
                placeholder="Selecione o curso"
                value={form.cursoId}
                options={cursos}
                onSelect={v => setField('cursoId', v)}
                loading={loadingCursos}
                error={errors.cursoId}
              />
            </FormField>

            <FormField label="Categoria de atividade" required error={errors.categoriaId}>
              <SelectField
                placeholder={form.cursoId ? 'Selecione a categoria' : 'Selecione o curso primeiro'}
                value={form.categoriaId}
                options={categorias}
                onSelect={v => setField('categoriaId', v)}
                loading={loadingCategorias}
                disabled={!form.cursoId}
                error={errors.categoriaId}
              />
            </FormField>
          </View>

          {/* ── Card 3: Dados do certificado ─── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dados do Certificado</Text>

            <FormField label="Nome do aluno" required error={errors.nomeAluno}>
              <TextInput
                style={[styles.input, errors.nomeAluno && styles.inputError]}
                placeholder="Ex: João da Silva"
                placeholderTextColor={colors.textMuted}
                value={form.nomeAluno}
                onChangeText={v => setField('nomeAluno', v)}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </FormField>

            <FormField label="Nome do evento / curso realizado" required error={errors.nomeEvento}>
              <TextInput
                style={[styles.input, errors.nomeEvento && styles.inputError]}
                placeholder="Ex: Workshop de Desenvolvimento Web"
                placeholderTextColor={colors.textMuted}
                value={form.nomeEvento}
                onChangeText={v => setField('nomeEvento', v)}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </FormField>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <FormField label="Carga horária (h)" required error={errors.cargaHoraria}>
                  <TextInput
                    style={[styles.input, errors.cargaHoraria && styles.inputError]}
                    placeholder="Ex: 40"
                    placeholderTextColor={colors.textMuted}
                    value={form.cargaHoraria}
                    onChangeText={v => setField('cargaHoraria', v.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                </FormField>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <FormField label="Data de conclusão" required error={errors.dataConclusao}>
                  <TextInput
                    style={[styles.input, errors.dataConclusao && styles.inputError]}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textMuted}
                    value={form.dataConclusao}
                    onChangeText={v => {
                      const d = v.replace(/\D/g, '').slice(0, 8);
                      let m = d;
                      if (d.length > 4) m = `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
                      else if (d.length > 2) m = `${d.slice(0,2)}/${d.slice(2)}`;
                      setField('dataConclusao', m);
                    }}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </FormField>
              </View>
            </View>
          </View>

          {/* ── Botão enviar ─── */}
          <TouchableOpacity
            style={[styles.btnPrimary, submitting && { opacity: 0.6 }]}
            onPress={handleEnviar}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnPrimaryText}>Enviar Certificado</Text>
            }
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea:       { flex: 1, backgroundColor: colors.bg },
  scroll:         { padding: 20 },

  header:         { marginBottom: 20 },
  headerTitle:    { fontSize: 24, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionTitle:    { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 16 },

  fieldWrapper: { marginBottom: 16 },
  label:        { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 6 },

  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError:    { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  inputDisabled: { opacity: 0.5 },
  errorText:     { fontSize: 12, color: colors.danger, marginTop: 4 },

  row: { flexDirection: 'row' },

  selectButton: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  selectPlaceholder: { color: colors.textMuted, fontSize: 15, flex: 1 },
  selectValue:       { color: colors.textPrimary, fontSize: 15, flex: 1 },

  dropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    ...shadows.md,
  },
  dropdownItem:       { paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownItemActive: { backgroundColor: colors.accentLight },
  dropdownLabel:      { fontSize: 14, color: colors.textPrimary, flex: 1 },
  dropdownLabelActive:{ color: colors.accent, fontWeight: '600' },
  dropdownEmpty:      { padding: 16, color: colors.textMuted, fontSize: 14, textAlign: 'center' },

  uploadArea: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    backgroundColor: colors.bg,
    marginBottom: 12,
  },
  uploadHint:    { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  uploadButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },

  btnCamera: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.blue700,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCameraText: { color: colors.blue700, fontSize: 14, fontWeight: '600' },

  btnGaleria: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGaleriaText: { color: colors.accent, fontSize: 14, fontWeight: '600' },

  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: { width: '100%', height: 180 },
  previewBar:   { backgroundColor: colors.card, padding: 12, flexDirection: 'row', alignItems: 'center' },
  previewName:  { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  previewType:  { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  removeBtn:    { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.dangerLight, borderRadius: 8 },
  removeBtnText:{ color: colors.danger, fontSize: 12, fontWeight: '600' },

  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    ...shadows.md,
  },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.bg },
  successIcon:      { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle:     { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  successSubtitle:  { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});