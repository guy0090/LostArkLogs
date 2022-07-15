import { ArrayMaxSize, ArrayMinSize, IsDefined, IsArray } from 'class-validator';

export class RedisDelDTO {
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  public keys!: string[];
}
