import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { generateTextFromGemini } from "@/api/gemini";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatBox() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await generateTextFromGemini(input);
      const botMsg = { sender: "bot", text: reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        sender: "bot",
        text: "❌ Lỗi khi gọi Gemini API.",
        err,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={[
            { paddingVertical: 10 },
            messages.length === 0 && {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {messages.length === 0 ? (
            <Text style={styles.placeholderText}>Ask Gemini something</Text>
          ) : (
            messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.sender === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))
          )}

          {loading && <ActivityIndicator size="small" color="#555" />}
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Gemini...  "
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingInline: 20,
  },
  chatArea: {
    flex: 1,
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 10,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F0F0",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
  },
  placeholderText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});
