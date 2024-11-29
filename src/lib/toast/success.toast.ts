import config from "./config";
import { toast, ToasterProps } from "sonner";

function successToast (message: string, toastConfig?: ToasterProps) {
  toast.success(message, {
    ...config,
    ...toastConfig,
  })
}

export default successToast