/* Panel reutilizable para formularios de auth */
export default function AuthCard({ title, children, icon = "👤" }) {
  return (
    <div className="glass w-full max-w-md p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-3xl">{icon}</div>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  );
}
