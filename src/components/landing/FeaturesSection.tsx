
import { CheckIcon } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      title: "Skill Development",
      description: "Access curated workshops designed by industry professionals to develop in-demand skills.",
      icon: "📚"
    },
    {
      title: "Talent Showcase",
      description: "Showcase your skills, achievements, and completed workshops to potential employers.",
      icon: "🏆"
    },
    {
      title: "Direct Connections",
      description: "Connect directly with recruiters looking for the specific skills you've developed.",
      icon: "🔗"
    },
    {
      title: "Progress Tracking",
      description: "Track your learning progress and skill development over time with detailed analytics.",
      icon: "📈"
    },
    {
      title: "Custom Workshops",
      description: "Recruiters can create custom workshops tailored to their specific hiring needs.",
      icon: "✏️"
    },
    {
      title: "Talent Pipeline",
      description: "Build a pipeline of qualified candidates with verified skills for your company.",
      icon: "👥"
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            SkillUp Connect offers a comprehensive platform for both job seekers and recruiters, 
            streamlining the process of skill development and talent acquisition.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-major-blue/5 rounded-xl p-8 border border-major-blue/20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">A Platform Built for Everyone</h3>
              <p className="text-gray-700 mb-6">
                Whether you're a job seeker looking to enhance your skills or a recruiter searching for qualified talent, 
                SkillUp Connect provides the tools and resources you need to succeed.
              </p>
              <ul className="space-y-3">
                {["24/7 access to workshops", "Personalized learning paths", "Direct messaging with recruiters", "Skill verification"].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-major-blue mr-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3 md:pl-10">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="text-center">
                  <div className="inline-block p-4 bg-major-blue/10 rounded-full">
                    <div className="text-4xl">💼</div>
                  </div>
                  <h4 className="text-xl font-semibold mt-4 mb-2">500+ Companies</h4>
                  <p className="text-gray-600">Actively recruiting from our talent pool</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
