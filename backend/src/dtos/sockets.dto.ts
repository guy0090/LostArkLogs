import { ArrayMinSize, IsArray, IsDefined, IsString, Length } from 'class-validator';

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
