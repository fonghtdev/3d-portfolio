import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              Ho The
              <br />
              <span>Phong</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>FullStack Developer &</h3>
            <h2 className="landing-info-h2">
              <span className="landing-h2-1">Backend</span>
              <span className="landing-h2-2">System</span>
            </h2>
            <h2>
              <span className="landing-h2-info">System</span>
              <span className="landing-h2-info-1">Backend</span>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
