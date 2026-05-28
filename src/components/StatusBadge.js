import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusBadge({ status }){
    const definirCores = () => {
    switch (status) {
      case 'APROVADO':
        return { corTexto: '#4CAF50', corFundo: '#1B5E20' }; 
      case 'REJEITADO':
        return { corTexto: '#F44336', corFundo: '#B71C1C' }; 
      default:
        return { corTexto: '#FFC107', corFundo: '#E65100' }; 
    }
  };

  const cores = definirCores();

  return (
    <View style={[styles.badge, {backgreoundColor: cores.corFundo}]}>
        <Text style={[styles.text, {color: cores.corTexto}]}>
            {status}
        </Text>

    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start', 
  },
  texto: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
