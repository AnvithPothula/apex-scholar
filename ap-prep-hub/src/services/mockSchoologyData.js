/**
 * Mock Schoology Data for Demo Purposes
 * This provides realistic sample data for demonstration
 */

export const mockSchoologyData = {
  // Sample courses
  courses: [
    {
      id: "12345",
      course_title: "AP Biology",
      section_code: "APBIO-1A",
      course_code: "BIO101"
    },
    {
      id: "12346", 
      course_title: "AP Calculus AB",
      section_code: "APCALC-2B",
      course_code: "MATH101"
    },
    {
      id: "12347",
      course_title: "AP English Literature",
      section_code: "APENG-3C", 
      course_code: "ENG101"
    },
    {
      id: "12348",
      course_title: "AP US History",
      section_code: "APUSH-1D",
      course_code: "HIST101"
    },
    {
      id: "12349",
      course_title: "AP Chemistry",
      section_code: "APCHEM-2A",
      course_code: "CHEM101"
    }
  ],

  // Sample assignments
  assignments: {
    "12345": [ // AP Biology
      {
        id: "assign_1001",
        title: "Cell Structure and Function Lab Report",
        description: "Complete the lab report analyzing plant and animal cell structures observed under microscope. Include detailed diagrams and comparative analysis.",
        due: Math.floor((Date.now() + 3 * 24 * 60 * 60 * 1000) / 1000), // 3 days from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 100,
        type: "assignment"
      },
      {
        id: "assign_1002", 
        title: "Chapter 8-10 Reading Quiz",
        description: "Quiz covering chapters 8-10 on cellular respiration and photosynthesis",
        due: Math.floor((Date.now() + 1 * 24 * 60 * 60 * 1000) / 1000), // 1 day from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 50,
        type: "test"
      },
      {
        id: "assign_1003",
        title: "Photosynthesis vs Cellular Respiration Essay",
        description: "Write a 3-page essay comparing and contrasting photosynthesis and cellular respiration processes",
        due: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000), // 1 week from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 150,
        type: "assignment"
      }
    ],
    "12346": [ // AP Calculus AB
      {
        id: "assign_2001",
        title: "Derivatives Practice Set #5",
        description: "Complete problems 1-25 from section 3.4 in textbook. Show all work for credit.",
        due: Math.floor((Date.now() + 2 * 24 * 60 * 60 * 1000) / 1000), // 2 days from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 75,
        type: "homework"
      },
      {
        id: "assign_2002",
        title: "Unit 3 Test: Derivatives",
        description: "Comprehensive test covering all derivative rules and applications",
        due: Math.floor((Date.now() + 5 * 24 * 60 * 60 * 1000) / 1000), // 5 days from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 200,
        type: "test"
      }
    ],
    "12347": [ // AP English Literature
      {
        id: "assign_3001",
        title: "Hamlet Act 1-2 Analysis",
        description: "Read Hamlet Acts 1-2 and write a 2-page character analysis of Hamlet's soliloquies",
        due: Math.floor((Date.now() + 4 * 24 * 60 * 60 * 1000) / 1000), // 4 days from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 100,
        type: "essay"
      },
      {
        id: "assign_3002",
        title: "Poetry Analysis Project",
        description: "Choose 3 poems from our unit and create a multimedia presentation analyzing themes, literary devices, and historical context",
        due: Math.floor((Date.now() + 10 * 24 * 60 * 60 * 1000) / 1000), // 10 days from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 150,
        type: "project"
      }
    ],
    "12348": [ // AP US History
      {
        id: "assign_4001",
        title: "Document Based Question (DBQ) Practice",
        description: "Complete DBQ analyzing causes of the American Revolution using provided primary sources",
        due: Math.floor((Date.now() + 3 * 24 * 60 * 60 * 1000) / 1000), // 3 days from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 100,
        type: "essay"
      },
      {
        id: "assign_4002",
        title: "Chapter 6 Reading Assignment",
        description: "Read chapter 6 (pages 142-168) and complete guided reading questions",
        due: Math.floor((Date.now() + 2 * 24 * 60 * 60 * 1000) / 1000), // 2 days from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 50,
        type: "reading"
      }
    ],
    "12349": [ // AP Chemistry
      {
        id: "assign_5001",
        title: "Stoichiometry Lab Experiment",
        description: "Complete stoichiometry lab determining the empirical formula of a hydrate compound",
        due: Math.floor((Date.now() + 6 * 24 * 60 * 60 * 1000) / 1000), // 6 days from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 120,
        type: "lab"
      },
      {
        id: "assign_5002",
        title: "Unit 4 Problem Set",
        description: "Complete problems 1-30 from unit 4 worksheet on chemical bonding and molecular geometry",
        due: Math.floor((Date.now() + 1 * 24 * 60 * 60 * 1000) / 1000), // 1 day from now
        created: Math.floor(Date.now() / 1000),
        last_updated: Math.floor(Date.now() / 1000),
        max_points: 80,
        type: "homework"
      }
    ]
  },

  // Generate mock user data
  generateMockUserData() {
    return {
      sections: this.courses.map(course => ({
        ...course,
        assignments: this.assignments[course.id] || []
      }))
    };
  },

  // Get all assignments across all courses
  getAllAssignments() {
    const allAssignments = [];
    
    this.courses.forEach(course => {
      const courseAssignments = this.assignments[course.id] || [];
      courseAssignments.forEach(assignment => {
        allAssignments.push({
          ...assignment,
          courseName: course.course_title,
          courseCode: course.section_code,
          courseId: course.id
        });
      });
    });

    return allAssignments;
  },

  // Get assignments for a specific course
  getCourseAssignments(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return [];

    const assignments = this.assignments[courseId] || [];
    return assignments.map(assignment => ({
      ...assignment,
      courseName: course.course_title,
      courseCode: course.section_code,
      courseId: course.id
    }));
  }
};

export default mockSchoologyData;
