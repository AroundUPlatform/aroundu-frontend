"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../components/layout/AuthProvider";
import { getConversations, getMessages, sendMessage, markConversationRead } from "../../services/chat";
import { Avatar } from "../../components/ui/Avatar";
import { Spinner } from "../../components/ui/Spinner";
import { cn } from "../../lib/cn";
import type { Conversation, ChatMessage } from "../../types/chat";

interface ChatPanelProps {
    backPath: string;
}

export function ChatPanel({ backPath }: ChatPanelProps) {
    const { session } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* Load conversations */
    const loadConvos = useCallback(async () => {
        try {
            const res = await getConversations();
            setConversations(res.data ?? []);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadConvos(); }, [loadConvos]);

    /* Polling for new conversations */
    useEffect(() => {
        const id = setInterval(loadConvos, 10_000);
        return () => clearInterval(id);
    }, [loadConvos]);

    /* Load messages for active conversation */
    const loadMessages = useCallback(async (convoId: number) => {
        setMsgLoading(true);
        try {
            const res = await getMessages(convoId);
            setMessages(res.data ?? []);
            await markConversationRead(convoId).catch(() => {});
            /* Update unread count locally */
            setConversations((prev) =>
                prev.map((c) => (c.id === convoId ? { ...c, unreadCount: 0 } : c)),
            );
        } catch {
            /* silent */
        } finally {
            setMsgLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!activeConvoId) return;
        loadMessages(activeConvoId);
        const id = setInterval(() => loadMessages(activeConvoId), 5_000);
        return () => clearInterval(id);
    }, [activeConvoId, loadMessages]);

    /* Scroll to bottom on new messages */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* Send message */
    const handleSend = async () => {
        if (!activeConvoId || !draft.trim()) return;
        setSending(true);
        try {
            const res = await sendMessage(activeConvoId, draft.trim());
            if (res.data) setMessages((prev) => [...prev, res.data!]);
            setDraft("");
            inputRef.current?.focus();
        } catch {
            /* silent */
        } finally {
            setSending(false);
        }
    };

    const activeConvo = conversations.find((c) => c.id === activeConvoId);

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border/60 bg-surface lg:h-[calc(100vh-6rem)]">
            {/* Conversation list */}
            <div
                className={cn(
                    "w-full flex-shrink-0 border-r border-border/60 md:w-80",
                    activeConvoId ? "hidden md:block" : "",
                )}
            >
                <div className="border-b border-border/60 p-4">
                    <h2 className="text-lg font-bold text-text">Conversations</h2>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Spinner /></div>
                ) : conversations.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted">No conversations yet.</div>
                ) : (
                    <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 60px)" }}>
                        {conversations.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveConvoId(c.id)}
                                className={cn(
                                    "flex w-full items-center gap-3 border-b border-border/30 px-4 py-3 text-left transition-colors hover:bg-surface-strong",
                                    activeConvoId === c.id && "bg-brand/5",
                                )}
                            >
                                <Avatar
                                    src={c.participantProfileImage}
                                    fallback={c.participantName ?? "?"}
                                    size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-sm font-medium text-text">
                                            {c.participantName ?? `User #${c.participantId}`}
                                        </span>
                                        {c.unreadCount > 0 && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                                                {c.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="truncate text-xs text-muted">
                                        {c.jobTitle && <span className="font-medium">{c.jobTitle} · </span>}
                                        {c.lastMessage ?? "No messages"}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat area */}
            <div className={cn("flex flex-1 flex-col", !activeConvoId && "hidden md:flex")}>
                {!activeConvoId ? (
                    <div className="flex flex-1 items-center justify-center text-muted">
                        Select a conversation to start chatting
                    </div>
                ) : (
                    <>
                        {/* Chat header */}
                        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
                            <button onClick={() => setActiveConvoId(null)} className="text-muted md:hidden">
                                ← Back
                            </button>
                            <Avatar
                                src={activeConvo?.participantProfileImage}
                                fallback={activeConvo?.participantName ?? "?"}
                                size="sm"
                            />
                            <div>
                                <div className="text-sm font-semibold text-text">
                                    {activeConvo?.participantName ?? `User #${activeConvo?.participantId}`}
                                </div>
                                {activeConvo?.jobTitle && (
                                    <div className="text-xs text-muted">Re: {activeConvo.jobTitle}</div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-3">
                            {msgLoading && messages.length === 0 ? (
                                <div className="flex items-center justify-center py-12"><Spinner /></div>
                            ) : messages.length === 0 ? (
                                <div className="py-12 text-center text-sm text-muted">No messages yet. Say hello!</div>
                            ) : (
                                <div className="space-y-2">
                                    {messages.map((msg) => {
                                        const isMe = msg.senderId === session?.userId;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={cn("flex", isMe ? "justify-end" : "justify-start")}
                                            >
                                                <div
                                                    className={cn(
                                                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                                                        isMe
                                                            ? "rounded-br-md bg-brand text-white"
                                                            : "rounded-bl-md bg-surface-strong text-text",
                                                    )}
                                                >
                                                    <p>{msg.content}</p>
                                                    <div className={cn("mt-1 text-[10px]", isMe ? "text-white/60" : "text-muted")}>
                                                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="border-t border-border/60 p-3">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    className="flex-1 rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-brand"
                                    placeholder="Type a message…"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    disabled={sending}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !draft.trim()}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand/90 disabled:opacity-40"
                                >
                                    {sending ? <Spinner size="sm" /> : "→"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
