import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { getEntryById, deleteEntry, JournalEntry } from "@/lib/storage";
import { moodOptions } from "@/data/moods";
import { getMotivationForMood } from "@/data/motivations";

export default function EntryDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [id]);

  async function loadEntry() {
    try {
      if (!id) {
        setError(true);
        return;
      }
      const data = await getEntryById(id);
      if (!data) {
        setError(true);
        return;
      }
      setEntry(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleDelete() {
    Alert.alert("Kaydi Sil", "Bu kaydi silmek istediginize emin misiniz?", [
      { text: "Iptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteEntry(id!);
          router.back();
        },
      },
    ]);
  }

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (loading) {
    return (
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  if (error || !entry) {
    return (
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
        <View style={[styles.headerBar, { paddingTop: insets.top + webTopInset + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Detay</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Kayit bulunamadi</Text>
          <Pressable style={styles.retryBtn} onPress={() => { setError(false); setLoading(true); loadEntry(); }}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  const mood = moodOptions[entry.moodIndex];
  const motivation = getMotivationForMood(entry.moodIndex);
  const date = new Date(entry.createdAt);
  const formatted = date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  function getEnergyColor(val: number): string {
    if (val <= 3) return Colors.energy.low;
    if (val <= 6) return Colors.energy.medium;
    return Colors.energy.high;
  }

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Detay</Text>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.dateWrap}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.dateText}>{formatted}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <LinearGradient
            colors={[mood.color + "18", mood.color + "08"]}
            style={styles.moodCard}
          >
            <Ionicons name={mood.icon as any} size={48} color={mood.color} />
            <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
            <Text style={styles.moodSubtitle}>Ruh Hali</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.statRow}>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color={getEnergyColor(entry.energyLevel)} />
            <Text style={[styles.statValue, { color: getEnergyColor(entry.energyLevel) }]}>
              {entry.energyLevel}
            </Text>
            <Text style={styles.statLabel}>Enerji Seviyesi</Text>
          </View>
        </Animated.View>

        {!!entry.smallWin && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="trophy-outline" size={20} color={Colors.accent} />
              <Text style={styles.infoTitle}>Kucuk Kazanim</Text>
            </View>
            <Text style={styles.infoText}>{entry.smallWin}</Text>
          </Animated.View>
        )}

        {!!entry.notes && (
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoTitle}>Notlar</Text>
            </View>
            <Text style={styles.infoText}>{entry.notes}</Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.accent} />
            <Text style={styles.motivationTitle}>Sana Ozel Motivasyon</Text>
          </View>
          <Text style={styles.motivationName}>{motivation.title}</Text>
          <Text style={styles.motivationText}>{motivation.message}</Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    gap: 12,
  },
  errorTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    justifyContent: "center",
  },
  dateText: {
    fontFamily: "Nunito_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  moodCard: {
    alignItems: "center",
    borderRadius: 22,
    padding: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  moodLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 26,
  },
  moodSubtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statRow: {
    marginBottom: 16,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  statValue: {
    fontFamily: "Nunito_700Bold",
    fontSize: 32,
  },
  statLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  infoTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  infoText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  motivationCard: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  motivationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  motivationTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: Colors.accent,
  },
  motivationName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    color: Colors.text,
    marginBottom: 6,
  },
  motivationText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
