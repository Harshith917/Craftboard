-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'roundedRect';
ALTER TYPE "NodeType" ADD VALUE 'ellipse';
ALTER TYPE "NodeType" ADD VALUE 'triangle';
ALTER TYPE "NodeType" ADD VALUE 'pentagon';
ALTER TYPE "NodeType" ADD VALUE 'hexagon';
ALTER TYPE "NodeType" ADD VALUE 'line';
ALTER TYPE "NodeType" ADD VALUE 'arrow';
ALTER TYPE "NodeType" ADD VALUE 'polyline';
ALTER TYPE "NodeType" ADD VALUE 'stickyNote';
ALTER TYPE "NodeType" ADD VALUE 'codeBlock';
ALTER TYPE "NodeType" ADD VALUE 'divider';

-- AlterEnum
ALTER TYPE "StrokeStyle" ADD VALUE 'dotted';

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "data" JSONB;
