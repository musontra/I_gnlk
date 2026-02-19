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
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { getUser, getTodaysEntry, getEntries, clearUser, JournalEntry } from "@/lib/storage";
import { moodOptions } from "@/data/moods";
import { getRandomMotivation } from "@/data/motivations";

interface DashCardProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  delay: number;
}

function DashCard({ icon, title, subtitle, color, onPress, delay }: DashCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <View style={[styles.cardIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      </Pressable>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dailyMotivation] = useState(getRandomMotivation());

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const [user, today, entries] = await Promise.all([
        getUser(),
        getTodaysEntry(),
        getEntries(),
      ]);
      setUsername(user || "");
      setTodayEntry(today);
      setEntryCount(entries.length);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await clearUser();
    router.replace("/");
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Gunaydin";
    if (hour < 18) return "Iyi gunler";
    return "Iyi aksamlar";
  };

  const todayMood = todayEntry ? moodOptions[todayEntry.moodIndex] : null;
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (loading) {
    return (
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.username}>{username}</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {todayMood && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.todayCard}>
            <LinearGradient
              colors={[todayMood.color + "15", todayMood.color + "08"]}
              style={styles.todayCardGradient}
            >
              <View style={styles.todayCardHeader}>
                <Ionicons name={todayMood.icon as any} size={28} color={todayMood.color} />
                <Text style={styles.todayCardTitle}>Bugunun Ruh Halin</Text>
              </View>
              <Text style={[styles.todayMoodLabel, { color: todayMood.color }]}>
                {todayMood.label}
              </Text>
              <View style={styles.todayCardRow}>
                <View style={styles.todayStatItem}>
                  <Ionicons name="flash-outline" size={16} color={Colors.accent} />
                  <Text style={styles.todayStatText}>
                    Enerji: {todayEntry!.energyLevel}/10
                  </Text>
                </View>
                {!!todayEntry!.smallWin && (
                  <View style={styles.todayStatItem}>
                    <Ionicons name="trophy-outline" size={16} color={Colors.success} />
                    <Text style={styles.todayStatText} numberOfLines={1}>
                      {todayEntry!.smallWin}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <Ionicons name="sparkles-outline" size={18} color={Colors.accent} />
            <Text style={styles.motivationTitle}>Gunun Motivasyonu</Text>
          </View>
          <Text style={styles.motivationText}>{dailyMotivation.message}</Text>
        </Animated.View>

        <View style={styles.cardsSection}>
          <DashCard
            icon="add-circle-outline"
            title="Yeni Kayit"
            subtitle={todayEntry ? "Bugunku kaydin var" : "Bugun nasil hissediyorsun?"}
            color={Colors.primary}
            onPress={() => router.push("/new-entry")}
            delay={400}
          />
          <DashCard
            icon="journal-outline"
            title="Kayitlarim"
            subtitle={entryCount > 0 ? `${entryCount} kayit` : "Henuz kayit yok"}
            color={Colors.accent}
            onPress={() => router.push("/entries")}
            delay={500}
          />
          <DashCard
            icon="trending-up-outline"
            title="Gelismim"
            subtitle="Ilerlemeni takip et"
            color={Colors.success}
            onPress={() => router.push("/progress")}
            delay={600}
          />
          <DashCard
            icon="heart-outline"
            title="Motivasyon Kutuphanesi"
            subtitle="Ilham verici mesajlar"
            color="#E17055"
            onPress={() => router.push("/motivation")}
            delay={700}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  username: {
    fontFamily: "Nunito_700Bold",
    fontSize: 26,
    color: Colors.text,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  todayCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  todayCardGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  todayCardTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  todayMoodLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 22,
    marginBottom: 12,
  },
  todayCardRow: {
    flexDirection: "row",
    gap: 16,
  },
  todayStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  todayStatText: {
    fontFamily: "Nunito_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
    maxWidth: 130,
  },
  motivationCard: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  motivationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  motivationTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: Colors.accent,
  },
  motivationText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  cardsSection: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  cardSubtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
