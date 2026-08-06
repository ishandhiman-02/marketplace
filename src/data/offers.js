import codingImg from '../assets/coding_course_laptop_dark.jpg';
import designImg from '../assets/design_course_creative_dark.jpg';

export const OFFERS = [
  {
    id: 1,
    type: 'video',
    title: 'Flash Sale — Streaming Bundle',
    description: 'Get Netflix + Prime + Hotstar together at a jaw-dropping bundled price. Limited slots available.',
    badge: 'VIDEO OFFER',
    discount: '60% OFF',
    color: '#4f46e5',
    thumbnail: codingImg,
  },
  {
    id: 2,
    type: 'audio',
    title: 'Podcast: How to Save Big on Premium Apps',
    description: 'Tips on stacking subscriptions, getting the best deals, and never overpaying for software again.',
    badge: 'AUDIO OFFER',
    discount: null,
    color: '#8b5cf6',
    audioDuration: '14:30',
  },
  {
    id: 3,
    type: 'image',
    title: 'Design Tools Mega Bundle — Canva + Autodesk',
    description: 'Get Canva Pro and Autodesk All Apps together at an unbeatable price. Create anything, design everything.',
    badge: 'IMAGE OFFER',
    discount: 'Bundle Deal',
    image: designImg,
    color: '#ec4899',
  },
  {
    id: 4,
    type: 'text',
    title: 'Learning Stack — Coursera + edX + LinkedIn',
    description: 'Lock in all three learning platforms at combo pricing and build your career faster than ever.',
    badge: 'TEXT OFFER',
    discount: 'Combo Deal',
    color: '#10b981',
    highlights: ['Coursera Plus — 1 Year', 'edX Full Access — 1 Year', 'LinkedIn Premium — 3 Months', 'All at combo pricing'],
  },
];
