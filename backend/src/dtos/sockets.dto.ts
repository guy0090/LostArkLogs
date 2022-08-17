import { ArrayMinSize, IsArray, IsBoolean, IsDefined, IsNumber, IsString, Length, Max, Min, ValidateIf } from 'class-validator';

export class PageAccessDTO {
  @IsDefined()
  @IsString()
  public page: string;
}

export class HasPermissionsDTO {
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  public permissions: string[];
}

export class GetUserDTO {
  @ValidateIf(o => o.discriminator)
  @IsString()
  @Length(2, 32)
  public username: string;

  @ValidateIf(o => o.username)
  @IsNumber()
  @Min(1)
  @Max(9999)
  public discriminator: number;

  @ValidateIf(o => !o.username || !o.discriminator)
  @IsString()
  @Length(24)
  public userId: string;
}

export class GetUsersDTO {
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  public users: string[];
}

export class GetUserPermissionsDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public target: string;
}

export class GetLogDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public logId: string;
}

export class UpdateLogVisibilityDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public logId: string;

  @IsDefined()
  @IsBoolean()
  public visibility: boolean;
}
