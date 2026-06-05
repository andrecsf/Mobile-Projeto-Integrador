import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import SubmissaoCard from '../components/SubmissaoCard';
import { colors, shadows } from '../theme/colors';
import api from '../services/api';
import authStore from '../store/authStore';

export default function MinhasSubmissoesScreen({ navigation }) {
  const [submissoes, setSubmissoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarSubmissoes = async () => {
    try {
      setLoading(true);
      const user = authStore.getUser();
      const alunoId = user?.id;

      if (!alunoId) {
        Alert.alert("Sessão inválida", "Não foi possível identificar o usuário. Faça login novamente.");
        return;
      }

      const response = await api.get(`/submissoes/aluno/${alunoId}`);
      setSubmissoes(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Não foi possível carregar as submissões. Verifique se o servidor está ativo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      buscarSubmissoes();
    });
    return unsubscribe;
  }, [navigation]);

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
          data={submissoes}
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
            <Text style={styles.emptyText}>Nenhum certificado submetido ainda.</Text>
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
  header:           { padding: 20, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  title:            { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle:         { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
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