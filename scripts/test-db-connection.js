const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    console.log("🔄 Testing database connection...");

    // Test connection
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database query successful:", result);

    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    console.log("📊 Existing tables:", tables);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Full error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
