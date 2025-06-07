import { Container, Button } from '@/components/ui';
import { ArrowRight, PlayCircle, Shield, Users, Star, Award } from 'lucide-react';

export const FinalCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
      <Container>
        <div className="text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Reclaim Your Time?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join hundreds of small businesses and solo HR managers who've transformed their HR operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary-600 hover:bg-gray-100 group"
            >
              Get Your Free HR Relief Session
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch 5-Minute Demo
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>500+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span>4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>2024 HR Tech Award Winner</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}; 