import { ArrayMinSize, IsArray, IsBoolean, IsDefined, IsOptional, IsString, Length, MaxLength, Validate, ValidateIf } from 'class-validator';

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
  @MaxLength(255)
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

export class SearchUsersDTO {
  @ValidateIf(o => !o.username)
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public id?: string;

  @ValidateIf(o => !o.id)
  @IsDefined()
  @IsString()
  @Length(2, 32)
  public username?: string;

  @IsOptional()
  @IsBoolean()
  public caseSensitive?: boolean;
}
