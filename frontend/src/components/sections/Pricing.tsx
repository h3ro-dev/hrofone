import { Container, Card, Button } from '@/components/ui';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 299,
    employees: 'Up to 25 employees',
    features: [
      'Document automation',
      'Basic compliance monitoring',
      'Employee self-service',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: 599,
    employees: 'Up to 100 employees',
    features: [
      'Everything in Starter',
      'Advanced compliance suite',
      'Custom onboarding workflows',
      'Priority phone support',
      'API access',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    employees: '100+ employees',
    features: [
      'Everything in Professional',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantees',
      'On-premise options',
    ],
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            30-day money-back guarantee. No setup fees. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-2 border-primary-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  {typeof plan.price === 'number' ? (
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  )}
                  {typeof plan.price === 'number' && (
                    <span className="text-gray-600">/month</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.employees}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                fullWidth 
                variant={plan.popular ? 'primary' : 'outline'}
              >
                {typeof plan.price === 'number' ? 'Get Started' : 'Contact Sales'}
              </Button>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}; 