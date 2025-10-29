import React, { useCallback, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import Search from "@/components/search/component";
import { ArtTool } from "@/types/artTool";

const FavoriteList = () => {
  const router = useRouter();
  const [Favorites, setFavorites] = useState<ArtTool[]>([]);
  const [searchText, setSearchText] = useState("");

  // Load saved favorites từ AsyncStorage khi focus vào screen
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const saved = await AsyncStorage.getItem("savedProducts"); // key giống HomePage
          if (saved) setFavorites(JSON.parse(saved));
          else setFavorites([]);
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "Failed to load favorite products");
        }
      };
      loadFavorites();
    }, [])
  );

  const removeFavorite = async (id: string) => {
    const newFavorites = Favorites.filter((f) => f.id !== id);
    setFavorites(newFavorites);
    await AsyncStorage.setItem("savedProducts", JSON.stringify(newFavorites));
  };

  const removeAllFavorites = async () => {
    setFavorites([]);
    await AsyncStorage.removeItem("savedProducts");
  };

  const filteredFavorites = Favorites.filter((f) =>
    f.artName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headContainer}>
        <Text style={styles.title}>Your Favorites</Text>
        <Pressable
          onPress={() =>
            Alert.alert("Remove All", "Are you sure?", [
              { text: "No" },
              { text: "Yes", onPress: removeAllFavorites },
            ])
          }
        >
          <Text style={styles.removeText}>Remove All</Text>
        </Pressable>
      </View>

      <View style={styles.search}>
        <Search searchText={searchText} setSearchText={setSearchText} />
      </View>

      {Favorites.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "#888" }}>No favorites yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/details?id=${item.id}`)}
            >
              <Pressable
                style={styles.loveBtn}
                onPress={(event) => {
                  event.stopPropagation();
                  removeFavorite(item.id);
                }}
              >
                <MaterialCommunityIcons
                  name="cards-heart"
                  size={24}
                  color="black"
                />
              </Pressable>

              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{item.artName}</Text>
              <Text style={styles.cardPrice}>
                {item.price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Text>
              {Number(item.limitedTimeDeal ?? 0) > 0 && (
                <Text style={styles.cardDeal}>
                  -{(Number(item.limitedTimeDeal) * 100).toFixed(0)}%
                </Text>
              )}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default FavoriteList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  headContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 20,
  },
  title: { fontSize: 26, fontWeight: "bold" },
  removeText: {
    fontSize: 20,
    color: "white",
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8,
  },
  search: { marginHorizontal: 10 },
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
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 6,
  },
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
  loveBtn: { position: "absolute", left: 8, top: 8, zIndex: 10 },
});
