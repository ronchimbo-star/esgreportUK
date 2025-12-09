import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Image as ImageIcon,
  File,
  Trash2,
  Search,
  Folder,
  Check,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

type MediaFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text: string | null;
  folder: string;
  created_at: string;
};

type MediaManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (file: MediaFile) => void;
  folder?: string;
  acceptTypes?: string[];
};

export function MediaManager({
  isOpen,
  onClose,
  onSelect,
  folder = "general",
  acceptTypes = ["image/*"]
}: MediaManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState(folder);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, currentFolder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("media_files")
        .select("*")
        .eq("folder", currentFolder)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target.files;
    if (!fileInput || fileInput.length === 0) return;

    const file = fileInput[0];

    if (acceptTypes.length > 0 && acceptTypes[0] !== "*/*") {
      const isValid = acceptTypes.some(type => {
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return file.type.startsWith(category + "/");
        }
        return file.type === type;
      });

      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: `Please upload a file of type: ${acceptTypes.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${currentFolder}/${fileName}`;

      const { data: fileRecord, error: insertError } = await supabase
        .from("media_files")
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          folder: currentFolder,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      loadFiles();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const { error } = await supabase
        .from("media_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "File deleted successfully",
      });

      loadFiles();
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error: any) {
      console.error("Error deleting file:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleSelect = () => {
    if (selectedFile && onSelect) {
      onSelect(selectedFile);
      onClose();
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredFiles = files.filter(file =>
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = ["general", "news", "logos", "banners", "documents"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Manager</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden">
          <div className="w-48 border-r pr-4 overflow-y-auto">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-2">Folders</p>
              {folders.map((folderName) => (
                <button
                  key={folderName}
                  onClick={() => setCurrentFolder(folderName)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    currentFolder === folderName
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  {folderName}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="space-y-4 mb-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button disabled={uploading} asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload"}
                    </span>
                  </Button>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  accept={acceptTypes.join(",")}
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <p>No files in this folder</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filteredFiles.map((file) => (
                    <Card
                      key={file.id}
                      className={`cursor-pointer transition-all ${
                        selectedFile?.id === file.id
                          ? "ring-2 ring-blue-500"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                          {file.mime_type.startsWith("image/") ? (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              {getFileIcon(file.mime_type)}
                            </div>
                          ) : (
                            getFileIcon(file.mime_type)
                          )}
                          {selectedFile?.id === file.id && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate mb-1">
                          {file.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.file_size)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {onSelect && (
              <div className="flex gap-3 pt-4 border-t mt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSelect}
                  disabled={!selectedFile}
                  className="flex-1"
                >
                  Select File
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
