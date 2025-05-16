
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-major-blue-dark">SkillUp</span>
            <span className="text-2xl font-bold text-black">Connect</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-major-blue">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-major-blue">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-major-blue">Pricing</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="border-major-blue text-major-blue hover:text-major-blue-dark">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-major-blue hover:bg-major-blue-dark text-white">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <HeroSection />
      
      <FeaturesSection />

      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-major-blue-light text-white text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Register & Choose Your Role</h3>
              <p className="text-gray-600">Sign up as a job seeker looking to develop skills or a recruiter seeking talent.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-major-blue text-white text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Engage With Workshops</h3>
              <p className="text-gray-600">Job seekers participate in workshops, while recruiters create and manage them.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-major-blue-dark text-white text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Connect & Grow</h3>
              <p className="text-gray-600">Build your profile, showcase skills, and connect with opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-major-blue-light">SkillUp</span>
                <span className="text-2xl font-bold">Connect</span>
              </div>
              <p className="max-w-xs text-gray-400">Bridging the gap between talent and opportunity through skill development.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">How It Works</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SkillUp Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
