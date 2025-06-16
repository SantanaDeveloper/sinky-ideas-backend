import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { Public, IS_PUBLIC_KEY } from './public.decorator';

describe('Public decorator', () => {
  it('should set isPublic metadata via Reflector', () => {
    class Dummy {
      @Public()
      foo() {}
    }
    const reflector = new Reflector();
    const metadata = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      Dummy.prototype.foo,
      Dummy,
    ]);
    expect(metadata).toBe(true);
  });
});