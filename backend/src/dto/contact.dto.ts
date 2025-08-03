import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class ContactDto {
  @IsString()
  from_name: string;

  @IsEmail()
  from_email: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  contact_type?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  units?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  referrer?: string;
} 