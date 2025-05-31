import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import './ChatPage.css';

const ChatPage = () => {
  const { jobId } = useParams();
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
    const initializeChatSystem = async (user) => {
      try {
        // Get job post details with null protection
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('posted_id, job_title')
          .eq('id_post', jobId)
          .single();

        if (postError || !postData) throw new Error('Job post not found');

        // Create or find the main chat for this specific job (but not with yourself)
        let mainChat = null;
        if (user.id !== postData.posted_id) {
          mainChat = await getOrCreateMainChat(user.id, postData.posted_id, jobId);
          console.log('Main chat for job created/found:', mainChat);
        } else {
          console.log('User is the job poster - no self-chat needed');
        }
        
        // Wait a moment for the database to be consistent
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch ALL chats for this user with better error handling
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

            // Get contact name from profiles table (more reliable than joins)
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
              .select('content, sent_at')
              .eq('chat_id', chat.id)
              .order('sent_at', { ascending: false })
              .limit(1);

            const processedChat = {
              ...chat,
              contactName,
              jobTitle: chat.posts?.job_title || 'Unknown Job',
              lastMessage: lastMessageData?.[0]?.content || 'No messages yet',
              lastMessageTime: lastMessageData?.[0]?.sent_at || chat.started_at
            };
            
            console.log(`Processed chat ${chat.id}:`, processedChat);
            processedChats.push(processedChat);
            
          } catch (err) {
            console.error(`Error processing chat ${chat.id}:`, err);
            // Continue with other chats instead of failing completely
          }
        }

        // Sort chats by last message time
        const validChats = processedChats.sort((a, b) => 
          new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );

        console.log(`Final processed chats (${validChats.length}):`, validChats);
        setChats(validChats);

        // Select the main chat for this specific job if it exists
        if (validChats.length > 0) {
          let initialChat = validChats[0]; // Default to first chat
          
          if (mainChat) {
            const foundMainChat = validChats.find(c => c.id === mainChat.id);
            if (foundMainChat) {
              initialChat = foundMainChat;
              console.log('Selected main chat for this job:', initialChat.id);
            }
          }
          
          console.log('Setting selected chat to:', initialChat.id);
          setSelectedChat(initialChat.id);
          await loadMessages(initialChat.id);
        } else {
          console.log('No valid chats found for user:', user.id);
        }

        setLoading(false);

      } catch (err) {
        console.error('Initialize chat system error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const getOrCreateMainChat = async (userId, posterId, jobId) => {
      try {
        // Prevent self-chat
        if (userId === posterId) {
          throw new Error('Cannot create chat with yourself');
        }

        console.log(`Finding or creating chat for users ${userId} and ${posterId} on job ${jobId}`);

        // Use consistent user ordering for deterministic chat creation
        const user1Id = userId < posterId ? userId : posterId;
        const user2Id = userId < posterId ? posterId : userId;

        console.log(`Normalized user ordering: user1=${user1Id}, user2=${user2Id}, post=${jobId}`);

        // First, try to find existing chat for this exact combination
        const { data: existingChats, error: searchError } = await supabase
          .from('chats')
          .select('*')
          .eq('post_id', jobId)
          .eq('user1_id', user1Id)
          .eq('user2_id', user2Id);

        if (searchError) {
          console.error('Error searching for existing chat:', searchError);
          throw searchError;
        }

        // If chat exists, return it (should be only one due to unique constraint)
        if (existingChats && existingChats.length > 0) {
          console.log('Found existing chat:', existingChats[0].id);
          
          // Log warning if somehow we have duplicates (shouldn't happen with constraint)
          if (existingChats.length > 1) {
            console.warn(`Found ${existingChats.length} duplicate chats for users ${user1Id}, ${user2Id} on job ${jobId}. Using first one:`, existingChats[0].id);
          }
          
          return existingChats[0];
        }

        // No existing chat found, create new one
        console.log('No existing chat found, creating new one...');
        
        const chatId = uuidv4();
        const chatData = {
          id: chatId,
          user1_id: user1Id,
          user2_id: user2Id,
          post_id: jobId,
          started_at: new Date().toISOString()
        };

        console.log('Attempting to create chat with data:', chatData);

        const { data: newChat, error: insertError } = await supabase
          .from('chats')
          .insert(chatData)
          .select('*')
          .single();

        if (insertError) {
          // Check if this is a unique constraint violation (race condition)
          if (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('unique')) {
            console.log('Unique constraint violation detected - another process created the chat. Fetching existing chat...');
            
            // Another process created the chat, fetch it
            const { data: raceConditionChat, error: fetchError } = await supabase
              .from('chats')
              .select('*')
              .eq('post_id', jobId)
              .eq('user1_id', user1Id)
              .eq('user2_id', user2Id)
              .single();

            if (fetchError) {
              console.error('Error fetching chat after race condition:', fetchError);
              throw fetchError;
            }

            if (raceConditionChat) {
              console.log('Successfully found chat created by concurrent process:', raceConditionChat.id);
              return raceConditionChat;
            } else {
              throw new Error('Chat creation race condition - could not find created chat');
            }
          } else {
            // Some other error, throw it
            console.error('Chat creation error (not constraint violation):', insertError);
            throw insertError;
          }
        }

        // Success case
        console.log('Successfully created new chat:', newChat.id);
        return newChat;

      } catch (err) {
        console.error('getOrCreateMainChat error:', err);
        throw new Error('Chat creation failed: ' + err.message);
      }
    };

    const checkAuthAndInitialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login';
        } else {
          setCurrentUser(user);
          await initializeChatSystem(user);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAuthAndInitialize();
  }, [jobId]);

  const loadMessages = async (chatId) => {
    try {
      // Clean up previous subscription
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }

      const { data: messagesData = [], error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('sent_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        throw messagesError;
      }

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
          console.log('New message received via subscription:', payload.new);
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
      console.error('Load messages error:', err);
      setError('Failed to load messages: ' + err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !currentUser) return;

    const messageId = uuidv4();
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

      if (error) {
        console.error('Message insert error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Message send error:', err);
      setError('Failed to send message: ' + err.message);
      
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

  if (loading) return (
    <div className="chat-loading">
      <div className="spinner"></div>
      <p>Initializing chat...</p>
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
        <h3 className="panel-title">Chats</h3>
        <ul className="contacts-list">
          {(chats || []).map(chat => (
            <li
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat.id);
                loadMessages(chat.id);
              }}
              className={`contact-item ${selectedChat === chat.id ? 'selected' : ''}`}
            >
              <div className="contact-name">{chat.contactName}</div>
              <div className="contact-job">{chat.jobTitle}</div>
              <div className="contact-last">{chat.lastMessage}</div>
            </li>
          ))}
        </ul>
        
        {chats.length === 0 && (
          <div className="no-chats">
            <p>No chats available</p>
          </div>
        )}
      </div>

      <div className="chat-panel">
        {selectedChat ? (
          <>
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
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;