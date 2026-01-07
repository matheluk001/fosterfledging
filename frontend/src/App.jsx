import { Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";

import LandingPage from "./pages/LandingPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import OrganizationsInstance from "./pages/OrganizationsPage/OrganizationsInstance.jsx";
import OrganizationsModel from "./pages/OrganizationsPage/OrganizationsModel.jsx";
import HousingModel from "./pages/HousingPage/HousingModel.jsx";
import HousingInstance from "./pages/HousingPage/HousingInstance.jsx";
import CounselingModel from "./pages/CounselingPage/CounselingModel.jsx";
import CounselingInstance from "./pages/CounselingPage/CounselingInstance.jsx";
import SearchPage from "./pages/SearchPage.jsx";   // 🔹 NEW
import Visualizations from "./pages/VisualizationsPage/Visualizations.jsx";
import DevVisualizations from "./pages/DevVisualizations/DevVisualizations.jsx";

export default function App() {
  return (
    <>
      {/* BLACK / WHITE NAVBAR */}
      <Navbar
        bg="dark"
        variant="dark"
        expand="md"
        className="mb-4 shadow-sm"
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            style={{ fontWeight: "700", fontSize: "1.5rem" }}
          >
            FosterFledging
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/housing">Housing</Nav.Link>
              <Nav.Link as={Link} to="/counseling">Counseling</Nav.Link>
              <Nav.Link as={Link} to="/organizations">Organizations</Nav.Link>
              <Nav.Link as={Link} to="/visualizations">Visualizations</Nav.Link>
              <Nav.Link as={Link} to="/dev-visualizations">Developer Visualizations</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />   {/* 🔹 NEW */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/organizations" element={<OrganizationsModel />} />
          <Route path="/organizations/:id" element={<OrganizationsInstance />} />
          <Route path="/housing" element={<HousingModel />} />
          <Route path="/housing/:id" element={<HousingInstance />} />
          <Route path="/counseling" element={<CounselingModel />} />
          <Route path="/counseling/:id" element={<CounselingInstance />} />
          <Route path="/visualizations" element={<Visualizations />} />
          <Route path="/dev-visualizations" element={<DevVisualizations />} />
        </Routes>
      </Container>
    </>
  );
}
