import { useCallback, useEffect, useState } from "react";
import { MdArrowBack, MdArrowForward, MdArrowOutward } from "react-icons/md";
import "./styles/Work.css";
import WorkImage from "./WorkImage";

const projects = [
  {
    title: "POMS",
    role:
      "Implemented triage logic, JWT auth with role-based access, Redis/Bull queues and FCM push notifications in the NestJS backend; contributed to the React admin dashboard and Flutter app.",
    descriptions:
      "Post-Operative Monitoring System, capstone with Thanh Nhan Hospital's ERAS research team",
    techs: "NestJS, PostgreSQL, Redis, Docker, React, Flutter",
    image: "/images/POMS.jpg",
    link: "https://github.com/Su26-SEP490-G57/Su26_SEP490_G57_BE",
  },
  {
    title: "CompassEd",
    role:
      "Built the Spring Boot/MySQL backend (20+ REST APIs, JWT auth, placement tests, learning roadmaps) and integrated the OpenAI API and VNPay (sandbox).",
    descriptions: "AI-powered online learning platform",
    techs: "Java, Spring Boot, MySQL, Flask, JavaScript, OpenAI API, VNPay, Docker",
    image: "/images/CompassEd-Landing.png",
    link: "https://github.com/fonghtdev/CompassEd",
  },
  {
    title: "Loop",
    role:
      "Built the real-time chat backend and desktop client: Socket.IO messaging, role-based permissions with per-channel overrides, and LiveKit voice and video calls.",
    descriptions:
      "Real-time community chat app for Windows and macOS with text and voice channels, roles and video calls",
    techs: "TypeScript, Electron, React, Fastify, Socket.IO, Prisma, PostgreSQL, Redis, LiveKit",
    image: "/images/Loop.png",
    link: "https://github.com/fonghtdev/loop",
  },
  {
    title: "Movie Ticket Booking System",
    role:
      "Built the ticket-booking flow and showtime management with Spring MVC, Spring Data JPA and SQL Server.",
    descriptions: "Online platform for booking movie tickets and managing showtimes",
    techs: "Java Spring Boot MVC, Spring Data JPA/Hibernate, SQL Server",
    image: "/images/MovieLanding.png",
    link: "https://github.com/fonghtdev/MovieTicketManager",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex =
      currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    const slideInterval = window.setInterval(goToNext, 6000);

    return () => window.clearInterval(slideInterval);
  }, [goToNext]);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          Some Of My <span>Project</span>
        </h2>

        <div className="carousel-wrapper">
          {/* Navigation Arrows */}
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward />
          </button>

          {/* Slides */}
          <div className="carousel-track-container">
            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {projects.map((project, index) => (
                <div className="carousel-slide" key={index}>
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number">
                        <h3>0{index + 1}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">
                          {project.descriptions}
                        </p>
                        <p className="carousel-category">{project.role}</p>
                        <div className="carousel-tools">
                          <span className="tools-label">Technologies</span>
                          <p>{project.techs}</p>
                        </div>
                        <a
                          className="carousel-github"
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor="disable"
                        >
                          GitHub <MdArrowOutward />
                        </a>
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage
                        image={project.image}
                        alt={project.title}
                        link={project.link}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? "carousel-dot-active" : ""
                  }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}`}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
