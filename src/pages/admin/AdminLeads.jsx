import { AdminPlaceholder } from './AdminPlaceholder';

export default function AdminLeads() {
  return (
    <AdminPlaceholder
      title="Leads"
      description="Kaun khareed raha hai — Instagram DM se pehle capture hota hai."
      step={9}
      features={[
        'Table — date, naam, Instagram username, phone, product, price',
        'Status dropdown: new / contacted / paid / delivered / cancelled',
        'Filter by status aur date range; username se search',
        'Export CSV',
      ]}
    />
  );
}
