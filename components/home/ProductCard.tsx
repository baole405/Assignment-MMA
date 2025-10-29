import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { ArtTool } from "@/types/artTool";

type Props = {
  item: ArtTool;
  isFavorite: boolean;
  onOpenDetails: () => void;
  onToggleFavorite: () => void;
};

const ProductCard = ({
  item,
  isFavorite,
  onOpenDetails,
  onToggleFavorite,
}: Props) => {
  const discount = Number(item.limitedTimeDeal ?? 0);

  return (
    <Pressable style={styles.card} onPress={onOpenDetails}>
      <View style={styles.blobOne} />
      <View style={styles.blobTwo} />

      <View style={styles.fabRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.brand}</Text>
        </View>
        <Pressable
          style={styles.loveBtn}
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
        >
          <MaterialCommunityIcons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color="#fff"
          />
        </Pressable>
      </View>

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

      {discount > 0 && (
        <Text style={styles.cardDeal}>Save {(discount * 100).toFixed(0)}%</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    margin: 8,
    padding: 16,
    alignItems: "flex-start",
    shadowColor: "#5136C2",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    position: "relative",
    overflow: "hidden",
  },
  blobOne: {
    position: "absolute",
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#7158FF",
    opacity: 0.26,
  },
  blobTwo: {
    position: "absolute",
    top: -60,
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#9B89FF",
    opacity: 0.18,
  },
  fabRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  badgeText: {
    color: "#F5F3FF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  loveBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 8,
    borderRadius: 16,
  },
  cardImage: {
    width: "100%",
    aspectRatio: 1.05,
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 12,
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#251C5A",
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#5B4BDF",
    marginBottom: 4,
  },
  cardDeal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0E7D6B",
    backgroundColor: "rgba(14, 125, 107, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default ProductCard;
