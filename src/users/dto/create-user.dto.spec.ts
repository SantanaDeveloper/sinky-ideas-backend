import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';

describe('CreateUserDto', () => {
  it('should validate a correct DTO (with default role)', async () => {
    const dto = new CreateUserDto();
    dto.username = 'johndoe';
    dto.password = 's3cr3t123';
    // no role set → default 'user'
    
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.role).toBe<UserRole>('user');
  });

  it('should accept explicit valid role "admin"', async () => {
    const dto = new CreateUserDto();
    dto.username = 'adminuser';
    dto.password = 'abcdef';
    dto.role = 'admin';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.role).toBe<UserRole>('admin');
  });

  it('should reject when username is not a string', async () => {
    const dto = new CreateUserDto();
    // @ts-expect-error testing invalid type
    dto.username = 123;
    dto.password = 'abcdef';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      'O username deve ser uma string'
    );
  });

  it('should reject when password is too short', async () => {
    const dto = new CreateUserDto();
    dto.username = 'shortpass';
    dto.password = '123'; // less than 6 chars

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty(
      'minLength',
      'A senha deve ter no mínimo 6 caracteres'
    );
  });

  it('should reject invalid role values', async () => {
    const dto = new CreateUserDto();
    dto.username = 'roleuser';
    dto.password = 'validpass';
    // @ts-expect-error testing invalid enum
    dto.role = 'superuser';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('role');
    expect(errors[0].constraints).toHaveProperty(
      'isIn',
      'role must be one of the following values: admin, user'
    );
  });
});