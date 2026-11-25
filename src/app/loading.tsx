export default function Loading() {
  return (
    <section className="section" aria-busy="true">
      <div className="container center" role="status">
        <div className="spinner spinner-dark" aria-hidden="true" />
        <p className="muted">Chargement…</p>
      </div>
    </section>
  );
}
