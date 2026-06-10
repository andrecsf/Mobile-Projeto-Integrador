import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, shadows } from '../theme/colors';
import authStore from '../store/authStore';
import ActivityService from '../services/activityService';
import SubmissaoCard from '../components/SubmissaoCard';
import CertificadoModal from '../components/CertificadoModal';
import CursoSelector from '../components/CursoSelector';
import Svg, { Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const DONUT_SIZE = 160;
const STROKE = 18;
const RADIUS = (DONUT_SIZE - STROKE) / 2;
const CIRCUNFERENCIA = 2 * Math.PI * RADIUS;

function DonutChart({ progresso, horasFeitas, horasMeta }) {
  const anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progresso,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progresso]);

  const pct = Math.min(progresso, 1);
  const angulo = pct * 2 * Math.PI;

  const cx = DONUT_SIZE / 2;
  const cy = DONUT_SIZE / 2;

  // Ponto final do arco na circunferência
  const x = cx + RADIUS * Math.sin(angulo);
  const y = cy - RADIUS * Math.cos(angulo);
  const largeArc = pct > 0.5 ? 1 : 0;

  // Path do arco: começa no topo (cx, cy - RADIUS) e vai até (x, y)
  const d = pct === 0
    ? ''
    : pct >= 1
      ? `M ${cx} ${cy - RADIUS} A ${RADIUS} ${RADIUS} 0 1 1 ${cx - 0.001} ${cy - RADIUS}`
      : `M ${cx} ${cy - RADIUS} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x} ${y}`;

  return (
    <View style={donutStyles.wrapper}>
      <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
        {/* Track cinza */}
        <Circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke={colors.accentLight}
          strokeWidth={STROKE}
        />
        {/* Arco de progresso */}
        {pct > 0 && (
          <Path
            d={d}
            fill="none"
            stroke={pct >= 1 ? colors.success : colors.accent}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        )}
      </Svg>
      {/* Texto central sobreposto */}
      <View style={donutStyles.hole}>
        <Text style={donutStyles.horasFeitas}>{horasFeitas}h</Text>
        <Text style={donutStyles.horasLabel}>de {horasMeta}h</Text>
      </View>
    </View>
  );
}

const donutStyles = StyleSheet.create({
  wrapper: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hole: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horasFeitas: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: -1,
  },
  horasLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
});

function BarraProgresso({ progresso }) {
  const anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progresso,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progresso]);

  const largura = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={barStyles.trilha}>
      <Animated.View
        style={[
          barStyles.preenchimento,
          { width: largura },
          progresso >= 1 && { backgroundColor: colors.success },
        ]}
      />
    </View>
  );
}

const barStyles = StyleSheet.create({
  trilha: {
    height: 10,
    backgroundColor: colors.accentLight,
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 12,
  },
  preenchimento: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 99,
  },
});

function ChipStatus({ status, count }) {
  const cores = {
    PENDENTE:  { bg: colors.warningLight, text: colors.warning },
    APROVADO:  { bg: colors.successLight, text: colors.success },
    REJEITADO: { bg: colors.dangerLight,  text: colors.danger  },
  };
  const c = cores[status] || { bg: colors.accentLight, text: colors.accent };
  return (
    <View style={[chipStyles.chip, { backgroundColor: c.bg }]}>
      <Text style={[chipStyles.count, { color: c.text }]}>{count}</Text>
      <Text style={[chipStyles.label, { color: c.text }]}>{status}</Text>
    </View>
  );
}

function LogoBadge() {
  return (
    <View style={logoStyles.badge}>
      <View style={logoStyles.dot} />
      <Text style={logoStyles.text}>
        Acad<Text style={{ color: colors.accent }}>Flow</Text>
      </Text>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

const chipStyles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 72,
  },
  count: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: 10, fontWeight: '600', marginTop: 2, letterSpacing: 0.3 },
});

