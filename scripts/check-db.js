const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const feeCount = await prisma.feeItem.count();
  const invoiceCount = await prisma.invoice.count();
  const invoiceItemCount = await prisma.invoiceItem.count();

  const invoice = await prisma.invoice.findFirst({
    include: {
      items: { include: { feeItem: true } },
      student: { include: { user: true } },
      term: true,
      session: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        feeCount,
        invoiceCount,
        invoiceItemCount,
        invoiceNumber: invoice?.invoiceNumber,
        totalAmount: invoice?.totalAmount,
        itemNames: invoice?.items.map((x) => x.feeItem.name),
        itemAmounts: invoice?.items.map((x) => x.amount),
        student: invoice?.student?.user?.name,
        term: invoice?.term?.name,
        session: invoice?.session?.name,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
