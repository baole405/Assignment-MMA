import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import productData from "@/data/data";

type Product = (typeof productData)[any];

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);

  // Load product từ productData
  useEffect(() => {
    const found = productData.find((p) => p.id === id);
    setProduct(found || null);
  }, [id]);

  // Load danh sách favorite từ AsyncStorage
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

  // Toggle favorite
  const toggleFavorite = async (p: Product) => {
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

  if (!product) {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Product not exists</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const feedbacks = product.feedbacks ?? [];
  const averageRating = feedbacks.length
    ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
    : 0;
  const ratingGroups: { rating: number; count: number }[] = [5, 4, 3, 2, 1].map(
    (r) => ({
      rating: r,
      count: feedbacks.filter((f) => f.rating === r).length,
    })
  );

  const isFavorite = savedProducts.some((fav) => fav.id === product.id);

  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Pressable
            style={styles.loveBtn}
            onPress={() => toggleFavorite(product)}
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
          {product.limitedTimeDeal > 0 && (
            <Text style={styles.deal}>
              -{Math.round(product.limitedTimeDeal * 100)}%
            </Text>
          )}
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.brand}>Brand: {product.brand}</Text>

          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Feedback</Text>
            <Text style={styles.average}>
              Average Rating: {averageRating.toFixed(1)} ⭐ ({feedbacks.length}{" "}
              reviews)
            </Text>
            <View style={styles.ratingGroupContainer}>
              {ratingGroups.map((g) => (
                <Text key={g.rating}>
                  {g.rating}⭐: {g.count}
                </Text>
              ))}
            </View>
            {feedbacks.map((f, index) => (
              <View key={index} style={styles.feedbackCard}>
                <Text style={styles.feedbackAuthor}>
                  {f.author} - {f.rating}⭐
                </Text>
                <Text style={styles.feedbackComment}>{f.comment}</Text>
                <Text style={styles.feedbackDate}>{f.date}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  closeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
