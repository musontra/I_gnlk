import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { saveEntry, generateId } from "@/lib/storage";
import { moodOptions } from "@/data/moods";

export default function NewEntryScreen() {
  const insets = useSafeAreaInsets();
  const [moodIndex, setMoodIndex] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [smallWin, setSmallWin] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function getEnergyColor(val: number): string {
    if (val <= 3) return Colors.energy.low;
    if (val <= 6) return Colors.energy.medium;
    return Colors.energy.high;
  }

  async function handleSave() {
    setError("");
    if (moodIndex === null) {
      setError("Lutfen ruh halini sec");
      return;
    }
    if (!smallWin.trim()) {
      setError("Bugunku kucuk kazanimin ne?");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);

    try {
      await saveEntry({
        id: generateId(),
        date: new Date().toISOString().split("T")[0],
        moodIndex,
        energyLevel: Math.round(energyLevel),
        smallWin: smallWin.trim(),
        notes: notes.trim(),
        createdAt: Date.now(),
      });

      Alert.alert("Basarili", "Kaydin basariyla eklendi!", [
        { text: "Tamam", onPress: () => router.back() },
      ]);
    } catch {
      setError("Kayit sirasinda bir hata olustu");
    } finally {
      setSaving(false);
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
        <Text style={styles.headerTitle}>Yeni Kayit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.sectionTitle}>Bugun nasil hissediyorsun?</Text>
          <View style={styles.moodRow}>
            {moodOptions.map((mood) => (
              <Pressable
                key={mood.index}
                onPress={() => {
                  setMoodIndex(mood.index);
                  setError("");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.moodItem,
                  moodIndex === mood.index && {
                    backgroundColor: mood.color + "20",
                    borderColor: mood.color,
                  },
                ]}
              >
                <Ionicons
                  name={mood.icon as any}
                  size={28}
                  color={moodIndex === mood.index ? mood.color : Colors.textLight}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    moodIndex === mood.index && { color: mood.color },
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Enerji Seviyen</Text>
          <View style={styles.energyWrap}>
            <View style={styles.energyHeader}>
              <Ionicons name="flash" size={20} color={getEnergyColor(energyLevel)} />
              <Text style={[styles.energyValue, { color: getEnergyColor(energyLevel) }]}>
                {Math.round(energyLevel)}
              </Text>
              <Text style={styles.energyMax}>/10</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={energyLevel}
              onValueChange={setEnergyLevel}
              minimumTrackTintColor={getEnergyColor(energyLevel)}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={getEnergyColor(energyLevel)}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Dusuk</Text>
              <Text style={styles.sliderLabel}>Yuksek</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Bugunku Kucuk Kazanim</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="trophy-outline" size={20} color={Colors.accent} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Ornegin: 30 dakika yuruyus yaptim"
              placeholderTextColor={Colors.textLight}
              value={smallWin}
              onChangeText={(t) => {
                setSmallWin(t);
                setError("");
              }}
              maxLength={100}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Notlar (Istege Bagli)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Bugunku dusuncelerin..."
            placeholderTextColor={Colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
        </Animated.View>

        {!!error && (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              saving && { opacity: 0.7 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 17,
    color: Colors.text,
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  moodItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 6,
  },
  moodLabel: {
    fontFamily: "Nunito_500Medium",
    fontSize: 10,
    color: Colors.textLight,
    textAlign: "center",
  },
  energyWrap: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  energyHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 12,
    gap: 4,
  },
  energyValue: {
    fontFamily: "Nunito_700Bold",
    fontSize: 36,
  },
  energyMax: {
    fontFamily: "Nunito_400Regular",
    fontSize: 18,
    color: Colors.textLight,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: Colors.textLight,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 16,
  },
  notesInput: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: "Nunito_500Medium",
    fontSize: 13,
    color: Colors.error,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 24,
  },
  saveButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    color: "#fff",
  },
});
