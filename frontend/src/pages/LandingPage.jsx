import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 🔍 GLOBAL SEARCH: go to /search?q=...
  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: white; }

        .custom-hero { height: 100vh; background: white; display: flex; align-items: center; margin-left: -12px; margin-right: -12px; margin-top: -24px; }
        .custom-hero h1 { font-size: 3.5rem; font-weight: 700; animation: fadeInUp 1s ease; }
        .custom-hero p { font-size: 1.3rem; animation: fadeInUp 1s ease 0.3s both; }

        .custom-search-container {
  max-width: 700px;
  margin: 2rem auto;
  display: flex;
  justify-content: center;
  animation: fadeInUp 1s ease 0.5s both;
}


        .custom-search-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
}


        .custom-search-wrapper .form-control {
          flex: 1;
          border: 2px solid #333 !important;
          padding: 15px 25px !important;
          font-size: 1.1rem;
          border-radius: 8px !important;
        }

        .custom-search-wrapper .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(51, 51, 51, 0.25) !important;
          border-color: #333 !important;
        }

        .custom-search-button {
          border-radius: 8px !important;
          padding: 0 20px;
          font-weight: 600;
        }

        .custom-cta-button { background: #333 !important; border: 2px solid #333 !important; font-weight: 600; transition: all 0.3s ease; animation: fadeInUp 1s ease 0.8s both; }
        .custom-cta-button:hover { background: white !important; color: #333 !important; border-color: #333 !important; }

        .custom-features { background: #f9f9f9; margin-left: -12px; margin-right: -12px; }
        .custom-feature-card { border: 1px solid #ddd !important; box-shadow: none !important; transition: transform 0.3s ease; }
        .custom-feature-card:hover { transform: translateY(-5px); border-color: #333 !important; }

        .custom-section-title { font-size: 2.5rem; color: #333; }
        .custom-question-card { background: #333 !important; color: white !important; border: 2px solid #333 !important; transition: all 0.3s ease; }
        .custom-question-card:hover { background: white !important; color: #333 !important; }

        .custom-questions-section { margin-left: -12px; margin-right: -12px; }
        .custom-footer { background: #333; color: white; margin-left: -12px; margin-right: -12px; }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .custom-hero h1 { font-size: 2.5rem; }
          .custom-hero p { font-size: 1.1rem; }
          .custom-search-wrapper { flex-direction: column; }
        }
      `}</style>

      {/* HERO */}
      <section id="home" className="custom-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="mb-4">Your Bridge to Independence</h1>
              <p className="mb-4">
                Empowering young adults aging out of foster care with housing,
                counseling, and community support resources
              </p>

              {/* SEARCH BAR */}
              <div className="custom-search-container">
                <div className="custom-search-wrapper">
                  <SearchBar
                    query={searchQuery}
                    setQuery={setSearchQuery}
                    onSearch={handleSearch}
                  />
                  <button
                    type="button"
                    className="btn btn-dark custom-search-button"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                </div>
              </div>

              <a
                href="#features"
                className="btn btn-dark btn-lg px-4 py-3 custom-cta-button"
                onClick={(e) => scrollToSection(e, "#features")}
              >
                Explore Resources
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES */}
      <section id="features" className="py-5 custom-features">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="custom-section-title">What We Offer</h2>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            {/* Housing */}
            <div className="col-md-4 col-lg-3">
              <div className="card h-100 custom-feature-card text-center p-4">
                <h3 className="card-title h4 fw-bold mb-3">
                  Affordable Housing
                </h3>
                <p className="card-text text-muted">
                  Find housing options that match your eligibility, budget, and
                  location preferences near public transit
                </p>
                <a href="/#/housing" className="btn btn-dark mt-3">
                  Explore Housing →
                </a>
              </div>
            </div>

            {/* Counseling */}
            <div className="col-md-4 col-lg-3">
              <div className="card h-100 custom-feature-card text-center p-4">
                <h3 className="card-title h4 fw-bold mb-3">
                  Mental Health Support
                </h3>
                <p className="card-text text-muted">
                  Access low/no-cost counseling services with trauma-informed
                  care in multiple languages
                </p>
                <a href="/#/counseling" className="btn btn-dark mt-3">
                  Find Counselors →
                </a>
              </div>
            </div>

            {/* Organizations */}
            <div className="col-md-4 col-lg-3">
              <div className="card h-100 custom-feature-card text-center p-4">
                <h3 className="card-title h4 fw-bold mb-3">
                  Community Organizations
                </h3>
                <p className="card-text text-muted">
                  Connect with vetted nonprofits and discover volunteer
                  opportunities or ways to give back
                </p>
                <a href="/#/organizations" className="btn btn-dark mt-3">
                  Browse Organizations →
                </a>
              </div>
            </div>
          </div>{" "}
          {/* row g-4 */}
        </div>{" "}
        {/* container */}
      </section>

      {/* QUESTIONS */}
      <section className="py-5 bg-white custom-questions-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="custom-section-title">
                Questions We Help You Answer
              </h2>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4 col-lg-3">
              <div className="card h-100 custom-question-card">
                <div className="card-body p-4">
                  <h3 className="card-title h5 fw-bold mb-3">
                    Where can I live next month?
                  </h3>
                  <p className="card-text">
                    Find housing that matches your eligibility and budget near
                    your preferred transit lines
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 custom-question-card">
                <div className="card-body p-4">
                  <h3 className="card-title h5 fw-bold mb-3">
                    Which counselors can help me?
                  </h3>
                  <p className="card-text">
                    Locate low/no-cost counselors offering trauma-informed care
                    in your preferred language
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 custom-question-card">
                <div className="card-body p-4">
                  <h3 className="card-title h5 fw-bold mb-3">
                    How can I get involved?
                  </h3>
                  <p className="card-text">
                    Discover vetted organizations where you can volunteer
                    effectively or donate with impact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-4 custom-footer">
        <div className="container">
          <div className="row text-center">
            <div className="col-12">
              <p className="mb-2">
                &copy; 2025 FosterFledging. Built by Team 55090_06
              </p>
              <p className="mb-0 text-white">
                Lukas Mathesius • Ameera Habib • Angel Ogungbemi • Danyal Saeed
                • Gora Bepary
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
