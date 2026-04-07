import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Particle from "../Particle";
import { fetchEditorialBySlug, getPlatformLabel } from "../../api/editorials";
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

function EditorialDetail() {
  const { slug } = useParams();
  const [editorial, setEditorial] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEditorial() {
      try {
        setStatus("loading");
        const data = await fetchEditorialBySlug(slug);

        if (!isMounted) {
          return;
        }

        setEditorial(data);
        setStatus("success");
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError("We couldn't find that editorial.");
        setStatus("error");
      }
    }

    loadEditorial();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <section className="editorials-page">
      <Container fluid className="editorials-hero">
        <div className="editorials-particle-layer">
          <Particle />
        </div>
        <Container className="editorials-shell editorial-detail-shell">
          <Link className="editorials-back-link" to="/editorials">
            ← Back to all editorials
          </Link>

          {status === "loading" && (
            <div className="editorials-feedback-card">
              Loading editorial...
            </div>
          )}

          {status === "error" && (
            <div className="editorials-feedback-card error">{error}</div>
          )}

          {status === "success" && editorial && (
            <>
              <div className="editorial-detail-header">
                <div className="editorial-detail-meta">
                  <span>{getPlatformLabel(editorial.platform)}</span>
                  <span>
                    Contest Date:{" "}
                    {formatDate(editorial.contest_date || editorial.created_at)}
                  </span>
                  <span>
                    {(editorial.questions || []).length} question
                    {(editorial.questions || []).length === 1 ? "" : "s"}
                  </span>
                </div>
                <h1>{editorial.contest_name}</h1>
                <p>
                  Full contest editorial with every published question from the
                  backend.
                </p>
                <a
                  className="editorial-contest-link"
                  href={editorial.contest_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open contest link
                </a>
              </div>

              <div className="editorial-question-list">
                {(editorial.questions || []).map((question, index) => (
                  <details
                    className="editorial-question-card editorial-question-dropdown"
                    key={question.id || `${question.question_name}-${index}`}
                  >
                    <summary className="editorial-question-summary">
                      <div className="editorial-question-summary-text">
                        <div className="editorial-question-index">
                          Question {index + 1}
                        </div>
                        <h2>{question.question_name}</h2>
                      </div>
                      <span className="editorial-dropdown-icon">+</span>
                    </summary>

                    <div className="editorial-question-body">
                      <a
                        href={question.question_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit problem
                      </a>

                      <div className="editorial-content-block">
                        <h3>Explanation</h3>
                        <pre>
                          {question.explanation || "No explanation added yet."}
                        </pre>
                      </div>

                      <div className="editorial-content-block">
                        <h3>Code</h3>
                        <pre>{question.code || "No code added yet."}</pre>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </>
          )}
        </Container>
      </Container>
    </section>
  );
}

export default EditorialDetail;
