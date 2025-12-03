import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsOptional()
    content?: string;


    @IsString()
    @IsOptional()
    title?: string;

    // This is passed as a route parameter, not in the body, but defined here for context.
    @IsInt()
    @IsNotEmpty()
    entityId: number;
}