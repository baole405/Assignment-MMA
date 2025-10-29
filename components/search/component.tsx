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
      <FontAwesome
        name="search"
        size={18}
        color="#5B4BDF"
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm art tools..."
        placeholderTextColor="#6F79A8"
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
    backgroundColor: "#ECE7FF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#CEC4FA",
    elevation: 0,
    width: "100%",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1D1B3E",
    fontWeight: "500",
  },
});

export default SearchComponent;
