import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import product from "@/data/data";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [savedProducts, setSavedProducts] = useState<typeof product>([]);
  const [products] = useState(product);

  const brands = [...new Set(products.map((p) => p.brand))];

  // Load saved favorite products
  const loadSavedProducts = async () => {
    try {
      const saved = await AsyncStorage.getItem("savedProducts");
      if (saved) {
        setSavedProducts(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading from AsyncStorage", error);
      Alert.alert("Error", "Failed to load favorite products");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedProducts();
    }, [])
  );

  const handleIconPress = async (productId: string) => {
    try {
      const currentProduct = products.find((p) => p.id === productId);
      if (!currentProduct) return;

      let newSaved = [...savedProducts];

      if (newSaved.some((p) => p.id === productId)) {
        newSaved = newSaved.filter((p) => p.id !== productId);
      } else {
        newSaved.push(currentProduct);
      }

      await AsyncStorage.setItem("savedProducts", JSON.stringify(newSaved));
      setSavedProducts(newSaved);
    } catch (error) {
      console.error("Error saving to AsyncStorage", error);
      Alert.alert("Error", "Failed to save product to AsyncStorage");
    }
  };

  // Filter products by selected brand
  const filteredProducts = selectedBrand
    ? products.filter((p) => p.brand === selectedBrand)
    : products;

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Brand */}
      <View style={styles.brandContainer}>
        {brands.map((brand) => (
          <Pressable
            key={brand}
            onPress={() =>
              setSelectedBrand(brand === selectedBrand ? null : brand)
            }
            style={[
              styles.brandButton,
              { backgroundColor: selectedBrand === brand ? "#e53935" : "#eee" },
            ]}
          >
            <Text
              style={{
                color: selectedBrand === brand ? "#fff" : "#333",
                fontWeight: selectedBrand === brand ? "600" : "500",
              }}
            >
              {brand}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card} key={item.id}>
            <Pressable
              style={styles.moreBtn}
              onPress={() => router.push(`/details?id=${item.id}`)}
            >
              <MaterialCommunityIcons
                name="dots-horizontal-circle-outline"
                size={22}
                color="#555"
              />
            </Pressable>

            <Pressable
              style={styles.loveBtn}
              onPress={() => handleIconPress(item.id)}
            >
              <MaterialCommunityIcons
                name={
                  savedProducts.some((p) => p.id === item.id)
                    ? "cards-heart"
                    : "cards-heart-outline"
                }
                size={24}
                color="black"
              />
            </Pressable>

            <Image source={{ uri: item.image }} style={styles.cardImage} />

            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.artName}
            </Text>

            <Text style={styles.cardPrice}>
              {item.price.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Text>

            {item.limitedTimeDeal > 0 && (
              <Text style={styles.cardDeal}>
                -{(item.limitedTimeDeal * 100).toFixed(0)}%
              </Text>
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  brandContainer: { flexDirection: "row", flexWrap: "wrap", margin: 10 },
  brandButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  list: { padding: 10 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: "cover",
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#333", textAlign: "center", marginBottom: 6 },
  cardPrice: { fontSize: 15, fontWeight: "bold", color: "#e53935", marginBottom: 6 },
  cardDeal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  moreBtn: { position: "absolute", top: 8, right: 8, zIndex: 10 },
  loveBtn: { position: "absolute", left: 8, top: 8, zIndex: 10 },
});
