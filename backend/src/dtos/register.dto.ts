import { IsString, Length } from 'class-validator';

export class RegisterDTO {
  @IsString()
  @Length(1)
  public code: string;
}
