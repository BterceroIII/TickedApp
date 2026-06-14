import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './../src/generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const generateToken = (): string => {
  const digits = '0123456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += digits[Math.floor(Math.random() * 10)];
  }
  return token;
};

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.invoice.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const password = await hashPassword('password');

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@tickedapp.com',
      password,
      role: 'ADMIN',
      confirmed: true,
      token: null,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  const user1 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@tickedapp.com',
      password,
      role: 'USER',
      confirmed: true,
      token: null,
    },
  });
  console.log(`User created: ${user1.email}`);

  const user2 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria@tickedapp.com',
      password,
      role: 'USER',
      confirmed: true,
      token: null,
    },
  });
  console.log(`User created: ${user2.email}`);

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Rediseño Dashboard',
      description: 'Rediseñar el panel principal con nuevos gráficos y métricas',
      status: 'EN_PROGRESO',
      responsibleId: admin.id,
      dateLimit: new Date('2026-07-15'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'App Móvil',
      description: 'Desarrollo de la aplicación móvil para iOS y Android',
      status: 'PLANIFICACION',
      responsibleId: user1.id,
      dateLimit: new Date('2026-09-01'),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Integración API Pagos',
      description: 'Integrar pasarela de pago Stripe',
      status: 'EN_REVISION',
      responsibleId: admin.id,
      dateLimit: new Date('2026-06-30'),
    },
  });

  console.log(`Projects created: ${project1.name}, ${project2.name}, ${project3.name}`);

  // Create tickets
  await prisma.ticket.createMany({
    data: [
      {
        id: 'TICK-001',
        projectId: project1.id,
        title: 'Crear gráfico de ventas',
        description: 'Implementar gráfico de barras con ventas mensuales',
        status: 'EN_PROCESO',
        priority: 'ALTA',
        assignedToId: user1.id,
        estimatedDate: new Date('2026-06-20'),
      },
      {
        id: 'TICK-002',
        projectId: project1.id,
        title: 'Filtros de fecha',
        description: 'Agregar filtro de rango de fechas al dashboard',
        status: 'ABIERTO',
        priority: 'MEDIA',
        assignedToId: user2.id,
        estimatedDate: new Date('2026-06-25'),
      },
      {
        id: 'TICK-003',
        projectId: project2.id,
        title: 'Login biométrico',
        description: 'Implementar autenticación con huella dactilar',
        status: 'ABIERTO',
        priority: 'ALTA',
        assignedToId: user1.id,
        estimatedDate: new Date('2026-08-15'),
      },
      {
        id: 'TICK-004',
        projectId: project2.id,
        title: 'Pantalla de inicio',
        description: 'Diseñar y maquetar la pantalla de inicio de la app',
        status: 'EN_PROCESO',
        priority: 'MEDIA',
        assignedToId: user2.id,
        estimatedDate: new Date('2026-07-01'),
      },
      {
        id: 'TICK-005',
        projectId: project3.id,
        title: 'Webhook Stripe',
        description: 'Implementar manejo de webhooks de Stripe',
        status: 'RESUELTO',
        priority: 'ALTA',
        assignedToId: admin.id,
        estimatedDate: new Date('2026-06-15'),
      },
    ],
  });

  console.log('Tickets created: TICK-001 through TICK-005');

  // Create invoices
  await prisma.invoice.createMany({
    data: [
      {
        id: 'INV-001',
        userId: admin.id,
        concept: 'Desarrollo Frontend Q2',
        amount: 3200,
        status: 'PENDIENTE',
        dueDate: new Date('2026-06-30'),
      },
      {
        id: 'INV-002',
        userId: admin.id,
        concept: 'Consultoría UX',
        amount: 1850,
        status: 'VENCIDA',
        dueDate: new Date('2026-06-05'),
      },
      {
        id: 'INV-003',
        userId: admin.id,
        concept: 'Soporte mensual Mayo',
        amount: 900,
        status: 'PAGADA',
        dueDate: new Date('2026-05-31'),
        paidAt: new Date('2026-05-28'),
      },
      {
        id: 'INV-004',
        userId: user1.id,
        concept: 'Sprint App Móvil',
        amount: 2400,
        status: 'PENDIENTE',
        dueDate: new Date('2026-07-10'),
      },
      {
        id: 'INV-005',
        userId: user1.id,
        concept: 'Mantenimiento portal cliente',
        amount: 750,
        status: 'PAGADA',
        dueDate: new Date('2026-06-10'),
        paidAt: new Date('2026-06-08'),
      },
      {
        id: 'INV-006',
        userId: user2.id,
        concept: 'Integración CRM',
        amount: 1650,
        status: 'VENCIDA',
        dueDate: new Date('2026-06-01'),
      },
      {
        id: 'INV-007',
        userId: user2.id,
        concept: 'Bolsa de horas soporte',
        amount: 600,
        status: 'PENDIENTE',
        dueDate: new Date('2026-07-05'),
      },
    ],
  });

  console.log('Invoices created: INV-001 through INV-007');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
