import { Container, Card } from '@/components/ui';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I went from drowning in paperwork to actually having time for strategic initiatives. HR of One saved my sanity.",
    name: "Sarah Chen",
    title: "HR Manager",
    company: "TechStart Solutions (45 employees)",
    rating: 5,
  },
  {
    quote: "The compliance monitoring alone is worth it. I used to lose sleep worrying about missing something important.",
    name: "Michael Rodriguez",
    title: "Owner",
    company: "Rodriguez Manufacturing (28 employees)",
    rating: 5,
  },
  {
    quote: "My employees love the self-service portal. I've reduced HR questions by 70% and everyone gets faster answers.",
    name: "Jennifer Park",
    title: "Operations Director",
    company: "Park Consulting Group (67 employees)",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Solo HR Heroes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our customers have to say about transforming their HR operations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-200" />
              <div className="relative z-10">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
 