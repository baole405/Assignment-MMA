import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, TextInput, View } from "react-native";

type SearchProps = {
  searchText: string;
  setSearchText: (text: string) => void;
};

const SearchComopnent = ({ searchText, setSearchText }: SearchProps) => {
  const [expand, setExpand] = useState<boolean>(false);
  const widthAnimated = useRef<Animated.Value>(new Animated.Value(0)).current;

  const toggleExpand = () => {
    setExpand(!expand);
    Animated.timing(widthAnimated, {
      toValue: expand ? 0 : 200,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  return (
    <View style={styles.container}>
      <Pressable onPress={toggleExpand}>
        <FontAwesome name="search" size={24} color="black" />
      </Pressable>
      <Animated.View style={{ width: widthAnimated, marginLeft: 8 }}>
        <TextInput
          style={styles.input}
          placeholder="Search your favorite"
          value={searchText}
          onChangeText={setSearchText}
        ></TextInput>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    padding: 5,
    width: "50%",
  },
  input: {
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
});

export default SearchComopnent;
