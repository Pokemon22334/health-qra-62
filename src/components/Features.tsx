
import {
  ShieldCheck,
  QrCode,
  FileText,
  Clock,
  Share2,
  Activity,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: "Secure Health Records",
    description: "Store and organize all your medical documents in one secure place with end-to-end encryption.",
    icon: FileText,
    iconColor: "text-green-500",
    iconBg: "bg-green-100"
  },
  {
    title: "QR Code Access",
    description: "Generate a secure, time-limited QR code that allows doctors to access your records during consultations.",
    icon: QrCode,
    iconColor: "text-medivault-600",
    iconBg: "bg-medivault-100"
  },
  {
    title: "Advanced Security",
    description: "Your data is protected with industry-leading security practices and role-based access controls.",
    icon: ShieldCheck,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-100"
  },
  {
    title: "Treatment Tracking",
    description: "Track medications, treatments, and set reminders to ensure you never miss a dose.",
    icon: Clock,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-100"
  },
  {
    title: "Emergency Profile",
    description: "Create an emergency profile with critical information that can be accessed in urgent situations.",
    icon: AlertCircle,
    iconColor: "text-red-500",
    iconBg: "bg-red-100"
  },
  {
    title: "Health Sharing",
    description: "Selectively share parts of your health record with family members or caregivers.",
    icon: Share2,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100"
  },
  {
    title: "Visit History",
    description: "Log and review your doctor visits, with the ability to add notes and follow-ups.",
    icon: Stethoscope,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-100"
  },
  {
    title: "Health Metrics",
    description: "Visualize and track key health metrics over time to better understand your wellbeing.",
    icon: Activity,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-100"
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-white" id="features">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Comprehensive Health Management
          </h2>
          <p className="text-lg text-gray-600">
            MediVault brings together powerful features designed to streamline your healthcare journey and 
            keep your medical information secure yet accessible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
      
      {/* Feature Highlight */}
      <div className="container mx-auto px-4 md:px-6 mt-20">
        <div className="bg-gradient-to-br from-medivault-50 to-blue-50 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-medivault-100 text-medivault-700 mb-6 w-fit">
                <QrCode className="w-4 h-4 mr-2" />
                Featured
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                QR-Based Doctor Access
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Generate a unique QR code that gives doctors temporary access to your medical records 
                during appointments. You control what they see and for how long.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Time-limited access (24-hour default)",
                  "Selective sharing of specific records",
                  "Access log to track who viewed your data",
                  "Revoke access with a single tap"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-medivault-100 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-medivault-500 rounded-full" />
                    </div>
                    <span className="ml-3 text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative lg:h-auto">
              <div className="absolute inset-0 bg-gradient-to-tl from-medivault-500/10 to-transparent z-10 lg:hidden" />
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Doctor scanning QR code"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-8 right-8 w-40 h-40 bg-white rounded-lg shadow-lg p-3 rotate-6 hidden lg:block">
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 text-medivault-800">
                    <path fillRule="evenodd" clipRule="evenodd" d="M30 30H40V40H30V30ZM50 30H60V40H50V30ZM30 50H40V60H30V50ZM60 50H70V60H60V50ZM50 50H60V60H50V50ZM30 70H40V80H30V70Z" fill="currentColor" />
                    <rect x="30" y="30" width="40" height="50" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

type FeatureCardProps = {
  feature: {
    title: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
  };
  index: number;
};

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const Icon = feature.icon;
  const animationDelay = `${index * 100}ms`;

  return (
    <div 
      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col animate-fade-in-up"
      style={{ animationDelay }}
    >
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", feature.iconBg)}>
        <Icon className={cn("w-6 h-6", feature.iconColor)} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-gray-600 flex-grow">{feature.description}</p>
    </div>
  );
};

export default Features;
