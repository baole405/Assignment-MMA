import { fetchArtTools } from "@/api/artTools";
import { generateTextFromGemini } from "@/api/gemini";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArtTool } from "@/types/artTool";

type ChatMessage = { sender: "user" | "bot"; text: string };

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const buildProductSummary = (tool: ArtTool) => {
  const dealText =
    tool.limitedTimeDeal && tool.limitedTimeDeal > 0
      ? `${Math.round(tool.limitedTimeDeal * 100)}% off`
      : "không có ưu đãi giới hạn";
  const glassText = tool.glassSurface
    ? "phù hợp cả trên bề mặt kính"
    : "không dành riêng cho bề mặt kính";

  return (
    `"${tool.artName}" của ${tool.brand} có giá $${tool.price}. ` +
    `${tool.description} Sản phẩm ${glassText} và hiện ${dealText}.`
  );
};

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<ArtTool[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);
        setCatalogError(null);
        const data = await fetchArtTools();
        setCatalog(data);
      } catch (error) {
        console.error("Failed to fetch art tools for chat", error);
        setCatalogError("Không thể tải dữ liệu art tools từ mock API.");
        setCatalog([]);
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const catalogFacts = useMemo(() => {
    if (!catalog.length) return "(empty)";

    return catalog
      .map((tool) => {
        const feedbackSummary = (tool.feedbacks || [])
          .slice(0, 2)
          .map(
            (feedback) =>
              `${feedback.author} (${feedback.rating}/5): ${feedback.comment}`
          )
          .join(" | ");

        return [
          `ID: ${tool.id}`,
          `Tên: ${tool.artName}`,
          `Thương hiệu: ${tool.brand}`,
          `Giá: $${tool.price}`,
          `Bề mặt kính: ${tool.glassSurface ? "có" : "không"}`,
          `Ưu đãi: ${tool.limitedTimeDeal ? `${
            Math.round(tool.limitedTimeDeal * 100)
          }%` : "0%"}`,
          `Mô tả: ${tool.description}`,
          feedbackSummary ? `Feedbacks: ${feedbackSummary}` : undefined,
        ]
          .filter(Boolean)
          .join(" | ");
      })
      .join("\n");
  }, [catalog]);

  const findProductInCatalog = (question: string) => {
    if (!catalog.length) return null;
    const normalizedQuestion = normalizeText(question);
    return (
      catalog.find((tool) =>
        normalizedQuestion.includes(normalizeText(tool.artName))
      ) || null
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const raw = await AsyncStorage.getItem("savedProducts");
      const favorites: ArtTool[] = raw ? JSON.parse(raw) : [];

      const lower = input.toLowerCase();
      const mentionsFav =
        /favorite|favorites|yêu thích|danh sách yêu thích|favour/i.test(lower);
      const asksCount = /how many|bao nhi(e|ê)u|số lượng|có bao nhiêu/.test(
        lower
      );
      const asksList =
        mentionsFav &&
        /(g(i|ì)|nào|bao gồm|list|those|gồm những)/.test(lower);

      if (mentionsFav && asksCount) {
        const count = Array.isArray(favorites) ? favorites.length : 0;
        const names = favorites.slice(0, 5).map((f) => f.artName);
        const summary =
          `Bạn có ${count} sản phẩm trong danh sách yêu thích.` +
          (names.length
            ? ` Nổi bật: ${names.join(", ")}${
                favorites.length > 5 ? "..." : ""
              }`
            : "");
        const botMsg: ChatMessage = { sender: "bot", text: summary };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      if (mentionsFav && asksList) {
        if (!favorites.length) {
          const botMsg: ChatMessage = {
            sender: "bot",
            text: "Danh sách yêu thích hiện đang trống. Bạn có thể lưu sản phẩm từ trang chủ.",
          };
          setMessages((prev) => [...prev, botMsg]);
        } else {
          const botMsg: ChatMessage = {
            sender: "bot",
            text: favorites
              .map((item, index) => `${index + 1}. ${item.artName} ($${item.price})`)
              .join("\n"),
          };
          setMessages((prev) => [...prev, botMsg]);
        }
        return;
      }

      const product = findProductInCatalog(input);

      if (mentionsFav && product) {
        const isFavorite = favorites.some((fav) => fav.id === product.id);
        const botMsg: ChatMessage = {
          sender: "bot",
          text: isFavorite
            ? `${product.artName} đã có trong danh sách yêu thích của bạn.`
            : `${product.artName} chưa nằm trong danh sách yêu thích. Bạn có thể lưu lại từ trang sản phẩm.`,
        };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      if (product) {
        const botMsg: ChatMessage = {
          sender: "bot",
          text: buildProductSummary(product),
        };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      if (!catalog.length && catalogError) {
        const botMsg: ChatMessage = {
          sender: "bot",
          text: catalogError,
        };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      const favoritesSummary = favorites.length
        ? favorites
            .map((fav) => `${fav.artName} (${fav.brand}) - $${fav.price}`)
            .join("; ")
        : "(no favorites saved)";

      const prompt = `Bạn là trợ lý mua sắm cho art tools. Chỉ sử dụng dữ kiện có trong phần CATALOG và FAVORITES dưới đây. Nếu không chắc chắn, hãy nói rằng bạn không biết.\nCATALOG:\n${catalogFacts}\n\nFAVORITES:\n${favoritesSummary}\n\nCâu hỏi của khách: ${input}`;

      const reply = await generateTextFromGemini(prompt);
      const botMsg: ChatMessage = { sender: "bot", text: reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error", err);
      const errorMsg: ChatMessage = {
        sender: "bot",
        text: "❌ Lỗi khi gọi Gemini API.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {catalogLoading && (
          <View style={[styles.banner, styles.bannerInfo]}>
            <ActivityIndicator size="small" color="#5B4BDF" />
            <Text style={[styles.bannerText, styles.bannerSpacing]}>
              Đang tải dữ liệu art tools...
            </Text>
          </View>
        )}
        {catalogError && !catalogLoading && (
          <View style={[styles.banner, styles.bannerError]}>
            <Text style={[styles.bannerText, styles.bannerErrorText]}>
              {catalogError}
            </Text>
          </View>
        )}
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
            <Text style={styles.placeholderText}>
              Hỏi trợ lý về art tools hoặc danh sách yêu thích của bạn
            </Text>
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
            placeholder="Hãy nhập câu hỏi..."
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Gửi</Text>
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
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  bannerInfo: {
    paddingHorizontal: 2,
  },
  bannerText: {
    color: "#5B4BDF",
    fontSize: 14,
  },
  bannerSpacing: {
    marginLeft: 8,
  },
  bannerError: {
    backgroundColor: "#fdecec",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  bannerErrorText: {
    color: "#d12c2c",
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
