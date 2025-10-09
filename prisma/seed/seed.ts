import { hashSync } from "bcrypt";
import { prismaClient } from "../../src/utils/prismaClient";
import { seedSimpleCourse } from "./simple-course";

async function seedAdminUser() {
  const adminEmail = "admin@gmail.com";
  const adminName = "Admin User";
  const adminPassword = "password";

  const existingAdmin = await prismaClient.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin user already exists, skipping creation.");
    return;
  }

  const hashedPassword = hashSync(adminPassword, 10);
  const adminUser = await prismaClient.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin user created successfully:", {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
  });
}

async function seedCategories() {
  const categoriesToSeed = [
    {
      "title": "Computer Science",
      "description": "Explore programming, algorithms, data structures, and the foundations of computing."
    },
    {
      "title": "Data Science",
      "description": "Learn data analysis, machine learning, and statistical modeling using real-world data."
    },
    {
      "title": "Business",
      "description": "Develop leadership, management, and entrepreneurship skills to grow professionally."
    },
    {
      "title": "Health & Medicine",
      "description": "Gain knowledge in public health, nutrition, and healthcare systems."
    },
    {
      "title": "Personal Development",
      "description": "Boost your productivity, communication, and mental wellness."
    },
    {
      "title": "Information Technology",
      "description": "Dive into networking, cybersecurity, cloud computing, and IT support."
    },
    {
      "title": "Language Learning",
      "description": "Master a new language with practical exercises and expert instruction."
    },
    {
      "title": "Arts & Humanities",
      "description": "Study history, philosophy, literature, and the creative arts."
    },
    {
      "title": "Physical Science & Engineering",
      "description": "Understand physics, chemistry, mechanics, and cutting-edge engineering fields."
    },
  ];

  for (const category of categoriesToSeed) {


    const createdCategory = await prismaClient.category.create({
      data: {
        name: category.title,

      },
    });

    console.log(`Category "${createdCategory.name}" created successfully.`);
  }
}

