import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>

        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>

          {/* <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Engineering</h4>
                <h5>FPT University</h5>
              </div>
              <h3>2022 – Present</h3>
            </div>

            <p>
              Developing strong foundations in software engineering, full stack
              development, database systems, software testing, and scalable web
              application architecture through academic and practical projects.
            </p>
          </div> */}

          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Full Stack Developer</h4>
                <h5>Smart Lab · FPT University</h5>
              </div>
              <h3>2023 – Apr 2025</h3>
            </div>

            <p>
              Collaborated with developers to build and maintain modern web
              applications, focusing on frontend responsiveness, backend
              development, RESTful APIs, testing, and scalable software
              solutions in real-world team environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
