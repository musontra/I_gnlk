import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { getUser, saveUser } from "@/lib/storage";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkExistingUser();
  }, []);

  async function checkExistingUser() {
    try {
      const user = await getUser();
      if (user) {
        router.replace("/dashboard");
        return;
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setError("");
    if (!username.trim()) {
      setError("Lutfen kullanici adinizi girin");
      return;
    }
    if (!password.trim()) {
      setError("Lutfen sifrenizi girin");
      return;
    }
    if (password.length < 3) {
      setError("Sifre en az 3 karakter olmali");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoggingIn(true);

    await new Promise((r) => setTimeout(r, 1200));
    await saveUser(username.trim());
    router.replace("/dashboard");
  }

  if (loading) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
    >
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + webTopInset + 60, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
        ]}
      >
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf-outline" size={40} color={Colors.primary} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.titleWrap}>
          <Text style={styles.title}>Iyilik Gunlugum</Text>
          <Text style={styles.subtitle}>
            Kisisel iyilesme ve duygusal saglik takip uygulamasi
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Kullanici Adi"
              placeholderTextColor={Colors.textLight}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setError("");
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Sifre"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError("");
              }}
              secureTextEntry
            />
          </View>

          {!!error && (
            <View style={styles.errorWrap}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
              loggingIn && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loggingIn}
          >
            {loggingIn ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Giris Yap</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(800).duration(600)}>
          <Text style={styles.footerText}>
            Bugune odaklan, yarini dusunme
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(126, 184, 160, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleWrap: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontFamily: "Nunito_700Bold",
    fontSize: 32,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: width * 0.75,
  },
  form: {
    width: "100%",
    maxWidth: 360,
    gap: 14,
    marginBottom: 40,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: "Nunito_500Medium",
    fontSize: 13,
    color: Colors.error,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 6,
  },
  loginButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    color: "#fff",
  },
  footerText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textLight,
    textAlign: "center",
  },
});
