import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/(auth)/sign-in");
    }, 900);

    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>C</Text>
      </View>
      <Text style={styles.title}>Campusly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6D5BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 28, fontWeight: "800", color: "#2F5BFF" },
  title: { marginTop: 14, fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
});
