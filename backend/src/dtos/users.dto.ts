import { ArrayMinSize, IsArray, IsDefined, IsString, Length } from 'class-validator';

export class UserIdDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public userId!: string;
}

export class BanUserDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public userId!: string;

  @IsDefined()
  @IsString()
  @Length(1, 255)
  public banReason!: string;
}

export class UnbanUserDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public userId!: string;
}

export class UserPermissionsDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public userId!: string;

  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  public permissions!: string[];
}

export class UserRolesDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public userId!: string;

  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  public roles!: string[];
}
