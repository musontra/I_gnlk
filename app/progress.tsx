import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { getEntries, JournalEntry } from "@/lib/storage";
import { moodOptions } from "@/data/moods";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const avgEnergy =
    entries.length > 0
      ? (entries.reduce((s, e) => s + e.energyLevel, 0) / entries.length).toFixed(1)
      : "0";

  const avgMood =
    entries.length > 0
      ? Math.round(entries.reduce((s, e) => s + e.moodIndex, 0) / entries.length)
      : 2;

  const moodCounts = [0, 0, 0, 0, 0];
  entries.forEach((e) => {
    moodCounts[e.moodIndex]++;
  });

  const maxMoodCount = Math.max(...moodCounts, 1);

  const streak = (() => {
    if (entries.length === 0) return 0;
    const dates = [...new Set(entries.map((e) => e.date))].sort().reverse();
    let count = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const diff = Math.floor(
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === i || diff === i + 1) {
        count++;
      } else {
        break;
      }
    }
    return count;
  })();

  const totalWins = entries.filter((e) => !!e.smallWin).length;

  if (loading) {
    return (
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
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
        <Text style={styles.headerTitle}>Gelismim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {entries.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bar-chart-outline" size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Henuz veri yok</Text>
            <Text style={styles.emptySubtitle}>
              Kayit ekledikce gelisimin burada gorunecek
            </Text>
          </View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="flame-outline" size={24} color={Colors.accent} />
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>Gun Serisi</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="journal-outline" size={24} color={Colors.primary} />
                <Text style={styles.statValue}>{entries.length}</Text>
                <Text style={styles.statLabel}>Toplam Kayit</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trophy-outline" size={24} color={Colors.success} />
                <Text style={styles.statValue}>{totalWins}</Text>
                <Text style={styles.statLabel}>Kazanim</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.avgCard}>
              <View style={styles.avgItem}>
                <Text style={styles.avgLabel}>Ortalama Ruh Hali</Text>
                <View style={styles.avgMoodWrap}>
                  <Ionicons
                    name={moodOptions[avgMood].icon as any}
                    size={28}
                    color={moodOptions[avgMood].color}
                  />
                  <Text style={[styles.avgMoodText, { color: moodOptions[avgMood].color }]}>
                    {moodOptions[avgMood].label}
                  </Text>
                </View>
              </View>
              <View style={styles.avgDivider} />
              <View style={styles.avgItem}>
                <Text style={styles.avgLabel}>Ortalama Enerji</Text>
                <View style={styles.avgMoodWrap}>
                  <Ionicons name="flash" size={28} color={Colors.accent} />
                  <Text style={[styles.avgMoodText, { color: Colors.accent }]}>
                    {avgEnergy}/10
                  </Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.chartCard}>
              <Text style={styles.chartTitle}>Ruh Hali Dagilimi</Text>
              <View style={styles.chartBars}>
                {moodOptions.map((mood, i) => (
                  <View key={i} style={styles.barWrap}>
                    <View style={styles.barBg}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${(moodCounts[i] / maxMoodCount) * 100}%`,
                            backgroundColor: mood.color,
                          },
                        ]}
                      />
                    </View>
                    <Ionicons name={mood.icon as any} size={18} color={mood.color} />
                    <Text style={styles.barCount}>{moodCounts[i]}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.recentCard}>
              <Text style={styles.chartTitle}>Son Enerji Seviyeleri</Text>
              <View style={styles.energyDots}>
                {entries.slice(0, 7).reverse().map((entry, i) => {
                  const color =
                    entry.energyLevel <= 3
                      ? Colors.energy.low
                      : entry.energyLevel <= 6
                        ? Colors.energy.medium
                        : Colors.energy.high;
                  return (
                    <View key={entry.id} style={styles.energyDotWrap}>
                      <View
                        style={[
                          styles.energyDot,
                          {
                            height: (entry.energyLevel / 10) * 60 + 10,
                            backgroundColor: color,
                          },
                        ]}
                      />
                      <Text style={styles.energyDotLabel}>{entry.energyLevel}</Text>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          </>
        )}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
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
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  statValue: {
    fontFamily: "Nunito_700Bold",
    fontSize: 24,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  avgCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avgItem: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  avgLabel: {
    fontFamily: "Nunito_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  avgMoodWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avgMoodText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
  },
  avgDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 100,
  },
  barWrap: {
    alignItems: "center",
    gap: 6,
  },
  barBg: {
    width: 28,
    height: 70,
    borderRadius: 14,
    backgroundColor: Colors.border + "50",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 14,
    minHeight: 4,
  },
  barCount: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recentCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  energyDots: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 90,
  },
  energyDotWrap: {
    alignItems: "center",
    gap: 6,
  },
  energyDot: {
    width: 24,
    borderRadius: 12,
  },
  energyDotLabel: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
