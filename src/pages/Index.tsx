import Header from "@/components/Header";
import ChatContainer from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Background glow effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "var(--gradient-glow)",
          top: "-50%",
        }}
      />

      <Header />

      <main className="flex-1 container max-w-4xl mx-auto p-4 flex flex-col h-full overflow-hidden">
        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-sm overflow-hidden animate-fade-in">
          <ChatContainer />
        </div>
      </main>
    </div>
  );
};

export default Index;
