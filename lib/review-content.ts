export type Testimonial = {
  id: string;
  category: string;
  quote: string;
  name: string;
  role: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    id: 'executive-support',
    category: 'Executive Support',
    quote: '“I finally have the space to focus on what matters.”\n\nAltura has brought a level of structure and calm to my working week that I didn\'t realize I was missing. From calendar coordination to inbox management and follow-ups, everything is handled with exceptional attention to detail.',
    name: 'Alexandra M.',
    role: 'Founder & Managing Director',
    rating: 4.7,
  },
  {
    id: 'travel-concierge',
    category: 'Travel Concierge',
    quote: '“Every detail was considered before I even had to ask.”\n\nCoordinating international travel alongside a demanding schedule can be exhausting. Having flights, accommodation, transfers and meeting arrangements organized in one place made the entire experience considerably easier.',
    name: 'Daniel R.',
    role: 'Senior Business Consultant',
    rating: 4.6,
  },
  {
    id: 'business-operations',
    category: 'Business Operations',
    quote: '“A dependable partner who keeps everything moving.”\n\nThe difference has been in the follow-through. Project updates, customer requests, research and ongoing tasks are much more organized. Communication is thoughtful, consistent and always professional.',
    name: 'Michael T.',
    role: 'Business Owner',
    rating: 5.0,
  },
  {
    id: 'personal-assistance',
    category: 'Personal Assistance',
    quote: '“Thoughtful support that makes a genuine difference.”\n\nFrom appointments and reservations to personal scheduling, having someone coordinate the details has made balancing work and personal commitments so much easier. Everything feels considered, organized and handled with discretion.',
    name: 'Sophia L.',
    role: 'Entrepreneur',
    rating: 4.7,
  },
  {
    id: 'digital-administrative-support',
    category: 'Digital & Administrative Support',
    quote: '“Professional, proactive and wonderfully detail-oriented.”\n\nWhat stands out most is the ability to bring clarity to complicated workflows. Research, reporting, digital coordination and recurring administrative tasks are handled in a structured way, allowing me to spend more time growing the business.',
    name: 'James W.',
    role: 'Managing Partner',
    rating: 4.6,
  },
];
