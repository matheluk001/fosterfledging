// src/pages/AboutPage.jsx
import { useState, useEffect } from "react";

const GITLAB_PROJECT_ID = 74752183;


const MEMBER_CONFIG = {
  lukas: {
    name: "Lukas Mathesius",
    image: "/about_page/images/lukas-m.jpg",
    role: "Phase 1 Leader",
    bio: "Junior CS and Math student at UT Austin interested in ML, OS, and consulting.",
    responsibilities: "AWS",
    // GitLab-related
    authorName: "Lukas Mathesius",
    username: "matheluk",
  },
  ameera: {
    name: "Ameera Habib",
    image: "/about_page/images/ameera-h.PNG",
    role: "Fullstack Developer",
    bio: "Junior CS major with a business minor at UT Austin interested in SWE & PM.",
    responsibilities: "Model pages",
    authorName: "Ameera Habib",
    username: "amh8992",
  },
  angel: {
    name: "Angel Ogungbemi",
    image: "/about_page/images/angel-o.jpg",
    role: "Full Stack Developer",
    bio: "Junior CS student at UT Austin interested in full-stack development and cybersecurity.",
    responsibilities: "Frontend team",
    authorName: "Angel O Ogungbemi",
    username: "angel-ogungbemi",
  },
  gora: {
    name: "Gora Bepary",
    image: "/about_page/images/20250927_221345_2.jpg",
    role: "Fullstack Developer",
    bio: "Junior CS student at UT Austin passionate about graphics and ML.",
    responsibilities: "Data scrape, backend team",
    authorName: "Gora Bepary",
    username: "gorabep",
  },
  danyal: {
    name: "Danyal Saeed",
    image: "/about_page/images/HeadshotFall24low.jpeg",
    role: "Fullstack Developer",
    bio: "Junior CS student at UT Austin passionate about ML and app development.",
    responsibilities: "Backend team",
    authorName: "Danyal Saeed",
    username: "das-codez",
  },
};



async function fetchCommitsForAuthor(authorName) {
  let totalCommits = [];
  for (let page = 1; page <= 10; page++) {
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${GITLAB_PROJECT_ID}/repository/commits?per_page=100&page=${page}`
    );
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) break;
    totalCommits = totalCommits.concat(data);
  }

  let count = 0;
  for (const commit of totalCommits) {
    if (commit.author_name === authorName) {
      count++;
    }
  }
  return count;
}

async function fetchClosedIssuesForUser(username) {
  let totalIssues = [];
  for (let page = 1; page <= 10; page++) {
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${GITLAB_PROJECT_ID}/issues?state=closed&per_page=100&page=${page}`
    );
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) break;
    totalIssues = totalIssues.concat(data);
  }

  let count = 0;
  for (const issue of totalIssues) {
    // closed_by can be null, so guard it
    if (
      issue.closed_by &&
      issue.closed_by.username &&
      issue.closed_by.username === username
    ) {
      count++;
    }
  }
  return count;
}

