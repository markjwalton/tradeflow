export default function Oatmeal() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#2C2416]">
      {/* Header */}
      <header className="border-b border-[#E5DCC9]">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#2C2416]">Oatmeal</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-[#2C2416] hover:text-[#8B7355]">Features</a>
              <a href="#about" className="text-sm font-medium text-[#2C2416] hover:text-[#8B7355]">About</a>
              <a href="#contact" className="text-sm font-medium text-[#2C2416] hover:text-[#8B7355]">Contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Welcome to Oatmeal
            </h1>
            <p className="text-xl sm:text-2xl text-[#6B5744] mb-8 max-w-3xl mx-auto">
              A warm, comforting digital experience that feels like home.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-3 bg-[#2C2416] text-white rounded-lg hover:bg-[#3E3420] transition-colors">
                Get Started
              </button>
              <button className="px-8 py-3 border-2 border-[#2C2416] text-[#2C2416] rounded-lg hover:bg-[#2C2416] hover:text-white transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-[#E5DCC9] rounded-lg">
              <h3 className="text-xl font-bold mb-3">Simple & Clean</h3>
              <p className="text-[#6B5744]">A minimalist design that focuses on what matters most.</p>
            </div>
            <div className="p-6 border border-[#E5DCC9] rounded-lg">
              <h3 className="text-xl font-bold mb-3">Fast & Reliable</h3>
              <p className="text-[#6B5744]">Built for performance and dependability.</p>
            </div>
            <div className="p-6 border border-[#E5DCC9] rounded-lg">
              <h3 className="text-xl font-bold mb-3">Easy to Use</h3>
              <p className="text-[#6B5744]">Intuitive interface that anyone can navigate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#E5DCC9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[#6B5744]">
            © {new Date().getFullYear()} Oatmeal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}