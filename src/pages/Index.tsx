import Header from "@/components/Header";
import ChatContainer from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background glow effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "var(--gradient-glow)",
          top: "-50%",
        }}
      />
      
      <Header />
      
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative">
        <ChatContainer />
      </main>
    </div>
  );
};

export default Index;
