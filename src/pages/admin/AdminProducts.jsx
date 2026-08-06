import { AdminPlaceholder } from './AdminPlaceholder';

export default function AdminProducts() {
  return (
    <AdminPlaceholder
      title="Products"
      description="Price badalna, naya product add karna, delete karna."
      step={6}
      features={[
        'Table view — thumbnail, title, category, price, active toggle',
        'Price table mein hi inline edit (sabse common kaam)',
        'Add / edit form — variants ke multiple rows ke saath',
        'Delete pe confirm; ya soft delete taaki wapas laaya ja sake',
      ]}
    />
  );
}
