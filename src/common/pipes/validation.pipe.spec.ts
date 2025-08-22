import { validationPipeConfig } from './validation.pipe';
import { ValidationPipe } from '@nestjs/common';

describe('ValidationPipe', () => {
  it('should create validation pipe config', () => {
    expect(validationPipeConfig).toBeDefined();
    expect(validationPipeConfig).toBeInstanceOf(ValidationPipe);
  });

  it('should have correct configuration properties', () => {
    // Check the internal configuration through the options
    expect(validationPipeConfig['isTransformEnabled']).toBe(true);
    expect(validationPipeConfig['validatorOptions']).toEqual(
      expect.objectContaining({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
  });
});
