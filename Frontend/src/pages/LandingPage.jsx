import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-[#F0F4FF] selection:bg-[#00F0FF] selection:text-[#05070F] relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(155,92,255,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.1)_0%,transparent_70%)] pointer-events-none" />

      <Navbar />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The future of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-glow-cyan to-glow-violet">talent discovery.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto font-light mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Connecting world-class companies with exceptional professionals through intelligent, AI-powered matching.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/register" className="btn btn-primary text-lg px-8 py-4 font-medium transition-transform hover:scale-105 active:scale-95">
                Join as Talent
              </Link>
              <Link to="/register" className="btn btn-secondary text-lg px-8 py-4 font-medium transition-all hover:scale-105 active:scale-95">
                Hire Talent
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-white/10 bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card card-interactive p-8 flex flex-col items-start group">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                  <span className="text-2xl text-glow-cyan">✨</span>
                </div>
                <h3 className="text-2xl font-display font-semibold mb-3 text-white">AI Matching</h3>
                <p className="text-white/60 font-light leading-relaxed">
                  Our advanced AI analyzes job requirements and candidate profiles to predict perfect mutual fits.
                </p>
              </div>

              <div className="card card-interactive p-8 flex flex-col items-start group">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(155,92,255,0.1)]">
                  <span className="text-2xl text-glow-violet">⚡️</span>
                </div>
                <h3 className="text-2xl font-display font-semibold mb-3 text-white">Real-time Chat</h3>
                <p className="text-white/60 font-light leading-relaxed">
                  Connect instantly. Schedule interviews and discuss opportunities securely without leaving the platform.
                </p>
              </div>

              <div className="card card-interactive p-8 flex flex-col items-start group">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <span className="text-2xl text-glow-white">🌍</span>
                </div>
                <h3 className="text-2xl font-display font-semibold mb-3 text-white">Global Reach</h3>
                <p className="text-white/60 font-light leading-relaxed">
                  Discover opportunities worldwide. Whether remote or on-site, the world's best companies are looking for you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-glow-cyan/5 blur-[100px]"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6">Ready to elevate your career?</h2>
            <p className="text-xl text-white/60 font-light mb-10">Join thousands of professionals finding their dream roles today.</p>
            <Link to="/register" className="btn btn-primary px-10 py-5 text-lg font-semibold hover:scale-105 transition-transform">
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-white/40 text-sm bg-black/40 backdrop-blur-md">
        <p>© {new Date().getFullYear()} TalentSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
