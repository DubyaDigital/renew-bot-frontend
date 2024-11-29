import config from "./config";
import { toast, ToasterProps } from "sonner";

function warningToast (message: string, toastConfig?: ToasterProps) {
  toast.warning(message, {
    ...config,
    ...toastConfig,
  })
}

export default warningToast