import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsNotEmptyObject, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class LogIdDTO {
  @IsString()
  @Length(24, 24)
  public id!: string;
}

export class LogDeleteDTO {
  @IsString()
  @Length(32, 32)
  public key!: string;

  @IsString()
  @Length(32, 32)
  public id!: string;
}

export class LogUploadDTO {
  @IsString()
  @Length(32, 32)
  public key!: string;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  public data!: any;
}

export class LogFilterDTO {
  @IsDefined()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(25)
  public classes!: number[];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  public bosses!: number[];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  public gearLevel!: [number, number];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  public level!: [number, number];

  @IsOptional()
  @IsString()
  @Length(0, 30)
  public server?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  public region?: string;
}
