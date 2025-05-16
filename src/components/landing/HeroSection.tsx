
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-black">Skill Up,</span>
              <span className="text-major-blue"> Connect,</span>
              <span className="text-black"> Succeed</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The platform that bridges the gap between talent seekers and skill builders. 
              Develop in-demand skills and connect with employers looking for your expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-major-blue hover:bg-major-blue-dark text-white">
                  Get Started
                </Button>
              </Link>
              <Link to="/learn-more">
                <Button size="lg" variant="outline" className="border-major-blue text-major-blue hover:text-major-blue-dark">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="relative">
              <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Top Skills in Demand</h3>
                  <span className="text-major-blue">View All</span>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "React Development", percent: 85 },
                    { name: "Data Analysis", percent: 75 },
                    { name: "UX/UI Design", percent: 65 },
                  ].map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-gray-500">{skill.percent}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-major-blue rounded-full" 
                          style={{ width: `${skill.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="p-4 bg-major-blue/10 rounded-md border border-major-blue/20">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">Pro Tip:</span> Developers with React skills are 4.5x more likely to get interviews.
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-gold-light/20 rounded-lg border border-gold-light/40 -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
