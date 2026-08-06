/**
 * The maison renders scent as colour, not photography. Each composition owns a
 * "chromatic signature" — a living gradient field used wherever an image would be.
 */
export default function ChromaticPlate({ chromatic, ratio = '3 / 4', className = '', children, style }) {
  const { from = '#1b1733', via = '#5a2e3e', to = '#c58a3d', glow = '#e0a857' } = chromatic || {}
  const grad = `radial-gradient(115% 90% at 26% 14%, ${glow}66 0%, transparent 52%), linear-gradient(152deg, ${from} 4%, ${via} 52%, ${to} 100%)`
  return (
    <div
      className={`plate ${className}`}
      style={{ '--plate-grad': grad, aspectRatio: ratio, ...style }}
    >
      <div className="plate__field" />
      <div className="plate__sheen" />
      <div className="plate__grain" />
      <div className="plate__vGloss" />
      {children}
    </div>
  )
}
