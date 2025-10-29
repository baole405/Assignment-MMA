import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { fetchArtTool } from "@/api/artTools";
import { ArtTool } from "@/types/artTool";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ArtTool | null>(null);
  const [savedProducts, setSavedProducts] = useState<ArtTool[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id) {
      setError("Thiếu mã sản phẩm để tải chi tiết.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchArtTool(id);
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product detail:", err);
      setError("Không thể tải thông tin chi tiết từ mockapi.io.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    const loadSavedProducts = async () => {
      try {
        const saved = await AsyncStorage.getItem("savedProducts");
        if (saved) {
          setSavedProducts(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };
    loadSavedProducts();
  }, []);

  const toggleFavorite = async (p: ArtTool) => {
    try {
      let newSaved = [...savedProducts];
      if (newSaved.some((item) => item.id === p.id)) {
        newSaved = newSaved.filter((item) => item.id !== p.id);
      } else {
        newSaved.push(p);
      }
      await AsyncStorage.setItem("savedProducts", JSON.stringify(newSaved));
      setSavedProducts(newSaved);
    } catch (error) {
      console.error("Error saving to AsyncStorage", error);
      Alert.alert("Error", "Failed to update favorite product");
    }
  };

  const feedbacks = useMemo(() => product?.feedbacks ?? [], [product]);
  const averageRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    return feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length;
  }, [feedbacks]);
  const ratingGroups = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: feedbacks.filter((f) => f.rating === rating).length,
      })),
    [feedbacks]
  );

  const isFavorite = useMemo(() => {
    if (!product) return false;
    return savedProducts.some((fav) => fav.id === product.id);
  }, [savedProducts, product]);

  if (loading) {
    return (
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#e53935" />
        </View>
      </Pressable>
    );
  }

  if (error) {
    return (
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProduct}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryBtn, styles.closeBtn]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>Đóng</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    );
  }

  if (!product) {
    return (
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={styles.title}>Product not exists</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    );
  }

  const dealValue = Number(product.limitedTimeDeal ?? 0);

  return (
    <Pressable style={styles.overlay} onPress={() => router.back()}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}
        >
          <Pressable
            style={styles.loveBtn}
            onPress={(event) => {
              event.stopPropagation();
              toggleFavorite(product);
            }}
          >
            <MaterialCommunityIcons
              name={isFavorite ? "cards-heart" : "cards-heart-outline"}
              size={24}
              color="red"
            />
          </Pressable>

          <Image source={{ uri: product.image }} style={styles.image} />

          <Text style={styles.title}>{product.artName}</Text>
          <Text style={styles.price}>
            {product.price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Text>
          {dealValue > 0 && (
            <Text style={styles.deal}>
              -{Math.round(dealValue * 100)}%
            </Text>
          )}
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.brand}>Brand: {product.brand}</Text>

          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Feedback</Text>
            <Text style={styles.average}>
              Average Rating: {averageRating.toFixed(1)} ⭐ ({feedbacks.length}{" "}
              reviews)
            </Text>
            <View style={styles.ratingGroupContainer}>
              {ratingGroups.map((group) => (
                <Text key={group.rating}>
                  {group.rating}⭐: {group.count}
                </Text>
              ))}
            </View>
            {feedbacks.map((fb, index) => (
              <View key={index} style={styles.feedbackCard}>
                <Text style={styles.feedbackAuthor}>
                  {fb.author} - {fb.rating}⭐
                </Text>
                <Text style={styles.feedbackComment}>{fb.comment}</Text>
                <Text style={styles.feedbackDate}>{fb.date}</Text>
              </View>
            ))}
          </View>
        </Pressable>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  card: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  loadingCard: {
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
    resizeMode: "cover",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "#111",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e53935",
    marginBottom: 6,
  },
  deal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  brand: {
    fontSize: 16,
    fontWeight: "500",
    color: "#777",
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  closeBtn: {
    backgroundColor: "#ff4757",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
  },
  retryBtn: {
    backgroundColor: "#e53935",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 12,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b71c1c",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    textAlign: "center",
    color: "#424242",
  },
  feedbackSection: {
    width: "100%",
    marginTop: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  average: {
    marginBottom: 8,
    fontWeight: "500",
  },
  ratingGroupContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  feedbackCard: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  feedbackAuthor: {
    fontWeight: "600",
  },
  feedbackComment: {
    fontSize: 14,
    color: "#555",
  },
  feedbackDate: {
    fontSize: 12,
    color: "#999",
  },
  loveBtn: {
    position: "absolute",
    left: 8,
    top: 8,
    zIndex: 10,
  },
});
