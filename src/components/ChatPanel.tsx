import { useApp } from "@/context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, ArrowLeft, PenSquare, Zap, Send, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export function ChatPanel() {
  const {
    chatOpen, chatMessages, chatInput, setChatInput, chatLoading,
    chatView, setChatView, conversations, convsLoading, convTitle, convId,
    sendChatMessage, openConversation, deleteConversation, newConversation, openHistory,
    chatEndRef,
  } = useApp();

  if (!chatOpen) return null;

  return (
    <div className="w-[380px] border-l border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
        {chatView === "history" ? (
          <>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setChatView("chat")}>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="flex-1 text-xs font-bold">Conversations</span>
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={newConversation}>
              + New
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">{convTitle || "AI Assistant"}</div>
              <div className="text-[10px] text-muted-foreground">Paste emails, transcripts, or ask anything</div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openHistory} title="History">
              <History className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={newConversation} title="New chat">
              <PenSquare className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      {/* History view */}
      {chatView === "history" && (
        <ScrollArea className="flex-1">
          <div className="p-2 flex flex-col gap-1">
            {convsLoading && <p className="text-xs text-muted-foreground text-center mt-8">Loading…</p>}
            {!convsLoading && conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-10">No saved conversations yet.</p>
            )}
            {conversations.map((c) => (
              <button key={c.id} onClick={() => openConversation(c.id)}
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg p-2.5 text-left transition-colors",
                  c.id === convId ? "bg-surface-high border border-primary/20" : "bg-surface-mid border border-border hover:bg-surface-high"
                )}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(c.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <button onClick={(e) => deleteConversation(c.id, e)}
                  className="text-muted-foreground hover:text-destructive p-1 opacity-50 hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Chat view */}
      {chatView === "chat" && (
        <>
          <ScrollArea className="flex-1">
            <div className="p-3 flex flex-col gap-2.5">
              {chatMessages.length === 0 && (
                <div className="text-xs text-muted-foreground text-center mt-10 leading-6 px-4">
                  Paste an email or meeting transcript and I'll extract tasks and add them for you.
                  <br /><br />
                  Or ask me to help prioritize, plan, or update existing tasks.
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                  {msg.role === "user" ? (
                    <div className="max-w-[92%] px-3 py-2 rounded-xl rounded-br-sm bg-primary text-primary-foreground text-xs leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="max-w-[96%] px-3 py-2.5 rounded-xl rounded-bl-sm bg-card border border-border text-xs leading-relaxed break-words">
                      {/* Tool calls */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {msg.toolCalls.map((tc, j) => (
                            <Badge key={j} variant="purple" className="text-[10px] gap-1 py-0">
                              <Zap className="h-2.5 w-2.5" />
                              {tc.name.replace(/_/g, " ")} {(tc.input as any).moduleId ?? (tc.input as any).project ?? ""}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Markdown body */}
                      {msg.text && (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || "");
                              const inline = !match;
                              return !inline ? (
                                <SyntaxHighlighter style={vscDarkPlus} language={match![1]} PreTag="div"
                                  customStyle={{ borderRadius: 6, fontSize: 11, margin: "6px 0" }} {...props}>
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code className="bg-[#1e1e2e] rounded px-1 py-0.5 text-[0.85em] text-accent-foreground" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children }) => <p className="my-1">{children}</p>,
                            ul: ({ children }) => <ul className="my-1 pl-4 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-1 pl-4 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                            h1: ({ children }) => <h1 className="text-sm font-bold mt-2 mb-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-[13px] font-bold mt-2 mb-1">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xs font-semibold mt-1.5 mb-0.5">{children}</h3>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-primary pl-2.5 my-1.5 text-muted-foreground">{children}</blockquote>
                            ),
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noreferrer" className="text-accent-foreground hover:underline">{children}</a>
                            ),
                            hr: () => <hr className="border-border my-2" />,
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-1.5">
                                <table className="w-full text-[11px] border-collapse">{children}</table>
                              </div>
                            ),
                            th: ({ children }) => <th className="px-2 py-1 border-b border-border text-left font-semibold">{children}</th>,
                            td: ({ children }) => <td className="px-2 py-1 border-b border-border/50">{children}</td>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      )}

                      {/* Streaming indicators */}
                      {msg.streaming && !msg.text && (
                        <span className="text-muted-foreground text-xs">…</span>
                      )}
                      {msg.streaming && msg.text && (
                        <span className="inline-block w-0.5 h-[1em] bg-accent-foreground ml-0.5 align-text-bottom animate-[blink_1s_step-end_infinite]" />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && !chatMessages[chatMessages.length - 1]?.streaming && (
                <div className="flex gap-1.5 text-muted-foreground text-xs pl-1">
                  <span className="animate-[pulse_1.2s_infinite]">●</span>
                  <span className="animate-[pulse_1.2s_infinite_0.2s]">●</span>
                  <span className="animate-[pulse_1.2s_infinite_0.4s]">●</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-2.5 border-t border-border">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
              placeholder="Paste an email, transcript, or ask a question…"
              rows={3}
              className="text-xs"
            />
            <Button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}
              className="w-full mt-1.5 h-8 text-xs gap-1.5">
              <Send className="h-3 w-3" />
              {chatLoading ? "Thinking…" : "Send"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
