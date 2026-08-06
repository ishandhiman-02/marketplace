import { AdminPlaceholder } from './AdminPlaceholder';

export default function AdminOffers() {
  return (
    <AdminPlaceholder
      title="Daily Offers"
      description="Roz ke offers — products se bilkul alag section."
      step={7}
      features={[
        'Emoji, title, prices, slots, expiry date-time',
        'Status pill — Live / Expired / Sold out',
        'Duplicate button — kal ka offer copy karke aaj ka',
        'Public site ka Deals of the day isi table se aayega',
      ]}
    />
  );
}
