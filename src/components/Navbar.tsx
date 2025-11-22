import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        {/* El logo siempre nos lleva al inicio */}
        <Link href="/" className="btn btn-ghost text-xl text-primary font-bold">
          🏠 Sillar Inmobiliaria
        </Link>
      </div>
      <div className="flex-none">
        {/* Aquí quitamos los links repetidos para limpiar la vista */}
      </div>
    </div>
  );
}