import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="p-4 mb-4 flex justify-between items-center" style={{ backgroundColor: '#181824' }}>
      <div className="text-white text-xl font-bold">
        <Link to="/">ChainProof</Link>
      </div>
      <div className="flex gap-4">
        <Link
          to="/send"
          className="text-white px-5 py-2 rounded-lg font-medium transition hover:opacity-80"
          style={{ borderColor: '#35da9a', borderWidth: '1px' }}
        >
          Send
        </Link>
        <Link
          to="/register-token"
          className="text-white px-5 py-2 rounded-lg font-medium transition hover:opacity-80"
          style={{ borderColor: '#35da9a', borderWidth: '1px' }}
        >
          Register Token
        </Link>
        <Link
          to="/developer/dashboard"
          className="text-white px-5 py-2 rounded-lg font-medium transition hover:opacity-80"
          style={{ borderColor: '#35da9a', borderWidth: '1px' }}
        >
          Developer Console
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;