import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can we help you today?",
      sender: "agent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [visitorInfo, setVisitorInfo] = useState({
    name: "",
    email: "",
    submitted: false,
  });

  useEffect(() => {
    if (chatId) {
      const channel = supabase
        .channel(`support-chat-${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'support_chats',
            filter: `id=eq.${chatId}`,
          },
          (payload: any) => {
            if (payload.new.messages) {
              const dbMessages = payload.new.messages;
              const formattedMessages = dbMessages.map((msg: any, index: number) => ({
                id: index + 1,
                text: msg.message,
                sender: msg.sender,
                time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }));
              setMessages(formattedMessages);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  const createChat = async () => {
    if (!visitorInfo.name || !visitorInfo.email) {
      return;
    }

    try {
      const initialMessages = [{
        message: "Hello! How can we help you today?",
        sender: "agent",
        timestamp: new Date().toISOString()
      }];

      const { data, error } = await supabase
        .from("support_chats")
        .insert([
          {
            visitor_name: visitorInfo.name,
            visitor_email: visitorInfo.email,
            messages: initialMessages,
            status: "new",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setChatId(data.id);
        setVisitorInfo({ ...visitorInfo, submitted: true });
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatId) return;

    const newMessage = {
      message: inputMessage,
      sender: "visitor",
      timestamp: new Date().toISOString()
    };

    try {
      const { data: currentChat } = await supabase
        .from("support_chats")
        .select("messages")
        .eq("id", chatId)
        .single();

      if (currentChat) {
        const updatedMessages = [...(currentChat.messages || []), newMessage];

        await supabase
          .from("support_chats")
          .update({ messages: updatedMessages })
          .eq("id", chatId);

        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            text: inputMessage,
            sender: "visitor",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }

      setInputMessage("");

      setTimeout(() => {
        const autoResponse = {
          id: messages.length + 2,
          text: "Thanks for your message! A support agent will respond shortly.",
          sender: "agent",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, autoResponse]);

        const autoResponseMessage = {
          message: autoResponse.text,
          sender: "agent",
          timestamp: new Date().toISOString()
        };

        supabase
          .from("support_chats")
          .select("messages")
          .eq("id", chatId)
          .single()
          .then(({ data }) => {
            if (data) {
              const updatedMessages = [...(data.messages || []), autoResponseMessage];
              supabase
                .from("support_chats")
                .update({ messages: updatedMessages })
                .eq("id", chatId);
            }
          });
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? "w-80 h-16" : "w-80 h-[500px]"
      } flex flex-col`}
    >
      <div className="bg-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <h3 className="font-medium">Live Support</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/10 p-1 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/10 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!visitorInfo.submitted ? (
            <div className="flex-1 p-6 flex flex-col justify-center">
              <h4 className="font-semibold mb-4 text-center">Start a Conversation</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input
                    value={visitorInfo.name}
                    onChange={(e) => setVisitorInfo({ ...visitorInfo, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={visitorInfo.email}
                    onChange={(e) => setVisitorInfo({ ...visitorInfo, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <Button
                  onClick={createChat}
                  className="w-full"
                  disabled={!visitorInfo.name || !visitorInfo.email}
                >
                  Start Chat
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "visitor" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        message.sender === "visitor"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === "visitor" ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="rounded-full">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Available Mon-Fri, 9am-5pm GMT
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
