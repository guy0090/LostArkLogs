import {
  registerDecorator,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
  IsNumber,
  Min,
  IsBoolean,
  Max,
} from 'class-validator';
import ms from 'ms';

export class LogIdDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public id!: string;
}

export class LogDeleteDTO {
  @IsDefined()
  @IsString()
  @Length(32, 32)
  public key!: string;

  @IsDefined()
  @IsString()
  @Length(24, 24)
  public logId!: string;
}

export class LogDeleteAdminDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public logId!: string;
}

export class LogUploadDTO {
  @IsDefined()
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
  @ArrayMaxSize(200)
  public bosses!: number[];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  public gearLevel!: [number, number];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  public level?: [number, number];

  @IsDefined()
  @IsArray()
  @ValidateIf(o => o.range.length > 0)
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  // @MaxRangeDifference('24h')
  public range!: [number, number];

  @IsDefined()
  @IsNumber()
  @Min(0)
  public partyDps!: number;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  public server?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  public region?: string;

  @IsOptional()
  @IsString()
  @Length(32, 32)
  public key?: string;

  @IsOptional()
  @IsBoolean()
  public removeBreakdowns?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @VerifySort()
  public sort?: ['dps' | 'createdAt', -1 | 1]; // -1 = desc, 1 = asc

  @IsOptional()
  @IsString()
  @Length(24, 24)
  public creator?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  public limit?: number;
}

export class RawLogIdDTO {
  @IsDefined()
  @IsString()
  @Length(24, 24)
  public id!: string;

  @IsDefined()
  @IsString()
  @Length(32, 32)
  public key!: string;
}

export class RawLogUploadDTO {
  @IsOptional()
  @IsString()
  @Length(1)
  public unlisted: string;
}

export function MaxRangeDifference(maxDifference: number | string) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'maxRangeDifference',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          const [begin, end] = value;

          if (typeof maxDifference === 'string') {
            maxDifference = ms(maxDifference);
          }

          return begin <= end && end - begin <= maxDifference;
        },
      },
    });
  };
}

export function VerifySort() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'maxRangeDifference',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          const [field, order] = value;

          if (typeof field !== 'string' || !['dps', 'createdAt'].includes(field) || typeof order !== 'number' || ![-1, 1].includes(order))
            return false;
          else return true;
        },
      },
    });
  };
}
