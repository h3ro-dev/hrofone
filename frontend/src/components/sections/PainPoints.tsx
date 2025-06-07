import { Container, Card } from '@/components/ui';
import { FileStack, AlertTriangle, UserX, MessageSquare } from 'lucide-react';

const painPoints = [
  {
    icon: FileStack,
    title: 'Endless Forms & Filing',
    description: 'New hire forms, benefits enrollment, compliance documents... the paperwork never stops coming, and one mistake could cost thousands.',
  },
  {
    icon: AlertTriangle,
    title: 'Always Behind on Regulations',
    description: 'Labor laws change constantly. Miss an update and face penalties, lawsuits, or worse. It\'s impossible to keep up while running your business.',
  },
  {
    icon: UserX,
    title: 'First Days Are a Mess',
    description: 'New employees feel lost, important steps get missed, and that crucial first impression suffers. You know it should be better.',
  },
  {
    icon: MessageSquare,
    title: '"Quick Questions" All Day',
    description: 'Your inbox is full of PTO requests, benefits questions, and policy clarifications. You\'re an HR helpdesk instead of a strategic partner.',
  },
];

export const PainPoints = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            We Know HR Is Overwhelming
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            When you're running a small business or managing HR alone, every day feels like you're fighting fires instead of building culture.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {painPoints.map((point, index) => (
            <Card key={index} hover className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <point.icon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {point.title}
                </h3>
                <p className="text-gray-600">
                  {point.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}; 