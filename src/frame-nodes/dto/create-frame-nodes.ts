import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

enum NodeType {
  rect = 'rect',
  circle = 'circle',
  text = 'text',
  frame = 'frame',
  star = 'star',
  diamond = 'diamond',
  image = 'image',
}

enum StrokeStyle {
  solid = 'solid',
  dashed = 'dashed',
}

export class CreateNodeDto {
  @IsEnum(NodeType)
  type!: NodeType;

  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;

  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;

  @IsNumber()
  radius!: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsString()
  fill!: string;

  @IsString()
  stroke!: string;

  @IsNumber()
  @Min(0)
  strokeWidth!: number;

  @IsNumber()
  @Min(0)
  @Max(360)
  rotation!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  opacity!: number;

  @IsNumber()
  @Min(1)
  fontSize!: number;

  @IsString()
  fontFamily!: string;

  @IsNumber()
  zIndex!: number;

  @IsOptional()
  @IsEnum(StrokeStyle)
  strokeStyle?: StrokeStyle;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  points?: number[];
}