export default function HomeScreen({ navigation, onLogout }) {
  const [aluno, setAluno]                     = useState(null);
  const [cursos, setCursos]                   = useState([]);
  const [cursoAtivo, setCursoAtivo]           = useState(() => authStore.getCursoAtivo());
  const [submissoes, setSubmissoes]           = useState([]);
  const [loadingCursos, setLoadingCursos]     = useState(false);
  const [loadingDados, setLoadingDados]       = useState(true);
  const [certSelecionado, setCertSelecionado] = useState(null);

  const user = authStore.getUser();

  // ── Carrega cursos uma vez (na montagem) ──────────────────
  useEffect(() => {
    if (!user?.id) return;
    setLoadingCursos(true);
    ActivityService.getCursosByAluno(user.id)
      .then(data => {
        const lista = data || [];
        setCursos(lista);
        authStore.inicializarCursoAtivo(lista);
        setCursoAtivo(authStore.getCursoAtivo());
      })
      .catch(e => console.warn('HomeScreen cursos erro:', e.message))
      .finally(() => setLoadingCursos(false));
  }, [user?.id]);

  // ── Recarrega aluno + submissões quando o curso ativo muda ─
  const carregarDados = useCallback(async () => {
    if (!user?.id || !cursoAtivo?.id) return;
    setLoadingDados(true);
    try {
      const [alunoData, submissoesData] = await Promise.all([
        ActivityService.getAluno(user.id),
        ActivityService.getSubmissoesByAluno(user.id, cursoAtivo.id),
      ]);
      setAluno(alunoData);
      setSubmissoes(submissoesData || []);
    } catch (e) {
      console.warn('HomeScreen dados erro:', e.message);
    } finally {
      setLoadingDados(false);
    }
  }, [user?.id, cursoAtivo?.id]);

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  // ── Troca de curso pelo seletor ───────────────────────────
  const handleTrocarCurso = (curso) => {
    authStore.setCursoAtivo(curso);
    setCursoAtivo(curso);
  };

  // ── Derivações ────────────────────────────────────────────
  const cursoDoCursoAtivo = cursos.find(c => c.id === cursoAtivo?.id);
  const horasFeitas = submissoes
  .filter(s => (s.status || '').toUpperCase() === 'APROVADO')
  .reduce((acc, s) => acc + (s.horasAproveitadas ?? 0), 0);
  const horasMeta   = cursoDoCursoAtivo?.cargaHorariaMax ?? 120;
  const progresso   = horasMeta > 0 ? horasFeitas / horasMeta : 0;
  const pctTexto    = Math.min(Math.round(progresso * 100), 100);

  const contagem = submissoes.reduce(
    (acc, s) => {
      const k = (s.status || 'PENDENTE').toUpperCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    { PENDENTE: 0, APROVADO: 0, REJEITADO: 0 },
  );

  const ultimas3     = submissoes.slice(0, 3);
  const loading      = loadingDados;
  const primeiroNome = (aluno?.name || user?.email || 'Aluno').split(' ')[0];
  const hora         = new Date().getHours();
  const saudacao     = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  if (loading && !cursoAtivo) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Carregando seu painel...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LogoBadge />
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>{saudacao},</Text>
            <Text style={styles.nome}>{primeiroNome} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() =>
              Alert.alert(
                "Sair da conta",
                "Tem certeza que deseja sair?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Sair",
                    style: "destructive",
                    onPress: () => {
                      authStore.clearSession();
                      onLogout();
                    },
                  },
                ]
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.avatarLetra}>
              {primeiroNome.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        <CursoSelector
          cursos={cursos.map(c => ({ id: c.id, nome: c.nome }))}
          cursoAtivo={cursoAtivo}
          onChange={handleTrocarCurso}
          loading={loadingCursos}
        />

        {loading ? (
          <View style={styles.loadingInline}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : (
          <>
            <View style={[styles.card, styles.progressoCard]}>
              <Text style={styles.sectionTitle}>Horas Complementares</Text>
              <Text style={styles.sectionSubtitle}>
                {progresso >= 1
                  ? '🎉 Meta atingida! Parabéns!'
                  : `Faltam ${Math.max(horasMeta - horasFeitas, 0)}h para completar`}
              </Text>
              <View style={styles.progressoRow}>
                <DonutChart progresso={progresso} horasFeitas={horasFeitas} horasMeta={horasMeta} />
                <View style={styles.progressoDetalhes}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaValor}>{pctTexto}%</Text>
                    <Text style={styles.metaLabel}>concluído</Text>
                  </View>
                  <View style={styles.separador} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaValor}>{horasMeta}h</Text>
                    <Text style={styles.metaLabel}>meta total</Text>
                  </View>
                  <View style={styles.separador} />
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaValor, { color: colors.success }]}>{contagem.APROVADO}</Text>
                    <Text style={styles.metaLabel}>aprovados</Text>
                  </View>
                </View>
              </View>
              <View style={styles.barraContainer}>
                <View style={styles.barraLabels}>
                  <Text style={styles.barraLabelText}>0h</Text>
                  <Text style={styles.barraLabelText}>{horasMeta}h</Text>
                </View>
                <BarraProgresso progresso={progresso} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Resumo de Envios</Text>
              <View style={styles.chipsRow}>
                <ChipStatus status="PENDENTE"  count={contagem.PENDENTE}  />
                <ChipStatus status="APROVADO"  count={contagem.APROVADO}  />
                <ChipStatus status="REJEITADO" count={contagem.REJEITADO} />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Últimos Certificados</Text>
                {submissoes.length > 3 && (
                  <TouchableOpacity onPress={() => navigation.navigate('MinhasSubmissoes')}>
                    <Text style={styles.verTodos}>Ver todos</Text>
                  </TouchableOpacity>
                )}
              </View>
              {ultimas3.length === 0 ? (
                <View style={styles.vazioContainer}>
                  <Text style={styles.vazioIcone}>📂</Text>
                  <Text style={styles.vazioTexto}>Nenhum certificado enviado ainda.</Text>
                  <TouchableOpacity
                    style={styles.btnEnviar}
                    onPress={() => navigation.navigate('NovaSubmissao')}
                  >
                    <Text style={styles.btnEnviarText}>Enviar meu primeiro certificado</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                ultimas3.map(item => (
                  <TouchableOpacity key={item.id} onPress={() => setCertSelecionado(item)} activeOpacity={0.8}>
                    <SubmissaoCard
                      titulo={item.certificado?.nomeCursoOcr || item.nomeCategoria}
                      horas={item.horasAproveitadas}
                      categoria={item.nomeCategoria}
                      status={item.status}
                      data={item.dataEnvio}
                      observacao={item.observacaoCoordenador}
                      curso={item.nomeCurso}
                    />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}

        <CertificadoModal
          certificado={certSelecionado}
          onClose={() => setCertSelecionado(null)}
        />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1, backgroundColor: colors.bg },
  scroll:     { padding: 20 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:      { marginTop: 12, color: colors.textSecondary, fontSize: 14 },
  loadingInline:    { alignItems: 'center', paddingVertical: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saudacao: { fontSize: 13, color: '#ffffff', fontWeight: '500' },
  nome:     { fontSize: 24, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, marginTop: 2 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { color: colors.white, fontSize: 18, fontWeight: '700' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  progressoCard: { paddingBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle:    { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  sectionSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2, marginBottom: 16 },
  verTodos:        { fontSize: 13, color: colors.accent, fontWeight: '600' },
  progressoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressoDetalhes: { flex: 1, paddingLeft: 20 },
  metaItem:  { alignItems: 'center' },
  metaValor: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  metaLabel: { fontSize: 10, color: colors.textMuted, marginTop: 1, fontWeight: '500' },
  separador: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  barraContainer: { marginTop: 16 },
  barraLabels:    { flexDirection: 'row', justifyContent: 'space-between' },
  barraLabelText: { fontSize: 11, color: colors.textMuted },
  chipsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  vazioContainer: { alignItems: 'center', paddingVertical: 20 },
  vazioIcone:     { fontSize: 36, marginBottom: 8 },
  vazioTexto:     { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  btnEnviar: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnEnviarText: { color: colors.white, fontSize: 13, fontWeight: '700' },
});