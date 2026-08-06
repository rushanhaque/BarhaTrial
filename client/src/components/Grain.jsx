// Fixed, pointer-events-none film grain + vignette. Renders once at app root.
export default function Grain() {
  return (
    <>
      <div className="fx-grain" aria-hidden="true" />
      <div className="fx-vignette" aria-hidden="true" />
    </>
  )
}
