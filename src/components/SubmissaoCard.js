import { View, Text, StyleSheet } from 'react-native';

// Formata a data ISO retornada pelo backend (ex: "2024-06-01T18:00:00Z") para dd/mm/aaaa
function formatarData(dataIso) {
  if (!dataIso) return '';
  try {
    const d = new Date(dataIso);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dataIso;
  }
}

// Mapeia o status vindo do backend (PENDENTE, APROVADO, REJEITADO) para cor
function corStatus(status) {
  switch ((status || '').toUpperCase()) {
    case 'APROVADO':  return '#4CAF50';
    case 'REJEITADO': return '#F44336';
    case 'PENDENTE':  return '#FFA726';
    default:          return '#378ADD';
  }
}

export default function SubmissaoCard({ titulo, horas, categoria, status, data, observacao, curso }) {
  return (
    <View style={styles.card}>
      {/* Nome do aluno ou título */}
      {titulo ? (
        <Text style={styles.titulo}>{titulo}</Text>
      ) : null}

      {/* Categoria e horas */}
      <Text style={styles.info}>
        {categoria || 'Sem categoria'}{horas != null ? ` • ${horas}h` : ''}
      </Text>

      {/* Curso */}
      {curso ? (
        <Text style={styles.info}>{curso}</Text>
      ) : null}

      {/* Data de envio */}
      {data ? (
        <Text style={styles.info}>{formatarData(data)}</Text>
      ) : null}

      {/* Status com cor dinâmica */}
      <Text style={[styles.status, { color: corStatus(status) }]}>
        {(status || 'PENDENTE').toUpperCase()}
      </Text>

      {/* Observação do coordenador (exibe apenas se rejeitado) */}
      {observacao ? (
        <Text style={styles.observacao}>Obs: {observacao}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card:       { backgroundColor: '#151825', borderRadius: 12, padding: 16, marginBottom: 12 },
  titulo:     { fontSize: 15, fontWeight: '600', color: '#e8eaf0', marginBottom: 4 },
  info:       { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  status:     { fontSize: 12, fontWeight: '600', marginTop: 6 },
  observacao: { fontSize: 12, color: '#F44336', marginTop: 4, fontStyle: 'italic' },
});