import { Container, Card } from '@/components/ui';
import { FileText, Shield, UserCheck, MessageCircle, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Smart Document Management',
    description: 'Generate, send, and track all HR documents automatically. From offer letters to I-9s, everything is handled with zero manual work.',
    benefits: [
      'Auto-generated documents with your branding',
      'E-signature integration',
      'Automatic filing and organization',
      'Instant retrieval when needed',
    ],
  },
  {
    icon: Shield,
    title: 'Stay Legal, Automatically',
    description: 'Real-time monitoring of federal, state, and local regulations. Get alerts before deadlines and auto-updated policies.',
    benefits: [
      'Automatic policy updates',
      'Compliance calendar and reminders',
      'Audit-ready documentation',
      'Legal change notifications',
    ],
  },
  {
    icon: UserCheck,
    title: 'Perfect First Days, Every Time',
    description: 'Automated onboarding workflows ensure nothing falls through the cracks. New hires feel welcomed and prepared from day one.',
    benefits: [
      'Customizable onboarding checklists',
      'Automated task assignments',
      'Progress tracking for managers',
      'New hire self-service portal',
    ],
  },
  {
    icon: MessageCircle,
    title: 'Answer Questions 24/7',
    description: 'AI-powered chat handles routine questions instantly. Employees get answers, you get your time back.',
    benefits: [
      'Instant policy lookups',
      'PTO balance checking',
      'Benefits explanations',
      'Smart escalation to you when needed',
    ],
  },
];

export const Solution = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your AI-Powered HR Department
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            HR of One handles the routine so you can focus on what matters: your people and your business.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} padding="lg" className="border-2 hover:border-primary-200 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 ml-16">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}; 