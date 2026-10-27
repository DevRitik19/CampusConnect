import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  MessageCircle,
  MessageSquare,
  ArrowLeft,
  Layers,
  Clock,
  CheckCheck,
  Check,
} from 'lucide-react';
import api from '../services/api';

export const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedConversationId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch all user conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId, silent = false) => {
    if (!conversationId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const res = await api.get(`/conversations/${conversationId}/messages`);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Set active conversation when ID or conversation list changes
  useEffect(() => {
    if (conversations.length > 0) {
      if (selectedConversationId) {
        const found = conversations.find((c) => c._id === selectedConversationId);
        if (found) {
          if (activeConversation?._id !== found._id) {
            setActiveConversation(found);
            fetchMessages(found._id);
          }
        } else {
          setActiveConversation(conversations[0]);
          setSearchParams({ conversationId: conversations[0]._id }, { replace: true });
          fetchMessages(conversations[0]._id);
        }
      } else {
        // Default to first conversation
        setActiveConversation(conversations[0]);
        setSearchParams({ conversationId: conversations[0]._id }, { replace: true });
        fetchMessages(conversations[0]._id);
      }
    }
  }, [conversations, selectedConversationId, fetchMessages, setSearchParams, activeConversation?._id]);

  // Periodic polling for new messages every 5 seconds
  useEffect(() => {
    if (!activeConversation) return;
    const interval = setInterval(() => {
      fetchMessages(activeConversation._id, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConversation, fetchMessages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConversation || sending) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');
    setSending(true);

    try {
      const res = await api.post(`/conversations/${activeConversation._id}/messages`, {
        text: textToSend,
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        fetchConversations(); // update last message preview in list
      }
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv?.participants || !user) return null;
    const myId = user._id?.toString();
    return conv.participants.find((p) => p?._id?.toString() !== myId) || conv.participants[0];
  };

  const otherUser = activeConversation ? getOtherParticipant(activeConversation) : null;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <div
        className="card"
        style={{
          height: 'calc(100vh - 12rem)',
          minHeight: '520px',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
        id="messages-wrapper"
      >
        {/* Left Column: Conversations List */}
        <div
          style={{
            borderRight: '1px solid var(--border)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
          }}
          className={activeConversation && selectedConversationId ? 'hide-on-mobile' : ''}
        >
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-surface)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Messages</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Direct chats with students
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConversations ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Loading conversations...
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const partner = getOtherParticipant(conv);
                const isSelected = activeConversation?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setActiveConversation(conv);
                      setSearchParams({ conversationId: conv._id });
                    }}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--bg-surface)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={partner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={partner?.name}
                        style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {partner?.name || 'Student'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>

                        {conv.post && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            Re: {conv.post.title}
                          </div>
                        )}

                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {conv.lastMessage?.text || 'No messages yet'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No conversations yet</p>
                <p style={{ fontSize: '0.775rem', marginTop: '0.25rem' }}>
                  Contact a seller or post author from any listing to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface)',
          }}
        >
          {activeConversation && otherUser ? (
            <>
              {/* Chat Header */}
              <div
                style={{
                  padding: '0.875rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={otherUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={otherUser.name}
                    style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{otherUser.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {otherUser.department || 'Campus Student'}
                    </div>
                  </div>
                </div>

                {activeConversation.post && (
                  <Link
                    to={`/posts/${activeConversation.post._id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'var(--bg-subtle)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      border: '1px solid var(--border)',
                      maxWidth: '220px',
                    }}
                  >
                    <Layers size={14} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeConversation.post.title}
                    </span>
                  </Link>
                )}
              </div>

              {/* Message Feed */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  background: 'var(--bg-page)',
                }}
              >
                {loadingMessages ? (
                  <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Loading message history...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={msg._id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            background: isMine ? 'var(--primary)' : 'var(--bg-surface)',
                            color: isMine ? '#ffffff' : 'var(--text-main)',
                            padding: '0.75rem 1rem',
                            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            boxShadow: 'var(--shadow-sm)',
                            border: isMine ? 'none' : '1px solid var(--border)',
                            fontSize: '0.925rem',
                            lineHeight: 1.45,
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.text}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span>{time}</span>
                          {isMine && <CheckCheck size={12} color="var(--primary)" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Start of conversation</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Say hello to {otherUser?.name ? otherUser.name.split(' ')[0] : 'them'} and ask about their listing!
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="text"
                  placeholder={`Message ${otherUser?.name ? otherUser.name.split(' ')[0] : 'student'}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-full)',
                    outline: 'none',
                    background: 'var(--bg-page)',
                    fontSize: '0.9rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || sending}
                  className="btn btn-primary"
                  aria-label="Send message"
                  style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    borderRadius: '9999px',
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <Send size={16} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <MessageCircle size={48} strokeWidth={1.8} style={{ opacity: 0.3, margin: '0 auto 1rem' }} aria-hidden="true" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Select a conversation
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '320px' }}>
                Pick an ongoing discussion from the sidebar or contact a student author from their listing.
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          #messages-wrapper {
            grid-template-columns: 1fr !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
