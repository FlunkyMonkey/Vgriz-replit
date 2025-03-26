import React from 'react';
import SignupForm from '@/components/SignupForm';
import ConstructionAnimation from '@/components/ConstructionAnimation';

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="font-sans bg-background min-h-screen" 
         style={{ 
           backgroundImage: "radial-gradient(circle at 50% 0%, rgba(138, 127, 176, 0.15) 0%, rgba(244, 194, 194, 0.1) 50%, rgba(130, 179, 164, 0.15) 100%)" 
         }}>
      <div className="container mx-auto px-4 py-12 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-semibold text-primary mb-2 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
            <span className="inline-block" style={{ fontStyle: "italic" }}>v<span style={{ fontWeight: 700 }}>G</span>riz</span>
            <span className="text-sm md:text-lg text-accent align-top ml-1">.com</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">Cool things are being built here....</p>
        </header>
        
        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center">
          
          {/* Construction Animation */}
          <ConstructionAnimation />
          
          {/* Info Message */}
          <div className="max-w-lg mx-auto text-center mb-10 px-4">
            <h2 className="text-2xl md:text-3xl font-heading font-medium text-primary mb-4">Under Construction</h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Cool things are being built here. Sign up to be the first to know when we launch and get updates about our progress.
            </p>
          </div>
          
          {/* Signup Form */}
          <SignupForm />
          
        </main>
        
        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>© {currentYear} vGriz. All rights reserved.</p>
        </footer>
        
      </div>
    </div>
  );
}
