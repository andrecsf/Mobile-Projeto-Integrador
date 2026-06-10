/**
 * CursoSelector.js
 *
 * Seletor de curso ativo para uso na HomeScreen e MinhasSubmissoesScreen.
 *
 * Props:
 *   cursos      — array de { id, nome } vindo do backend
 *   cursoAtivo  — objeto { id, nome } atualmente selecionado (ou null)
 *   onChange    — função chamada com o objeto { id, nome } quando o aluno trocar
 *   loading     — boolean; exibe spinner enquanto os cursos ainda estão carregando
 *
 * Comportamento:
 *   - Se `cursos` tiver só 1 elemento, renderiza apenas uma pill com o nome
 *     (sem interação — não faz sentido "selecionar" um único curso).
 *   - Se tiver 2 ou mais, exibe o botão dropdown com a lista inline.
 *   - O dropdown fecha automaticamente ao selecionar uma opção.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, shadows } from '../theme/colors';

export default function CursoSelector({ cursos = [], cursoAtivo, onChange, loading = false }) {
  const [open, setOpen] = useState(false);

  // ── Carregando ──────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.pill}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.pillText}>Carregando cursos...</Text>
      </View>
    );
  }

  // ── Nenhum curso disponível ─────────────────────────────
  if (!cursos || cursos.length === 0) return null;

  const nomeAtivo = cursoAtivo?.nome ?? cursos[0]?.nome ?? '—';

  // ── Curso único — só exibe pill informativa ─────────────
  if (cursos.length === 1) {
    return (
      <View style={styles.pill}>
        <View style={styles.dot} />
        <Text style={styles.pillText} numberOfLines={1}>{nomeAtivo}</Text>
      </View>
    );
  }

  // ── Múltiplos cursos — dropdown ─────────────────────────
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.75}
      >
        <View style={styles.dot} />
        <Text style={styles.buttonText} numberOfLines={1}>{nomeAtivo}</Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {cursos.map(curso => {
            const ativo = cursoAtivo?.id === curso.id;
            return (
              <TouchableOpacity
                key={curso.id}
                style={[styles.item, ativo && styles.itemAtivo]}
                onPress={() => {
                  onChange(curso);
                  setOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.itemLabel, ativo && styles.itemLabelAtivo]} numberOfLines={2}>
                  {curso.nome}
                </Text>
                {ativo && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Pill (curso único / loading) ────────────────────────
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    maxWidth: 220,
  },

  // ── Dropdown ────────────────────────────────────────────
  wrapper: {
    marginBottom: 16,
    zIndex: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    maxWidth: 200,
  },
  chevron: {
    fontSize: 11,
    color: colors.textMuted,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    flexShrink: 0,
  },

  // ── Lista do dropdown ───────────────────────────────────
  dropdown: {
    marginTop: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    minWidth: 220,
    ...shadows.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  itemAtivo: {
    backgroundColor: colors.accentLight,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemLabelAtivo: {
    color: colors.accent,
    fontWeight: '600',
  },
  check: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '700',
  },
});