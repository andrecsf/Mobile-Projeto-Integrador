import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import SubmissaoCard from '../components/SubmissaoCard'; 
import { colors } from '../theme/colors';

import api from '../services/api'; 

export default function MinhasSubmissoesScreen({ navigation }) {
  const [submissoes, setSubmissoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarSubmissoes = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/submissoes'); 
      
      setSubmissoes(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro de Conexão",
        "Não foi possível carregar as submissões. Verifique se o servidor no Render está ativo."
      );
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Submissões</Text>
        <Text style={styles.subtitle}>Acompanhe o status dos seus certificados</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors?.primary || '#3498db'} />
          <Text style={styles.loadingText}>Conectando ao servidor...</Text>
        </View>
      ) : (
        <FlatList
          data={submissoes}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SubmissaoCard 
              titulo={item.titulo}
              horas={item.horas}
              categoria={item.categoria}
              status={item.status}
              data={item.data}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors?.background || '#121212' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#222' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors?.text || '#fff' },
  subtitle: { fontSize: 14, color: '#aaa', marginTop: 4 },
  list: { padding: 20, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#aaa', marginTop: 10, fontSize: 14 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 16 },
  fab: { position: 'absolute', right: 24, bottom: 24, backgroundColor: colors?.primary || '#3498db', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold' }
});