import { ArrowUpRightIcon, FolderIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface EmptyDataProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  btnCreateLabel: React.ReactNode;
  onCreate?: () => void;
}

export default function EmptyData({ title, description, icon, btnCreateLabel, onCreate }: EmptyDataProps) {
   return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {icon || <FolderIcon />}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button variant="default" onClick={onCreate}>{btnCreateLabel}</Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}