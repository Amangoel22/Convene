export function PageHeader({ title, description }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold text-[#111827]">{title}</h2>
      {description ? <p className="text-sm font-medium text-[#6B7280]">{description}</p> : null}
    </div>
  );
}
