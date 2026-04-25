import { http } from "./http";
import type { Conversation, ChatMessage } from "../types/chat";

export const getConversations = async () => {
    return http<Conversation[]>("/conversations");
};

export const getMessages = async (conversationId: number, page = 0, size = 50) => {
    return http<ChatMessage[]>(`/conversations/${conversationId}/messages`, {
        query: { page, size },
    });
};

export const sendMessage = async (conversationId: number, content: string) => {
    return http<ChatMessage>(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { content },
    });
};

export const markConversationRead = async (conversationId: number) => {
    return http<null>(`/conversations/${conversationId}/read`, { method: "POST" });
};
