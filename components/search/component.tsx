import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type SearchProps = {
  searchText: string;
  setSearchText: (text: string) => void;
};

const SearchComponent = ({ searchText, setSearchText }: SearchProps) => {
  return (
    <View style={styles.container}>
      <FontAwesome name="search" size={18} color="#757575" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search art tools..."
        placeholderTextColor="#9e9e9e"
        value={searchText}
        onChangeText={setSearchText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    width: "100%",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 38,
    fontSize: 15,
    color: "#333",
  },
});

export default SearchComponent;
