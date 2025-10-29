import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchArtTools } from "@/api/artTools";
import BrandFilter from "@/components/home/BrandFilter";
import ProductCard from "@/components/home/ProductCard";
import Search from "@/components/search/component";
import { ArtTool } from "@/types/artTool";

const HomePage = () => {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [savedProducts, setSavedProducts] = useState<ArtTool[]>([]);
  const [products, setProducts] = useState<ArtTool[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))],
    [products]
  );

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchArtTools();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching art tools", err);
      setError("Không thể tải danh sách sản phẩm từ mockapi.io");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedProducts = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem("savedProducts");
      if (saved) {
        setSavedProducts(JSON.parse(saved));
      } else {
        setSavedProducts([]);
      }
    } catch (storageError) {
      console.error("Error loading from AsyncStorage", storageError);
      Alert.alert("Error", "Failed to load favorite products");
      setSavedProducts([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedProducts();
    }, [loadSavedProducts])
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggleFavorite = useCallback(
    async (productId: string) => {
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
      } catch (err) {
        console.error("Error saving to AsyncStorage", err);
        Alert.alert("Error", "Failed to save product to AsyncStorage");
      }
    },
    [products, savedProducts]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return products.filter((p) => {
      const matchBrand = selectedBrand ? p.brand === selectedBrand : true;
      const matchSearch = normalizedSearch
        ? p.artName.toLowerCase().includes(normalizedSearch)
        : true;
      return matchBrand && matchSearch;
    });
  }, [products, selectedBrand, searchText]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e53935" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.retryWrapper}>
            <Text style={styles.retryLink} onPress={loadProducts}>
              Thử lại
            </Text>
          </View>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Search searchText={searchText} setSearchText={setSearchText} />
      </View>

      <BrandFilter
        brands={brands}
        selectedBrand={selectedBrand}
        onChange={setSelectedBrand}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          const isFavorite = savedProducts.some((p) => p.id === item.id);
          return (
            <ProductCard
              item={item}
              isFavorite={isFavorite}
              onOpenDetails={() => router.push(`/details?id=${item.id}`)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
            />
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Không tìm thấy sản phẩm nào cho bộ lọc hiện tại.
            </Text>
            <View style={styles.retryWrapper}>
              <Text style={styles.retryLink} onPress={loadProducts}>
                Tải lại dữ liệu
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  list: { paddingHorizontal: 4, paddingBottom: 24, paddingTop: 8 },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fdecea",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#f5c6cb",
  },
  errorText: {
    color: "#b71c1c",
    textAlign: "center",
    fontWeight: "500",
  },
  retryWrapper: {
    marginTop: 8,
    alignSelf: "center",
    backgroundColor: "#e53935",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  retryLink: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginBottom: 12,
    color: "#424242",
    textAlign: "center",
  },
});
