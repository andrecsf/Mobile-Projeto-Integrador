import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Pressable, ScrollView,
} from 'react-native';
import SubmissaoCard from '../components/SubmissaoCard';
import { colors, shadows } from '../theme/colors';
import api from '../services/api';
import authStore from '../store/authStore';
import CertificadoModal from '../components/CertificadoModal';

const STATUS_OPTIONS = ['Todos', 'PENDENTE', 'APROVADO', 'REJEITADO'];
const STATUS_META = {
  Todos:     { bg: colors.accentLight, fg: colors.accent,  emoji: '📋' },
  PENDENTE:  { bg: '#fef3c7',          fg: '#d97706',       emoji: '⏳' },
  APROVADO:  { bg: '#e6f9ef',          fg: '#12a150',       emoji: '✅' },
  REJEITADO: { bg: '#fee2e2',          fg: '#dc2626',       emoji: '❌' },
};

function FilterIcon({ color = colors.textPrimary, size = 18 }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', gap: 3 }}>
      <View style={{ height: 2, backgroundColor: color, borderRadius: 99, width: '100%' }} />
      <View style={{ height: 2, backgroundColor: color, borderRadius: 99, width: '70%', alignSelf: 'center' }} />
      <View style={{ height: 2, backgroundColor: color, borderRadius: 99, width: '40%', alignSelf: 'center' }} />
    </View>
  );
}

