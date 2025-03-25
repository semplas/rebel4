export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}