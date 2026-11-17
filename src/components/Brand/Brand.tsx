import logo from '../../assets/logo-spider.jpg'

type BrandProps = {
  /** Classes de tamanho da marca (largura/altura). */
  className?: string
}

/** Marca do sistema: logo da Spider Som e Filme. */
function Brand({ className = 'h-9 w-auto' }: BrandProps) {
  return (
    <img
      src={logo}
      alt="Spider Som e Filme"
      className={`aspect-square rounded-full object-cover ${className}`}
    />
  )
}

export default Brand
