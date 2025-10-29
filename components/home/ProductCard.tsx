import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";

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
      <Pressable
        style={styles.loveBtn}
        onPress={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
      >
        <MaterialCommunityIcons
          name={isFavorite ? "cards-heart" : "cards-heart-outline"}
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

      {discount > 0 && (
        <Text style={styles.cardDeal}>-{(discount * 100).toFixed(0)}%</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
  loveBtn: { position: "absolute", left: 8, top: 8, zIndex: 10 },
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
    color: "#333",
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
});

export default ProductCard;
