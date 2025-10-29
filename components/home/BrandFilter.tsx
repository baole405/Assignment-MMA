import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  brands: string[];
  selectedBrand: string | null;
  onChange: (brand: string | null) => void;
};

const BrandFilter = ({ brands, selectedBrand, onChange }: Props) => {
  const handlePress = (brand: string) => {
    const next = brand === selectedBrand ? null : brand;
    onChange(next);
  };

  if (brands.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Thương hiệu</Text>
      <View style={styles.chipRow}>
        {brands.map((brand) => {
          const isActive = brand === selectedBrand;
          return (
            <Pressable
              key={brand}
              onPress={() => handlePress(brand)}
              style={[
                styles.brandButton,
                {
                  backgroundColor: isActive ? "#5B4BDF" : "rgba(91, 75, 223, 0.08)",
                  borderColor: isActive ? "#5B4BDF" : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color: isActive ? "#fff" : "#3E3B6D",
                  fontWeight: "600",
                }}
              >
                {brand}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E2960",
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  brandButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
});

export default BrandFilter;
