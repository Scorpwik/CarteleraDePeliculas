interface SkeletonPosterProps {
  cantidad?: number
  className?: string
}

export function SkeletonPoster({
  cantidad = 6,
  className = '',
}: SkeletonPosterProps) {
  return (
    <ul className={`grid-titulos grid-skeleton ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: cantidad }, (_, i) => (
        <li
          key={i}
          className="skeleton-poster"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <div className="skeleton-poster-frame" />
          <div className="skeleton-linea" />
          <div className="skeleton-linea corta" />
        </li>
      ))}
    </ul>
  )
}
