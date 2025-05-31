import { useState } from "react";
import { UserCircle, ChevronDown } from "lucide-react";
import "./Header.css"; // Import the normal CSS

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* Left Side - Site Name */}
      <h1 className="site-title">KHADEMNI</h1>

      {/* Right Side - User Section */}
      <div className="user-section">
        <button className="user-button" onClick={() => setMenuOpen(!menuOpen)}>
          <UserCircle size={24} />
          <span>John Doe</span>
          <ChevronDown size={18} />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="dropdown-menu">
            <ul>
              <li className="dropdown-item">Profile</li>
              <li className="dropdown-item">Settings</li>
              <li className="dropdown-item logout">Logout</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
