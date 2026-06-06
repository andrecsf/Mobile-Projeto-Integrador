import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import SubmissaoCard from '../components/SubmissaoCard';
import { colors, shadows } from '../theme/colors';
import api from '../services/api';
import authStore from '../store/authStore';

const STATUS_OPTIONS   = ['Todos', 'PENDENTE', 'APROVADO', 'REJEITADO'];
const STATUS_COLORS = {
  PENDENTE:  { bg: '#fef3c7', text: '#d97706' },
  APROVADO:  { bg: '#e6f9ef', text: '#12a150' },
  REJEITADO: { bg: '#fee2e2', text: '#dc2626' },
  Todos:     { bg: colors.accentLight, text: colors.accent },
};

function FilterChip({ label, active, onPress, colorSet }) {
  const cs = colorSet || STATUS_COLORS['Todos'];
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: cs.bg, borderColor: cs.text }
          : { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? cs.text : colors.textMuted }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MinhasSubmissoesScreen({ navigation }) {
  const [submissoes, setSubmissoes]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroCat, setFiltroCat]       = useState('Todas');
  const [filtroCurso, setFiltroCurso]   = useState('Todos');

  const buscarSubmissoes = async () => {
    try {
      setLoading(true);
      const user    = authStore.getUser();
      const alunoId = user?.id;
      if (!alunoId) {
        Alert.alert('Sessão inválida', 'Não foi possível identificar o usuário. Faça login novamente.');
        return;
      }
      const response = await api.get(`/submissoes/aluno/${alunoId}`);
      setSubmissoes(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível carregar as submissões. Verifique se o servidor está ativo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', buscarSubmissoes);
    return unsubscribe;
  }, [navigation]);

  // Opções dinâmicas de categoria e curso
  const categorias = useMemo(() => {
    const set = new Set(submissoes.map(s => s.nomeCategoria).filter(Boolean));
    return ['Todas', ...Array.from(set)];
  }, [submissoes]);

  const cursos = useMemo(() => {
    const set = new Set(submissoes.map(s => s.nomeCurso).filter(Boolean));
    return ['Todos', ...Array.from(set)];
  }, [submissoes]);

  const filtradas = useMemo(() => {
    return submissoes.filter(s => {
      const okStatus = filtroStatus === 'Todos' || (s.status || '').toUpperCase() === filtroStatus;
      const okCat    = filtroCat   === 'Todas'  || s.nomeCategoria === filtroCat;
      const okCurso  = filtroCurso === 'Todos'  || s.nomeCurso     === filtroCurso;
      return okStatus && okCat && okCurso;
    });
  }, [submissoes, filtroStatus, filtroCat, filtroCurso]);

  const totalFiltros = (filtroStatus !== 'Todos' ? 1 : 0) +
                       (filtroCat    !== 'Todas'  ? 1 : 0) +
                       (filtroCurso  !== 'Todos'  ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Submissões</Text>
        <Text style={styles.subtitle}>Acompanhe o status dos seus certificados</Text>
      </View>

      {/* ── Painel de filtros ── */}
      <View style={styles.filterPanel}>
        {/* Status */}
        <Text style={styles.filterLabel}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {STATUS_OPTIONS.map(s => (
            <FilterChip
              key={s}
              label={s}
              active={filtroStatus === s}
              onPress={() => setFiltroStatus(s)}
              colorSet={STATUS_COLORS[s] || STATUS_COLORS['Todos']}
            />
          ))}
        </ScrollView>

        {/* Categoria */}
        {categorias.length > 1 && (
          <>
            <Text style={styles.filterLabel}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {categorias.map(c => (
                <FilterChip
                  key={c}
                  label={c}
                  active={filtroCat === c}
                  onPress={() => setFiltroCat(c)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Curso */}
        {cursos.length > 1 && (
          <>
            <Text style={styles.filterLabel}>Curso</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {cursos.map(c => (
                <FilterChip
                  key={c}
                  label={c}
                  active={filtroCurso === c}
                  onPress={() => setFiltroCurso(c)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Resumo */}
        <View style={styles.filterSummary}>
          <Text style={styles.filterCount}>
            {filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}
          </Text>
          {totalFiltros > 0 && (
            <TouchableOpacity
              onPress={() => { setFiltroStatus('Todos'); setFiltroCat('Todas'); setFiltroCurso('Todos'); }}
            >
              <Text style={styles.clearBtn}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista */}
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
          renderItem={({ item }) => (
            <SubmissaoCard
              titulo={item.nomeAluno}
              horas={item.horasAproveitadas}
              categoria={item.nomeCategoria}
              status={item.status}
              data={item.dataEnvio}
              observacao={item.observacaoCoordenador}
              curso={item.nomeCurso}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {submissoes.length === 0
                ? 'Nenhum certificado submetido ainda.'
                : 'Nenhuma submissão encontrada com esses filtros.'}
            </Text>
          }
          refreshing={loading}
          onRefresh={buscarSubmissoes}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NovaSubmissao')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  title:            { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle:         { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

  // Filtros
  filterPanel: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  filterLabel:  { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  chipRow:      { flexDirection: 'row', marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  chipText:     { fontSize: 13, fontWeight: '600' },
  filterSummary:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  filterCount:  { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  clearBtn:     { fontSize: 13, color: colors.accent, fontWeight: '700' },

  list:             { padding: 20, paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:      { color: colors.textMuted, marginTop: 10, fontSize: 14 },
  emptyText:        { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 16 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: colors.accent,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  fabText: { color: colors.white, fontSize: 28, fontWeight: 'bold' },
});