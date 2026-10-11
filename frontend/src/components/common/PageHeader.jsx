// Purpose: PageHeader implements this source module.
export function PageHeader({ title, description }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="type-2xl weight-bold text-token-primary">{title}</h2>
      {description ? <p className="type-sm weight-medium text-token-secondary">{description}</p> : null}
    </div>
  );
}
