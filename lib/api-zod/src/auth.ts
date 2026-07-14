import * as zod from 'zod';

export const RegisterUserBody = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  phone: zod.string().optional(),
  nationalId: zod.string().optional(),
  role: zod.enum(['owner', 'breeder', 'vet', 'regulator']),
  province: zod.string().optional(),
});

export const LoginUserBody = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(1, "Password is required"),
});
