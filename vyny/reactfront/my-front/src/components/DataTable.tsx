import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "./DeleteModal";
import { UpdateModal } from "./UpdateModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DataTableProps {
  data: any[];
  columns: { header: string; accessor: string }[];
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  type: "chauffeur" | "recette";
}

export const DataTable = ({
  data,
  columns,
  onUpdate,
  onDelete,
  type,
}: DataTableProps) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUpdate = (item: any) => {
    setSelectedItem(item);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (isoDate) => {
    return format(new Date(isoDate), "EEEE d MMMM yyyy HH'h'mm ss's'", { locale: fr });
  };

  const renderCellContent = (item: any, accessor: string) => {
    const value = item[accessor];
    const dateColumns = ["date_de_point"];
    if (dateColumns.includes(accessor) && value) {
      return formatDate(value);
    }
    return value || "-";
  };

  return (
    <div className="w-full">
      <div className="rounded-md border animate-fade-in overflow-x-auto">
      <Table className="min-w-full"><TableHeader><TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.accessor}
              className="whitespace-nowrap px-2 py-2 bg-gray-100 text-left sticky top-0"
            >
              {column.header}
            </TableHead>
          ))}
          <TableHead className="whitespace-nowrap px-2 py-2 bg-gray-100 text-left sticky top-0">Actions</TableHead>
        </TableRow></TableHeader><TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.accessor}
                  className="whitespace-nowrap px-4"
                >
                  {renderCellContent(item, column.accessor)}
                </TableCell>
              ))}
              <TableCell className="whitespace-nowrap px-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdate(item)}
                    className="hover:bg-primary/10 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(item)}
                    className="hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </div>

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdate={(data) => {
          onUpdate(selectedItem.id, data);
          setIsUpdateModalOpen(false);
        }}
        data={selectedItem}
        type={type}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(selectedItem.id);
          setIsDeleteModalOpen(false);
        }}
        type={type}
      />
    </div>
  );
};