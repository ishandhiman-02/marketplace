import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export function VideoOfferCard({ offer }) {
  const [clicked, setClicked] = useState(false);
  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer"
      style={{ height: 200 }}
      onClick={() => setClicked(true)}
    >
      <img src={offer.thumbnail} alt={offer.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.45)' }} />
      {!clicked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: '#4f46e5' }}
          >
            <Icons.Play size={24} color="#fff" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
