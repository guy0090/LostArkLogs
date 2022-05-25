import { IsString, Length } from 'class-validator';

export class RegisterDTO {
  @Length(1)
  @IsString()
  public code: string;
}
