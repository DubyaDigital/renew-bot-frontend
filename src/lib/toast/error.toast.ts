import config from "./config";
import { toast, ToasterProps } from "sonner";

function errorToast (message: string, toastConfig?: ToasterProps) {
  toast.error(message, {
    ...config,
    ...toastConfig,
  })
}

export default errorToast