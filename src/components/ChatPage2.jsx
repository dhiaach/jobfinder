import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import './ChatPage.css'; // Reuse the same CSS

const ChatPage2 = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const authListener = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') window.location.href = '/login';
    });

    return () => authListener.data.subscription.unsubscribe();
  }, []);

  // Clean up subscriptions on component unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const initializeGeneralChatSystem = async (user) => {
      try {
        console.log('Initializing general chat system for user:', user.id);
        
        // Fetch ALL chats for this user
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select(`
            id,
            user1_id,
            user2_id,
            post_id,
            started_at,
            posts:post_id (job_title, posted_id)
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('started_at', { ascending: false });

        if (chatsError) {
          console.error('Error fetching chats:', chatsError);
          throw new Error('Failed to fetch chats: ' + chatsError.message);
        }

        console.log(`Fetched ${chatsData?.length || 0} chats for user ${user.id}:`, chatsData);

        // Process chats with better error handling and name resolution
        const processedChats = [];
        
        for (const chat of (chatsData || [])) {
          try {
            console.log(`Processing chat ${chat.id}:`, chat);
            
            // Determine which user is the "other" user
            const isUser1 = user.id === chat.user1_id;
            const otherUserId = isUser1 ? chat.user2_id : chat.user1_id;
            
            console.log(`Current user is user${isUser1 ? '1' : '2'}, other user ID: ${otherUserId}`);

            // Get contact name from profiles table
            let contactName = 'Unknown User';
            if (otherUserId) {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', otherUserId)
                .single();
              
              if (profileError) {
                console.warn(`Profile lookup failed for user ${otherUserId}:`, profileError);
              } else {
                contactName = profileData?.name || 'Unknown User';
              }
            }

            // Get last message
            const { data: lastMessageData } = await supabase
              .from('messages')
              .select('content, sent_at, sender_id')
              .eq('chat_id', chat.id)
              .order('sent_at', { ascending: false })
              .limit(1);

            // Get message count for this chat
            const { count: messageCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('chat_id', chat.id);

            const lastMessage = lastMessageData?.[0];
            let lastMessagePreview = 'No messages yet';
            
            if (lastMessage) {
              // Show "You: " prefix if the current user sent the last message
              const isCurrentUserMessage = lastMessage.sender_id === user.id;
              const prefix = isCurrentUserMessage ? 'You: ' : '';
              lastMessagePreview = prefix + (lastMessage.content.length > 50 
                ? lastMessage.content.substring(0, 50) + '...' 
                : lastMessage.content);
            }

            const processedChat = {
              ...chat,
              contactName,
              jobTitle: chat.posts?.job_title || 'Unknown Job',
              lastMessage: lastMessagePreview,
              lastMessageTime: lastMessage?.sent_at || chat.started_at,
              messageCount: messageCount || 0,
              otherUserId
            };
            
            console.log(`Processed chat ${chat.id}:`, processedChat);
            processedChats.push(processedChat);
            
          } catch (err) {
            console.error(`Error processing chat ${chat.id}:`, err);
            // Continue with other chats instead of failing completely
          }
        }

        // Sort chats by last message time (most recent first)
        const validChats = processedChats.sort((a, b) => 
          new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );

        console.log(`Final processed chats (${validChats.length}):`, validChats);
        setChats(validChats);

        // Auto-select the most recent chat if available
        if (validChats.length > 0) {
          const mostRecentChat = validChats[0];
          console.log('Auto-selecting most recent chat:', mostRecentChat.id);
          setSelectedChat(mostRecentChat.id);
          await loadMessages(mostRecentChat.id);
        } else {
          console.log('No chats found for user:', user.id);
        }

        setLoading(false);

      } catch (err) {
        console.error('Error initializing chat system:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const checkAuthAndInitialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login';
        } else {
          setCurrentUser(user);
          await initializeGeneralChatSystem(user);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkAuthAndInitialize();
  }, []); // No dependencies since this is a general chat view

  const loadMessages = async (chatId) => {
    try {
      // Clean up previous subscription
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }

      console.log('Loading messages for chat:', chatId);

      const { data: messagesData = [] } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('sent_at', { ascending: true });

      console.log(`Loaded ${messagesData.length} messages for chat ${chatId}`);

      setMessages(prev => ({ 
        ...prev, 
        [chatId]: messagesData || [] 
      }));

      // Set up real-time subscription for new messages
      subscriptionRef.current = supabase
        .channel(`messages:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, (payload) => {
          console.log('New message received:', payload.new);
          setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), payload.new]
          }));
          scrollToBottom();
        })
        .subscribe();

      // Scroll to bottom after loading messages
      setTimeout(scrollToBottom, 100);

    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !currentUser) return;

    const messageId = crypto.randomUUID();
    const newMessageData = {
      id: messageId,
      chat_id: selectedChat,
      sender_id: currentUser.id,
      content: newMessage.trim(),
      sent_at: new Date().toISOString()
    };

    // Optimistic update
    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessageData]
    }));
    setNewMessage('');
    scrollToBottom();

    try {
      const { error } = await supabase
        .from('messages')
        .insert(newMessageData);

      if (error) throw error;

      // Update the chat list to reflect the new last message
      setChats(prev => prev.map(chat => {
        if (chat.id === selectedChat) {
          return {
            ...chat,
            lastMessage: `You: ${newMessage.trim().length > 50 
              ? newMessage.trim().substring(0, 50) + '...' 
              : newMessage.trim()}`,
            lastMessageTime: newMessageData.sent_at
          };
        }
        return chat;
      }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));

    } catch (err) {
      console.error('Message send error:', err);
      setError('Failed to send message');
      
      // Revert optimistic update on error
      setMessages(prev => ({
        ...prev,
        [selectedChat]: (prev[selectedChat] || []).filter(msg => msg.id !== messageId)
      }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatSelect = (chatId) => {
    console.log('Selecting chat:', chatId);
    setSelectedChat(chatId);
    loadMessages(chatId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) return (
    <div className="chat-loading">
      <div className="spinner"></div>
      <p>Loading your chats...</p>
    </div>
  );

  if (error) return (
    <div className="chat-error">
      <h3>Error</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="main-content">
      <div className="contacts-panel">
        <h3 className="panel-title">Your Chats</h3>
        <ul className="contacts-list">
          {(chats || []).map(chat => (
            <li
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              className={`contact-item ${selectedChat === chat.id ? 'selected' : ''}`}
            >
              <div className="contact-header">
                <div className="contact-name">{chat.contactName}</div>
                <div className="contact-time">{formatTime(chat.lastMessageTime)}</div>
              </div>
              <div className="contact-job">{chat.jobTitle}</div>
              <div className="contact-last">{chat.lastMessage}</div>
              {chat.messageCount > 0 && (
                <div className="message-count">{chat.messageCount} messages</div>
              )}
            </li>
          ))}
        </ul>
        
        {chats.length === 0 && (
          <div className="no-chats">
            <p>No chats yet</p>
            <p className="no-chats-subtitle">Start a conversation by applying to jobs!</p>
          </div>
        )}
      </div>

      <div className="chat-panel">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <h4>{chats.find(c => c.id === selectedChat)?.contactName || 'Chat'}</h4>
              <div className="chat-job-info">
                {chats.find(c => c.id === selectedChat)?.jobTitle}
              </div>
            </div>

            <div className="messages-view">
              {(messages[selectedChat] || []).map((message, index) => (
                <div
                  key={`${message.id}-${index}`}
                  className={`message-bubble ${
                    message.sender_id === currentUser?.id ? 'outgoing' : 'incoming'
                  }`}
                >
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.sent_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={!selectedChat}
              />
              <button type="submit" disabled={!selectedChat || !newMessage.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Welcome to your chats!</h3>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage2;