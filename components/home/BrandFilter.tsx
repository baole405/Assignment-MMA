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

  return (
    <View style={styles.container}>
      {brands.map((brand) => {
        const isActive = brand === selectedBrand;
        return (
          <Pressable
            key={brand}
            onPress={() => handlePress(brand)}
            style={[
              styles.brandButton,
              { backgroundColor: isActive ? "#e53935" : "#eee" },
            ]}
          >
            <Text
              style={{
                color: isActive ? "#fff" : "#333",
                fontWeight: isActive ? "600" : "500",
              }}
            >
              {brand}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginTop: 16,
  },
  brandButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
});

export default BrandFilter;
