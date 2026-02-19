import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Bulunamadi" }} />
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={styles.title}>Bu sayfa mevcut degil</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Ana sayfaya don</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.background,
    gap: 12,
  },
  title: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    fontFamily: "Nunito_500Medium",
    fontSize: 14,
    color: Colors.primary,
  },
});
