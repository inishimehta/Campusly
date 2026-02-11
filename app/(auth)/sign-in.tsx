import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignIn() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#F6F7FB", "#EEF0FF"]} style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>C</Text>
        </View>
        <Text style={styles.brandText}>Campusly</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h1}>Sign in to Campusly</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="your.email@georgebrown.ca"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
        />

        <LinearGradient colors={["#2F80FF", "#8B2CFF"]} style={styles.ssoBtn}>
          <Pressable onPress={() => {}} style={styles.ssoBtnPressable}>
            <Text style={styles.ssoBtnText}>Sign in with SSO</Text>
          </Pressable>
        </LinearGradient>

        <Pressable style={styles.continueBtn} onPress={() => router.replace("/(app)/home")}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </Pressable>

        <Pressable onPress={() => {}}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => {}}>
        <Text style={styles.footer}>Staff login</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },

  brand: { alignItems: "center", marginBottom: 18 },
  icon: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 2,
  },
  iconText: { fontSize: 26, fontWeight: "800", color: "#2F5BFF" },
  brandText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  h1: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 10 },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  ssoBtn: { marginTop: 14, borderRadius: 12, overflow: "hidden" },
  ssoBtnPressable: { paddingVertical: 12, alignItems: "center" },
  ssoBtnText: { color: "#FFFFFF", fontWeight: "800" },

  continueBtn: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  continueBtnText: { color: "#111827", fontWeight: "800" },

  link: {
    marginTop: 12,
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "700",
  },
  footer: {
    marginTop: 14,
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "600",
  },
});
