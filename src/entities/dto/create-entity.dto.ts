import { IsNotEmpty, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateEntityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  // The category helps filter and organize the entities (e.g., "Book", "Restaurant", "Software")
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;
}