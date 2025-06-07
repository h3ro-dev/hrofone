import { Container } from '@/components/ui';
import { Phone, Settings, Upload, HeartHandshake } from 'lucide-react';

const steps = [
  {
    icon: Phone,
    title: 'Quick Setup Call',
    description: 'Tell us about your business and current HR challenges in a free 30-minute consultation.',
    time: '30 minutes',
  },
  {
    icon: Settings,
    title: 'Custom Configuration',
    description: 'We configure HR of One for your specific needs, policies, and compliance requirements.',
    time: '1-2 days',
  },
  {
    icon: Upload,
    title: 'Seamless Launch',
    description: 'Import your employee data, and you\'re ready. Most clients see time savings on day one.',
    time: 'Same day',
  },
  {
    icon: HeartHandshake,
    title: 'Ongoing Support',
    description: 'Your AI assistant learns and improves. Plus, you get human support whenever you need it.',
    time: 'Always available',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From first call to full implementation in under 48 hours
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gray-300 hidden lg:block" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-lg p-6 text-center relative z-10">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="absolute -top-4 right-4 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {step.description}
                  </p>
                  <p className="text-sm font-medium text-primary-600">
                    {step.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}; 