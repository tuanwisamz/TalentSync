import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Messages({ role }) {
  const { supabase, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Subscribe to new messages for active conversation
  useEffect(() => {
    if (!activeConv) return;

    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConv.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, supabase]);

  const handleSelectConversation = useCallback(async (conv) => {
    setActiveConv(conv);
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!user) return;

    async function fetchConversations() {
      try {
        setLoadingConvs(true);
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            talent:talent_profiles!talent_id ( full_name, photo_url ),
            employer:companies!employer_id ( name, logo_url )
          `)
          .eq(role === 'employer' ? 'employer_id' : 'talent_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setConversations(data || []);

        if (data && data.length > 0) {
          await handleSelectConversation(data[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load conversations');
      } finally {
        setLoadingConvs(false);
      }
    }

    fetchConversations();
  }, [user, role, supabase, handleSelectConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const content = newMessage.trim();
    setNewMessage(''); // optimistic clear

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConv.id,
          sender_id: user.id,
          content
        });

      if (error) throw error;
      
      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConv.id);

    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
      setNewMessage(content); // revert on error
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Messages</h1>
        <p>Connect with {role === 'employer' ? 'talent' : 'employers'} in real time</p>
      </div>

      <div className="messages-layout">
        <div className="messages-sidebar">
          <div className="messages-sidebar__header">
            <h2>Conversations</h2>
          </div>

          <div className="messages-list scrollbar-thin scrollbar-thumb-gray-300">
            {loadingConvs ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }} className="t-caption">
                No active conversations.
                {role === 'employer'
                  ? ' Message talents from their profiles or applications.'
                  : ' Employers will message you when they are interested!'}
              </div>
            ) : (
              conversations.map(conv => {
                const otherParty = role === 'employer' ? conv.talent : conv.employer;
                const name = otherParty?.full_name || otherParty?.name || 'Unknown';
                const photo = otherParty?.photo_url || otherParty?.logo_url;
                const isActive = activeConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`messages-conv-btn${isActive ? ' active' : ''}`}
                  >
                    {photo ? (
                      <img src={photo} alt="" className="messages-avatar" />
                    ) : (
                      <div className="messages-avatar messages-avatar--placeholder">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t-body-strong" style={{ fontSize: 14, marginBottom: 2 }}>{name}</div>
                      <div className="t-caption" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.job_title ? `Re: ${conv.job_title}` : 'Direct Message'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="messages-main">
          {activeConv ? (
            <>
              <div className="messages-chat-header">
                <span>{role === 'employer' ? activeConv.talent?.full_name : activeConv.employer?.name}</span>
                {activeConv.job_title && (
                  <>
                    <span style={{ color: 'var(--color-hairline-strong)' }}>•</span>
                    <span className="t-caption">Re: {activeConv.job_title}</span>
                  </>
                )}
              </div>

              <div className="messages-chat-body scrollbar-thin scrollbar-thumb-gray-200">
                {loadingMessages ? (
                  <div className="messages-empty">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="messages-empty">
                    <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
                    <p>Send a message to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.sender_id === user.id;
                    const showTime = i === 0 || new Date(msg.created_at) - new Date(messages[i - 1].created_at) > 5 * 60000;

                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                        {showTime && (
                          <div className="t-caption" style={{ marginBottom: 8 }}>
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </div>
                        )}
                        <div className={`messages-bubble ${isMine ? 'messages-bubble--mine' : 'messages-bubble--theirs'}`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="messages-input-bar">
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Type a message…"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="input-field"
                    style={{ borderRadius: 999, flex: 1 }}
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="btn-primary">
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="messages-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ marginBottom: 16, opacity: 0.25 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
