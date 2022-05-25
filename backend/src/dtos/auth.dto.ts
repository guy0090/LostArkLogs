import { IsString, Length } from 'class-validator';

export class ApiKeyDTO {
  @IsString()
  @Length(32, 32)
  public key: string;
}
