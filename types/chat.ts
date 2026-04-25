export type Conversation = {
    id: number;
    jobId: number;
    jobTitle?: string;
    participantId: number;
    participantName?: string;
    participantProfileImage?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    archived?: boolean;
};

export type ChatMessage = {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    sentAt: string;
    deliveredAt?: string;
    readAt?: string;
};

export type SendMessageRequest = {
    content: string;
};

export type TypingEvent = {
    conversationId: number;
    userId: number;
    typing: boolean;
};
