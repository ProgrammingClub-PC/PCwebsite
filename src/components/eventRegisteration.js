import React, { useState, useRef } from "react";
import axios from "axios";
import "./Register.css"; 
import ReCAPTCHA from "react-google-recaptcha"; 


const branchCodes = {
  ME: "40", ECE: "31", EE: "21", "CSE(Hindi)": "169", "CSE (Hindi)": "169",
  AIML: "164", "CSE(DS)": "154", "CSE (DS)": "154", "CSE(AIML)": "153",
  "CSE (AIML)": "153", IT: "13", CS: "12", CSIT: "11", "CS IT": "11",
  CSE: "10", CE: "0",
};

function EventRegisteration() {
  const recaptchaRef = useRef(null); 
  
  const GOOGLE_SITE_KEY = "6LdiBPkrAAAAAE2m6IRWNs3Gu37Ps6y-MpfwOLRA"; 
  const BACKEND_URL = "https://api.programmingclub.live/api/register"; 

  const [formData, setFormData] = useState({
    fullName: "", emailId: "", phoneNumber: "", 
    hackerrankProfile: "",
    branch: "", year: "1", gender: "", hosteller: "",
    studentNumber: "", rollNumber: "",
    website: "", 
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState({});
  const [captchaValue, setCaptchaValue] = useState(null); 

  const validateForm = () => {
    let tempErrors = {};
    const { 
        fullName, emailId, phoneNumber, rollNumber, branch, year, hosteller, studentNumber,
        hackerrankProfile 
    } = formData;

    const urlRegex = /(http|https|www\.)/i;

    if (!fullName.trim() || !/^[a-zA-Z\s]+$/.test(fullName)) {
        tempErrors.fullName = "Name must contain only alphabets.";
    }

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        tempErrors.phoneNumber = "Enter valid 10-digit mobile number.";
    }

    if (!studentNumber.trim() || !/^25\d{5,6}$/.test(studentNumber)) {
        tempErrors.studentNumber = "Student No. must start with '25' (1st Year only) and be 7-8 digits.";
    }

    if (!emailId.endsWith("@akgec.ac.in")) {
        tempErrors.emailId = "Email must end with @akgec.ac.in";
    } else if (studentNumber && !emailId.replace("@akgec.ac.in", "").endsWith(studentNumber)) {
        tempErrors.emailId = "Email ID doesn't match your Student No.";
    }

    if (!rollNumber.trim() || !/^25\d{11}$/.test(rollNumber)) {
      tempErrors.rollNumber = "Roll No. must start with '25' (1st Year only) and be 13 digits.";
    } else if (branch && branchCodes[branch] && !rollNumber.substring(5, 9).includes(branchCodes[branch])) {
      tempErrors.rollNumber = `Roll No. doesn't match selected branch (${branch}).`;
    }

    if (!branch) tempErrors.branch = "Please select your Branch.";
    if (!year) tempErrors.year = "Please select your Year.";
    if (hosteller === "") tempErrors.hosteller = "Please select Residence status.";
    
    if (hackerrankProfile && urlRegex.test(hackerrankProfile)) {
        tempErrors.hackerrankProfile = "Enter Username only, not the full link.";
    }

    if (!captchaValue) {
      tempErrors.captcha = "Please verify you are not a robot.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === "hosteller") processedValue = value === "yes" ? true : value === "no" ? false : "";
    
    setFormData((prevState) => ({ ...prevState, [name]: processedValue }));
    
    if (errors[name]) {
        setErrors((prev) => { const newErr = {...prev}; delete newErr[name]; return newErr; });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); 
    setIsError(false);

    if (formData.website !== "") {
        setMessage("Registration successful!"); 
        setIsError(false);
        return; 
    }

    const isValid = validateForm();
    if (!isValid) {
      setMessage("Please fix the errors highlighted in red.");
      setIsError(true);
      return; 
    }

    setLoading(true);
    const payload = { ...formData, captchaToken: captchaValue };

    try {
      const response = await axios.post(BACKEND_URL, payload);
      setLoading(false);
      setMessage("Registration successful!");
      setIsError(false);
      
      setFormData({
        fullName: "", emailId: "", phoneNumber: "", 
        hackerrankProfile: "",
        branch: "", year: "1", gender: "", hosteller: "",
        studentNumber: "", rollNumber: "", website: "",
      });
      
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaValue(null);

    } catch (error) {
      setLoading(false);
      setIsError(true);
      
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaValue(null);

      const errorMsg = error.response?.data?.message || "Server Error.";
      
      if (errorMsg.includes("duplicate") || errorMsg.includes("already exists")) {
          setMessage("User already registered with this Email/Roll No!");
      } else if (errorMsg.includes("captcha") || errorMsg.includes("reCAPTCHA")) {
          setMessage("Captcha verification failed. Please try again.");
      } else {
          setMessage(errorMsg);
      }
    }
  };

  return (
    <div className="formContainer">
      <form onSubmit={handleSubmit} className="form">
        
        <h2><span className="highlight">#include</span> 5.0 Registration</h2>
        <p className="description">Open for 1st Year Students Only</p>

        <input 
            type="text" name="website" value={formData.website} 
            onChange={handleChange} style={{ display: "none" }} 
            tabIndex="-1" autoComplete="off" maxLength={50}
        />

        <div className="formGrid">
          
          <div className="formGroup">
            <label className="label">Full Name <span>*</span></label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={`input ${errors.fullName ? "input-error" : ""}`} placeholder="Full Name" maxLength={50} />
            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
          </div>
          {/* cecnje */}

          <div className="formGroup">
            <label className="label">Student No <span>*</span></label>
            <input type="text" name="studentNumber" value={formData.studentNumber} onChange={handleChange} className={`input ${errors.studentNumber ? "input-error" : ""}`} placeholder="Enter your student no" maxLength={8} />
            {errors.studentNumber && <span className="error-msg">{errors.studentNumber}</span>}
          </div>

          <div className="formGroup">
            <label className="label">Email <span>*</span></label>
            <input type="email" name="emailId" value={formData.emailId} onChange={handleChange} className={`input ${errors.emailId ? "input-error" : ""}`} placeholder="NameStudentno@akgec.ac.in" maxLength={50} />
            {errors.emailId && <span className="error-msg">{errors.emailId}</span>}
          </div>

          <div className="formGroup">
            <label className="label">Roll No <span>*</span></label>
            <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} className={`input ${errors.rollNumber ? "input-error" : ""}`} placeholder="Enter your roll no" maxLength={13} />
            {errors.rollNumber && <span className="error-msg">{errors.rollNumber}</span>}
          </div>

          <div className="formGroup">
            <label className="label">Phone <span>*</span></label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`input ${errors.phoneNumber ? "input-error" : ""}`} placeholder="10-digit number" maxLength={10} />
            {errors.phoneNumber && <span className="error-msg">{errors.phoneNumber}</span>}
          </div>

          <div className="formGroup">
            <label className="label">Branch <span>*</span></label>
            <select name="branch" value={formData.branch} onChange={handleChange} className={`select ${errors.branch ? "input-error" : ""}`}>
              <option value="">Select Branch</option>
              <option value="CSE">CSE</option>
              <option value="CS IT">CS & IT</option>
              <option value="CS">CS</option>
              <option value="IT">IT</option>
              <option value="CSE(AIML)">CSE (AIML)</option>
              <option value="AIML">AIML</option>
              <option value="CSE(DS)">CSE (DS)</option>
              <option value="CSE(Hindi)">CSE (Hindi)</option>
              <option value="ECE">ECE</option>
              <option value="EE">EE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
            {errors.branch && <span className="error-msg">{errors.branch}</span>}
          </div>
          
           <div className="formGroup">
            <label className="label">Year <span>*</span></label>
            <select name="year" value={formData.year} onChange={handleChange} className={`select ${errors.year ? "input-error" : ""}`}>
              <option value="1">1st Year</option>
            </select>
            {errors.year && <span className="error-msg">{errors.year}</span>}
          </div>

           <div className="formGroup">
            <label className="label">Gender <span>*</span></label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="select">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

           <div className="formGroup">
            <label className="label">Hosteller <span>*</span></label>
            <select name="hosteller" value={formData.hosteller === true ? "yes" : formData.hosteller === false ? "no" : ""} onChange={handleChange} className={`select ${errors.hosteller ? "input-error" : ""}`}>
              <option value="">Select Status</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
             {errors.hosteller && <span className="error-msg">{errors.hosteller}</span>}
          </div>

          <div className="formGroup">
            <label className="label">HackerRank ID</label>
            <input type="text" name="hackerrankProfile" value={formData.hackerrankProfile} onChange={handleChange} className={`input ${errors.hackerrankProfile ? "input-error" : ""}`} placeholder="Username (Optional)" maxLength={50} />
            {errors.hackerrankProfile && <span className="error-msg">{errors.hackerrankProfile}</span>}
          </div>

        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", marginTop: "10px" }}>
            <div style={{ textAlign: "center" }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={GOOGLE_SITE_KEY}
                onChange={(value) => {
                    setCaptchaValue(value);
                    if(errors.captcha) {
                        setErrors(prev => { const newErr = {...prev}; delete newErr.captcha; return newErr; });
                    }
                }}
                theme="dark"
              />
              {errors.captcha && (
                <span className="error-msg" style={{ display: "block", textAlign: "center", marginTop: "10px" }}>
                  {errors.captcha}
                </span>
              )}
            </div>
        </div>

        <button type="submit" disabled={loading} className="button">
          {loading ? "Processing..." : "Register Now"}
        </button>

        {message && <p className={`message ${isError ? "error" : "success"}`}>{message}</p>}

      </form>
    </div>
  );
}

export default EventRegisteration;