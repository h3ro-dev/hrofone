'use client';

import React from 'react';
import { HeroButton, HeroCard, HeroHeader, HeroAvatar, HeroStat } from '@h3ro-dev/ofone-ui';

export default function SharedComponentsDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <HeroHeader 
          title="HR of One"
          subtitle="Shared Components Showcase"
          variant="center"
        />
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Hero Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <HeroButton variant="primary">Primary Action</HeroButton>
            <HeroButton variant="secondary">Secondary Action</HeroButton>
            <HeroButton variant="outline">Outline Style</HeroButton>
            <HeroButton variant="ghost">Ghost Button</HeroButton>
            <HeroButton variant="destructive">Destructive</HeroButton>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Hero Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HeroCard 
              title="Employee Management"
              description="Streamline HR processes with automated employee lifecycle management"
              ctaText="Manage Now"
            />
            <HeroCard 
              title="Benefits Administration"
              description="Comprehensive benefits management with self-service portals and analytics"
              ctaText="View Benefits"
            />
            <HeroCard 
              title="Compliance Tracking"
              description="Stay compliant with automated policy updates and regulatory tracking"
              ctaText="Check Compliance"
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Hero Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <HeroStat 
              label="Active Employees"
              value="237"
              trend={{ value: 8, isPositive: true }}
            />
            <HeroStat 
              label="Time to Hire"
              value="24 days"
              trend={{ value: 3, isPositive: true }}
            />
            <HeroStat 
              label="Employee Satisfaction"
              value="92%"
              trend={{ value: 4, isPositive: true }}
            />
            <HeroStat 
              label="Retention Rate"
              value="94.5%"
              trend={{ value: 2.1, isPositive: true }}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Hero Avatars</h2>
          <div className="flex items-center gap-6">
            <HeroAvatar 
              name="HR Manager"
              imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=HR"
              size="sm"
            />
            <HeroAvatar 
              name="HR Manager"
              imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=HR"
              size="md"
            />
            <HeroAvatar 
              name="HR Manager"
              imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=HR"
              size="lg"
            />
            <HeroAvatar 
              name="HR"
              size="lg"
            />
          </div>
        </section>

        <section className="text-center py-12">
          <HeroHeader 
            title="Ready to Transform Your HR Operations?"
            subtitle="Leverage the power of unified components across your entire HR ecosystem"
            variant="center"
          />
          <div className="mt-8">
            <HeroButton variant="primary" size="lg">
              Start Your HR Journey
            </HeroButton>
          </div>
        </section>
      </div>
    </div>
  );
}