import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="border border-white p-4 mb-4 flex justify-between items-center">
      <div className="text-white text-xl">
        <Link to="/">ChainProof</Link>
      </div>
      <div>
        <Link to="/register-token" className="text-white hover:text-gray-300">
          Register Token
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;