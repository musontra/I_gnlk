import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { getEntries, JournalEntry } from "@/lib/storage";
import { moodOptions } from "@/data/moods";

function EntryItem({ item, index }: { item: JournalEntry; index: number }) {
  const mood = moodOptions[item.moodIndex];
  const date = new Date(item.createdAt);
  const formatted = date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.entryCard,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: "/entry-detail", params: { id: item.id } });
        }}
      >
        <View style={[styles.moodStrip, { backgroundColor: mood.color }]} />
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <View style={styles.entryMoodWrap}>
              <Ionicons name={mood.icon as any} size={20} color={mood.color} />
              <Text style={[styles.entryMoodText, { color: mood.color }]}>{mood.label}</Text>
            </View>
            <Text style={styles.entryDate}>{formatted}</Text>
          </View>
          <View style={styles.entryDetails}>
            <View style={styles.entryDetailItem}>
              <Ionicons name="flash-outline" size={14} color={Colors.accent} />
              <Text style={styles.entryDetailText}>Enerji: {item.energyLevel}/10</Text>
            </View>
            {!!item.smallWin && (
              <View style={styles.entryDetailItem}>
                <Ionicons name="trophy-outline" size={14} color={Colors.success} />
                <Text style={styles.entryDetailText} numberOfLines={1}>
                  {item.smallWin}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      </Pressable>
    </Animated.View>
  );
}

export default function EntriesScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  async function loadEntries() {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Kayitlarim</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centerWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="journal-outline" size={48} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>Henuz kayit yok</Text>
          <Text style={styles.emptySubtitle}>
            Ilk kaydini ekleyerek iyilesme yolculuguna basla
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push("/new-entry")}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Yeni Kayit</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <EntryItem item={item} index={index} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={entries.length > 0}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border + "60",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodStrip: {
    width: 4,
    alignSelf: "stretch",
  },
  entryContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 14,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  entryMoodWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  entryMoodText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
  },
  entryDate: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: Colors.textLight,
  },
  entryDetails: {
    flexDirection: "row",
    gap: 16,
  },
  entryDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  entryDetailText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: 120,
  },
});
