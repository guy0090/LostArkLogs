import { IsObject, IsString, Length } from 'class-validator';

export class LogIdDTO {
  @IsString()
  @Length(24, 24)
  public id: string;
}

export class LogDeleteDTO {
  @IsString()
  @Length(32, 32)
  public key: string;

  @IsString()
  @Length(32, 32)
  public id: string;
}

export class LogUploadDTO {
  @IsString()
  @Length(32, 32)
  public key: string;

  @IsObject()
  public data: any;
}