const AboutPage = () => {
  const [gitLabStats, setGitLabStats] = useState(() => {
    // initialize all stats to 0
    const initial = {};
    for (const key of Object.keys(MEMBER_CONFIG)) {
      initial[key] = { commits: 0, issues: 0 };
    }
    return initial;
  });


  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);


  useEffect(() => {
    const loadStats = async () => {
      const newStats = {};

      for (const [key, member] of Object.entries(MEMBER_CONFIG)) {
        try {
          const commits = await fetchCommitsForAuthor(member.authorName);
          const issues = await fetchClosedIssuesForUser(member.username);
          newStats[key] = { commits, issues };
        } catch (err) {
          console.error("Error fetching stats for", member.name, err);
          newStats[key] = { commits: "N/A", issues: "N/A" };
        }
      }

      setGitLabStats((prev) => ({ ...prev, ...newStats }));
    };

    loadStats();
  }, []);

  const teamMembers = Object.entries(MEMBER_CONFIG).map(([key, cfg]) => ({
    ...cfg,
    stats: gitLabStats[key] || { commits: 1, issues: 0 },
  }));

  return (
    <div>

      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: white; }

        .about-header { padding: 80px 0 60px; background: #f9f9f9; margin-left: -12px; margin-right: -12px; }
        .about-header h1 { font-size: 3rem; font-weight: 700; color: #333; animation: fadeInUp 0.8s ease; }

        .section-container { padding: 60px 0; margin-left: -12px; margin-right: -12px; }
        .section-container:nth-child(even) { background: #f9f9f9; }
        .section-title { font-size: 2.2rem; font-weight: 700; color: #333; margin-bottom: 1.5rem; }
        
        .member-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 2rem; transition: all 0.3s ease; height: 100%; }
        .member-card:hover { transform: translateY(-5px); border-color: #333; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .member-card img { border-radius: 50%; object-fit: cover; width: 150px; height: 150px; margin-bottom: 1rem; border: 3px solid #f9f9f9; }
        .member-card h3 { font-size: 1.5rem; font-weight: 700; color: #333; margin-bottom: 1rem; }
        .member-card ul { list-style: none; padding: 0; text-align: left; }
        .member-card li { padding: 0.3rem 0; color: #666; }
        .member-card li strong { color: #333; }

        .info-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 2rem; }
        .info-card h2 { font-size: 2rem; font-weight: 700; color: #333; margin-bottom: 1.5rem; }
        .info-card p, .info-card ul { color: #666; font-size: 1.1rem; }
        .info-card ul { padding-left: 1.5rem; }
        .info-card a { color: #333; font-weight: 600; text-decoration: none; transition: color 0.3s ease; }
        .info-card a:hover { color: #666; }

        .custom-footer { background: #333; color: white; padding: 2rem 0; margin-left: -12px; margin-right: -12px; }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .about-header h1 { font-size: 2.2rem; }
          .section-title { font-size: 1.8rem; }
        }
      `}</style>


      <section className="about-header">
        <div className="container text-center">
          <h1>About FosterFledging</h1>
        </div>
      </section>


      <section className="section-container">
        <div className="container">
          <div className="info-card">
            <h2 className="section-title">Description</h2>
            <p>
              FosterFledging empowers young adults (18–24) aging out of foster care by 
              aggregating affordable housing, low/no-cost counseling, and trusted 
              organizations that serve them. The site helps users find resources 
              that fit their eligibility and needs, while also allowing community 
              members to engage by contributing time, talent, or money.
            </p>
          </div>
        </div>
      </section>


      <section className="section-container">
        <div className="container">
          <div className="info-card">
            <h2 className="section-title">Explanation of Disparate Data Integration</h2>
            <p>
              Disparate data is data that comes from various sources. In our experience, 
              combining a broad source of data, such as the Places API (Google Maps), 
              with something narrower like the NonProfit Explorer API (ProPublica), 
              leads to both scope and specificity in the results. This is something 
              that neither could do alone.
            </p>
          </div>
        </div>
      </section>


      <section className="section-container">
        <div className="container">
          <h2 className="section-title text-center mb-5">Meet the Group Members</h2>
          <div className="row g-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="member-card text-center">
                  <img src={member.image} alt={member.name} />
                  <h3>{member.name}</h3>
                  <ul>
                    <li><strong>Role:</strong> {member.role}</li>
                    <li><strong>Bio:</strong> {member.bio}</li>
                    <li><strong>Responsibilities:</strong> {member.responsibilities}</li>
                    <li><strong># of Commits:</strong> {member.stats.commits}</li>
                    <li><strong># of Issues:</strong> {member.stats.issues}</li>
                    <li><strong># of Unit Tests:</strong> 5</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="section-container">
        <div className="container">
          <div className="info-card">
            <h2 className="section-title">Data Sources</h2>
            <ul>
              <li>
                <a target="_blank" rel="noopener noreferrer" href="https://projects.propublica.org/nonprofits/api">
                  ProPublica NonProfit Explorer API
                </a>
              </li>
              <li>
                <a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps">
                  Google Maps Places API
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>


      <section className="section-container">
        <div className="container">
          <div className="info-card">
            <h2 className="section-title">Tools Used</h2>
            <ul>
              <li><strong>React & React Router:</strong> Frontend framework and routing</li>
              <li><strong>Bootstrap 5:</strong> Responsive design and components</li>
              <li><strong>HTML/CSS:</strong> Web pages and styling</li>
              <li><strong>GitLab:</strong> Version control and collaboration</li>
              <li><strong>Postman:</strong> API endpoint testing and documentation</li>
            </ul>
          </div>
        </div>
      </section>


      <section className="section-container">
        <div className="container">
          <div className="info-card">
            <h2 className="section-title">Other Links</h2>
            <ul>
              <li>
                <a target="_blank" rel="noopener noreferrer" href="https://gitlab.com/matheluk/cs373-fall-2025-55090_06">
                  GitLab Repository
                </a>
              </li>
              <li>
                <a target="_blank" rel="noopener noreferrer" href="https://documenter.getpostman.com/view/48800265/2sB3QDwD34">
                  Postman API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>


      <footer className="custom-footer">
        <div className="container">
          <div className="row text-center">
            <div className="col-12">
              <p className="mb-2">&copy; 2025 FosterFledging. Built by Team 55090_06</p>
              <p className="mb-0 text-white">
                Lukas Mathesius • Ameera Habib • Angel Ogungbemi • Danyal Saeed •
                Gora Bepary
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
