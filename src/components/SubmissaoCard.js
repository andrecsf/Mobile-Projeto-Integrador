import { View, Text, StyleSheet } from 'react-native';

export default function SubmissaoCard({ titulo, horas, categoria, status, data }) {
  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.info}>{categoria} • {horas}h</Text>
      <Text style={styles.info}>{data}</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card:   { backgroundColor: '#151825', borderRadius: 12, padding: 16, marginBottom: 12 },
  titulo: { fontSize: 15, fontWeight: '600', color: '#e8eaf0', marginBottom: 4 },
  info:   { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  status: { fontSize: 12, fontWeight: '600', color: '#378ADD', marginTop: 6 },
});
