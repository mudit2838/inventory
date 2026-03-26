import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectToDatabase from '../../../lib/mongoose';
import User from '../../../models/User';
import { registerSchema } from '../../../lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    await connectToDatabase();

    const existing = await User.findOne({ $or: [{ email: parsed.email.toLowerCase() }, { username: parsed.username }] });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = new User({ username: parsed.username, email: parsed.email.toLowerCase(), passwordHash });
    await user.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'name' in error && (error as { name: string }).name === 'ZodError') {
      return NextResponse.json({ error: (error as unknown as { errors: unknown }).errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Failed to register';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
