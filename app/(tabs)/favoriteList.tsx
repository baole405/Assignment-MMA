import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import ProductCard from "@/components/home/ProductCard";
import Search from "@/components/search/component";
import { ArtTool } from "@/types/artTool";

const FavoriteList = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<ArtTool[]>([]);
  const [searchText, setSearchText] = useState("");

  const refreshFavorites = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem("savedProducts");
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu thích");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
    }, [refreshFavorites])
  );

  const handleRemoveFavorite = useCallback(
    async (id: string) => {
      const updated = favorites.filter((item) => item.id !== id);
      setFavorites(updated);
      await AsyncStorage.setItem("savedProducts", JSON.stringify(updated));
    },
    [favorites]
  );

  const removeAllFavorites = useCallback(() => {
    Alert.alert("Xóa tất cả", "Bạn có chắc chắn muốn xóa mọi mục đã lưu?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setFavorites([]);
          await AsyncStorage.removeItem("savedProducts");
        },
      },
    ]);
  }, []);

  const filteredFavorites = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return favorites;
    return favorites.filter((item) =>
      item.artName.toLowerCase().includes(keyword)
    );
  }, [favorites, searchText]);

  const clearDisabled = favorites.length === 0;

  const listHeader = (
    <View style={styles.headerWrapper}>
      <View style={styles.heroCard}>
        <View style={styles.heroBlobOne} />
        <View style={styles.heroBlobTwo} />
        <View style={styles.heroBadgeRow}>
          <View style={styles.badge}>
            <MaterialCommunityIcons
              name="heart-multiple"
              size={18}
              color="#ECE7FF"
            />
            <Text style={styles.badgeText}>Saved Collection</Text>
          </View>
          <Pressable
            onPress={clearDisabled ? undefined : removeAllFavorites}
            style={[
              styles.clearButton,
              clearDisabled && styles.clearButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Xóa toàn bộ danh sách yêu thích"
            disabled={clearDisabled}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={18}
              color={clearDisabled ? "#BDB6EE" : "#5B4BDF"}
            />
            <Text
              style={[
                styles.clearButtonText,
                clearDisabled && styles.clearButtonTextDisabled,
              ]}
            >
              Clear all
            </Text>
          </Pressable>
        </View>

        <Text style={styles.heroTitle}>Những sắc màu bạn đã chọn</Text>
        <Text style={styles.heroSubtitle}>
          {favorites.length > 0
            ? `Bạn đang lưu ${favorites.length} sản phẩm để tham khảo nhanh.`
            : "Lưu những dụng cụ yêu thích để dễ dàng quay lại khi cần."}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search searchText={searchText} setSearchText={setSearchText} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách đã lưu</Text>
        <Text style={styles.sectionSubtitle}>
          Nhấn vào trái tim để loại bỏ khỏi danh sách cá nhân
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            isFavorite
            onOpenDetails={() => router.push(`/details?id=${item.id}`)}
            onToggleFavorite={() => handleRemoveFavorite(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="heart-off-outline"
              size={42}
              color="#837AD9"
            />
            <Text style={styles.emptyTitle}>Chưa có mục nào</Text>
            <Text style={styles.emptyText}>
              Lưu lại những art tools bạn yêu thích để tiện so sánh và đặt hàng
              sau này.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default FavoriteList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F2FF",
  },
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
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#7B62FF",
    opacity: 0.32,
  },
  heroBlobTwo: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#4634B5",
    opacity: 0.28,
  },
  heroBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  badgeText: {
    color: "#ECE7FF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECE7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    color: "#5B4BDF",
    fontSize: 13,
    fontWeight: "700",
  },
  clearButtonTextDisabled: {
    color: "#BDB6EE",
  },
  heroTitle: {
    marginTop: 16,
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
  list: {
    paddingHorizontal: 8,
    paddingBottom: 48,
  },
  emptyState: {
    marginTop: 48,
    marginHorizontal: 32,
    backgroundColor: "#ECE7FF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3A3472",
  },
  emptyText: {
    fontSize: 14,
    color: "#6F79A8",
    textAlign: "center",
    lineHeight: 20,
  },
});