function OptionRow({ label, selected, onPress, meta }) {
  const m = meta || { bg: colors.accentLight, fg: colors.accent };
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        mStyles.optionRow,
        selected && { backgroundColor: m.bg, borderColor: m.fg },
      ]}
    >
      {meta?.emoji
        ? <Text style={mStyles.emoji}>{meta.emoji}</Text>
        : <View style={[mStyles.dot, { backgroundColor: selected ? m.fg : colors.border }]} />
      }
      <Text style={[mStyles.optionLabel, selected && { color: m.fg, fontWeight: '700' }]}>
        {label}
      </Text>
      {selected && (
        <View style={[mStyles.check, { backgroundColor: m.fg }]}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function FilterSection({ title, options, value, onChange, metaMap }) {
  return (
    <View style={mStyles.section}>
      <Text style={mStyles.sectionTitle}>{title}</Text>
      {options.map(opt => (
        <OptionRow
          key={opt}
          label={opt}
          selected={value === opt}
          onPress={() => onChange(opt)}
          meta={metaMap?.[opt]}
        />
      ))}
    </View>
  );
}

export default function MinhasSubmissoesScreen({ navigation }) {
  const [submissoes, setSubmissoes]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [certSelecionado, setCertSelecionado] = useState(null);

  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroCat,    setFiltroCat]    = useState('Todas');
  const [filtroCurso,  setFiltroCurso]  = useState('Todos');

  const [draftStatus, setDraftStatus] = useState('Todos');
  const [draftCat,    setDraftCat]    = useState('Todas');
  const [draftCurso,  setDraftCurso]  = useState('Todos');

  const buscarSubmissoes = async () => {
    try {
      setLoading(true);
      const user    = authStore.getUser();
      const alunoId = user?.id;
      if (!alunoId) {
        Alert.alert('Sessão inválida', 'Faça login novamente.');
        return;
      }
      const response = await api.get(`/submissoes/aluno/${alunoId}`);
      setSubmissoes(response.data);
    } catch {
      Alert.alert('Erro de Conexão', 'Não foi possível carregar as submissões.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', buscarSubmissoes);
    return unsubscribe;
  }, [navigation]);

  const categorias = useMemo(() => {
    const set = new Set(submissoes.map(s => s.nomeCategoria).filter(Boolean));
    return ['Todas', ...Array.from(set)];
  }, [submissoes]);

  const cursos = useMemo(() => {
    const set = new Set(submissoes.map(s => s.nomeCurso).filter(Boolean));
    return ['Todos', ...Array.from(set)];
  }, [submissoes]);

  const filtradas = useMemo(() => submissoes.filter(s => {
    const okStatus = filtroStatus === 'Todos' || (s.status || '').toUpperCase() === filtroStatus;
    const okCat    = filtroCat   === 'Todas'  || s.nomeCategoria === filtroCat;
    const okCurso  = filtroCurso === 'Todos'  || s.nomeCurso     === filtroCurso;
    return okStatus && okCat && okCurso;
  }), [submissoes, filtroStatus, filtroCat, filtroCurso]);

  const totalFiltros = (filtroStatus !== 'Todos' ? 1 : 0) +
                       (filtroCat    !== 'Todas'  ? 1 : 0) +
                       (filtroCurso  !== 'Todos'  ? 1 : 0);

  const openModal = () => {
    setDraftStatus(filtroStatus);
    setDraftCat(filtroCat);
    setDraftCurso(filtroCurso);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const applyFilters = () => {
    setFiltroStatus(draftStatus);
    setFiltroCat(draftCat);
    setFiltroCurso(draftCurso);
    setModalVisible(false);
  };

  const clearAll = () => {
    setDraftStatus('Todos');
    setDraftCat('Todas');
    setDraftCurso('Todos');
  };

  const ListToolbar = () => (
    <View style={styles.toolbar}>
      <Text style={styles.resultCount}>
        {filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {filtroStatus !== 'Todos' && (
          <View style={[styles.activeTag, { backgroundColor: STATUS_META[filtroStatus]?.bg }]}>
            <Text style={[styles.activeTagText, { color: STATUS_META[filtroStatus]?.fg }]}>
              {STATUS_META[filtroStatus]?.emoji} {filtroStatus}
            </Text>
          </View>
        )}
        {filtroCat !== 'Todas' && (
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>📂</Text>
          </View>
        )}
        {filtroCurso !== 'Todos' && (
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>🎓</Text>
          </View>
        )}
        <TouchableOpacity onPress={openModal} style={[styles.filterBtn, totalFiltros > 0 && styles.filterBtnActive]}>
          <FilterIcon color={totalFiltros > 0 ? colors.accent : colors.textSecondary} size={16} />
          {totalFiltros > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalFiltros}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Minhas Submissões</Text>
        <Text style={styles.subtitle}>Acompanhe o status dos seus certificados</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<ListToolbar />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setCertSelecionado(item)} activeOpacity={0.8}>
              <SubmissaoCard
                titulo={item.nomeAluno}
                horas={item.horasAproveitadas}
                categoria={item.nomeCategoria}
                status={item.status}
                data={item.dataEnvio}
                observacao={item.observacaoCoordenador}
                curso={item.nomeCurso}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {submissoes.length === 0
                ? 'Nenhum certificado submetido ainda.'
                : 'Nenhuma submissão com esses filtros.'}
            </Text>
          }
          refreshing={loading}
          onRefresh={buscarSubmissoes}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NovaSubmissao')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <Pressable style={mStyles.overlay} onPress={closeModal} />

        <View style={mStyles.sheet}>
          <View style={mStyles.handleArea}>
            <View style={mStyles.handle} />
          </View>

          <View style={mStyles.sheetHeader}>
            <Text style={mStyles.sheetTitle}>Filtrar submissões</Text>
            <TouchableOpacity onPress={clearAll}>
              <Text style={mStyles.clearAllBtn}>Limpar tudo</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
            <FilterSection
              title="Status"
              options={STATUS_OPTIONS}
              value={draftStatus}
              onChange={setDraftStatus}
              metaMap={STATUS_META}
            />
            {categorias.length > 1 && (
              <FilterSection
                title="Categoria"
                options={categorias}
                value={draftCat}
                onChange={setDraftCat}
              />
            )}
            {cursos.length > 1 && (
              <FilterSection
                title="Curso"
                options={cursos}
                value={draftCurso}
                onChange={setDraftCurso}
              />
            )}
          </ScrollView>

          <TouchableOpacity style={mStyles.applyBtn} onPress={applyFilters} activeOpacity={0.85}>
            <Text style={mStyles.applyBtnText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <CertificadoModal                          
        certificado={certSelecionado}
        onClose={() => setCertSelecionado(null)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: 20,
    borderBottomWidth: 0,
    
    backgroundColor: colors.bg,
  },
  title:    { fontSize: 24, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#ffffff', marginTop: 4, opacity: 0.7 },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultCount: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },

  filterBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.bg,
    borderWidth: 1.5, 
    alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  filterBtnActive: { backgroundColor: colors.accentLight, borderColor: colors.accent },
  badge: {
    position: 'absolute', top: -5, right: -5,
    width: 17, height: 17, borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  activeTag: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  activeTagText: { fontSize: 11, fontWeight: '600', color: colors.accent },

  list:             { padding: 20, paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:      { color: colors.textMuted, marginTop: 10, fontSize: 14 },
  emptyText:        { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 16 },

  fab: {
    position: 'absolute', right: 24, bottom: 24,
    backgroundColor: colors.accent,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    ...shadows.md,
  },
  fabText: { color: colors.white, fontSize: 28, fontWeight: 'bold' },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,22,40,0.45)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 0,
    ...shadows.md,
  },
  handleArea: { alignItems: 'center', paddingVertical: 14 },
  handle: { width: 40, height: 4, borderRadius: 99, backgroundColor: colors.borderStrong },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  sheetTitle:  { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  clearAllBtn: { fontSize: 14, color: colors.danger, fontWeight: '700' },

  section:      { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1.5,
     marginBottom: 8,
    backgroundColor: colors.inputBg, gap: 10,
  },
  emoji:       { fontSize: 16 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  check: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtn: {
    backgroundColor: colors.accent, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 8, ...shadows.md,
  },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});