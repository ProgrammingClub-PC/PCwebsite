import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
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

const CODE_KEYWORDS = new Set([
  "auto",
  "bool",
  "break",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "default",
  "delete",
  "do",
  "double",
  "else",
  "enum",
  "extern",
  "false",
  "float",
  "for",
  "friend",
  "if",
  "inline",
  "int",
  "long",
  "namespace",
  "new",
  "null",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "signed",
  "sizeof",
  "static",
  "struct",
  "switch",
  "template",
  "this",
  "throw",
  "true",
  "try",
  "typedef",
  "typename",
  "union",
  "unsigned",
  "using",
  "virtual",
  "void",
  "while",
]);

function tokenizeCode(source) {
  if (!source) {
    return [];
  }

  const tokens = [];
  const tokenMatcher =
    /\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|#\w+|\b\d+(?:\.\d+)?\b|[(){}\[\]]|\b[A-Za-z_]\w*\b/g;
  let lastIndex = 0;
  let match = tokenMatcher.exec(source);

  while (match) {
    const [value] = match;
    const start = match.index;

    if (start > lastIndex) {
      tokens.push({
        type: "plain",
        value: source.slice(lastIndex, start),
      });
    }

    let type = "plain";

    if (value.startsWith("//") || value.startsWith("/*")) {
      type = "comment";
    } else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith("`") && value.endsWith("`"))
    ) {
      type = "string";
    } else if (value.startsWith("#")) {
      type = "preprocessor";
    } else if (/^\d/.test(value)) {
      type = "number";
    } else if (/^[(){}\[\]]$/.test(value)) {
      type = "bracket";
    } else if (CODE_KEYWORDS.has(value)) {
      type = "keyword";
    } else if (/^[A-Za-z_]\w*$/.test(value)) {
      type = "identifier";
    }

    tokens.push({ type, value });
    lastIndex = start + value.length;
    match = tokenMatcher.exec(source);
  }

  if (lastIndex < source.length) {
    tokens.push({
      type: "plain",
      value: source.slice(lastIndex),
    });
  }

  return tokens;
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
                        {question.code ? (
                          <pre className="editorial-code-block">
                            <code>
                              {tokenizeCode(question.code).map((token, tokenIndex) => (
                                <span
                                  key={`${question.id || index}-${tokenIndex}`}
                                  className={`token token-${token.type}`}
                                >
                                  {token.value}
                                </span>
                              ))}
                            </code>
                          </pre>
                        ) : (
                          <pre>No code added yet.</pre>
                        )}
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