async function seedCourses() {
  const coursesToSeed = [
    // Computer Science (category_id = 1)
    {
      title: "Introduction to Programming with Python",
      description: "Learn the basics of Python programming, variables, and control flow.",
      price: 100,
      level: "Beginner",
      language: "English",
      duration: "10h",
      requirements: "Basic computer knowledge",
      learning_outcomes: "Write Python programs, understand core programming concepts.",
      category_id: 1,
      instructor_id: 3, // 👈 Make sure you have an instructor with id=1
    },
    {
      title: "Data Structures and Algorithms",
      description: "Master fundamental data structures and algorithms to improve problem-solving.",
      price: 150,
      level: "Intermediate",
      language: "English",
      duration: "20h",
      requirements: "Basic Python or Java knowledge",
      learning_outcomes: "Implement and analyze algorithms and data structures.",
      category_id: 1,
      instructor_id: 3,
    },
    {
      title: "Full-Stack Web Development",
      description: "Build modern web applications using React, Node.js, and PostgreSQL.",
      price: 200,
      level: "Advanced",
      language: "English",
      duration: "30h",
      requirements: "Basic HTML, CSS, JS knowledge",
      learning_outcomes: "Develop full-stack applications and deploy them.",
      category_id: 1,
      instructor_id: 3,
    },
    {
      title: "Introduction to Databases",
      description: "Learn SQL and relational database concepts with PostgreSQL.",
      price: 120,
      level: "Beginner",
      language: "English",
      duration: "12h",
      requirements: "Basic programming knowledge",
      learning_outcomes: "Design databases, write SQL queries.",
      category_id: 1,
      instructor_id: 3,
    },
    {
      title: "Machine Learning Foundations",
      description: "Understand core ML concepts and algorithms with Python libraries.",
      price: 180,
      level: "Intermediate",
      language: "English",
      duration: "25h",
      requirements: "Python & math basics",
      learning_outcomes: "Build ML models and evaluate performance.",
      category_id: 1,
      instructor_id: 3,
    },
    {
      title: "Cybersecurity Essentials",
      description: "Protect systems and networks with foundational cybersecurity practices.",
      price: 160,
      level: "Intermediate",
      language: "English",
      duration: "15h",
      requirements: "Basic IT knowledge",
      learning_outcomes: "Understand security threats, apply defense techniques.",
      category_id: 1,
      instructor_id: 3,
    },
    {
      title: "Cloud Computing with AWS",
      description: "Deploy and manage cloud applications with AWS services.",
      price: 200,
      level: "Advanced",
      language: "English",
      duration: "18h",
      requirements: "Basic networking knowledge",
      learning_outcomes: "Deploy applications on AWS cloud.",
      category_id: 1,
      instructor_id: 3,
    },
    {
      title: "Software Engineering Principles",
      description: "Understand SDLC, design patterns, and Agile methodologies.",
      price: 130,
      level: "Intermediate",
      language: "English",
      duration: "14h",
      requirements: "Basic programming knowledge",
      learning_outcomes: "Apply software engineering principles in projects.",
      category_id: 1,
      instructor_id: 3,
    },

    // Business (category_id = 3)
    {
      title: "Business Analytics Fundamentals",
      description: "Learn how to analyze and visualize data for better decision-making.",
      price: 140,
      level: "Beginner",
      language: "English",
      duration: "12h",
      requirements: "No prior business experience required",
      learning_outcomes: "Use data for business insights and reports.",
      category_id: 3,
      instructor_id: 3,
    },
    {
      title: "Entrepreneurship Essentials",
      description: "Learn how to build, fund, and grow a startup.",
      price: 180,
      level: "Intermediate",
      language: "English",
      duration: "16h",
      requirements: "Interest in starting a business",
      learning_outcomes: "Develop a business plan, pitch ideas to investors.",
      category_id: 3,
      instructor_id: 3,
    },
    {
      title: "Marketing in the Digital Age",
      description: "Master digital marketing strategies including SEO, SEM, and social media.",
      price: 150,
      level: "Beginner",
      language: "English",
      duration: "14h",
      requirements: "Basic internet usage",
      learning_outcomes: "Run digital marketing campaigns.",
      category_id: 3,
      instructor_id: 3,
    },
    {
      title: "Project Management Professional (PMP) Prep",
      description: "Prepare for the PMP certification with best practices and case studies.",
      price: 220,
      level: "Advanced",
      language: "English",
      duration: "30h",
      requirements: "Basic project management knowledge",
      learning_outcomes: "Manage large-scale projects effectively.",
      category_id: 3,
      instructor_id: 3,
    },
    {
      title: "Finance for Non-Financial Managers",
      description: "Understand key financial statements and budgeting principles.",
      price: 160,
      level: "Beginner",
      language: "English",
      duration: "10h",
      requirements: "No finance background required",
      learning_outcomes: "Interpret financial data for decision making.",
      category_id: 3,
      instructor_id: 3,
    },
    {
      title: "Leadership and Team Management",
      description: "Develop essential leadership skills to inspire and manage teams.",
      price: 140,
      level: "Intermediate",
      language: "English",
      duration: "15h",
      requirements: "Experience working in teams",
      learning_outcomes: "Lead and motivate teams effectively.",
      category_id: 3,
      instructor_id: 3,
    },
    {
      title: "Supply Chain Management Basics",
      description: "Learn supply chain concepts, logistics, and procurement processes.",
      price: 180,
      level: "Intermediate",
      language: "English",
      duration: "18h",
      requirements: "Basic business knowledge",
      learning_outcomes: "Manage supply chain operations.",
      category_id: 3,
      instructor_id: 3,
    },
    {
      title: "Human Resource Management",
      description: "Recruit, train, and retain talent effectively within organizations.",
      price: 150,
      level: "Beginner",
      language: "English",
      duration: "12h",
      requirements: "Interest in HR",
      learning_outcomes: "Manage HR processes and people.",
      category_id: 3,
      instructor_id: 3,
    },

    // Health & Medicine (category_id = 4)
    {
      title: "Public Health Fundamentals",
      description: "Understand the basics of public health and global healthcare systems.",
      price: 120,
      level: "Beginner",
      language: "English",
      duration: "10h",
      requirements: "Interest in health topics",
      learning_outcomes: "Understand public health strategies.",
      category_id: 4,
      instructor_id: 3,
    },
    {
      title: "Nutrition and Healthy Living",
      description: "Learn nutrition science and develop healthy eating habits.",
      price: 130,
      level: "Beginner",
      language: "English",
      duration: "8h",
      requirements: "No prior health knowledge required",
      learning_outcomes: "Plan a balanced diet and healthy lifestyle.",
      category_id: 4,
      instructor_id: 3,
    },
    {
      title: "First Aid and Emergency Care",
      description: "Learn essential first aid techniques and emergency response.",
      price: 100,
      level: "Beginner",
      language: "English",
      duration: "6h",
      requirements: "No prior training needed",
      learning_outcomes: "Provide first aid in emergency situations.",
      category_id: 4,
      instructor_id: 3,
    },
    {
      title: "Introduction to Mental Health",
      description: "Gain awareness of mental health issues and psychological well-being.",
      price: 140,
      level: "Intermediate",
      language: "English",
      duration: "12h",
      requirements: "Interest in psychology",
      learning_outcomes: "Recognize and support mental health conditions.",
      category_id: 4,
      instructor_id: 3,
    },
    {
      title: "Global Healthcare Systems",
      description: "Compare healthcare delivery systems worldwide and their challenges.",
      price: 170,
      level: "Advanced",
      language: "English",
      duration: "20h",
      requirements: "Interest in healthcare policies",
      learning_outcomes: "Analyze and compare healthcare systems globally.",
      category_id: 4,
      instructor_id: 3,
    },
    {
      title: "Epidemiology Basics",
      description: "Study the distribution and determinants of health conditions in populations.",
      price: 160,
      level: "Intermediate",
      language: "English",
      duration: "14h",
      requirements: "Basic science knowledge",
      learning_outcomes: "Conduct epidemiological studies.",
      category_id: 4,
      instructor_id: 3,
    },
    {
      title: "Healthcare Management",
      description: "Manage hospitals and healthcare organizations effectively.",
      price: 200,
      level: "Advanced",
      language: "English",
      duration: "22h",
      requirements: "Basic business knowledge",
      learning_outcomes: "Run healthcare institutions efficiently.",
      category_id: 4,
      instructor_id: 3,
    },
    {
      title: "Pharmacology Essentials",
      description: "Learn about drug classifications, actions, and therapeutic uses.",
      price: 180,
      level: "Intermediate",
      language: "English",
      duration: "16h",
      requirements: "Basic biology knowledge",
      learning_outcomes: "Understand pharmacological treatments.",
      category_id: 4,
      instructor_id: 3,
    },
  ];

  for (const course of coursesToSeed) {
    const existing = await prismaClient.course.findUnique({
      where: { title: course.title },
    });

    if (!existing) {
      await prismaClient.course.create({ data: course });
      console.log(`Course "${course.title}" created successfully.`);
    } else {
      console.log(`Course "${course.title}" already exists, skipping.`);
    }
  }
}


