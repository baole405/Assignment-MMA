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

  const listHeader = (
    <View style={styles.headerWrapper}>
      <View style={styles.heroCard}>
        <View style={styles.heroBlobOne} />
        <View style={styles.heroBlobTwo} />
        <Text style={styles.heroEyebrow}>Khám phá kho Art Tools</Text>
        <Text style={styles.heroTitle}>
          Sáng tạo cùng những sắc màu{"\n"}xanh tím huyền ảo
        </Text>
        <Text style={styles.heroSubtitle}>
          Bộ sưu tập {products.length} sản phẩm từ {brands.length} thương hiệu
          khác nhau, sẵn sàng cho ý tưởng tiếp theo.
        </Text>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>
              {savedProducts.length.toString().padStart(2, "0")}
            </Text>
            <Text style={styles.heroStatLabel}>Mục đã lưu</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>
              {Math.max(products.length - savedProducts.length, 0)
                .toString()
                .padStart(2, "0")}
            </Text>
            <Text style={styles.heroStatLabel}>Gợi ý mới</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search searchText={searchText} setSearchText={setSearchText} />
      </View>

      <BrandFilter
        brands={brands}
        selectedBrand={selectedBrand}
        onChange={setSelectedBrand}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bộ sưu tập nổi bật</Text>
        <Text style={styles.sectionSubtitle}>
          Sắp xếp theo nhãn hiệu và ưu đãi mới nhất
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#5B4BDF" />
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

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={listHeader}
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
  container: { flex: 1, backgroundColor: "#F4F2FF" },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: "#5B4BDF",
    borderRadius: 28,
    padding: 24,
    overflow: "hidden",
    marginTop: 12,
  },
  heroBlobOne: {
    position: "absolute",
    top: -70,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#7B62FF",
    opacity: 0.35,
  },
  heroBlobTwo: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#4634B5",
    opacity: 0.3,
  },
  heroEyebrow: {
    color: "#CEC4FF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 14,
    color: "#E6E2FF",
    lineHeight: 20,
  },
  heroStatsRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  heroStat: {
    padding: 14,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    marginRight: 12,
  },
  heroStatValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  heroStatLabel: {
    color: "#D9D2FF",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#312B60",
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6F79A8",
  },
  list: { paddingHorizontal: 8, paddingBottom: 48 },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FBE6F0",
    borderWidth: 1,
    borderColor: "#F291BF",
  },
  errorText: {
    color: "#C2185B",
    textAlign: "center",
    fontWeight: "600",
  },
  retryWrapper: {
    marginTop: 8,
    alignSelf: "center",
    backgroundColor: "#5B4BDF",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
  },
  retryLink: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginBottom: 12,
    color: "#6F79A8",
    textAlign: "center",
    fontWeight: "600",
  },
});
