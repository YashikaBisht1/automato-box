import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Trash2, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  title: string | null;
  agent_type: string;
  messages: any;
  updated_at: string;
}

interface ConversationSidebarProps {
  agentType: string;
  currentConversationId?: string;
  onSelectConversation: (conversationId: string | undefined) => void;
}

export default function ConversationSidebar({ 
  agentType, 
  currentConversationId,
  onSelectConversation 
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [agentType]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('agent_type', agentType)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete conversation');
      return;
    }

    toast.success('Conversation deleted');
    loadConversations();
    if (currentConversationId === id) {
      onSelectConversation(undefined);
    }
  };

  const downloadConversation = (conversation: Conversation) => {
    const content = JSON.stringify(conversation, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${(conversation.title || 'untitled').substring(0, 30)}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Conversation downloaded');
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed left-4 top-24 z-10"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className="w-80 h-[calc(100vh-12rem)] fixed left-4 top-24 p-4 z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Conversations</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectConversation(undefined)}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-3rem)]">
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <Card
                key={conv.id}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                  currentConversationId === conv.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(conv.messages) ? conv.messages.length : 0} messages
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadConversation(conv);
                      }}
                      title="Download conversation"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this conversation?')) {
                          deleteConversation(conv.id);
                        }
                      }}
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