// PaymentMethod seeding
async function seedPaymentMethods() {
  const methods = [
    { id: "paypal", provider: "PayPal" },
    { id: "stripe", provider: "Stripe" },
    { id: "bank_transfer", provider: "Bank Transfer" },
  ];

  for (const method of methods) {
    const existing = await prismaClient.paymentMethod.findUnique({
      where: { id: method.id },
    });

    if (!existing) {
      await prismaClient.paymentMethod.create({ data: method });
      console.log(`Payment method "${method.provider}" created.`);
    }
  }
}

async function seedKHAndroidCourse() {
  // Ensure instructor exists (admin as instructor here)
  const instructor = await prismaClient.user.findFirst({
    where: { role: "instructor" },
  });

  if (!instructor) {
    throw new Error("No instructor found. Please create an instructor user first.");
  }

  // Create the course
  const course = await prismaClient.course.create({
    data: {
      title: "KH Android Developer Course",
      description: "Master Android development with hands-on modules covering Kotlin, UI, databases, and advanced features.",
      price: 199,
      level: "Intermediate",
      language: "English",
      duration: "6 weeks",
      requirements: "Basic programming knowledge",
      learning_outcomes: "Build Android apps using Kotlin, Jetpack Compose, Room, and more.",
      category_id: 1, // Computer Science
      instructor_id: instructor.id,
      imageUrl: "https://placehold.co/600x400/android-course.png",
      previewUrl: "https://placehold.co/600x400/android-preview.png",
    },
  });

  console.log(`✅ Course created: ${course.title}`);

  // Loop modules
  for (let m = 1; m <= 6; m++) {
    const module = await prismaClient.module.create({
      data: {
        title: `Module ${m}: Android Topic ${m}`,
        desription: `Detailed coverage of Android topic ${m}`,
        position: m,
        course_id: course.id,
      },
    });

    console.log(`📘 Module created: ${module.title}`);

    // Add 3 contents (VIDEO/ARTICLE)
    for (let c = 1; c <= 3; c++) {
      await prismaClient.content.create({
        data: {
          title: `Lesson ${c} in ${module.title}`,
          content_url: `https://placehold.co/600x400/lesson-${m}-${c}.mp4`,
          description: `This is lesson ${c} of ${module.title}.`,
          content_type: c % 2 === 0 ? "ARTICLE" : "VIDEO",
          duration: "10m",
          position: c,
          module_id: module.id,
        },
      });
    }

    // Add Quiz content (4th content)
    const quizContent = await prismaClient.content.create({
      data: {
        title: `Quiz for ${module.title}`,
        content_url: "",
        description: `Test your knowledge for ${module.title}`,
        content_type: "QUIZ",
        duration: "5m",
        position: 4,
        module_id: module.id,
      },
    });

    const quiz = await prismaClient.quiz.create({
      data: {
        title: `Quiz for ${module.title}`,
        content_id: quizContent.id,
      },
    });

    // Add 3 questions with 4 answers each
    for (let q = 1; q <= 3; q++) {
      const question = await prismaClient.question.create({
        data: {
          quiz_id: quiz.id,
          question_text: `Question ${q} for ${module.title}`,
          type: "MULTIPLE_CHOICE",
        },
      });

      for (let a = 1; a <= 4; a++) {
        await prismaClient.quizzAnswer.create({
          data: {
            answer_text: `Answer ${a} for Question ${q}`,
            is_correct: a === 1, // First answer is correct
            question_id: question.id,
          },
        });
      }
    }

    console.log(`📝 Quiz created for ${module.title}`);
  }

  console.log("🎉 KH Android Developer Course seeded successfully!");
}


async function main() {
  //  await seedKHAndroidCourse();
  await seedSimpleCourse();
  // await seedAdminUser();
  // await seedCategories();
  // await seedCourses();
  // await seedPaymentMethods();
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
