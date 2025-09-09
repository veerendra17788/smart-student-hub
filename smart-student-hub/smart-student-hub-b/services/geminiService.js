const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    // Initialize Gemini API - API key should be in environment variables
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "your-gemini-api-key-here");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateCourseRecommendations(studentData) {
    try {
      const prompt = this.buildCourseRecommendationPrompt(studentData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown formatting from Gemini response
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // Parse the JSON response from Gemini
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini API rate limit reached, using fallback data:', error.status || error.message);
      return this.getFallbackCourseRecommendations(studentData);
    }
  }

  async generateSkillRecommendations(studentData) {
    try {
      const prompt = this.buildSkillRecommendationPrompt(studentData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown formatting from Gemini response
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini API rate limit reached, using fallback data:", error.status || error.message);
      return this.getFallbackSkillRecommendations(studentData);
    }
  }

  async generateCareerGuidance(studentData) {
    try {
      const prompt = this.buildCareerGuidancePrompt(studentData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown formatting from Gemini response
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini API rate limit reached, using fallback data:", error.status || error.message);
      return this.getFallbackCareerGuidance(studentData);
    }
  }

  buildCourseRecommendationPrompt(studentData) {
    return `
You are an AI academic advisor. Analyze the following student data and recommend 6-8 relevant courses.

Student Profile:
- Name: ${studentData.name}
- Department: ${studentData.department}
- Year: ${studentData.year}
- CGPA: ${studentData.cgpa}
- Attendance: ${studentData.overallAttendancePercentage}%
- Current Skills: ${studentData.skills?.join(', ') || 'None listed'}
- Activities: ${studentData.activities?.map(a => `${a.type}: ${a.title}`).join(', ') || 'None'}

Performance Analysis:
- Academic Performance: ${studentData.cgpa >= 8.5 ? 'Excellent' : studentData.cgpa >= 7.0 ? 'Good' : 'Needs Improvement'}
- Attendance Status: ${studentData.overallAttendancePercentage >= 85 ? 'Excellent' : studentData.overallAttendancePercentage >= 75 ? 'Good' : 'Poor'}

Based on this data, recommend courses that will:
1. Align with their department and academic level
2. Address any skill gaps for their field
3. Match their current performance level (beginner/intermediate/advanced)
4. Enhance their career prospects

Return ONLY a JSON object with this exact structure:
{
  "courses": [
    {
      "title": "Course Title",
      "platform": "Platform Name (Coursera, Udemy, edX, etc.)",
      "provider": "Institution/Instructor",
      "duration": "X weeks",
      "level": "Beginner/Intermediate/Advanced",
      "relevance": "Why this course is recommended for this student",
      "skills": ["skill1", "skill2", "skill3"]
    }
  ],
  "reasoning": "Brief explanation of the recommendation strategy"
}

Focus on practical, industry-relevant courses from reputable platforms like Coursera, Udemy, edX, Pluralsight, LinkedIn Learning, etc.
`;
  }

  buildSkillRecommendationPrompt(studentData) {
    return `
You are an AI career counselor. Analyze this student's profile and recommend skills they should develop.

Student Profile:
- Department: ${studentData.department}
- Year: ${studentData.year}
- CGPA: ${studentData.cgpa}
- Current Skills: ${studentData.skills?.join(', ') || 'None listed'}
- Activities: ${studentData.activities?.map(a => a.type).join(', ') || 'None'}

Recommend 8-12 skills that would benefit this student's career growth.

Return ONLY a JSON object:
{
  "recommendedSkills": [
    {
      "skill": "Skill Name",
      "priority": "High/Medium/Low",
      "category": "Technical/Soft/Domain-specific",
      "reason": "Why this skill is important for this student"
    }
  ],
  "skillGaps": ["skill1", "skill2"],
  "careerFocus": "Brief career direction advice"
}
`;
  }

  buildCareerGuidancePrompt(studentData) {
    return `
You are an AI career advisor. Provide personalized career guidance for this student.

Student Profile:
- Department: ${studentData.department}
- Year: ${studentData.year}
- CGPA: ${studentData.cgpa}
- Attendance: ${studentData.overallAttendancePercentage}%
- Activities: ${studentData.activities?.length || 0} activities

Provide career guidance based on their performance and field.

Return ONLY a JSON object:
{
  "careerPath": "Recommended career direction",
  "immediateSteps": ["step1", "step2", "step3"],
  "longTermGoals": ["goal1", "goal2"],
  "industryTrends": "Current trends in their field",
  "competitiveAdvantage": "How they can stand out"
}
`;
  }

  getFallbackCourseRecommendations(studentData) {
    const departmentCourses = {
      "Computer Science and Engineering": [
        {
          title: "Full Stack Web Development",
          platform: "Coursera",
          provider: "University of Hong Kong",
          duration: "16 weeks",
          level: "Intermediate",
          relevance: "Essential for modern software development careers",
          skills: ["React", "Node.js", "MongoDB", "Express"]
        },
        {
          title: "Machine Learning Specialization",
          platform: "Coursera",
          provider: "Stanford University",
          duration: "12 weeks",
          level: "Advanced",
          relevance: "High-demand field with excellent career prospects",
          skills: ["Python", "TensorFlow", "Neural Networks", "Data Science"]
        },
        {
          title: "AWS Cloud Practitioner",
          platform: "AWS Training",
          provider: "Amazon Web Services",
          duration: "8 weeks",
          level: "Beginner",
          relevance: "Cloud skills are essential in modern tech industry",
          skills: ["AWS", "Cloud Computing", "DevOps"]
        }
      ],
      "Information Technology": [
        {
          title: "Cybersecurity Fundamentals",
          platform: "Coursera",
          provider: "IBM",
          duration: "10 weeks",
          level: "Intermediate",
          relevance: "Growing field with high job security",
          skills: ["Network Security", "Ethical Hacking", "Risk Management"]
        },
        {
          title: "Data Analytics with Python",
          platform: "edX",
          provider: "MIT",
          duration: "12 weeks",
          level: "Intermediate",
          relevance: "Data-driven decision making is crucial in IT",
          skills: ["Python", "Pandas", "Data Visualization", "SQL"]
        }
      ]
    };

    const courses = departmentCourses[studentData.department] || departmentCourses["Computer Science and Engineering"];
    
    return {
      courses: courses.slice(0, 6),
      reasoning: "Fallback recommendations based on department and industry trends"
    };
  }

  getFallbackSkillRecommendations(studentData) {
    return {
      recommendedSkills: [
        { skill: "Problem Solving", priority: "High", category: "Soft", reason: "Essential for any technical role" },
        { skill: "Communication", priority: "High", category: "Soft", reason: "Critical for career advancement" },
        { skill: "Project Management", priority: "Medium", category: "Soft", reason: "Valuable for leadership roles" }
      ],
      skillGaps: ["Technical Skills", "Industry Knowledge"],
      careerFocus: "Focus on building both technical and soft skills"
    };
  }

  getFallbackCareerGuidance(studentData) {
    return {
      careerPath: "Technology Professional",
      immediateSteps: ["Build portfolio", "Gain practical experience", "Network with professionals"],
      longTermGoals: ["Specialize in chosen field", "Pursue advanced certifications"],
      industryTrends: "AI/ML, Cloud Computing, and Cybersecurity are growing rapidly",
      competitiveAdvantage: "Combine technical skills with strong communication abilities"
    };
  }
}

module.exports = new GeminiService();
