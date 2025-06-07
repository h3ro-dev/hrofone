import { Container, Card } from '@/components/ui';
import { Clock, Shield, Smile, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Save 15+ Hours Weekly',
    description: 'Cut routine HR tasks by 80%. Spend time on strategy, not paperwork.',
  },
  {
    icon: Shield,
    title: 'Reduce Compliance Risk',
    description: 'Sleep better knowing you\'re always up-to-date with regulations.',
  },
  {
    icon: Smile,
    title: 'Improve Employee Satisfaction',
    description: 'Fast answers and smooth processes keep your team happy.',
  },
  {
    icon: TrendingUp,
    title: 'Scale Without Hiring',
    description: 'Handle 10 or 100 employees with the same ease.',
  },
];

export const Benefits = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Your HR Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of companies that have revolutionized their HR operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center" hover>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}; 