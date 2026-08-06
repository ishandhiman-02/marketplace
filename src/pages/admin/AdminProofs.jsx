import { AdminPlaceholder } from './AdminPlaceholder';

export default function AdminProofs() {
  return (
    <AdminPlaceholder
      title="Proofs"
      description="Delivery aur payment ke screenshots — public site pe bharosa banate hain."
      step={8}
      features={[
        'Drag-and-drop upload, ek saath multiple files',
        'Upload se pehle browser mein compress (max 1200px)',
        'Caption, product name, active toggle, sort order',
        'Delete pe storage se file bhi hatti hai',
      ]}
    />
  );
}
