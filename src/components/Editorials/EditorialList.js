import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import Particle from "../Particle";
import { fetchAllEditorials, getPlatformLabel } from "../../api/editorials";
import "./Editorials.css";

function formatDate(value) {
  if (!value) {
    return "Recently added";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch (error) {
    return "Recently added";
  }
}

function getContestDateLabel(editorial) {
  if (editorial?.contest_date) {
    return formatDate(editorial.contest_date);
  }

  return formatDate(editorial?.created_at);
}

function EditorialList() {
  const [editorials, setEditorials] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEditorials() {
      try {
        setStatus("loading");
        const data = await fetchAllEditorials();

        if (!isMounted) {
          return;
        }

        setEditorials(data);
        setStatus("success");
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError("We couldn't load the editorials right now.");
        setStatus("error");
      }
    }

    loadEditorials();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="editorials-page">
      <Container fluid className="editorials-hero">
        <div className="editorials-particle-layer">
          <Particle />
        </div>
        <Container className="editorials-shell">
          <div className="editorials-intro">
            <span className="editorials-kicker">Contest Editorials</span>
            <h1>Read every contest breakdown in one place.</h1>
            <p>
              Browse the latest contest editorials, then open any contest to
              see the full write-up and all included questions.
            </p>
          </div>

          {status === "loading" && (
            <div className="editorials-feedback-card">
              Loading editorials...
            </div>
          )}

          {status === "error" && (
            <div className="editorials-feedback-card error">{error}</div>
          )}

          {status === "success" && editorials.length === 0 && (
            <div className="editorials-feedback-card">
              No editorials have been published yet.
            </div>
          )}

          {status === "success" && editorials.length > 0 && (
            <div className="editorial-grid">
              {editorials.map((editorial) => (
                <Link
                  key={editorial.id || editorial.slug}
                  className="editorial-card"
                  to={`/editorials/${editorial.slug}`}
                >
                  <div className="editorial-card-topline">
                    <span className="editorial-platform">
                      {getPlatformLabel(editorial.platform)}
                    </span>
                    <span className="editorial-date">
                      {getContestDateLabel(editorial)}
                    </span>
                  </div>

                  <h2>{editorial.contest_name}</h2>

                  <p>
                    {editorial.questions?.length || 0} question
                    {(editorial.questions?.length || 0) === 1 ? "" : "s"} in
                    this editorial.
                  </p>

                  <div className="editorial-card-footer">
                    <span>Open editorial</span>
                    <span className="editorial-arrow">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Container>
    </section>
  );
}

export default EditorialList;
