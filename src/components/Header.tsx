import { Dna } from "lucide-react";

const Header = () => {
  return (
    <header className="glass border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center glow-effect">
            <Dna className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Protein Binding Analysis</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
