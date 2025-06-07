'use client';

import { useState } from 'react';
import { Container } from '@/components/ui';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How quickly can I get started?',
    answer: 'Most clients are fully operational within 48 hours. Our quick setup call takes just 30 minutes, and configuration typically completes by the next business day.',
  },
  {
    question: 'Will this work with my existing HR tools?',
    answer: 'Yes! HR of One integrates with popular payroll, benefits, and HRIS systems. We\'ll help you connect everything during setup.',
  },
  {
    question: 'What about data security?',
    answer: 'We use bank-level encryption and are SOC 2 Type II certified. Your data is safer with us than in a filing cabinet.',
  },
  {
    question: 'Can I customize it for my specific policies?',
    answer: 'Absolutely. HR of One adapts to your unique policies, procedures, and company culture. It\'s your HR department, automated.',
  },
  {
    question: 'What if I need human help?',
    answer: 'You\'re never alone. Our HR experts are available via phone and email. Think of us as your backup team.',
  },
  {
    question: 'How does the AI actually work?',
    answer: 'Our AI is trained on millions of HR interactions and continuously updated with the latest regulations. It understands context and provides accurate, relevant responses.',
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gray-50">
      <Container size="md">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about HR of One
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {faq.question}
                </h3>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}; 