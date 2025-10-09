import { prismaClient } from "../../src/utils/prismaClient";

export async function seedSimpleCourse() {
  // Ensure instructor exists
  const instructor = await prismaClient.user.findFirst({
    where: { role: "instructor" },
  });

  if (!instructor) {
    throw new Error("No instructor found. Please create an instructor user first.");
  }

  // Create the course
  const course = await prismaClient.course.create({
    data: {
      title: "Simple Android Mini Course",
      description: "A compact Android course with 2 modules and quizzes.",
      price: 49,
      level: "Beginner",
      language: "English",
      duration: "2 weeks",
      requirements: "Basic programming knowledge",
      learning_outcomes: "Understand basic Android app development concepts.",
      category_id: 1, // Computer Science
      instructor_id: instructor.id,
      imageUrl: "https://placehold.co/600x400/simple-course.png",
      previewUrl: "https://placehold.co/600x400/simple-preview.png",
    },
  });

  console.log(`✅ Course created: ${course.title}`);

  // Loop modules (2)
  for (let m = 1; m <= 2; m++) {
    const module = await prismaClient.module.create({
      data: {
        title: `Module ${m}: Android Mini Topic ${m}`,
        desription: `Brief coverage of Android mini topic ${m}`,
        position: m,
        course_id: course.id,
      },
    });

    console.log(`📘 Module created: ${module.title}`);

    // First content (VIDEO/ARTICLE)
    await prismaClient.content.create({
      data: {
        title: `Lesson 1 in ${module.title}`,
        content_url: `https://placehold.co/600x400/lesson-${m}-1.mp4`,
        description: `Lesson 1 of ${module.title}.`,
        content_type: "VIDEO",
        duration: "10m",
        position: 1,
        module_id: module.id,
      },
    });

    // Second content (Quiz)
    const quizContent = await prismaClient.content.create({
      data: {
        title: `Quiz for ${module.title}`,
        content_url: "",
        description: `Test your knowledge for ${module.title}`,
        content_type: "QUIZ",
        duration: "5m",
        position: 2,
        module_id: module.id,
      },
    });

    const quiz = await prismaClient.quiz.create({
      data: {
        title: `Quiz for ${module.title}`,
        content_id: quizContent.id,
      },
    });

    // Add 2 questions with 3 answers each
    for (let q = 1; q <= 2; q++) {
      const question = await prismaClient.question.create({
        data: {
          quiz_id: quiz.id,
          question_text: `Question ${q} for ${module.title}`,
          type: "MULTIPLE_CHOICE",
        },
      });

      for (let a = 1; a <= 3; a++) {
        await prismaClient.quizzAnswer.create({
          data: {
            answer_text: `Answer ${a} for Question ${q}`,
            is_correct: a === 1, // First answer correct
            question_id: question.id,
          },
        });
      }
    }

    console.log(`📝 Quiz created for ${module.title}`);
  }

  console.log("🎉 Simple Android Mini Course seeded successfully!");
}
