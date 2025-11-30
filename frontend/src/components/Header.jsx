export default function Header() {
  return (
    <header className="bg-peacock text-white py-3 shadow">
      <nav className="container d-flex justify-content-between align-items-center">
        <h2 className="m-0 fw-bold">TripShield</h2>

        <ul className="nav">
          <li className="nav-item">
            <a className="nav-link text-white" href="/">Home</a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-white" href="/register">Register</a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-white" href="/login">Login</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
