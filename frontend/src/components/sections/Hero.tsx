import { Button } from '@/components/ui';
import { Container } from '@/components/ui';
import { ArrowRight, PlayCircle } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-primary-50 to-white pt-32 pb-20">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal HR Department
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Stop drowning in HR tasks. Let AI handle the paperwork while you focus on your people.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              Get Your Free HR Relief Session
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="group">
              <PlayCircle className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Setup in 48 hours</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}; 