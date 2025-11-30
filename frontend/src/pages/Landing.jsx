export default function Landing() {
  return (
    <div className="landing-wrapper d-flex align-items-center justify-content-center bg-light">
      <div className="container text-center">
        
        <div className="glass p-5 rounded shadow-lg">
          <h1 className="text-peacock fw-bold mb-3">Welcome to TripShield</h1>

          <p className="text-tealcustom fs-5 mb-4">
            Your personal safety companion for emergencies, real-time alerts,
            and quick SOS communication.
          </p>

          <div className="d-flex gap-3 justify-content-center">
            <a href="/register" className="btn btn-success px-4">
              Get Started
            </a>

            <a href="/login" className="btn btn-outline-peacock px-4"
               style={{ borderColor: "#046D63", color: "#046D63" }}>
              Login
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
