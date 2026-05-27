import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";

export const fileService = {
  uploadFile: async (base64Data: string, fileName: string) => {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await api.post(API_ENDPOINTS.FILE.UPLOAD, {
      file: cleanBase64,
      name: fileName
    });
    
    if (response.data.status === "success") {
      return response.data.data as string;
    } else {
      throw new Error(response.data.data || "File upload failed");
    }
  },
};
