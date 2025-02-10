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

  return (
    <div className="w-full">
      <div className="rounded-md border animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessor}>{column.header}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                {columns.map((column) => (
                  <TableCell key={column.accessor}>
                    {item[column.accessor]}
                  </TableCell>
                ))}
                <TableCell>
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
          </TableBody>
        </Table>
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