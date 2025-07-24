import { hashSync } from "bcrypt";
import { prismaClient } from "../../src/utils/prismaClient";

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

async function main() {
  // await seedAdminUser();
  // await seedCategories();
  await seedPaymentMethods();
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
