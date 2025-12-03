import { IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

// Define the basic structure for any property condition
export class ConditionDto {
  @IsDefined()
  // Key must be a valid field on the Entity model (e.g., 'title', 'category')
  key: string; 

  @IsDefined()
  // The value to search for
  value: string | number;

  @IsString()
  @IsOptional()
  // Optional operator for advanced comparison (e.g., 'contains', 'equals', 'gt', 'lt')
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
}

// Define the structure for the entire filter object
export class GetEntitiesFilterDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  and?: ConditionDto[]; // Conditions joined by AND

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  or?: ConditionDto[]; // Conditions joined by OR

  // For basic text search (can be combined with other filters)
  @IsOptional()
  @IsString()
  textSearch?: string;
  
  @IsOptional()
  @IsString()
  orderBy?: string; // e.g., 'createdAt:desc' or 'averageRating:asc'
}