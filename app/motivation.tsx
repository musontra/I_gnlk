import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { motivations, Motivation } from "@/data/motivations";

function MotivationCard({ item, index }: { item: Motivation; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const categoryColors: Record<string, string> = {
    Ilerleme: Colors.primary,
    Sakinlik: "#74B9FF",
    "Oz-sefkat": Colors.moodHappy,
    Guc: Colors.accent,
    Umut: "#FDCB6E",
    Sabir: Colors.primaryLight,
    Minnettarlik: Colors.moodGood,
    Cesaret: Colors.error,
    Dinlenme: "#A29BFE",
    Buyume: Colors.success,
    "Oz-guven": "#E17055",
    Farkindalik: "#00CEC9",
  };

  const color = categoryColors[item.category] || Colors.primary;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.motivCard,
          pressed && { opacity: 0.9 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(!expanded);
        }}
      >
        <View style={styles.motivHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: color + "20" }]}>
            <Text style={[styles.categoryText, { color }]}>{item.category}</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={Colors.textLight}
          />
        </View>
        <Text style={styles.motivTitle}>{item.title}</Text>
        {expanded && (
          <Text style={styles.motivMessage}>{item.message}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function MotivationScreen() {
  const insets = useSafeAreaInsets();
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
        <Text style={styles.headerTitle}>Motivasyon Kutuphanesi</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={motivations}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <MotivationCard item={item} index={index} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={motivations.length > 0}
      />
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  motivCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  motivHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
  },
  motivTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  motivMessage: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: 10,
  },
});
